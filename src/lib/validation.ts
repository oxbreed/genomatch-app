const HTML_TAG_REGEX = /<[^>]*>/g;
const SCRIPT_BLOCK_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_REGEX = /\bon\w+\s*=/gi;
const JAVASCRIPT_URL_REGEX = /javascript:/gi;
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Must match public.genotype_type and the Genotype union.
// CC (HbCC) is not supported; adding it needs its own migration and review.
const VALID_GENOTYPES = new Set(['AA', 'AS', 'SS', 'AC', 'SC']);

/** Trims whitespace and strips HTML/script injection patterns. */
export function sanitizeText(input: string): string {
  let text = input.trim();
  text = text.replace(SCRIPT_BLOCK_REGEX, '');
  text = text.replace(HTML_TAG_REGEX, '');
  text = text.replace(EVENT_HANDLER_REGEX, '');
  text = text.replace(JAVASCRIPT_URL_REGEX, '');
  return text.trim();
}

/** Strict email format validation (max 254 chars). */
export function validateEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) {
    return false;
  }
  return EMAIL_REGEX.test(trimmed);
}

/** Only allows known genotype codes. */
export function validateGenotype(genotype: string): boolean {
  return VALID_GENOTYPES.has(genotype.trim().toUpperCase());
}

/** Max 500 characters after sanitization; rejects script markup. */
export function validateBio(bio: string): boolean {
  if (SCRIPT_BLOCK_REGEX.test(bio) || /<script/i.test(bio)) {
    return false;
  }
  return sanitizeText(bio).length <= 500;
}

const MINIMUM_AGE = 18;
const MAXIMUM_AGE = 100;

/** True when age is a whole number and the user is at least 18. */
export function isMinimumAge(age: number): boolean {
  return Number.isInteger(age) && age >= MINIMUM_AGE && age <= MAXIMUM_AGE;
}

/** Calendar date as YYYY-MM-DD in the local timezone. */
export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parse YYYY-MM-DD as a local calendar date. Rejects impossible days such as 31 Feb. */
export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** Build YYYY-MM-DD from the day, month, and year boxes on signup. */
export function dateOfBirthFromParts(day: string, month: string, year: string): string | null {
  if (!/^\d{1,2}$/.test(day.trim()) || !/^\d{1,2}$/.test(month.trim()) || !/^\d{4}$/.test(year.trim())) {
    return null;
  }
  const iso = `${year.trim()}-${month.trim().padStart(2, '0')}-${day.trim().padStart(2, '0')}`;
  return parseDateOnly(iso) ? iso : null;
}

/**
 * Whole years since a calendar birthday.
 * Age increases on the birthday itself, including when that date is 29 Feb.
 */
export function ageFromDateOfBirth(dob: string | null, today = new Date()): number | null {
  const birth = dob ? parseDateOnly(dob) : null;
  if (!birth) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** True when the birthday is a real date and the person is 18–100 today. */
export function isAdultDateOfBirth(dob: string | null, today = new Date()): boolean {
  const age = ageFromDateOfBirth(dob, today);
  return age != null && isMinimumAge(age);
}

/** Derive a date_of_birth that satisfies the 18+ gate for the given age today. */
export function dateOfBirthFromAge(age: number, today = new Date()): string {
  const dob = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
  return formatDateOnly(dob);
}

/** 2–50 chars; letters, spaces, and hyphens only. */
export function validateDisplayName(name: string): boolean {
  const trimmed = sanitizeText(name);
  if (trimmed.length < 2 || trimmed.length > 50) {
    return false;
  }
  return /^[a-zA-Z\u00C0-\u024F\s-]+$/.test(trimmed);
}

const MAX_MESSAGE_LENGTH = 2000;

/** Sanitizes chat input; returns null when empty or invalid. */
export function validateMessage(input: string): string | null {
  if (SCRIPT_BLOCK_REGEX.test(input) || /<script/i.test(input)) {
    return null;
  }
  const sanitized = sanitizeText(input);
  if (!sanitized || sanitized.length > MAX_MESSAGE_LENGTH) {
    return null;
  }
  return sanitized;
}
