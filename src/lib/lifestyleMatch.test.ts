import { computeLifestyleMatch, getMatchHeadline } from './lifestyleMatch';

describe('computeLifestyleMatch', () => {
  it('returns 100 for identical interests and matching goals', () => {
    expect(
      computeLifestyleMatch(['music', 'travel'], ['travel', 'music'], 'marriage', 'marriage')
    ).toBe(100);
  });

  it('is low when no interests overlap and goals differ', () => {
    // interest Jaccard 0, goal mismatch 0.25 -> 0*0.7 + 0.25*0.3 = 0.075 -> 8
    expect(computeLifestyleMatch(['music'], ['sports'], 'casual', 'marriage')).toBe(8);
  });

  it('falls back to goal alignment when a side has no interests', () => {
    // no interest signal -> goalScore only; matching goals -> 100
    expect(computeLifestyleMatch([], ['music'], 'serious', 'serious')).toBe(100);
    // no interest signal, unknown goals -> neutral 0.5 -> 50
    expect(computeLifestyleMatch(null, null)).toBe(50);
  });

  it('is case- and whitespace-insensitive for interests', () => {
    // Full interest overlap (0.7) + neutral goal score (0.3 * 0.5) = 0.85 -> 85.
    // Without normalization the interests would not match (would be 15), so 85
    // proves trimming + lowercasing worked.
    expect(computeLifestyleMatch([' Music '], ['music'])).toBe(85);
  });
});

describe('getMatchHeadline', () => {
  it('maps percent ranges to headlines', () => {
    expect(getMatchHeadline(95)).toBe('EXCELLENT MATCH');
    expect(getMatchHeadline(80)).toBe('STRONG MATCH');
    expect(getMatchHeadline(60)).toBe('ALIGNED MATCH');
    expect(getMatchHeadline(20)).toBe('WORTH EXPLORING');
  });
});
