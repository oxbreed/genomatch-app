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
  /** True when the viewer has no genotype on file and nothing can be calculated. */
  unknownViewer: boolean;
};

/** Shown wherever the viewer has not recorded their own genotype yet. */
export const UNKNOWN_GENOTYPE_SHORT = 'Genotype not set';
export const UNKNOWN_GENOTYPE_LINE = 'Add your genotype to see what this pairing means.';

/** Neutral score used when a pairing cannot be calculated. */
export const UNSCORED_COMPATIBILITY = 0;

/**
 * Canonical key for an unordered genotype pair.
 *
 * Both genotypes are sorted before joining, so 'AS' + 'AC' and 'AC' + 'AS'
 * both produce 'ACAS'. Every lookup table in this file MUST be keyed with this
 * function's output. Hand-written keys in the wrong order silently miss and
 * fall through to the generic fallback, which is how 'AS × AC' previously
 * rendered as "Compatible pairing".
 */
export function genotypePairKey(a: Genotype, b: Genotype): string {
  return [a, b].sort().join('');
}

/**
 * Every unordered pair of the four supported genotypes. Exported so tests can
 * assert that each lookup table is total — no pairing may fall through.
 */
export const ALL_GENOTYPE_PAIR_KEYS = [
  'AAAA',
  'AAAC',
  'AAAS',
  'AASC',
  'AASS',
  'ACAC',
  'ACAS',
  'ACSC',
  'ACSS',
  'ASAS',
  'ASSC',
  'ASSS',
  'SCSC',
  'SCSS',
  'SSSS',
] as const;

export type GenotypePairKey = (typeof ALL_GENOTYPE_PAIR_KEYS)[number];

/**
 * Genotype-aware compatibility score (0–100), scaled to the chance that a
 * pairing produces a child with a sickle cell disorder (SS or SC).
 *
 * Returns UNSCORED_COMPATIBILITY when either genotype is missing. Callers must
 * check for it and hide the score rather than render a number — an absent
 * genotype is not the same as a safe one.
 */
export function computeCompatibility(
  viewer: Genotype | null,
  candidate: Genotype | null
): number {
  if (!viewer || !candidate) return UNSCORED_COMPATIBILITY;

  const scores: Record<GenotypePairKey, number> = {
    AAAA: 98,
    AAAC: 92,
    AAAS: 92,
    AASC: 88,
    AASS: 85,
    ACAC: 62,
    ACAS: 40,
    ACSC: 34,
    ACSS: 25,
    ASAS: 38,
    ASSC: 20,
    ASSS: 25,
    SCSC: 22,
    SCSS: 18,
    SSSS: 20,
  };

  return scores[genotypePairKey(viewer, candidate) as GenotypePairKey] ?? UNSCORED_COMPATIBILITY;
}

/** Long-form risk phrasing, keyed by genotypePairKey. */
const RISK_LINE_BY_PAIR: Record<GenotypePairKey, string> = {
  AAAA: 'Children would not have sickle cell disease or carry the trait',
  AAAC: 'Children would not have sickle cell disease; some may carry hemoglobin C',
  AAAS: 'Children would not have sickle cell disease; some may carry the trait',
  AASC: 'Children would not have sickle cell disease; all would be carriers (AS or AC)',
  AASS: 'Children would not have sickle cell disease; all would carry the trait',
  ACAC: 'Around 1 in 4 children could have hemoglobin C disease, which is usually mild',
  ACAS: 'Around 1 in 4 children could have sickle cell disease (HbSC)',
  ACSC: 'Around 1 in 4 children could have sickle cell disease (HbSC), and 1 in 4 hemoglobin C disease',
  ACSS: 'Children would have sickle cell disease (HbSC)',
  ASAS: 'Around 1 in 4 children could have sickle cell disease (HbSS)',
  ASSC: 'Around 1 in 2 children could have sickle cell disease (HbSS or HbSC)',
  ASSS: 'Around 1 in 2 children could have sickle cell disease (HbSS)',
  SCSC: 'Around 3 in 4 children could have sickle cell disease (HbSS or HbSC)',
  SCSS: 'Children would have sickle cell disease (HbSS or HbSC)',
  SSSS: 'Children would have sickle cell disease (HbSS)',
};

/** Short risk phrasing for swipe cards and match rows. */
const RISK_SHORT_BY_PAIR: Record<GenotypePairKey, string> = {
  AAAA: 'No risk to children',
  AAAC: 'No disease risk',
  AAAS: 'No disease risk',
  AASC: 'No disease risk — all children carriers',
  AASS: 'No disease risk — all children carriers',
  ACAC: 'Counselling advised',
  ACAS: 'Counselling needed',
  ACSC: 'Counselling needed',
  ACSS: 'Counselling needed',
  ASAS: 'Counselling needed',
  ASSC: 'Counselling needed',
  ASSS: 'Counselling needed',
  SCSC: 'Specialist care needed',
  SCSS: 'Specialist care needed',
  SSSS: 'Specialist care needed',
};

/**
 * One-line educational summary of a pairing, e.g. "AS × AC — around 1 in 4
 * children could have sickle cell disease (HbSC)."
 *
 * Returns UNKNOWN_GENOTYPE_LINE when the viewer has no genotype on file.
 */
export function getGenotypeCompatibilityLine(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): string {
  if (!viewerGenotype) return UNKNOWN_GENOTYPE_LINE;

  const key = genotypePairKey(viewerGenotype, candidateGenotype) as GenotypePairKey;
  const risk = RISK_LINE_BY_PAIR[key];
  if (!risk) return UNKNOWN_GENOTYPE_LINE;

  return `${viewerGenotype} × ${candidateGenotype} — ${risk}.`;
}

/**
 * Short risk label for swipe cards and match rows.
 *
 * Returns UNKNOWN_GENOTYPE_SHORT when the viewer has no genotype on file, so a
 * missing genotype never renders as a reassuring label.
 */
export function getGenotypeRiskShort(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): string {
  if (!viewerGenotype) return UNKNOWN_GENOTYPE_SHORT;

  const key = genotypePairKey(viewerGenotype, candidateGenotype) as GenotypePairKey;
  return RISK_SHORT_BY_PAIR[key] ?? UNKNOWN_GENOTYPE_SHORT;
}

type FamilyPlanningCopy = Omit<FamilyPlanningInsight, 'pairLabel' | 'unknownViewer'>;

const FAMILY_PLANNING_BY_PAIR: Record<GenotypePairKey, FamilyPlanningCopy> = {
  AAAA: {
    tier: 'favourable',
    title: 'Strong fit for family planning',
    riskLabel: 'Very low — sickle cell disease not possible from this pairing',
    summary: 'Children from this pairing would not have sickle cell disease or carry the trait.',
    detail:
      'You are both AA, so neither of you can pass on a sickle cell or hemoglobin C gene. Children would also be AA.',
    nextStep: 'No sickle cell screening is needed before conceiving.',
    icon: 'shield-checkmark-outline',
  },
  AAAS: {
    tier: 'low_risk',
    title: 'Favourable for family planning',
    riskLabel: 'Low — disease not possible, about half of children would be carriers',
    summary: 'Children would not have sickle cell disease, though about half would carry the trait (AS).',
    detail:
      'One partner is AA and one is AS. A child needs two sickle genes for the disease, and the AA partner cannot pass one on.',
    nextStep: 'No urgent action. Children who are carriers will want to know their own genotype before they have children.',
    icon: 'leaf-outline',
  },
  AAAC: {
    tier: 'low_risk',
    title: 'Favourable for family planning',
    riskLabel: 'Low — disease not possible, about half of children would carry hemoglobin C',
    summary: 'Children would not have a hemoglobin disorder, though about half would carry hemoglobin C (AC).',
    detail:
      'One partner is AA and one is AC. Carrying hemoglobin C causes no illness on its own.',
    nextStep: 'No urgent action. Children who are carriers will want to know their own genotype before they have children.',
    icon: 'leaf-outline',
  },
  AASC: {
    tier: 'low_risk',
    title: 'Every child would be a carrier',
    riskLabel: 'Low — disease not possible, all children would be carriers',
    summary:
      'Children from this pairing would not have a sickle cell disorder. Each would be either AS or AC.',
    detail:
      'One partner is AA and one is SC. The AA partner can only pass on an A gene, so no child can inherit two affected genes.',
    nextStep:
      'Sickle cell disease is not the concern here. The SC partner should plan pregnancy with their own care team, and children will need their genotype before they start families.',
    icon: 'information-circle-outline',
  },
  AASS: {
    tier: 'low_risk',
    title: 'Every child would be a carrier',
    riskLabel: 'Low — disease not possible, all children would carry the trait',
    summary: 'Children from this pairing would not have sickle cell disease. All of them would be AS carriers.',
    detail:
      'One partner is AA and one is SS. Each child inherits one A and one S gene, which makes them AS. Being a carrier is not an illness.',
    nextStep:
      'Sickle cell disease is not the concern here. The SS partner should plan pregnancy with their own care team, and children will need their genotype before they start families.',
    icon: 'information-circle-outline',
  },
  ACAC: {
    tier: 'awareness',
    title: 'Genetic counselling advised',
    riskLabel: 'Moderate — about 1 in 4 children could have hemoglobin C disease',
    summary:
      'Each child has a 25% chance of hemoglobin C disease (CC), which is usually mild, and a 50% chance of being a carrier.',
    detail:
      'You are both AC. Hemoglobin C disease is generally much milder than sickle cell disease, but it is still a condition worth understanding before conceiving.',
    nextStep: 'Arrange pre-conception genetic counselling for a personalised risk summary.',
    icon: 'information-circle-outline',
  },
  ACAS: {
    tier: 'counselling',
    title: 'Genetic counselling recommended',
    riskLabel: 'Moderate to higher — about 1 in 4 children could have sickle cell disease',
    summary:
      'Each child has a 25% chance of HbSC disease, a form of sickle cell disease, and a 50% chance of being a carrier.',
    detail:
      'One partner is AS and one is AC. A child who inherits the S gene from one parent and the C gene from the other has HbSC disease. It is often milder than HbSS but it is still sickle cell disease.',
    nextStep: 'Book genetic counselling and pre-conception screening before starting a family.',
    icon: 'medical-outline',
  },
  ACSC: {
    tier: 'counselling',
    title: 'Genetic counselling recommended',
    riskLabel: 'Higher — about half of children would have a haemoglobin disorder',
    summary:
      'Each child has a 25% chance of HbSC disease and a 25% chance of hemoglobin C disease. The rest would be carriers.',
    detail:
      'One partner is AC and one is SC. The C gene is passed by both sides, so hemoglobin C disease is on the table alongside HbSC.',
    nextStep: 'Book genetic counselling and pre-conception screening before starting a family.',
    icon: 'medical-outline',
  },
  ACSS: {
    tier: 'counselling',
    title: 'Every child would have sickle cell disease',
    riskLabel: 'High — all children would have HbSC disease',
    summary: 'Every child from this pairing would have HbSC disease, a form of sickle cell disease.',
    detail:
      'One partner is AC and one is SS. Each child inherits an S gene from one parent and a C gene from the other.',
    nextStep:
      'Speak with a hematologist and a genetic counselor before making any family planning decisions.',
    icon: 'medical-outline',
  },
  ASAS: {
    tier: 'counselling',
    title: 'Genetic counselling recommended',
    riskLabel: 'Moderate to higher — about 1 in 4 children could have sickle cell disease',
    summary:
      'Each child has a 25% chance of sickle cell disease (SS) and a 50% chance of being a carrier (AS).',
    detail:
      'You are both AS. This is the pairing where professional guidance matters most before family planning.',
    nextStep: 'Book genetic counselling and pre-conception screening before starting a family.',
    icon: 'medical-outline',
  },
  ASSC: {
    tier: 'counselling',
    title: 'Higher risk — specialist guidance needed',
    riskLabel: 'Higher — about half of children could have sickle cell disease',
    summary:
      'Each child has a 25% chance of HbSS disease and a 25% chance of HbSC disease. The other half would be carriers.',
    detail:
      'One partner is AS and one is SC. Both can pass on an S gene, so a child can inherit two affected genes in more than one combination.',
    nextStep: 'Speak with a genetic counselor and hematologist before making family planning decisions.',
    icon: 'medical-outline',
  },
  ASSS: {
    tier: 'counselling',
    title: 'Higher risk — specialist guidance needed',
    riskLabel: 'Higher — about half of children could have sickle cell disease',
    summary:
      'Each child has a 50% chance of sickle cell disease (SS) and a 50% chance of being a carrier (AS).',
    detail:
      'One partner is AS and one is SS. This pairing needs careful planning with medical support.',
    nextStep: 'Speak with a genetic counselor and hematologist before making family planning decisions.',
    icon: 'medical-outline',
  },
  SCSC: {
    tier: 'counselling',
    title: 'Specialist care for family planning',
    riskLabel: 'High — most children would have a haemoglobin disorder',
    summary:
      'Each child has a 25% chance of HbSS disease, a 50% chance of HbSC disease and a 25% chance of hemoglobin C disease.',
    detail:
      'Both partners have HbSC disease, so every child inherits an affected gene from each side. Severity varies by combination.',
    nextStep: 'Work with your hematologist and a genetic counselor before trying to conceive.',
    icon: 'medical-outline',
  },
  SCSS: {
    tier: 'counselling',
    title: 'Every child would have sickle cell disease',
    riskLabel: 'High — all children would have a sickle cell disorder',
    summary: 'Each child has a 50% chance of HbSS disease and a 50% chance of HbSC disease.',
    detail:
      'One partner is SC and one is SS. The SS partner can only pass on an S gene, so every child inherits at least one.',
    nextStep:
      'Work with your hematologist and a maternal–fetal specialist before making family planning decisions.',
    icon: 'medical-outline',
  },
  SSSS: {
    tier: 'counselling',
    title: 'Specialist care for family planning',
    riskLabel: 'Every child would have sickle cell disease',
    summary: 'Both partners have sickle cell disease (SS), so every child would inherit it.',
    detail:
      'Pregnancy and conception also need specialist support to protect the health of both partners.',
    nextStep: 'Work with your hematologist and a maternal–fetal specialist before trying to conceive.',
    icon: 'medical-outline',
  },
};

/**
 * Plain-language family planning insight for a genotype pairing.
 *
 * When the viewer has no genotype on file the result is explicitly marked
 * unknownViewer and carries prompt copy. It never assumes AA — assuming the
 * safest genotype on a member's behalf would show a reassuring risk label to
 * someone who has no idea what their own genotype is.
 */
export function getFamilyPlanningInsight(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): FamilyPlanningInsight {
  if (!viewerGenotype) {
    return {
      tier: 'awareness',
      title: 'Add your genotype to see this',
      riskLabel: 'Not calculated yet',
      summary:
        'GenoMatch cannot show what this pairing would mean until your own genotype is on your profile.',
      detail:
        'Add your genotype in Profile to see a plain-language breakdown for every profile you view.',
      nextStep: 'Add your genotype to your profile, or ask your clinic for a hemoglobin electrophoresis test.',
      pairLabel: `— × ${candidateGenotype}`,
      icon: 'help-circle-outline',
      unknownViewer: true,
    };
  }

  const key = genotypePairKey(viewerGenotype, candidateGenotype) as GenotypePairKey;
  const copy = FAMILY_PLANNING_BY_PAIR[key];
  const pairLabel = `${viewerGenotype} × ${candidateGenotype}`;

  if (!copy) {
    return {
      tier: 'counselling',
      title: 'Speak with a genetic counselor',
      riskLabel: 'Personalised assessment needed',
      summary: 'This pairing needs a clinician to explain outcomes for your situation.',
      detail: 'GenoMatch shares educational information only — not a diagnosis or medical advice.',
      nextStep: 'Book a pre-conception appointment with your doctor or a genetic counselor.',
      pairLabel,
      icon: 'information-circle-outline',
      unknownViewer: false,
    };
  }

  return { ...copy, pairLabel, unknownViewer: false };
}
