import {
  genotypePairKey,
  getFamilyPlanningInsight,
  getGenotypeRiskShort,
} from './compatibility';

describe('genotypePairKey', () => {
  it('is order independent and uses lexicographic sort', () => {
    expect(genotypePairKey('AS', 'AC')).toBe('ACAS');
    expect(genotypePairKey('AC', 'AS')).toBe('ACAS');
    expect(genotypePairKey('AC', 'SS')).toBe('ACSS');
    expect(genotypePairKey('SS', 'AC')).toBe('ACSS');
  });
});

describe('getGenotypeRiskShort', () => {
  it('never returns a health-risk label', () => {
    expect(getGenotypeRiskShort('AA', 'SS')).toBeNull();
    expect(getGenotypeRiskShort('AS', 'AS')).toBeNull();
    expect(getGenotypeRiskShort('AS', 'AC')).toBeNull();
    expect(getGenotypeRiskShort(null, 'AA')).toBeNull();
  });
});

describe('getFamilyPlanningInsight', () => {
  it('states the pair as self-reported genotype compatibility', () => {
    const insight = getFamilyPlanningInsight('AS', 'AS');
    expect(insight.tier).toBe('awareness');
    expect(insight.title).toBe('Genotype compatibility');
    expect(insight.summary).toMatch(/genotypes you each entered/i);
    expect(`${insight.summary} ${insight.detail}`).not.toMatch(/sickle|disease|counsel|%|risk/i);
  });

  it('labels the pair without changing the message by order', () => {
    const forward = getFamilyPlanningInsight('AS', 'AC');
    const reverse = getFamilyPlanningInsight('AC', 'AS');
    expect(forward.pairLabel).toBe('AS × AC');
    expect(reverse.pairLabel).toBe('AC × AS');
    expect(reverse.title).toBe(forward.title);
    expect(reverse.summary).toBe(forward.summary);
  });
});
