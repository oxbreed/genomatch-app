import { getAuthenticatedUserId } from './auth';
import { registerForPushNotifications } from './notifications';
import { supabase } from './supabase';

/** Persist the device Expo push token on the signed-in profile. */
export async function syncPushTokenToProfile(): Promise<string | null> {
  const token = await registerForPushNotifications();
  if (!token) return null;

  const userId = await getAuthenticatedUserId();
  if (!userId) return null;

  const { error } = await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', userId);

  if (error) {
    console.warn('[push] failed to save expo_push_token', error.message);
    return null;
  }

  return token;
}
