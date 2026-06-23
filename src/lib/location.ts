import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { getCurrentProfile, updateProfileFields } from './profiles';

const LAST_LOCATION_KEY = 'genomatch-last-device-location';

export type DeviceLocation = {
  city: string;
  latitude: number;
  longitude: number;
};

type StoredLocation = {
  latitude: number;
  longitude: number;
  city: string;
};

export function normalizeCityLabel(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
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
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

async function writeStoredLocation(location: StoredLocation): Promise<void> {
  await SecureStore.setItemAsync(LAST_LOCATION_KEY, JSON.stringify(location));
}

export type SyncProfileLocationResult = {
  updated: boolean;
  city: string | null;
  permissionDenied: boolean;
};

/** Resolve city from GPS and persist to profile when it changes. */
export async function syncProfileCityFromDevice(options?: {
  force?: boolean;
}): Promise<SyncProfileLocationResult> {
  const deviceLocation = await getDeviceLocation();
  if (!deviceLocation) {
    const { status } = await Location.getForegroundPermissionsAsync();
    return {
      updated: false,
      city: null,
      permissionDenied: status !== Location.PermissionStatus.GRANTED,
    };
  }

  const profile = await getCurrentProfile();
  const profileCity = profile?.city?.trim() ?? '';
  const cityChanged = !citiesMatch(profileCity, deviceLocation.city);

  if (!options?.force && !cityChanged) {
    await writeStoredLocation({
      latitude: deviceLocation.latitude,
      longitude: deviceLocation.longitude,
      city: deviceLocation.city,
    });
    return { updated: false, city: deviceLocation.city, permissionDenied: false };
  }

  await updateProfileFields({ city: deviceLocation.city });
  await writeStoredLocation({
    latitude: deviceLocation.latitude,
    longitude: deviceLocation.longitude,
    city: deviceLocation.city,
  });

  return { updated: true, city: deviceLocation.city, permissionDenied: false };
}

/** Read city for onboarding without writing to profile yet. */
export async function detectDeviceCity(): Promise<{
  city: string | null;
  permissionDenied: boolean;
}> {
  const deviceLocation = await getDeviceLocation();
  if (!deviceLocation) {
    const { status } = await Location.getForegroundPermissionsAsync();
    return {
      city: null,
      permissionDenied: status !== Location.PermissionStatus.GRANTED,
    };
  }

  return { city: deviceLocation.city, permissionDenied: false };
}
