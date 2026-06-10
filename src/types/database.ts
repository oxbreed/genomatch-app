export type Genotype = 'AA' | 'AS' | 'SS' | 'AC';

export type PresenceState = 'online' | 'recently_online' | 'offline';

export type ProfileRow = {
  id: string;
  email: string | null;
  genotype: Genotype | null;
  display_name: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  bio: string | null;
  date_of_birth: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  interests: string[] | null;
  relationship_goal: string | null;
  onboarding_completed: boolean;
  verification_status: string;
  genotype_verified: boolean;
  height_cm: number | null;
  religion: string | null;
  drinking_status: string | null;
  smoking_status: string | null;
  education_status: string | null;
  last_active_at: string | null;
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
  read_at: string | null;
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
  photos: string[];
  relationshipGoal?: string | null;
  genotypeVerified: boolean;
  verificationStatus?: string | null;
  heightCm?: number | null;
  religion?: string | null;
  drinkingStatus?: string | null;
  smokingStatus?: string | null;
  educationStatus?: string | null;
  presenceState: PresenceState;
  isNewMember: boolean;
  createdAt?: string | null;
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
