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

  const { error } = await supabase.from('blocks').upsert(
    { blocker_id: blockerId, blocked_id: blockedId },
    { onConflict: 'blocker_id,blocked_id' }
  );

  if (error) throw error;
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
