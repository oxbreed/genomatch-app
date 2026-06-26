import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { isGenotypeVerified } from './profileMapper';
import { getCurrentProfile } from './profiles';
import { supabase } from './supabase';

const LAST_LOCATION_KEY = 'genomatch-last-device-location';

export type DeviceLocation = {
  city: string;
  country: string | null;
  latitude: number;
  longitude: number;
};

type StoredLocation = {
  latitude: number;
  longitude: number;
  city: string;
  country: string | null;
};

export function normalizeCityLabel(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeCountryCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

export function citiesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  return normalizeCityLabel(a ?? '').toLowerCase() === normalizeCityLabel(b ?? '').toLowerCase();
}

function pickCityFromGeocode(place: Location.LocationGeocodedAddress): string | null {
  const candidate =
    place.city?.trim() ||
    place.district?.trim() ||
    place.subregion?.trim() ||
    place.region?.trim() ||
    place.name?.trim();

  return candidate ? normalizeCityLabel(candidate) : null;
}

function pickCountryFromGeocode(place: Location.LocationGeocodedAddress): string | null {
  return normalizeCountryCode(place.isoCountryCode);
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

export async function getDeviceLocation(): Promise<DeviceLocation | null> {
  const granted = await requestLocationPermission();
  if (!granted) return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const [place] = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  if (!place) return null;

  const city = pickCityFromGeocode(place);
  if (!city) return null;

  return {
    city,
    country: pickCountryFromGeocode(place),
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export async function saveProfileLocation(location: DeviceLocation): Promise<void> {
  const { error } = await supabase.rpc('save_profile_location', {
    p_city: location.city,
    p_country: location.country ?? '',
    p_latitude: location.latitude,
    p_longitude: location.longitude,
  });

  if (error) {
    throw error;
  }
}

async function writeStoredLocation(location: StoredLocation): Promise<void> {
  await SecureStore.setItemAsync(LAST_LOCATION_KEY, JSON.stringify(location));
}

export type SyncProfileLocationResult = {
  updated: boolean;
  city: string | null;
  permissionDenied: boolean;
};

/** Resolve city from GPS and persist coordinates when they change. */
export async function syncProfileCityFromDevice(options?: {
  force?: boolean;
}): Promise<SyncProfileLocationResult> {
  const profile = await getCurrentProfile();
  if (profile && isGenotypeVerified(profile)) {
    return {
      updated: false,
      city: profile.city,
      permissionDenied: false,
    };
  }

  const deviceLocation = await getDeviceLocation();
  if (!deviceLocation) {
    const { status } = await Location.getForegroundPermissionsAsync();
    return {
      updated: false,
      city: null,
      permissionDenied: status !== Location.PermissionStatus.GRANTED,
    };
  }

  const profileCity = profile?.city?.trim() ?? '';
  const cityChanged = !citiesMatch(profileCity, deviceLocation.city);
  const countryChanged =
    normalizeCountryCode(profile?.country) !== normalizeCountryCode(deviceLocation.country);

  if (!options?.force && !cityChanged && !countryChanged) {
    await writeStoredLocation({
      latitude: deviceLocation.latitude,
      longitude: deviceLocation.longitude,
      city: deviceLocation.city,
      country: deviceLocation.country,
    });
    return { updated: false, city: deviceLocation.city, permissionDenied: false };
  }

  await saveProfileLocation(deviceLocation);
  await writeStoredLocation({
    latitude: deviceLocation.latitude,
    longitude: deviceLocation.longitude,
    city: deviceLocation.city,
    country: deviceLocation.country,
  });

  return { updated: true, city: deviceLocation.city, permissionDenied: false };
}

/** Read location for onboarding without writing to profile yet. */
export async function detectDeviceCity(): Promise<{
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  permissionDenied: boolean;
}> {
  const deviceLocation = await getDeviceLocation();
  if (!deviceLocation) {
    const { status } = await Location.getForegroundPermissionsAsync();
    return {
      city: null,
      country: null,
      latitude: null,
      longitude: null,
      permissionDenied: status !== Location.PermissionStatus.GRANTED,
    };
  }

  return {
    city: deviceLocation.city,
    country: deviceLocation.country,
    latitude: deviceLocation.latitude,
    longitude: deviceLocation.longitude,
    permissionDenied: false,
  };
}
