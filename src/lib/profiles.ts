import type { PostgrestError } from '@supabase/supabase-js';
import { getSeenProfileIds } from './likes';
import { getBlockedUserIds } from './moderation';
import { parseDistanceBand } from './distanceBands';
import type { DiscoveryProfile, DistanceBand, Genotype, ProfileRow } from '../types/database';
import { getAuthenticatedUserId, logSupabaseResult } from './auth';
import { mapProfileRow, resolveProfilePhotos } from './profileMapper';
import { getVerificationEligibility } from './verification';
import { supabase } from './supabase';
import { sanitizeText } from './validation';

const CORE_PROFILE_FIELDS =
  'id, email, genotype, display_name, avatar_url, photos, bio, date_of_birth, city, country, gender, interests, relationship_goal, onboarding_completed, verification_status, genotype_verified, created_at, updated_at';

const EXTENDED_PROFILE_FIELDS =
  'height_cm, religion, drinking_status, smoking_status, education_status, last_active_at';

const PROFILE_FIELDS = `${CORE_PROFILE_FIELDS}, ${EXTENDED_PROFILE_FIELDS}`;

/** Public profile fields for discovery — excludes email and other private columns. */
const CORE_PUBLIC_PROFILE_FIELDS =
  'id, display_name, date_of_birth, city, country, gender, genotype, genotype_verified, photos, bio, interests, relationship_goal, verification_status, created_at';

const EXTENDED_PUBLIC_PROFILE_FIELDS =
  'height_cm, religion, drinking_status, smoking_status, education_status, last_active_at';

export const PUBLIC_PROFILE_FIELDS = `${CORE_PUBLIC_PROFILE_FIELDS}, ${EXTENDED_PUBLIC_PROFILE_FIELDS}`;

export { resolveProfilePhotos };

function isMissingColumnError(error: PostgrestError | null): boolean {
  if (!error) return false;
  const msg = error.message.toLowerCase();
  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    msg.includes('does not exist') ||
    msg.includes('could not find') ||
    msg.includes('column')
  );
}

function isMissingRpcError(error: PostgrestError | null): boolean {
  if (!error) return false;
  const msg = error.message.toLowerCase();
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    msg.includes('function') && msg.includes('does not exist')
  );
}

export async function fetchDistanceBandsForProfiles(
  profileIds: string[]
): Promise<Map<string, DistanceBand>> {
  const bands = new Map<string, DistanceBand>();
  if (!profileIds.length) return bands;

  const { data, error } = await supabase.rpc('coarse_distance_bands_for_profiles', {
    target_ids: profileIds,
  });

  if (error) {
    if (isMissingRpcError(error)) return bands;
    throw error;
  }

  for (const row of (data ?? []) as { profile_id: string; distance_band: string }[]) {
    bands.set(row.profile_id, parseDistanceBand(row.distance_band));
  }

  return bands;
}

function normalizeProfileRow(row: Record<string, unknown>): ProfileRow {
  return {
    height_cm: null,
    religion: null,
    drinking_status: null,
    smoking_status: null,
    education_status: null,
    last_active_at: null,
    ...row,
  } as ProfileRow;
}

async function selectOwnProfile(
  userId: string,
  options?: { single?: boolean }
): Promise<{ data: ProfileRow | null; error: PostgrestError | null }> {
  const builder = supabase.from('profiles').select(PROFILE_FIELDS).eq('id', userId);
  const result = options?.single
    ? await builder.single()
    : await builder.maybeSingle();

  if (!result.error) {
    return {
      data: result.data ? normalizeProfileRow(result.data as Record<string, unknown>) : null,
      error: null,
    };
  }

  if (!isMissingColumnError(result.error)) {
    return { data: null, error: result.error };
  }

  console.warn('[profiles] extended columns missing — falling back to core profile fields');
  const fallbackBuilder = supabase.from('profiles').select(CORE_PROFILE_FIELDS).eq('id', userId);
  const fallback = options?.single
    ? await fallbackBuilder.single()
    : await fallbackBuilder.maybeSingle();

  if (fallback.error) {
    return { data: null, error: fallback.error };
  }

  return {
    data: fallback.data ? normalizeProfileRow(fallback.data as Record<string, unknown>) : null,
    error: null,
  };
}

async function fetchPublicProfilesWithFallback(
  build: (fields: string) => PromiseLike<{ data: unknown; error: PostgrestError | null }>
): Promise<{ data: ProfileRow[]; error: PostgrestError | null }> {
  const primary = await build(PUBLIC_PROFILE_FIELDS);

  if (!primary.error) {
    return {
      data: ((primary.data ?? []) as Record<string, unknown>[]).map(normalizeProfileRow),
      error: null,
    };
  }

  if (!isMissingColumnError(primary.error)) {
    return { data: [], error: primary.error };
  }

  console.warn('[profiles] extended public columns missing — falling back to core public fields');
  const fallback = await build(CORE_PUBLIC_PROFILE_FIELDS);

  if (fallback.error) {
    return { data: [], error: fallback.error };
  }

  return {
    data: ((fallback.data ?? []) as Record<string, unknown>[]).map(normalizeProfileRow),
    error: null,
  };
}

/** Fetch public profile rows by user id (matches, messages). */
export async function fetchPublicProfilesByIds(ids: string[]): Promise<ProfileRow[]> {
  if (!ids.length) return [];

  const { data, error } = await fetchPublicProfilesWithFallback((fields) =>
    supabase.from('public_profiles').select(fields).in('id', ids)
  );

  if (error) throw error;
  return data;
}

export async function getCurrentUserId(): Promise<string | null> {
  return getAuthenticatedUserId();
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    console.log('[profiles] getCurrentProfile — no authenticated user');
    return null;
  }

  const { data, error } = await selectOwnProfile(userId);

  logSupabaseResult('profiles.getCurrentProfile', data, error);
  if (error) throw error;

  if (!data) return null;

  const row = data;

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

  const { error: insertError } = await supabase.from('profiles').insert(payload);
  logSupabaseResult('profiles.ensureUserProfile.insert', null, insertError);
  if (insertError) throw insertError;

  const { data, error } = await selectOwnProfile(user.id, { single: true });
  logSupabaseResult('profiles.ensureUserProfile', data, error);
  if (error) throw error;
  return data;
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

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', profile.id);

  logSupabaseResult('profiles.syncOnboardingIfNeeded.update', null, updateError);
  if (updateError) throw updateError;

  const { data, error } = await selectOwnProfile(profile.id, { single: true });
  logSupabaseResult('profiles.syncOnboardingIfNeeded', data, error);
  if (error) throw error;
  return data;
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
    .select('genotype')
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

  const rpcResult = await supabase.rpc('discovery_profiles_for_viewer', { max_rows: 50 });

  let rows: { row: ProfileRow; distanceBand: DistanceBand | null }[] = [];

  if (!rpcResult.error && rpcResult.data) {
    rows = (rpcResult.data as Record<string, unknown>[]).map((raw) => {
      const { distance_band: distanceBandRaw, ...rest } = raw;
      return {
        row: normalizeProfileRow(rest),
        distanceBand: parseDistanceBand(distanceBandRaw),
      };
    });
  } else if (rpcResult.error && isMissingRpcError(rpcResult.error)) {
    const { data, error } = await fetchPublicProfilesWithFallback((fields) =>
      supabase
        .from('public_profiles')
        .select(fields)
        .neq('id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
    );

    if (error) throw error;
    rows = data.map((row) => ({ row, distanceBand: null }));
  } else if (rpcResult.error) {
    throw rpcResult.error;
  }

  const profiles = rows
    .filter(({ row }) => !seenSet.has(row.id) && !blockedSet.has(row.id))
    .map(({ row, distanceBand }) =>
      mapProfileRow(row, viewerGenotype, { distanceBand })
    );

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
      | 'height_cm'
      | 'religion'
      | 'drinking_status'
      | 'smoking_status'
      | 'education_status'
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
  if (!error) return;

  if (!isMissingColumnError(error)) throw error;

  const corePayload = { ...payload };
  for (const key of [
    'height_cm',
    'religion',
    'drinking_status',
    'smoking_status',
    'education_status',
  ] as const) {
    delete corePayload[key];
  }

  const { error: retryError } = await supabase
    .from('profiles')
    .update(corePayload)
    .eq('id', userId);

  if (retryError) throw retryError;
}

/** Self-declare genotype accuracy (builds trust with matches). Requires photo + profile basics. */
export async function verifyGenotype(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not signed in');

  const row = await getCurrentProfile();
  const eligibility = getVerificationEligibility(row);
  if (!eligibility.ok) {
    throw new Error(eligibility.message);
  }

  const payload: Record<string, unknown> = {
    verification_status: 'verified',
    genotype_verified: true,
  };

  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);

  if (error) throw error;
}

export type ViewerProfileSnapshot = {
  name: string;
  avatarUrl: string | null;
  photos: string[];
  gradient: [string, string];
  genotypeVerified: boolean;
};

/** Current member snapshot for match modals and headers. */
export async function getViewerProfileSnapshot(): Promise<ViewerProfileSnapshot | null> {
  const row = await getCurrentProfile();
  if (!row) return null;

  const mapped = mapProfileRow(row, row.genotype ?? null);
  return {
    name: mapped.name,
    avatarUrl: mapped.avatarUrl ?? null,
    photos: mapped.photos,
    gradient: mapped.gradient,
    genotypeVerified: mapped.genotypeVerified,
  };
}
