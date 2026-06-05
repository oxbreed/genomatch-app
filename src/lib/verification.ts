import type { ProfileRow } from '../types/database';
import { resolveProfilePhotos } from './profileMapper';

export type VerificationBlockReason =
  | 'not_signed_in'
  | 'missing_photo'
  | 'missing_name'
  | 'missing_genotype'
  | 'already_verified';

export type VerificationEligibility = {
  ok: true;
} | {
  ok: false;
  reason: VerificationBlockReason;
  message: string;
};

const REASON_MESSAGES: Record<Exclude<VerificationBlockReason, 'already_verified'>, string> = {
  not_signed_in: 'Sign in to verify your profile.',
  missing_photo: 'Add at least one profile photo before verifying — matches need to see the real you.',
  missing_name: 'Add your display name before verifying.',
  missing_genotype: 'Set your genotype before verifying.',
};

/** Checks whether a member can complete identity verification. */
export function getVerificationEligibility(
  row: ProfileRow | null,
  options?: { allowAlreadyVerified?: boolean }
): VerificationEligibility {
  if (!row) {
    return { ok: false, reason: 'not_signed_in', message: REASON_MESSAGES.not_signed_in };
  }

  const alreadyVerified =
    row.genotype_verified === true || row.verification_status === 'verified';
  if (alreadyVerified && !options?.allowAlreadyVerified) {
    return {
      ok: false,
      reason: 'already_verified',
      message: 'Your profile is already verified.',
    };
  }

  const photos = resolveProfilePhotos(row.avatar_url, row.photos);
  if (photos.length === 0) {
    return { ok: false, reason: 'missing_photo', message: REASON_MESSAGES.missing_photo };
  }

  if (!row.display_name?.trim()) {
    return { ok: false, reason: 'missing_name', message: REASON_MESSAGES.missing_name };
  }

  if (!row.genotype) {
    return { ok: false, reason: 'missing_genotype', message: REASON_MESSAGES.missing_genotype };
  }

  return { ok: true };
}

export const VERIFICATION_ATTESTATIONS = [
  {
    id: 'identity',
    label: 'I am the person shown in my profile photos',
  },
  {
    id: 'genotype',
    label: 'My declared genotype is accurate to the best of my knowledge',
  },
  {
    id: 'conduct',
    label: 'I understand false information may lead to removal from Genomatch Ltd Nigeria',
  },
] as const;

export type VerificationAttestationId = (typeof VERIFICATION_ATTESTATIONS)[number]['id'];
