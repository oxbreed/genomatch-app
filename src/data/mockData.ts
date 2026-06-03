import type { DiscoveryProfile } from '../types/database';

export { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '../theme';
import { COLORS } from '../theme';

export const GENOTYPE_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  AA: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  AS: { bg: '#FFF8E6', text: '#BA7517', border: '#D4A843' },
  SS: { bg: '#FFEBEE', text: '#A32D2D', border: '#EF9A9A' },
  AC: { bg: '#E3F2FD', text: '#185FA5', border: '#90CAF9' },
};

export type Genotype = 'AA' | 'AS' | 'SS' | 'AC';

export type MockProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  genotype: Genotype;
  compatibility: number;
  bio: string;
  interests: string[];
  gradient: [string, string];
  lastMessageAt?: string;
};

export const MOCK_MATCHES: MockProfile[] = [
  {
    id: '1',
    name: 'Amara Okafor',
    age: 27,
    city: 'Lagos',
    genotype: 'AA',
    compatibility: 94,
    bio: 'Architect who loves live music and long walks. Looking for someone intentional, kind, and ready for something real.',
    interests: ['Music', 'Travel', 'Art', 'Food'],
    gradient: ['#2A5C40', '#1A3D28'],
    lastMessageAt: '2h ago',
  },
  {
    id: '2',
    name: 'Kwame Mensah',
    age: 29,
    city: 'Accra',
    genotype: 'AS',
    compatibility: 87,
    bio: 'Fitness coach and foodie. I value honesty, good conversation, and building a future with the right person.',
    interests: ['Fitness', 'Food', 'Sports', 'Movies'],
    gradient: ['#2E7D32', '#1B5E20'],
    lastMessageAt: 'Yesterday',
  },
  {
    id: '3',
    name: 'Zainab Bello',
    age: 25,
    city: 'Abuja',
    genotype: 'SS',
    compatibility: 78,
    bio: 'Medical student and book lover. Building a life filled with purpose, laughter, and deep connection.',
    interests: ['Reading', 'Movies', 'Nature', 'Food'],
    gradient: ['#A32D2D', '#7B1F1F'],
    lastMessageAt: 'Mon',
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
  gradient: ['#1A3D28', '#2A5C40'],
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
export function getMockDiscoveryProfiles(): DiscoveryProfile[] {
  return MOCK_MATCHES.map((p) => ({
    id: `mock-${p.id}`,
    name: p.name,
    age: p.age,
    city: p.city,
    genotype: p.genotype,
    compatibility: p.compatibility,
    bio: p.bio,
    interests: p.interests,
    gradient: p.gradient,
    avatarUrl: null,
    photos: [],
    genotypeVerified: false,
    verificationStatus: 'unverified',
    isMock: true,
  }));
}
