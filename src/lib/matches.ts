import type { Genotype, MatchWithProfile, ProfileRow } from '../types/database';
import { logSupabaseResult } from './auth';
import { mapProfileRow } from './profileMapper';
import { getBlockedUserIds, severConnection } from './moderation';
import { getCurrentUserId } from './profiles';
import { supabase } from './supabase';

export type FetchMatchesResult = {
  matches: MatchWithProfile[];
  viewerGenotype: Genotype | null;
};

export async function fetchMatches(): Promise<FetchMatchesResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.log('[matches] fetchMatches — no authenticated user');
    return { matches: [], viewerGenotype: null };
  }

  const { data: matchRows, error: matchError } = await supabase
    .from('matches')
    .select('id, user_a_id, user_b_id, created_at')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  logSupabaseResult('matches.fetchMatches', matchRows, matchError);
  if (matchError) throw matchError;

  const { data: me, error: meError } = await supabase
    .from('profiles')
    .select('genotype')
    .eq('id', userId)
    .maybeSingle();

  logSupabaseResult('matches.viewerGenotype', me, meError);
  if (meError) throw meError;
  const viewerGenotype = (me as { genotype: ProfileRow['genotype'] } | null)?.genotype ?? null;

  if (!matchRows?.length) return { matches: [], viewerGenotype };

  const blockedSet = await getBlockedUserIds(userId);
  const visibleMatches = matchRows.filter((match) => {
    const otherId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;
    return !blockedSet.has(otherId);
  });
  if (!visibleMatches.length) return { matches: [], viewerGenotype };

  const otherIds = visibleMatches.map((m) =>
    m.user_a_id === userId ? m.user_b_id : m.user_a_id
  );

  const { data: profiles, error: profilesError } = await supabase
    .from('public_profiles')
    .select(
      'id, display_name, genotype, city, bio, interests, relationship_goal, avatar_url, photos, date_of_birth'
    )
    .in('id', otherIds);

  logSupabaseResult('matches.matchedProfiles', profiles, profilesError);
  if (profilesError) throw profilesError;

  const profileMap = new Map(
    ((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p])
  );

  return {
    matches: visibleMatches
      .map((match) => {
        const otherId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;
        const row = profileMap.get(otherId);
        if (!row) return null;
        return {
          matchId: match.id,
          profile: mapProfileRow(row, viewerGenotype),
          matchedAt: match.created_at,
        };
      })
      .filter((item): item is MatchWithProfile => item !== null),
    viewerGenotype,
  };
}

export async function unmatchByMatchId(matchId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not signed in');

  const { data: match, error: fetchError } = await supabase
    .from('matches')
    .select('id, user_a_id, user_b_id')
    .eq('id', matchId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!match) throw new Error('Match not found');

  const isParticipant = match.user_a_id === userId || match.user_b_id === userId;
  if (!isParticipant) throw new Error('Not allowed to unmatch');

  const otherId =
    match.user_a_id === userId ? match.user_b_id : match.user_a_id;

  await severConnection(userId, otherId);
}

export async function getMatchIdForProfile(profileId: string): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [userAId, userBId] = userId < profileId ? [userId, profileId] : [profileId, userId];

  const { data, error } = await supabase
    .from('matches')
    .select('id')
    .eq('user_a_id', userAId)
    .eq('user_b_id', userBId)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}
