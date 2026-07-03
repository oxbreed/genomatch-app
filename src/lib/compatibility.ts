import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Genotype } from '../types/database';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type FamilyPlanningTier = 'favourable' | 'low_risk' | 'awareness' | 'counselling';

export type FamilyPlanningInsight = {
  tier: FamilyPlanningTier;
  /** Short headline — plain English outcome */
  title: string;
  /** One-line risk level for children (sickle cell context) */
  riskLabel: string;
  /** Key takeaway in one sentence */
  summary: string;
  /** Extra context — what the pairing means in practice */
  detail: string;
  /** Clear recommended action */
  nextStep: string;
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
  const risk = riskByPair[pairKey] ?? 'Compatible pairing';
  return `${pairLabel} — ${risk}.`;
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
  return riskByPair[pairKey] ?? 'Compatible pairing';
}

const FAMILY_PLANNING_BY_PAIR: Record<string, Omit<FamilyPlanningInsight, 'pairLabel'>> = {
  AAAA: {
    tier: 'favourable',
    title: 'Strong fit for family planning',
    riskLabel: 'Very low — sickle cell disease unlikely',
    summary: 'If you have children together, they would not have sickle cell disease.',
    detail:
      'You are both AA (no sickle cell trait). Children from this pairing would also be AA.',
    nextStep: 'No special screening needed for sickle cell before conceiving.',
    icon: 'shield-checkmark-outline',
  },
  AAAS: {
    tier: 'low_risk',
    title: 'Generally favourable for family planning',
    riskLabel: 'Low — disease unlikely, some children may be carriers',
    summary: 'Your children would not have sickle cell disease, but some may carry the trait (AS).',
    detail:
      'One partner is AA and one is AS. This pairing cannot produce a child with sickle cell disease (SS).',
    nextStep: 'Optional: discuss carrier status with a doctor if you want extra reassurance.',
    icon: 'leaf-outline',
  },
  AAAC: {
    tier: 'low_risk',
    title: 'Generally favourable for family planning',
    riskLabel: 'Low — disease unlikely, variants possible',
    summary: 'Sickle cell disease is unlikely; some children may inherit a hemoglobin variant.',
    detail:
      'One partner is AA and one is AC. Outcomes are usually mild, but a clinician can explain your specific case.',
    nextStep: 'Consider a pre-conception chat with your doctor or a genetic counselor.',
    icon: 'leaf-outline',
  },
  AASS: {
    tier: 'awareness',
    title: 'Children would be carriers (AS)',
    riskLabel: 'Low for disease — children would likely be carriers (AS)',
    summary: 'Children would not have sickle cell disease, but would likely carry the sickle cell trait.',
    detail:
      'One partner is AA and one is SS. All children would be AS carriers — not affected by sickle cell disease.',
    nextStep: 'Talk with a healthcare provider before trying to conceive so you know what to expect.',
    icon: 'information-circle-outline',
  },
  ASAS: {
    tier: 'counselling',
    title: 'Genetic counselling recommended',
    riskLabel: 'Moderate to higher — 1 in 4 children could have sickle cell disease',
    summary: 'Each child has a 25% chance of sickle cell disease (SS) and a 50% chance of being a carrier (AS).',
    detail:
      'You are both AS (sickle cell carriers). This is the pairing where professional guidance matters most before family planning.',
    nextStep: 'Book genetic counselling and pre-conception screening before starting a family.',
    icon: 'medical-outline',
  },
  ASAC: {
    tier: 'awareness',
    title: 'Plan with professional guidance',
    riskLabel: 'Moderate — some risk of sickle cell disease in children',
    summary: 'Both of you carry hemoglobin variants (AS and AC). Some children could be affected.',
    detail:
      'Outcomes depend on which genes each child inherits. A counselor can map the exact percentages for your pairing.',
    nextStep: 'See a genetic counselor for pre-conception screening and a clear risk breakdown.',
    icon: 'information-circle-outline',
  },
  ASSS: {
    tier: 'counselling',
    title: 'Higher risk — specialist guidance needed',
    riskLabel: 'Higher — about half of children could have sickle cell disease',
    summary: 'Each child has a 50% chance of sickle cell disease (SS) and a 50% chance of being a carrier (AS).',
    detail:
      'One partner is AS and one is SS. This pairing needs careful planning with medical support.',
    nextStep: 'Speak with a genetic counselor and hematologist before making family planning decisions.',
    icon: 'medical-outline',
  },
  ACAC: {
    tier: 'awareness',
    title: 'Plan with professional guidance',
    riskLabel: 'Moderate — hemoglobin variants on both sides',
    summary: 'Both partners are AC. Children may inherit combinations that need medical follow-up.',
    detail:
      'Carrier-on-carrier pairings benefit from screening so you understand possible outcomes before conceiving.',
    nextStep: 'Arrange pre-conception genetic counselling for a personalised risk summary.',
    icon: 'information-circle-outline',
  },
  ACCC: {
    tier: 'awareness',
    title: 'Get personalised guidance',
    riskLabel: 'Varies — depends on exact hemoglobin types',
    summary: 'This pairing involves hemoglobin variants on both sides; outcomes are not one-size-fits-all.',
    detail:
      'GenoMatch shows educational signals only. A lab test and counselor can give numbers specific to you.',
    nextStep: 'Ask your doctor for hemoglobin electrophoresis and a referral to genetic counselling.',
    icon: 'information-circle-outline',
  },
  SSSS: {
    tier: 'counselling',
    title: 'Specialist care for family planning',
    riskLabel: 'Specialist input required',
    summary: 'Both partners have sickle cell disease (SS). Family planning should be led by your care team.',
    detail:
      'Pregnancy and conception need specialist support to protect your health and plan thoughtfully.',
    nextStep: 'Work with your hematologist and a maternal–fetal specialist before trying to conceive.',
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
    title: 'Speak with a genetic counselor',
    riskLabel: 'Personalised assessment needed',
    summary: 'This pairing needs a clinician to explain outcomes for your situation.',
    detail:
      'GenoMatch shares educational information only — not a diagnosis or medical advice.',
    nextStep: 'Book a pre-conception appointment with your doctor or a genetic counselor.',
    icon: 'information-circle-outline',
  };

  const insight = FAMILY_PLANNING_BY_PAIR[pairKey] ?? fallback;
  return { ...insight, pairLabel };
}
