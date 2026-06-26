import {
  dateOfBirthFromAge,
  isMinimumAge,
  sanitizeText,
  validateBio,
  validateDisplayName,
  validateEmail,
  validateGenotype,
  validateMessage,
} from './validation';

describe('validation', () => {
  it('validateEmail accepts well-formed addresses', () => {
    expect(validateEmail('hello@genomatch.app')).toBe(true);
  });

  it('validateEmail rejects invalid addresses', () => {
    expect(validateEmail('not-an-email')).toBe(false);
  });

  it('validateGenotype allows app genotype codes only', () => {
    expect(validateGenotype('AA')).toBe(true);
    expect(validateGenotype('XX')).toBe(false);
  });

  it('validateDisplayName enforces letter-only names', () => {
    expect(validateDisplayName('Amara')).toBe(true);
    expect(validateDisplayName('A')).toBe(false);
  });

  it('validateBio strips markup and enforces length', () => {
    expect(validateBio('A thoughtful bio about me and what I want.')).toBe(true);
    expect(validateBio('<script>alert(1)</script>')).toBe(false);
  });

  it('validateMessage sanitizes chat input', () => {
    expect(validateMessage('  Hello there  ')).toBe('Hello there');
    expect(validateMessage('   ')).toBeNull();
  });

  it('sanitizeText removes script tags', () => {
    expect(sanitizeText('<b>Hi</b>')).toBe('Hi');
  });

  it('isMinimumAge requires 18 or older', () => {
    expect(isMinimumAge(17)).toBe(false);
    expect(isMinimumAge(18)).toBe(true);
    expect(isMinimumAge(100)).toBe(true);
    expect(isMinimumAge(101)).toBe(false);
  });

  it('dateOfBirthFromAge returns a calendar date 18 years ago today', () => {
    const dob = dateOfBirthFromAge(18);
    expect(dob).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    const [year, month, day] = dob.split('-').map(Number);
    const born = new Date(year, month - 1, day);

    expect(born.getFullYear()).toBe(cutoff.getFullYear());
    expect(born.getMonth()).toBe(cutoff.getMonth());
    expect(born.getDate()).toBe(cutoff.getDate());
  });
});
