export type CityCentroid = {
  displayName: string;
  approxLat: number;
  approxLng: number;
};

/** Normalized key → centroid (~1 km grid, 2 decimal places). */
export const CITY_CENTROIDS: Record<string, CityCentroid> = {
  lagos: { displayName: 'Lagos', approxLat: 6.52, approxLng: 3.38 },
  abuja: { displayName: 'Abuja', approxLat: 9.08, approxLng: 7.4 },
  nairobi: { displayName: 'Nairobi', approxLat: -1.29, approxLng: 36.82 },
  ibadan: { displayName: 'Ibadan', approxLat: 7.38, approxLng: 3.9 },
  kano: { displayName: 'Kano', approxLat: 12.0, approxLng: 8.52 },
  port_harcourt: { displayName: 'Port Harcourt', approxLat: 4.82, approxLng: 7.05 },
  benin_city: { displayName: 'Benin City', approxLat: 6.34, approxLng: 5.6 },
  kaduna: { displayName: 'Kaduna', approxLat: 10.51, approxLng: 7.44 },
  enugu: { displayName: 'Enugu', approxLat: 6.44, approxLng: 7.5 },
  accra: { displayName: 'Accra', approxLat: 5.56, approxLng: -0.2 },
};

const CITY_ALIASES: Record<string, string> = {
  fct: 'abuja',
  ph: 'port_harcourt',
  'port harcourt': 'port_harcourt',
  benin: 'benin_city',
  'benin city': 'benin_city',
};

export function normalizeCityKey(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const lower = raw.trim().toLowerCase();
  const aliased = CITY_ALIASES[lower];
  if (aliased) return aliased;
  return lower.replace(/\s+/g, '_');
}

export function resolveCityCentroid(raw: string | null | undefined): CityCentroid | null {
  const key = normalizeCityKey(raw);
  return key ? (CITY_CENTROIDS[key] ?? null) : null;
}

export const SUPPORTED_CITY_NAMES = Object.values(CITY_CENTROIDS)
  .map((city) => city.displayName)
  .sort((a, b) => a.localeCompare(b));
