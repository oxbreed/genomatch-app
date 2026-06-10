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

/** Genotype-aware compatibility score (0–100) for West African sickle-cell context. */
export function computeCompatibility(
  viewer: Genotype | null,
  candidate: Genotype | null
): number {
  if (!viewer || !candidate) return 72;

  const pair = [viewer, candidate].sort().join('');

  const scores: Record<string, number> = {
    AAAA: 98,
    AAAS: 88,
    AAAC: 90,
    AASS: 45,
    ASAS: 72,
    ASAC: 78,
    ASSS: 38,
    ACAC: 75,
    ACCC: 70,
    SSSS: 30,
  };

  return scores[pair] ?? 65;
}

export function getGenotypeCompatibilityLine(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): string {
  const viewer = viewerGenotype ?? 'AA';
  const pairLabel = `${viewer} × ${candidateGenotype}`;
  const pairKey = [viewer, candidateGenotype].sort().join('');
  const riskByPair: Record<string, string> = {
    AAAA: 'Very low sickle cell risk',
    AAAS: 'Low sickle cell risk',
    AAAC: 'Low sickle cell risk',
    AASS: 'Elevated sickle cell risk',
    ASAS: 'Moderate sickle cell risk',
    ASAC: 'Moderate sickle cell risk',
    ASSS: 'Higher sickle cell risk',
    ACAC: 'Moderate sickle cell risk',
    ACCC: 'Moderate sickle cell risk',
    SSSS: 'Higher sickle cell risk',
  };
  const risk = riskByPair[pairKey] ?? 'Genotype-compatible match';
  return `${pairLabel} — ${risk}`;
}

/** Short risk label for swipe cards and match rows */
export function getGenotypeRiskShort(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): string {
  const viewer = viewerGenotype ?? 'AA';
  const pairKey = [viewer, candidateGenotype].sort().join('');
  const riskByPair: Record<string, string> = {
    AAAA: 'Very low risk',
    AAAS: 'Low risk',
    AAAC: 'Low risk',
    AASS: 'Elevated risk',
    ASAS: 'Moderate risk',
    ASAC: 'Moderate risk',
    ASSS: 'Higher risk',
    ACAC: 'Moderate risk',
    ACCC: 'Moderate risk',
    SSSS: 'Higher risk',
  };
  return riskByPair[pairKey] ?? 'Compatible';
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
  ASAC: {
    tier: 'awareness',
    title: 'Moderate awareness needed',
    summary: 'Children may be carriers; some risk of sickle cell disease exists.',
    detail:
      'Both partners carry hemoglobin variants (AS × AC). Speak with a counselor to understand your options.',
    icon: 'information-circle-outline',
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
  ACCC: {
    tier: 'awareness',
    title: 'Awareness recommended',
    summary: 'Hemoglobin variants on both sides — outcomes vary by exact genotype.',
    detail:
      'This pairing benefits from professional genetic guidance before family planning decisions.',
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
  const pairKey = [viewer, candidateGenotype].sort().join('');
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
