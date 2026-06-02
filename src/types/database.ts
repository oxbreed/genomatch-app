export type Genotype = 'AA' | 'AS' | 'SS' | 'AC';

export type ProfileRow = {
  id: string;
  email: string | null;
  genotype: Genotype | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  interests: string[] | null;
  relationship_goal: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type MatchRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
};

export type MessageRow = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type DiscoveryProfile = {
  id: string;
  name: string;
  age: number | null;
  city: string;
  genotype: Genotype;
  compatibility: number;
  bio: string;
  interests: string[];
  gradient: [string, string];
  avatarUrl: string | null;
  relationshipGoal?: string | null;
  isMock?: boolean;
};

export type MatchWithProfile = {
  matchId: string;
  profile: DiscoveryProfile;
  matchedAt: string;
};

export type ConversationPreview = {
  matchId: string;
  profile: DiscoveryProfile;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: boolean;
};
