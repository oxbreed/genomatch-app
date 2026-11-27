/** Pronoun options stored in profiles.gender */
export const PROFILE_PRONOUNS = [
  'He/Him',
  'She/Her',
  'They/Them',
  'He/They',
  'She/They',
] as const;

export type ProfilePronoun = (typeof PROFILE_PRONOUNS)[number];

export function parseProfilePronoun(value: unknown): ProfilePronoun | null {
  if (typeof value !== 'string') return null;
  return PROFILE_PRONOUNS.includes(value as ProfilePronoun) ? (value as ProfilePronoun) : null;
}
