import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Genotype } from '../types/database';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type FamilyPlanningTier = 'favourable' | 'low_risk' | 'awareness' | 'counseling';

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
 * `AS`+`AC` and `AC`+`AS` both produce `ACAS`. Every lookup table must use
 * this helper's output; hand-written keys in the wrong order miss silently.
 */
export function genotypePairKey(a: Genotype, b: Genotype): string {
  return [a, b].sort().join('');
}

/**
 * Short risk label for swipe cards and match rows.
 *
 * Returns `null` for any unmapped pairing — an explicit unresolved state.
 * Consumers MUST hide the label entirely when the result is `null`; they must
 * never substitute a default like "Compatible".
 */
export function getGenotypeRiskShort(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): string | null {
  if (!viewerGenotype) return null;

  const riskByPair: Record<string, string> = {
    AAAA: 'Very low risk',
    AAAS: 'Low risk',
    AAAC: 'Low risk',
    AASC: 'Low risk',
    AASS: 'Elevated risk',
    ASAS: 'Moderate risk',
    ACAS: 'Moderate risk',
    ACSS: 'Higher risk',
    ASSC: 'Higher risk',
    ASSS: 'Higher risk',
    ACAC: 'Moderate risk',
    ACSC: 'Higher risk',
    SCSC: 'Higher risk',
    SCSS: 'Higher risk',
    SSSS: 'Higher risk',
  };
  return riskByPair[genotypePairKey(viewerGenotype, candidateGenotype)] ?? null;
}

const FAMILY_PLANNING_BY_PAIR: Record<string, Omit<FamilyPlanningInsight, 'pairLabel'>> = {
  AAAA: {
    tier: 'favourable',
    title: 'Favourable for family planning',
    summary: 'Children from this pairing would not have sickle cell disease.',
    detail:
      'Both partners are AA. Offspring would inherit AA — no sickle cell trait or disease from this genetic match.',
    icon: 'shield-checkmark-outline',
  },
  AAAS: {
    tier: 'low_risk',
    title: 'Low-risk pairing',
    summary: 'Children may be carriers (AS) but sickle cell disease is very unlikely.',
    detail:
      'An AA × AS pairing cannot produce SS children. Some children may carry the trait — worth discussing openly.',
    icon: 'leaf-outline',
  },
  AAAC: {
    tier: 'low_risk',
    title: 'Low-risk pairing',
    summary: 'Children may carry hemoglobin variants; sickle cell disease is unlikely.',
    detail:
      'An AA × AC pairing has a low chance of affected children. A genetic counselor can offer personalised clarity.',
    icon: 'leaf-outline',
  },
  AASS: {
    tier: 'awareness',
    title: 'Carrier-aware pairing',
    summary: 'Children would likely be carriers (AS), not affected by sickle cell disease.',
    detail:
      'This AA × SS pairing produces AS carriers. Partner with a healthcare provider before family planning.',
    icon: 'information-circle-outline',
  },
  ASAS: {
    tier: 'counseling',
    title: 'Genetic counseling recommended',
    summary: 'Each child has a 25% chance of sickle cell disease (SS).',
    detail:
      'Both partners carry the sickle cell trait (AS). Professional screening and counseling are advised before starting a family.',
    icon: 'medical-outline',
  },
  ACAS: {
    tier: 'awareness',
    title: 'Moderate awareness needed',
    summary: 'Children may be carriers; some risk of sickle cell disease exists.',
    detail:
      'Both partners carry hemoglobin variants (AS × AC). Speak with a counselor to understand your options.',
    icon: 'information-circle-outline',
  },
  ACSS: {
    tier: 'counseling',
    title: 'Every child would have sickle cell disease',
    summary: 'Every child from this pairing would have HbSC disease, a form of sickle cell disease.',
    detail:
      'One partner is AC and one is SS. Each child inherits an S gene from one parent and a C gene from the other.',
    icon: 'medical-outline',
  },
  AASC: {
    tier: 'low_risk',
    title: 'Every child would be a carrier',
    summary:
      'Children from this pairing would not have a sickle cell disorder. Each would be either AS or AC.',
    detail:
      'One partner is AA and one is SC. The AA partner can only pass on an A gene, so no child can inherit two affected genes.',
    icon: 'information-circle-outline',
  },
  ACSC: {
    tier: 'counseling',
    title: 'Genetic counseling recommended',
    summary:
      'Each child has a 25% chance of HbSC disease and a 25% chance of hemoglobin C disease. The rest would be carriers.',
    detail:
      'One partner is AC and one is SC. The C gene is passed by both sides, so hemoglobin C disease is on the table alongside HbSC.',
    icon: 'medical-outline',
  },
  ASSC: {
    tier: 'counseling',
    title: 'Higher risk — seek counseling',
    summary:
      'Each child has a 25% chance of HbSS disease and a 25% chance of HbSC disease. The other half would be carriers.',
    detail:
      'One partner is AS and one is SC. Both can pass on an S gene, so a child can inherit two affected genes in more than one combination.',
    icon: 'medical-outline',
  },
  SCSC: {
    tier: 'counseling',
    title: 'Specialist support advised',
    summary:
      'Each child has a 25% chance of HbSS disease, a 50% chance of HbSC disease and a 25% chance of hemoglobin C disease.',
    detail:
      'Both partners have HbSC disease, so every child inherits an affected gene from each side. Severity varies by combination.',
    icon: 'medical-outline',
  },
  SCSS: {
    tier: 'counseling',
    title: 'Specialist support advised',
    summary: 'Each child has a 50% chance of HbSS disease and a 50% chance of HbSC disease.',
    detail:
      'One partner is SC and one is SS. The SS partner can only pass on an S gene, so every child inherits at least one.',
    icon: 'medical-outline',
  },
  ASSS: {
    tier: 'counseling',
    title: 'Higher risk — seek counseling',
    summary: 'Each child has a 50% chance of sickle cell disease (SS).',
    detail:
      'An AS × SS pairing carries significant risk for affected children. Genetic counseling is strongly recommended.',
    icon: 'medical-outline',
  },
  ACAC: {
    tier: 'awareness',
    title: 'Moderate awareness needed',
    summary: 'Children may inherit hemoglobin variants; counseling can clarify outcomes.',
    detail:
      'Both partners are AC carriers. A pre-marital or pre-conception screen helps you plan with confidence.',
    icon: 'information-circle-outline',
  },
  SSSS: {
    tier: 'counseling',
    title: 'Specialist support advised',
    summary: 'Both partners have sickle cell disease (SS) — specialist care is essential for family planning.',
    detail:
      'A hematologist or genetic counselor should guide any family planning conversation for this pairing.',
    icon: 'medical-outline',
  },
};

/** Plain-language family planning insight for a genotype pairing. */
export function getFamilyPlanningInsight(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): FamilyPlanningInsight {
  const viewer = viewerGenotype ?? 'AA';
  const pairKey = genotypePairKey(viewer, candidateGenotype);
  const pairLabel = `${viewer} × ${candidateGenotype}`;
  const fallback: Omit<FamilyPlanningInsight, 'pairLabel'> = {
    tier: 'awareness',
    title: 'Discuss with a counselor',
    summary: 'This genotype pairing benefits from professional guidance before family planning.',
    detail:
      'GenoMatch provides educational signals only. A healthcare provider can give advice for your situation.',
    icon: 'information-circle-outline',
  };

  const insight = FAMILY_PLANNING_BY_PAIR[pairKey] ?? fallback;
  return { ...insight, pairLabel };
}
