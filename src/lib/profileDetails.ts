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

export const HABIT_OPTIONS = [
  { id: 'never', label: 'Never' },
  { id: 'socially', label: 'Socially' },
  { id: 'regularly', label: 'Regularly' },
  { id: 'prefer_not', label: 'Prefer not to say' },
] as const;

export type HabitId = (typeof HABIT_OPTIONS)[number]['id'];

export const HABIT_LABELS: Record<string, string> = Object.fromEntries(
  HABIT_OPTIONS.map((o) => [o.id, o.label])
);

export const EDUCATION_OPTIONS = [
  { id: 'high_school', label: 'High school' },
  { id: 'diploma', label: 'Diploma / Certificate' },
  { id: 'bachelors', label: "Bachelor's degree" },
  { id: 'masters', label: "Master's degree" },
  { id: 'doctorate', label: 'Doctorate' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not', label: 'Prefer not to say' },
] as const;

export type EducationId = (typeof EDUCATION_OPTIONS)[number]['id'];

export const EDUCATION_LABELS: Record<string, string> = Object.fromEntries(
  EDUCATION_OPTIONS.map((o) => [o.id, o.label])
);
