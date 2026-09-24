import {
  genotypePairKey,
  getFamilyPlanningInsight,
  getGenotypeRiskShort,
} from './compatibility';
import type { Genotype } from '../types/database';

const GENOTYPES: Genotype[] = ['AA', 'AS', 'SS', 'AC', 'SC'];

const SC_PAIRS: [Genotype, Genotype][] = [
  ['AA', 'SC'],
  ['AS', 'SC'],
  ['SS', 'SC'],
  ['AC', 'SC'],
  ['SC', 'SC'],
];

describe('SC genotype pairings', () => {
  it('sorts pair keys so SC matrix entries match genotypePairKey output', () => {
    expect(genotypePairKey('AA', 'SC')).toBe('AASC');
    expect(genotypePairKey('SC', 'AA')).toBe('AASC');
    expect(genotypePairKey('AS', 'SC')).toBe('ASSC');
    expect(genotypePairKey('SC', 'AS')).toBe('ASSC');
    expect(genotypePairKey('AC', 'SC')).toBe('ACSC');
    expect(genotypePairKey('SC', 'AC')).toBe('ACSC');
    expect(genotypePairKey('SC', 'SC')).toBe('SCSC');
    expect(genotypePairKey('SS', 'SC')).toBe('SCSS');
    expect(genotypePairKey('SC', 'SS')).toBe('SCSS');
    expect(genotypePairKey('AS', 'AC')).toBe('ACAS');
    expect(genotypePairKey('AC', 'SS')).toBe('ACSS');
  });

  it.each(SC_PAIRS)('returns the same non-clinical note for %s × %s', (a, b) => {
    const insight = getFamilyPlanningInsight(a, b);
    expect(insight.pairLabel).toBe(`${a} × ${b}`);
    expect(insight.title).toBe('Self-reported only');
    expect(insight.summary).toMatch(/does not assess health/i);
    expect(getGenotypeRiskShort(a, b)).toBeNull();
  });

  it('covers every unordered pair of the five genotypes and never emits ACCC', () => {
    const generated = new Set(
      GENOTYPES.flatMap((a, i) =>
        GENOTYPES.slice(i).map((b) => genotypePairKey(a, b))
      )
    );
    expect(generated.has('AASC')).toBe(true);
    expect(generated.has('ACSC')).toBe(true);
    expect(generated.has('ASSC')).toBe(true);
    expect(generated.has('SCSC')).toBe(true);
    expect(generated.has('SCSS')).toBe(true);
    expect(generated.has('ACCC')).toBe(false);
  });
});