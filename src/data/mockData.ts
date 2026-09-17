import { resolveDistanceBandFromCities } from '../lib/distanceBands';
import type { DiscoveryProfile } from '../types/database';

export { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';
import { COLORS } from '../theme';

const GENOTYPE_BADGE_STYLE = {
  bg: COLORS.mint,
  text: COLORS.ink,
  border: 'rgba(11, 12, 14, 0.12)',
} as const;

export const GENOTYPE_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  AA: { ...GENOTYPE_BADGE_STYLE },
  AS: { ...GENOTYPE_BADGE_STYLE },
  SS: { ...GENOTYPE_BADGE_STYLE },
  AC: { ...GENOTYPE_BADGE_STYLE },
  SC: { ...GENOTYPE_BADGE_STYLE },
};

export type Genotype = 'AA' | 'AS' | 'SS' | 'AC' | 'SC';

export type MockProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  genotype: Genotype;
  lifestyleMatch: number;
  bio: string;
  interests: string[];
  gradient: [string, string];
  photoUrl?: string;
  lastMessageAt?: string;
};

export const MOCK_MATCHES: MockProfile[] = [
  {
    id: '1',
    name: 'Amara Okafor',
    age: 27,
    city: 'Lagos',
    genotype: 'AA',
    lifestyleMatch: 94,
    bio: 'Architect who loves live music and long walks. Looking for someone intentional, kind, and ready for something real.',
    interests: ['Music', 'Travel', 'Art', 'Food'],
    gradient: ['#C8102E', '#15171A'],
    photoUrl: 'https://genomatch.app/demo/demo-amara.png',
    lastMessageAt: '2h ago',
  },
  {
    id: '2',
    name: 'Kwame Mensah',
    age: 29,
    city: 'Accra',
    genotype: 'AS',
    lifestyleMatch: 87,
    bio: 'Fitness coach and foodie. I value honesty, good conversation, and building a future with the right person.',
    interests: ['Fitness', 'Food', 'Sports', 'Movies'],
    gradient: ['#C8102E', '#8E0B20'],
    photoUrl: 'https://genomatch.app/demo/demo-kwame.png',
    lastMessageAt: 'Yesterday',
  },
  {
    id: '3',
    name: 'Zainab Bello',
    age: 25,
    city: 'Abuja',
    genotype: 'SS',
    lifestyleMatch: 78,
    bio: 'Medical student and book lover. Building a life filled with purpose, laughter, and deep connection.',
    interests: ['Reading', 'Movies', 'Nature', 'Food'],
    gradient: ['#A32D2D', '#7B1F1F'],
    photoUrl: 'https://genomatch.app/demo/demo-zainab.png',
    lastMessageAt: 'Mon',
  },
  {
    id: '4',
    name: 'Amani Mwangi',
    age: 30,
    city: 'Nairobi',
    genotype: 'AC',
    lifestyleMatch: 82,
    bio: 'Software engineer who enjoys hiking and photography. Looking for an honest connection built on shared values and laughter.',
    interests: ['Hiking', 'Photography', 'Tech', 'Music'],
    gradient: ['#C8102E', COLORS.ink],
    photoUrl: 'https://genomatch.app/demo/demo-amani.png',
    lastMessageAt: '3d ago',
  },
];

export const RELATIONSHIP_GOAL_LABELS: Record<string, string> = {
  serious: 'Serious Relationship',
  marriage: 'Marriage',
  friendship: 'Friendship',
};

export type CurrentUserProfile = {
  displayName: string;
  age: number;
  city: string;
  genotype: Genotype;
  bio: string;
  interests: string[];
  relationshipGoal: string;
  gradient: [string, string];
};

export const MOCK_CURRENT_USER: CurrentUserProfile = {
  displayName: 'Jordan Adeyemi',
  age: 28,
  city: 'Lagos',
  genotype: 'AS',
  bio: 'Passionate about meaningful connections, good food, and building a future with the right person. Genotype-aware and intentional about love.',
  interests: ['Music', 'Travel', 'Tech', 'Food'],
  relationshipGoal: 'serious',
  gradient: ['#15171A', '#C8102E'],
};

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function getFirstName(name: string) {
  return name.split(' ')[0];
}

/** Mock cards shown in Discovery when no real profiles exist yet. */
export function getMockDiscoveryProfiles(viewerCity?: string | null): DiscoveryProfile[] {
  const originCity = viewerCity?.trim() || MOCK_CURRENT_USER.city;
  return MOCK_MATCHES.map((p, index) => {
    const photos = p.photoUrl ? [p.photoUrl] : [];
    return {
      id: `mock-${p.id}`,
      name: p.name,
      age: p.age,
      city: p.city,
      distanceBand: resolveDistanceBandFromCities(originCity, p.city),
      genotype: p.genotype,
      lifestyleMatch: p.lifestyleMatch,
      bio: p.bio,
      interests: p.interests,
      gradient: p.gradient,
      avatarUrl: photos[0] ?? null,
      photos,
      genotypeVerified: false,
      verificationStatus: 'unverified',
      drinkingStatus: index % 2 === 0 ? 'socially' : 'never',
      smokingStatus: 'never',
      educationStatus: index % 3 === 0 ? 'bachelors' : 'masters',
      presenceState: index % 3 === 0 ? 'online' : index % 3 === 1 ? 'recently_online' : 'offline',
      isNewMember: index < 2,
      isMock: true,
    };
  });
}
