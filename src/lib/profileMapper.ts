import type { DiscoveryProfile, Genotype, ProfileRow } from '../types/database';
import { computeCompatibility } from './compatibility';

const GRADIENTS: [string, string][] = [
  ['#2A5C40', '#0D2818'],
  ['#3D7A52', '#1A3D28'],
  ['#185FA5', '#0D47A1'],
  ['#6A4C93', '#4A2C6A'],
  ['#D4A843', '#8B6914'],
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

/** Ordered gallery URLs; avatar_url is always first when present. */
export function resolveProfilePhotos(
  avatarUrl: string | null,
  photos: string[] | null | undefined
): string[] {
  const fromColumn = (photos ?? []).map((u) => u?.trim()).filter(Boolean) as string[];
  const avatar = avatarUrl?.trim();

  if (fromColumn.length > 0) {
    if (avatar && fromColumn[0] !== avatar) {
      const rest = fromColumn.filter((u) => u !== avatar);
      return [avatar, ...rest];
    }
    return fromColumn;
  }

  return avatar ? [avatar] : [];
}

export function isGenotypeVerified(row: Pick<ProfileRow, 'genotype_verified' | 'verification_status'>): boolean {
  return row.genotype_verified === true || row.verification_status === 'verified';
}

export function mapProfileRow(
  row: ProfileRow,
  viewerGenotype: Genotype | null
): DiscoveryProfile {
  const genotype = row.genotype ?? 'AA';
  const photos = resolveProfilePhotos(row.avatar_url, row.photos);
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
    avatarUrl: photos[0] ?? row.avatar_url,
    photos,
    relationshipGoal: row.relationship_goal,
    genotypeVerified: isGenotypeVerified(row),
    verificationStatus: row.verification_status ?? 'unverified',
  };
}
