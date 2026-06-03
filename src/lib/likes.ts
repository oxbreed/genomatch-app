import { sendLocalNotification } from './notifications';
import { getCurrentUserId } from './profiles';
import { rateLimitAction } from './rateLimit';
import { supabase } from './supabase';

const SWIPE_RATE_KEY = 'swipe';
const SWIPE_MAX_PER_HOUR = 100;
const SWIPE_WINDOW_MS = 3_600_000;

function assertSwipeRateLimit(userId: string): void {
  const key = `${SWIPE_RATE_KEY}:${userId}`;
  if (!rateLimitAction(key, SWIPE_MAX_PER_HOUR, SWIPE_WINDOW_MS)) {
    throw new Error('Swipe limit reached. Please try again later.');
  }
}

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export type LikeResult = {
  isMutualMatch: boolean;
  matchId: string | null;
};

/** Record a like; creates a match row when both users have liked each other. */
export async function recordLike(likedId: string): Promise<LikeResult> {
  const likerId = await getCurrentUserId();
  if (!likerId) throw new Error('Not signed in');

  assertSwipeRateLimit(likerId);

  const { error: likeError } = await supabase.from('likes').upsert(
    { liker_id: likerId, liked_id: likedId },
    { onConflict: 'liker_id,liked_id' }
  );

  if (likeError) throw likeError;

  const { data: mutual, error: mutualError } = await supabase
    .from('likes')
    .select('id')
    .eq('liker_id', likedId)
    .eq('liked_id', likerId)
    .maybeSingle();

  if (mutualError) throw mutualError;
  if (!mutual) {
    return { isMutualMatch: false, matchId: null };
  }

  const [userAId, userBId] = orderedPair(likerId, likedId);

  const { data: existing, error: existingError } = await supabase
    .from('matches')
    .select('id')
    .eq('user_a_id', userAId)
    .eq('user_b_id', userBId)
    .maybeSingle();

  if (existingError) throw existingError;

  let matchId: string;
  if (existing) {
    matchId = existing.id;
  } else {
    const { data: created, error: createError } = await supabase
      .from('matches')
      .insert({ user_a_id: userAId, user_b_id: userBId })
      .select('id')
      .single();

    if (createError) throw createError;
    matchId = created.id;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', likedId)
    .maybeSingle();

  const name = profile?.display_name?.trim().split(/\s+/)[0] || 'Someone';

  try {
    await sendLocalNotification(
      "It's a Match! 💚",
      `You and ${name} liked each other. Start a conversation!`
    );
  } catch {
    // Non-fatal if notification permission or delivery fails
  }

  return { isMutualMatch: true, matchId };
}

/** Record a pass so this profile is hidden from Discovery. */
export async function recordPass(passedId: string): Promise<void> {
  const passerId = await getCurrentUserId();
  if (!passerId) throw new Error('Not signed in');

  assertSwipeRateLimit(passerId);

  const { error } = await supabase.from('passes').upsert(
    { passer_id: passerId, passed_id: passedId },
    { onConflict: 'passer_id,passed_id' }
  );

  if (error) throw error;
}

/** Profile ids the current user has already liked or passed. */
export async function getSeenProfileIds(userId: string): Promise<Set<string>> {
  const seen = new Set<string>();

  const [{ data: likes, error: likesError }, { data: passes, error: passesError }] =
    await Promise.all([
      supabase.from('likes').select('liked_id').eq('liker_id', userId),
      supabase.from('passes').select('passed_id').eq('passer_id', userId),
    ]);

  if (likesError) throw likesError;
  if (passesError) throw passesError;

  for (const row of likes ?? []) seen.add(row.liked_id);
  for (const row of passes ?? []) seen.add(row.passed_id);

  return seen;
}
