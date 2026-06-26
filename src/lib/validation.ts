const HTML_TAG_REGEX = /<[^>]*>/g;
const SCRIPT_BLOCK_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_REGEX = /\bon\w+\s*=/gi;
const JAVASCRIPT_URL_REGEX = /javascript:/gi;
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const VALID_GENOTYPES = new Set(['AA', 'AS', 'SS', 'AC', 'SC', 'CC']);

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

/** Derive a date_of_birth that satisfies the 18+ gate for the given age today. */
export function dateOfBirthFromAge(age: number): string {
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - age);
  const year = dob.getFullYear();
  const month = String(dob.getMonth() + 1).padStart(2, '0');
  const day = String(dob.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
