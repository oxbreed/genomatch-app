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
  title: 'Genotype compatibility',
  summary: 'These letters are the genotypes you each entered, so you can see compatibility at a glance.',
  detail: 'GenoMatch does not provide medical advice; talk to a qualified health professional.',
  icon: 'information-circle-outline',
};

/** Profile note for two self-reported genotypes. Letters only — no clinical interpretation. */
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
