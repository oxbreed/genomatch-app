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

export function getGenotypeCompatibilityLine(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): string {
  const viewer = viewerGenotype ?? 'AA';
  const pairLabel = `${viewer} × ${candidateGenotype}`;
  const pairKey = [viewer, candidateGenotype].sort().join('');
  const riskByPair: Record<string, string> = {
    AAAA: 'Very low sickle cell risk',
    AAAS: 'Low sickle cell risk',
    AAAC: 'Low sickle cell risk',
    AASS: 'Elevated sickle cell risk',
    ASAS: 'Moderate sickle cell risk',
    ASAC: 'Moderate sickle cell risk',
    ASSS: 'Higher sickle cell risk',
    ACAC: 'Moderate sickle cell risk',
    ACCC: 'Moderate sickle cell risk',
    SSSS: 'Higher sickle cell risk',
  };
  const risk = riskByPair[pairKey] ?? 'Genotype-compatible match';
  return `${pairLabel} — ${risk}`;
}

/** Short risk label for swipe cards and match rows */
export function getGenotypeRiskShort(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): string {
  const viewer = viewerGenotype ?? 'AA';
  const pairKey = [viewer, candidateGenotype].sort().join('');
  const riskByPair: Record<string, string> = {
    AAAA: 'Very low risk',
    AAAS: 'Low risk',
    AAAC: 'Low risk',
    AASS: 'Elevated risk',
    ASAS: 'Moderate risk',
    ASAC: 'Moderate risk',
    ASSS: 'Higher risk',
    ACAC: 'Moderate risk',
    ACCC: 'Moderate risk',
    SSSS: 'Higher risk',
  };
  return riskByPair[pairKey] ?? 'Compatible';
}
