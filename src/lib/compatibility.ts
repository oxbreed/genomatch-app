import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Genotype } from '../types/database';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type FamilyPlanningTier = 'awareness';

export type FamilyPlanningInsight = {
  tier: FamilyPlanningTier;
  title: string;
  summary: string;
  detail: string;
  pairLabel: string;
  icon: IonName;
};

/**
 * Canonical key for an unordered genotype pair.
 * `AS`+`AC` and `AC`+`AS` both produce `ACAS`.
 */
export function genotypePairKey(a: Genotype, b: Genotype): string {
  return [a, b].sort().join('');
}

/**
 * GenoMatch does not label pairings with a health risk.
 * The result is always null so no screen can show "Low risk" or similar.
 */
export function getGenotypeRiskShort(
  _viewerGenotype: Genotype | null,
  _candidateGenotype: Genotype
): string | null {
  return null;
}

const NEUTRAL_INSIGHT: Omit<FamilyPlanningInsight, 'pairLabel'> = {
  tier: 'awareness',
  title: 'Self-reported only',
  summary: 'These letters are what each person typed in. GenoMatch does not assess health or family outcomes.',
  detail: 'This is not a lab test, a diagnosis, or medical advice.',
  icon: 'information-circle-outline',
};

/** Profile note for two self-reported genotypes. No health interpretation. */
export function getFamilyPlanningInsight(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): FamilyPlanningInsight {
  const viewer = viewerGenotype ?? '—';
  return {
    ...NEUTRAL_INSIGHT,
    pairLabel: `${viewer} × ${candidateGenotype}`,
  };
}
