import { getGenotypeRiskShort, getFamilyPlanningInsight } from './compatibility';

describe('getGenotypeRiskShort', () => {
  it('returns a plain risk label for a mapped pairing', () => {
    expect(getGenotypeRiskShort('AA', 'SS')).toBe('Elevated risk');
    expect(getGenotypeRiskShort('AS', 'AS')).toBe('Moderate risk');
  });

  it('returns null (unresolved) for an unmapped pairing — never a default', () => {
    // AS × AC sorts to 'ACAS', which is not a mapped key -> unresolved.
    expect(getGenotypeRiskShort('AS', 'AC')).toBeNull();
    expect(getGenotypeRiskShort('AC', 'SS')).toBeNull();
  });
});

describe('getFamilyPlanningInsight', () => {
  it('still returns a tiered educational insight per pairing', () => {
    expect(getFamilyPlanningInsight('AA', 'AA').tier).toBe('favourable');
    expect(getFamilyPlanningInsight('AS', 'AS').tier).toBe('counseling');
  });
});
