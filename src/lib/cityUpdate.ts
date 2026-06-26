import { getDeviceLocation } from './location';
import { supabase } from './supabase';

export type CityUpdateEligibility = {
  canUpdate: boolean;
  reason?: 'not_signed_in' | 'not_found' | 'not_verified' | 'cooldown';
  nextEligibleAt?: string | null;
};

function isMissingRpcError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? '';
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    (msg.includes('function') && msg.includes('does not exist'))
  );
}

export async function fetchCityUpdateEligibility(): Promise<CityUpdateEligibility> {
  const { data, error } = await supabase.rpc('get_my_city_update_eligibility');

  if (error) {
    if (isMissingRpcError(error)) {
      return { canUpdate: false, reason: 'not_verified' };
    }
    throw error;
  }

  const row = (data ?? {}) as {
    can_update?: boolean;
    reason?: string;
    next_eligible_at?: string;
  };

  return {
    canUpdate: row.can_update === true,
    reason: row.reason as CityUpdateEligibility['reason'],
    nextEligibleAt: row.next_eligible_at ?? null,
  };
}

/** GPS-confirmed city change for verified members (server enforces 12-month cooldown). */
export async function updateVerifiedCityFromDevice(): Promise<{ city: string }> {
  const deviceLocation = await getDeviceLocation();
  if (!deviceLocation) {
    throw new Error('Enable location access to confirm your new city.');
  }

  const { data, error } = await supabase.rpc('update_my_verified_city', {
    p_city: deviceLocation.city,
    p_latitude: deviceLocation.latitude,
    p_longitude: deviceLocation.longitude,
    p_country: deviceLocation.country ?? '',
  });

  if (error) {
    throw error;
  }

  const payload = (data ?? {}) as { city?: string };
  return { city: payload.city ?? deviceLocation.city };
}
