export type DiscoveryDeckCounts = {
  eligible: number;
  liked: number;
  passed: number;
};

/**
 * True when other finished profiles exist beyond the ones this member
 * already liked or passed, but the deck query returned nobody.
 */
export function discoveryDeckIsMissingPeople(stats: DiscoveryDeckCounts | null): boolean {
  if (!stats) return false;
  return stats.eligible > stats.liked + stats.passed;
}
