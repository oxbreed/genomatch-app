import type { DiscoveryProfile, Genotype, ProfileRow } from '../types/database';
import { computeCompatibility } from './compatibility';

const GRADIENTS: [string, string][] = [
  ['#1B7A6E', '#074D2E'],
  ['#2E7D32', '#1B5E20'],
  ['#185FA5', '#0D47A1'],
  ['#6A4C93', '#4A2C6A'],
  ['#C9872B', '#8B5A14'],
];

export function ageFromDateOfBirth(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function gradientFromId(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 1000;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export function mapProfileRow(
  row: ProfileRow,
  viewerGenotype: Genotype | null
): DiscoveryProfile {
  const genotype = row.genotype ?? 'AA';
  return {
    id: row.id,
    name: row.display_name?.trim() || 'GenoMatch Member',
    age: ageFromDateOfBirth(row.date_of_birth),
    city: row.city?.trim() || 'Nearby',
    genotype,
    compatibility: computeCompatibility(viewerGenotype, genotype),
    bio: row.bio?.trim() || '',
    interests: row.interests ?? [],
    gradient: gradientFromId(row.id),
    avatarUrl: row.avatar_url,
    relationshipGoal: row.relationship_goal,
  };
}
