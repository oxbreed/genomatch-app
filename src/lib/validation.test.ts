import {
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
    expect(validateGenotype('SC')).toBe(false);
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
});
