import { pickNewMatches } from './inboxMatches';
import type { ConversationPreview, DiscoveryProfile, MatchWithProfile } from '../types/database';

const profile: DiscoveryProfile = {
  id: 'p1',
  name: 'Test User',
  age: 28,
  city: 'Lagos',
  genotype: 'AA',
  compatibility: 90,
  bio: 'Bio',
  interests: [],
  gradient: ['#000', '#111'],
  avatarUrl: null,
  photos: [],
  genotypeVerified: false,
  presenceState: 'offline',
  isNewMember: false,
};

function makeMatch(id: string, matchedAt: string): MatchWithProfile {
  return { matchId: id, profile: { ...profile, id }, matchedAt };
}

describe('pickNewMatches', () => {
  it('returns recent matches without a first message', () => {
    const recent = new Date().toISOString();
    const matches = [makeMatch('m1', recent)];
    const conversations: ConversationPreview[] = [
      {
        matchId: 'm1',
        profile,
        lastMessage: null,
        lastMessageAt: null,
        unread: false,
      },
    ];

    expect(pickNewMatches(matches, conversations)).toHaveLength(1);
  });

  it('excludes matches that already have chat history', () => {
    const recent = new Date().toISOString();
    const matches = [makeMatch('m1', recent)];
    const conversations: ConversationPreview[] = [
      {
        matchId: 'm1',
        profile,
        lastMessage: 'Hey!',
        lastMessageAt: recent,
        unread: false,
      },
    ];

    expect(pickNewMatches(matches, conversations)).toHaveLength(0);
  });
});
