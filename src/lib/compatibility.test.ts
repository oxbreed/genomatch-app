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
  it('returns a plain risk label for a mapped pairing', () => {
    expect(getGenotypeRiskShort('AA', 'SS')).toBe('Elevated risk');
    expect(getGenotypeRiskShort('AS', 'AS')).toBe('Moderate risk');
  });

  it('resolves AS × AC (key ACAS) and AC × SS (key ACSS)', () => {
    expect(getGenotypeRiskShort('AS', 'AC')).toBe('Moderate risk');
    expect(getGenotypeRiskShort('AC', 'AS')).toBe('Moderate risk');
    expect(getGenotypeRiskShort('AC', 'SS')).toBe('Higher risk');
    expect(getGenotypeRiskShort('SS', 'AC')).toBe('Higher risk');
  });

  it('returns null when the viewer genotype is missing — never a default label', () => {
    expect(getGenotypeRiskShort(null, 'AA')).toBeNull();
  });
});

describe('getFamilyPlanningInsight', () => {
  it('still returns a tiered educational insight per pairing', () => {
    expect(getFamilyPlanningInsight('AA', 'AA').tier).toBe('favourable');
    expect(getFamilyPlanningInsight('AS', 'AS').tier).toBe('counseling');
  });

  it('uses the AS × AC copy for both orderings', () => {
    const insight = getFamilyPlanningInsight('AS', 'AC');
    expect(insight.tier).toBe('awareness');
    expect(insight.detail).toMatch(/AS × AC/);
    expect(getFamilyPlanningInsight('AC', 'AS').title).toBe(insight.title);
  });

  it('treats AC × SS as counseling (all children HbSC)', () => {
    const insight = getFamilyPlanningInsight('AC', 'SS');
    expect(insight.tier).toBe('counseling');
    expect(`${insight.summary} ${insight.detail}`).toMatch(/HbSC/);
  });
});
