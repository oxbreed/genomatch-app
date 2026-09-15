import {
  ALL_GENOTYPE_PAIR_KEYS,
  computeCompatibility,
  genotypePairKey,
  getFamilyPlanningInsight,
  getGenotypeCompatibilityLine,
  getGenotypeRiskShort,
  UNKNOWN_GENOTYPE_SHORT,
} from './compatibility';
import type { Genotype } from '../types/database';

const GENOTYPES: Genotype[] = ['AA', 'AS', 'SS', 'AC', 'SC'];

const ALL_PAIRS: [Genotype, Genotype][] = GENOTYPES.flatMap((a, i) =>
  GENOTYPES.slice(i).map((b) => [a, b] as [Genotype, Genotype])
);

describe('genotypePairKey', () => {
  it('is order independent', () => {
    expect(genotypePairKey('AS', 'AC')).toBe(genotypePairKey('AC', 'AS'));
    expect(genotypePairKey('AS', 'AC')).toBe('ACAS');
  });

  it('covers every unordered pair with a declared key', () => {
    const generated = new Set(ALL_PAIRS.map(([a, b]) => genotypePairKey(a, b)));
    expect([...generated].sort()).toEqual([...ALL_GENOTYPE_PAIR_KEYS].sort());
  });
});

describe('getFamilyPlanningInsight', () => {
  it.each(ALL_PAIRS)('returns complete, non-fallback copy for %s × %s', (viewer, candidate) => {
    const insight = getFamilyPlanningInsight(viewer, candidate);
    expect(insight.unknownViewer).toBe(false);
    expect(insight.pairLabel).toBe(`${viewer} × ${candidate}`);
    expect(insight.title.length).toBeGreaterThan(10);
    expect(insight.riskLabel.length).toBeGreaterThan(5);
    expect(insight.summary.length).toBeGreaterThan(15);
    expect(insight.detail.length).toBeGreaterThan(15);
    expect(insight.nextStep.length).toBeGreaterThan(10);
    expect(['favourable', 'low_risk', 'awareness', 'counselling']).toContain(insight.tier);
    // The generic fallback must never be reachable for a supported pairing.
    expect(insight.riskLabel).not.toBe('Personalised assessment needed');
  });

  it('flags AS × AS as counselling with 25% language', () => {
    const insight = getFamilyPlanningInsight('AS', 'AS');
    expect(insight.tier).toBe('counselling');
    expect(insight.summary).toMatch(/25%/);
    expect(insight.nextStep.toLowerCase()).toMatch(/counsell/);
  });

  it('flags AS × AC as counselling and names HbSC disease', () => {
    const insight = getFamilyPlanningInsight('AS', 'AC');
    expect(insight.tier).toBe('counselling');
    expect(`${insight.summary} ${insight.detail}`).toMatch(/HbSC/);
  });

  it('treats AA × SS as no disease risk, not elevated risk', () => {
    const insight = getFamilyPlanningInsight('AA', 'SS');
    expect(insight.tier).toBe('low_risk');
    expect(insight.summary.toLowerCase()).toContain('would not have sickle cell disease');
    expect(insight.riskLabel.toLowerCase()).not.toMatch(/elevated|high/);
  });

  it('treats AA × SC as no disease risk, since AA cannot pass an affected gene', () => {
    const insight = getFamilyPlanningInsight('AA', 'SC');
    expect(insight.tier).toBe('low_risk');
    expect(insight.riskLabel.toLowerCase()).not.toMatch(/high|elevated/);
  });

  it('flags SC pairings that can produce disease as counselling', () => {
    for (const other of ['AS', 'AC', 'SS', 'SC'] as Genotype[]) {
      expect(getFamilyPlanningInsight('SC', other).tier).toBe('counselling');
    }
  });

  it('does not assume AA when the viewer genotype is unknown', () => {
    const insight = getFamilyPlanningInsight(null, 'AS');
    expect(insight.unknownViewer).toBe(true);
    expect(insight.pairLabel).not.toContain('AA');
    expect(insight.riskLabel).toBe('Not calculated yet');
  });
});

describe('risk labels', () => {
  it.each(ALL_PAIRS)('never returns the unknown label for %s × %s', (viewer, candidate) => {
    expect(getGenotypeRiskShort(viewer, candidate)).not.toBe(UNKNOWN_GENOTYPE_SHORT);
    expect(getGenotypeCompatibilityLine(viewer, candidate)).toContain('×');
  });

  it('labels AA × SS as no disease risk', () => {
    expect(getGenotypeRiskShort('AA', 'SS').toLowerCase()).toContain('no disease risk');
  });

  it('does not label AS × AC as compatible', () => {
    const label = getGenotypeRiskShort('AS', 'AC');
    expect(label.toLowerCase()).not.toContain('compatible');
    expect(label.toLowerCase()).toContain('counselling');
  });

  it('withholds a label when the viewer genotype is unknown', () => {
    expect(getGenotypeRiskShort(null, 'AA')).toBe(UNKNOWN_GENOTYPE_SHORT);
  });
});

describe('computeCompatibility', () => {
  it.each(ALL_PAIRS)('scores %s × %s above zero', (viewer, candidate) => {
    expect(computeCompatibility(viewer, candidate)).toBeGreaterThan(0);
  });

  it('scores AA × SS well above AS × AS, since it cannot produce disease', () => {
    expect(computeCompatibility('AA', 'SS')).toBeGreaterThan(computeCompatibility('AS', 'AS'));
  });

  it('returns 0 when either genotype is missing so the UI can hide the score', () => {
    expect(computeCompatibility(null, 'AA')).toBe(0);
    expect(computeCompatibility('AA', null)).toBe(0);
  });
});
