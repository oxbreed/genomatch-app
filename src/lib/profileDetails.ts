export const RELIGION_OPTIONS = [
  { id: 'christianity', label: 'Christianity' },
  { id: 'islam', label: 'Islam' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not', label: 'Prefer not to say' },
] as const;

export type ReligionId = (typeof RELIGION_OPTIONS)[number]['id'];

export const RELIGION_LABELS: Record<string, string> = Object.fromEntries(
  RELIGION_OPTIONS.map((o) => [o.id, o.label])
);

/** Common heights for quick-select in Profile Studio (cm). */
export const HEIGHT_PRESETS_CM = [155, 160, 163, 165, 168, 170, 173, 175, 178, 180, 183, 185, 188, 190, 193, 195];

export function formatHeightCm(cm: number | null | undefined): string | null {
  if (cm == null || cm <= 0) return null;
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}′${inches}″ · ${cm} cm`;
}

export function clampHeightCm(value: number): number {
  return Math.min(230, Math.max(120, Math.round(value)));
}

export function parseHeightInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, 10);
  if (Number.isNaN(n)) return null;
  return clampHeightCm(n);
}
