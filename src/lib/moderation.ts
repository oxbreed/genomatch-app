import { getAuthenticatedUserId } from './auth';
import { supabase } from './supabase';
import { sanitizeText } from './validation';

export const REPORT_REASONS = [
  'Fake profile',
  'Inappropriate content',
  'Harassment',
  'Spam',
  'Other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/** Remove match row and bilateral likes so blocked/unmatched users can be managed cleanly. */
export async function severConnection(userId: string, otherId: string): Promise<void> {
  const [userAId, userBId] = userId < otherId ? [userId, otherId] : [otherId, userId];

  await Promise.all([
    supabase.from('matches').delete().eq('user_a_id', userAId).eq('user_b_id', userBId),
    supabase.from('likes').delete().eq('liker_id', userId).eq('liked_id', otherId),
    supabase.from('likes').delete().eq('liker_id', otherId).eq('liked_id', userId),
  ]);
}

/** Submit a report against another user. */
export async function reportUser(
  reportedId: string,
  reason: string,
  details?: string
): Promise<void> {
  const reporterId = await getAuthenticatedUserId();
  if (!reporterId) throw new Error('Not signed in');
  if (reporterId === reportedId) throw new Error('Cannot report yourself');

  const trimmedReason = sanitizeText(reason);
  if (!trimmedReason) throw new Error('Report reason is required');

  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    reported_id: reportedId,
    reason: trimmedReason,
    details: details ? sanitizeText(details) : null,
  });

  if (error) throw error;
}

/** Block another user so they no longer appear in your experience. */
export async function blockUser(blockedId: string): Promise<void> {
  const blockerId = await getAuthenticatedUserId();
  if (!blockerId) throw new Error('Not signed in');
  if (blockerId === blockedId) throw new Error('Cannot block yourself');

  const { error: insertError } = await supabase.from('blocks').insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  });

  // Unique violation = already blocked
  if (insertError && insertError.code !== '23505') {
    throw insertError;
  }

  await severConnection(blockerId, blockedId);
}

/** Profile ids the current user has blocked. */
export async function getBlockedUserIds(userId: string): Promise<Set<string>> {
  const blocked = new Set<string>();

  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);

    if (error) throw error;
    for (const row of data ?? []) {
      blocked.add(row.blocked_id);
    }
  } catch {
    // blocks table may not exist until migration is applied
  }

  return blocked;
}
