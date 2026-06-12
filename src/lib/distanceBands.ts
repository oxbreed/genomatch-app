import { normalizeCityKey, resolveCityCentroid } from './cityCentroids';

export type DistanceBand = 'same_city' | 'nearby' | 'regional' | 'distant' | 'unknown';

/** Metro / short-trip radius from city centre. */
export const DISTANCE_BAND_NEARBY_KM = 50;
/** Drivable day-trip radius before treated as far. */
export const DISTANCE_BAND_REGIONAL_KM = 150;

/** Coarse km-range copy — never exact distance. */
export const DISTANCE_BAND_LABELS: Record<DistanceBand, string> = {
  same_city: 'Same city',
  nearby: `Within ${DISTANCE_BAND_NEARBY_KM} km`,
  regional: `${DISTANCE_BAND_NEARBY_KM}–${DISTANCE_BAND_REGIONAL_KM} km`,
  distant: `${DISTANCE_BAND_REGIONAL_KM}+ km`,
  unknown: '',
};

export const FILTERABLE_DISTANCE_BANDS: DistanceBand[] = [
  'same_city',
  'nearby',
  'regional',
  'distant',
];

export const DISTANCE_BAND_FILTER_OPTIONS: { id: DistanceBand; label: string }[] =
  FILTERABLE_DISTANCE_BANDS.map((id) => ({
    id,
    label: DISTANCE_BAND_LABELS[id],
  }));

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export function parseDistanceBand(value: unknown): DistanceBand {
  if (
    value === 'same_city' ||
    value === 'nearby' ||
    value === 'regional' ||
    value === 'distant' ||
    value === 'unknown'
  ) {
    return value;
  }
  return 'unknown';
}

/** Mock/demo fallback — mirrors server coarse_distance_band thresholds. */
export function resolveDistanceBandFromCities(
  viewerCity: string | null | undefined,
  targetCity: string | null | undefined
): DistanceBand {
  const viewerKey = normalizeCityKey(viewerCity);
  const targetKey = normalizeCityKey(targetCity);

  if (viewerKey && targetKey && viewerKey === targetKey) {
    return 'same_city';
  }

  const viewerCentroid = resolveCityCentroid(viewerCity);
  const targetCentroid = resolveCityCentroid(targetCity);
  if (!viewerCentroid || !targetCentroid) {
    return 'unknown';
  }

  const km = haversineKm(
    viewerCentroid.approxLat,
    viewerCentroid.approxLng,
    targetCentroid.approxLat,
    targetCentroid.approxLng
  );

  if (km <= DISTANCE_BAND_NEARBY_KM) return 'nearby';
  if (km <= DISTANCE_BAND_REGIONAL_KM) return 'regional';
  return 'distant';
}

export function formatLocationLine(
  city: string,
  band: DistanceBand | null | undefined
): string {
  const label = band && band !== 'unknown' ? DISTANCE_BAND_LABELS[band] : '';
  return label ? `${city} · ${label}` : city;
}
