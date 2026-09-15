/**
 * Lifestyle match — a genuine interest / relationship-goal overlap score.
 *
 * This module is intentionally free of any genotype logic. It must NEVER
 * import from `./compatibility` or from the genotype path in `./profileMapper`.
 * It is the only permitted source of the percentage shown by MatchProfileCard
 * and the discovery/match score UI.
 */

const norm = (value: string): string => value.trim().toLowerCase();

/**
 * Overlap percentage (0–100) between two members, based on shared interests
 * and relationship-goal alignment. No genotype data is involved.
 */
export function computeLifestyleMatch(
  viewerInterests: readonly string[] | null | undefined,
  candidateInterests: readonly string[] | null | undefined,
  viewerGoal?: string | null,
  candidateGoal?: string | null
): number {
  const viewerSet = new Set((viewerInterests ?? []).map(norm).filter(Boolean));
  const candidateSet = new Set((candidateInterests ?? []).map(norm).filter(Boolean));

  let shared = 0;
  for (const tag of candidateSet) {
    if (viewerSet.has(tag)) shared += 1;
  }
  const union = new Set([...viewerSet, ...candidateSet]).size;
  const interestScore = union > 0 ? shared / union : 0;

  // Neutral when either goal is unknown; strong when they align.
  let goalScore = 0.5;
  if (viewerGoal && candidateGoal) {
    goalScore = norm(viewerGoal) === norm(candidateGoal) ? 1 : 0.25;
  }

  // With no interests to compare on both sides, fall back to goal alignment
  // rather than reporting a misleading 0% overlap.
  const hasInterestSignal = viewerSet.size > 0 && candidateSet.size > 0;
  const blended = hasInterestSignal ? interestScore * 0.7 + goalScore * 0.3 : goalScore;

  return Math.max(0, Math.min(100, Math.round(blended * 100)));
}

/**
 * Qualitative headline for a lifestyle-overlap percent. Takes ONLY a lifestyle
 * percent — never a genotype pairing result.
 */
export function getMatchHeadline(percent: number): string {
  if (percent >= 90) return 'EXCELLENT MATCH';
  if (percent >= 75) return 'STRONG MATCH';
  if (percent >= 50) return 'ALIGNED MATCH';
  return 'WORTH EXPLORING';
}
