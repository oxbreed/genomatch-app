import type { DiscoveryProfile } from '../types/database';

export const HIGH_COMPATIBILITY_MIN = 75;

export type DiscoveryFilters = {
  compatibilityMode: 'all' | 'high';
  city: string;
  minAge: string;
  maxAge: string;
  relationshipGoal: 'any' | 'marriage' | 'serious' | 'casual';
  verifiedOnly: boolean;
};

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
  compatibilityMode: 'all',
  city: '',
  minAge: '',
  maxAge: '',
  relationshipGoal: 'any',
  verifiedOnly: false,
};

export function countActiveDiscoveryFilters(filters: DiscoveryFilters): number {
  let count = 0;
  if (filters.compatibilityMode === 'high') count += 1;
  if (filters.city.trim().length > 0) count += 1;
  if (filters.minAge.trim().length > 0) count += 1;
  if (filters.maxAge.trim().length > 0) count += 1;
  if (filters.relationshipGoal !== 'any') count += 1;
  if (filters.verifiedOnly) count += 1;
  return count;
}

export function hasActiveDiscoveryFilters(filters: DiscoveryFilters): boolean {
  return countActiveDiscoveryFilters(filters) > 0;
}

export function applyDiscoveryFilters(
  profiles: DiscoveryProfile[],
  filters: DiscoveryFilters
): DiscoveryProfile[] {
  return profiles.filter((p) => {
    if (filters.compatibilityMode === 'high' && p.compatibility < HIGH_COMPATIBILITY_MIN) {
      return false;
    }
    if (filters.verifiedOnly && !p.genotypeVerified) {
      return false;
    }
    const cityQuery = filters.city.trim().toLowerCase();
    if (cityQuery && !p.city.toLowerCase().includes(cityQuery)) {
      return false;
    }
    if (filters.minAge.trim() || filters.maxAge.trim()) {
      if (p.age == null) return false;
      const min = filters.minAge.trim() ? parseInt(filters.minAge, 10) : 18;
      const max = filters.maxAge.trim() ? parseInt(filters.maxAge, 10) : 65;
      if (p.age < min || p.age > max) return false;
    }
    if (filters.relationshipGoal !== 'any') {
      const goal = (p.relationshipGoal ?? '').toLowerCase();
      if (goal !== filters.relationshipGoal) return false;
    }
    return true;
  });
}

function clampAge(value: string): string {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return '';
  return String(Math.min(65, Math.max(18, n)));
}

export function normalizeDiscoveryFilters(draft: DiscoveryFilters): DiscoveryFilters {
  let minAge = draft.minAge.trim() ? clampAge(draft.minAge.trim()) : '';
  let maxAge = draft.maxAge.trim() ? clampAge(draft.maxAge.trim()) : '';

  if (minAge && maxAge && parseInt(minAge, 10) > parseInt(maxAge, 10)) {
    [minAge, maxAge] = [maxAge, minAge];
  }

  return {
    compatibilityMode: draft.compatibilityMode,
    city: draft.city.trim(),
    minAge,
    maxAge,
    relationshipGoal: draft.relationshipGoal,
    verifiedOnly: draft.verifiedOnly,
  };
}
