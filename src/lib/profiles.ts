import { getSeenProfileIds } from './likes';
import { getBlockedUserIds } from './moderation';
import type { DiscoveryProfile, Genotype, ProfileRow } from '../types/database';
import { getAuthenticatedUserId, logSupabaseResult } from './auth';
import { mapProfileRow, resolveProfilePhotos } from './profileMapper';
import { supabase } from './supabase';
import { sanitizeText } from './validation';

const PROFILE_FIELDS =
  'id, email, genotype, display_name, avatar_url, photos, bio, date_of_birth, city, country, gender, interests, relationship_goal, onboarding_completed, created_at, updated_at';

export { resolveProfilePhotos };

export async function getCurrentUserId(): Promise<string | null> {
  return getAuthenticatedUserId();
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    console.log('[profiles] getCurrentProfile — no authenticated user');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', userId)
    .maybeSingle();

  logSupabaseResult('profiles.getCurrentProfile', data, error);
  if (error) throw error;

  if (!data) return null;

  const row = data as ProfileRow;

  if (!row.genotype) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const metaGenotype = session?.user?.user_metadata?.genotype as
      | Genotype
      | undefined;
    if (metaGenotype) {
      row.genotype = metaGenotype;
    }
  }

  return row;
}

/** Create a profiles row from auth metadata if the signup trigger missed it. */
export async function ensureUserProfile(): Promise<ProfileRow | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  const existing = await getCurrentProfile();
  if (existing) return existing;

  const metaGenotype = user.user_metadata?.genotype as Genotype | undefined;
  const payload = {
    id: user.id,
    email: user.email ?? null,
    genotype:
      metaGenotype && ['AA', 'AS', 'SS', 'AC'].includes(metaGenotype)
        ? metaGenotype
        : null,
  };

  const { data, error } = await supabase.from('profiles').insert(payload).select(PROFILE_FIELDS).single();

  logSupabaseResult('profiles.ensureUserProfile', data, error);
  if (error) throw error;
  return data as ProfileRow;
}

export function isProfileComplete(profile: ProfileRow | null): boolean {
  if (!profile) return false;
  if (profile.onboarding_completed === true) return true;
  return !!profile.display_name?.trim();
}

/** Backfill onboarding_completed for profiles that already have a display name. */
export async function syncOnboardingIfNeeded(
  profile: ProfileRow | null
): Promise<ProfileRow | null> {
  if (!profile) return null;
  if (profile.onboarding_completed || !profile.display_name?.trim()) {
    return profile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', profile.id)
    .select(PROFILE_FIELDS)
    .single();

  logSupabaseResult('profiles.syncOnboardingIfNeeded', data, error);
  if (error) throw error;
  return data as ProfileRow;
}

/** Route after sign-in based on profile completion. */
export async function resolvePostSignInScreen(): Promise<'profileSetup' | 'main'> {
  await ensureUserProfile();
  let profile = await getCurrentProfile();
  profile = await syncOnboardingIfNeeded(profile);
  if (!isProfileComplete(profile)) return 'profileSetup';
  return 'main';
}

/** Where to send the user on app launch based on session + profile row. */
export async function resolveInitialScreen(): Promise<
  'onboarding' | 'profileSetup' | 'main'
> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return 'onboarding';

  await ensureUserProfile();

  let profile = await getCurrentProfile();
  profile = await syncOnboardingIfNeeded(profile);
  if (!isProfileComplete(profile)) return 'profileSetup';

  return 'main';
}

export async function fetchDiscoveryProfiles(): Promise<{
  profiles: DiscoveryProfile[];
  viewerGenotype: Genotype | null;
}> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { profiles: [], viewerGenotype: null };
  }

  const { data: me, error: meError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (meError) throw meError;
  const viewerGenotype = (me as ProfileRow | null)?.genotype ?? null;

  let seenSet = new Set<string>();
  try {
    seenSet = await getSeenProfileIds(userId);
  } catch {
    // likes/passes tables may not exist yet — still show profiles
  }

  const blockedSet = await getBlockedUserIds(userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const profiles = ((data ?? []) as ProfileRow[])
    .filter((row) => !seenSet.has(row.id) && !blockedSet.has(row.id))
    .map((row) => mapProfileRow(row, viewerGenotype));

  return { profiles, viewerGenotype };
}

export async function updateProfileAvatar(avatarUrl: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not signed in');

  const row = await getCurrentProfile();
  const photos = resolveProfilePhotos(avatarUrl, row?.photos);
  const nextPhotos = photos.length > 0 ? photos : [avatarUrl];

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, photos: nextPhotos })
    .eq('id', userId);

  if (error) throw error;
}

/** Persist the full photo gallery; first photo syncs to avatar_url. */
export async function updateProfilePhotos(photos: string[]): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not signed in');

  const cleaned = photos.map((u) => u.trim()).filter(Boolean);
  const avatar_url = cleaned[0] ?? null;

  const { error } = await supabase
    .from('profiles')
    .update({ photos: cleaned, avatar_url })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateProfileFields(
  fields: Partial<
    Pick<
      ProfileRow,
      | 'display_name'
      | 'city'
      | 'bio'
      | 'interests'
      | 'gender'
      | 'relationship_goal'
      | 'date_of_birth'
      | 'avatar_url'
    >
  >
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not signed in');

  const payload = { ...fields };
  if (payload.display_name != null) {
    payload.display_name = sanitizeText(payload.display_name);
  }
  if (payload.city != null) {
    payload.city = sanitizeText(payload.city);
  }
  if (payload.bio != null) {
    payload.bio = sanitizeText(payload.bio);
  }

  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  if (error) throw error;
}
