import { getCurrentUserId } from './profiles';
import { supabase } from './supabase';

export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
export const RECENTLY_ONLINE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
export const NEW_MEMBER_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export type PresenceState = 'online' | 'recently_online' | 'offline';

export function resolvePresenceState(lastActiveAt: string | null | undefined): PresenceState {
  if (!lastActiveAt) return 'offline';
  const elapsed = Date.now() - new Date(lastActiveAt).getTime();
  if (elapsed <= ONLINE_THRESHOLD_MS) return 'online';
  if (elapsed <= RECENTLY_ONLINE_THRESHOLD_MS) return 'recently_online';
  return 'offline';
}

export function isNewMember(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() <= NEW_MEMBER_THRESHOLD_MS;
}

/** Update the signed-in user's last_active_at timestamp. */
export async function touchLastActive(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.warn('[presence] touchLastActive failed:', error.message);
  }
}
