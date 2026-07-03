import { getFamilyPlanningInsight } from './compatibility';
import type { Genotype } from '../types/database';

describe('getFamilyPlanningInsight', () => {
  const pairs: [Genotype, Genotype][] = [
    ['AA', 'AA'],
    ['AA', 'AS'],
    ['AA', 'AC'],
    ['AA', 'SS'],
    ['AS', 'AS'],
    ['AS', 'AC'],
    ['AS', 'SS'],
    ['AC', 'AC'],
    ['SS', 'SS'],
  ];

  it.each(pairs)('returns complete copy for %s × %s', (viewer, candidate) => {
    const insight = getFamilyPlanningInsight(viewer, candidate);
    expect(insight.pairLabel).toContain('×');
    expect(insight.title.length).toBeGreaterThan(10);
    expect(insight.riskLabel.length).toBeGreaterThan(5);
    expect(insight.summary.length).toBeGreaterThan(15);
    expect(insight.detail.length).toBeGreaterThan(15);
    expect(insight.nextStep.length).toBeGreaterThan(10);
    expect(['favourable', 'low_risk', 'awareness', 'counselling']).toContain(insight.tier);
  });

  it('flags AS × AS as counseling tier with 25% risk language', () => {
    const insight = getFamilyPlanningInsight('AS', 'AS');
    expect(insight.tier).toBe('counselling');
    expect(insight.summary).toMatch(/25%/);
    expect(insight.nextStep.toLowerCase()).toMatch(/counsell/);
  });

  it('shows locked-friendly fallback when viewer genotype is unknown', () => {
    const insight = getFamilyPlanningInsight(null, 'AS');
    expect(insight.pairLabel).toBe('AA × AS');
    expect(insight.riskLabel).toBeTruthy();
  });
});
