import type { ConversationPreview, MatchWithProfile } from '../types/database';

const NEW_MATCH_MS = 72 * 60 * 60 * 1000;

export function isRecentMatch(matchedAt: string): boolean {
  return Date.now() - new Date(matchedAt).getTime() < NEW_MATCH_MS;
}

/** Recent mutual matches that have not started chatting yet. */
export function pickNewMatches(
  matches: MatchWithProfile[],
  conversations: ConversationPreview[]
): MatchWithProfile[] {
  const conversationByMatchId = new Map(conversations.map((c) => [c.matchId, c]));

  return matches.filter((match) => {
    if (!isRecentMatch(match.matchedAt)) return false;
    const conversation = conversationByMatchId.get(match.matchId);
    if (!conversation) return true;
    return !conversation.lastMessage;
  });
}
