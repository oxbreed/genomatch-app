import type { Genotype } from '../types/database';

/** Genotype-aware compatibility score (0–100) for West African sickle-cell context. */
export function computeCompatibility(
  viewer: Genotype | null,
  candidate: Genotype | null
): number {
  if (!viewer || !candidate) return 72;

  const pair = [viewer, candidate].sort().join('');

  const scores: Record<string, number> = {
    AAAA: 98,
    AAAS: 88,
    AAAC: 90,
    AASS: 45,
    ASAS: 72,
    ASAC: 78,
    ASSS: 38,
    ACAC: 75,
    ACCC: 70,
    SSSS: 30,
  };

  return scores[pair] ?? 65;
}
