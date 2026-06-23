import { getAuthenticatedUserId } from './auth';
import { registerForPushNotifications } from './notifications';
import { supabase } from './supabase';

/** Persist the device Expo push token on the signed-in profile. */
export async function syncPushTokenToProfile(): Promise<string | null> {
  const token = await registerForPushNotifications();
  if (!token) return null;

  const userId = await getAuthenticatedUserId();
  if (!userId) return null;

  const { error } = await supabase.rpc('save_expo_push_token', { token });

  if (error) {
    const missingRpc =
      error.code === 'PGRST202' ||
      error.code === '42883' ||
      error.message.toLowerCase().includes('does not exist');

    if (missingRpc) {
      const { error: fallbackError } = await supabase
        .from('profiles')
        .update({ expo_push_token: token })
        .eq('id', userId);

      if (fallbackError) {
        console.warn('[push] failed to save expo_push_token', fallbackError.message);
        return null;
      }
      return token;
    }

    console.warn('[push] failed to save expo_push_token', error.message);
    return null;
  }

  return token;
}
