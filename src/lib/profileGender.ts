import type { DiscoveryInterest } from './discoveryInterest';

/** Values written at signup in ProfileSetup. */
export const PROFILE_SETUP_GENDERS = ['Male', 'Female', 'Other'] as const;

const WOMEN_VALUES = new Set([
  'female',
  'woman',
  'women',
  'she/her',
  'she/they',
]);

const MEN_VALUES = new Set([
  'male',
  'man',
  'men',
  'he/him',
  'he/they',
]);

export type GenderBucket = 'women' | 'men' | 'beyond_binary';

/** Map a stored profiles.gender value, whether it is Male/Female or a pronoun. */
export function genderBucket(value: string | null | undefined): GenderBucket | null {
  if (!value || typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  if (!key) return null;
  if (WOMEN_VALUES.has(key)) return 'women';
  if (MEN_VALUES.has(key)) return 'men';
  return 'beyond_binary';
}

export function profileMatchesInterestedIn(
  gender: string | null | undefined,
  interestedIn: readonly DiscoveryInterest[]
): boolean {
  if (!interestedIn.length || interestedIn.includes('everyone')) return true;
  const bucket = genderBucket(gender);
  if (!bucket) return false;
  return interestedIn.includes(bucket);
}
