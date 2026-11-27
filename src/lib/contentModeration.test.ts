import {
  assertModerationAllowed,
  describeServerModerationError,
  moderateText,
  normaliseForMatching,
} from './contentModeration';

describe('normaliseForMatching', () => {
  it('undoes common evasion tricks', () => {
    expect(normaliseForMatching('S3ND  M0N3Y!!!')).toBe('send money');
    expect(normaliseForMatching('s-e-n-d  n-u-d-e-s')).toBe('s e n d n u d e s');
    expect(normaliseForMatching('hooooorny')).toBe('hoorny');
  });

  it('strips diacritics and zero-width characters', () => {
    expect(normaliseForMatching('séx châts')).toBe('sex chats');
    expect(normaliseForMatching('kil​l')).toBe('kill');
  });
});

describe('moderateText', () => {
  it('allows ordinary conversation', () => {
    for (const line of [
      'Hey, how was your week?',
      'I am AS, what about you?',
      'Would you like to get coffee in Lekki on Saturday?',
      'My assistant booked the class, it was a classic mix-up',
    ]) {
      expect(moderateText(line).allowed).toBe(true);
      expect(moderateText(line).flagged).toBe(false);
    }
  });

  it('does not trip on words that merely contain a blocked substring', () => {
    expect(moderateText('I will assist you with the analysis').allowed).toBe(true);
    expect(moderateText('She is a classical pianist').allowed).toBe(true);
  });
});

describe('hard blocks', () => {
  const blocked: [string, string][] = [
    ['send me money for the flight', 'scam_or_payment'],
    ['s3nd m0ney now', 'scam_or_payment'],
    ['do you have a gift card', 'scam_or_payment'],
    ['send nudes', 'sexual_solicitation'],
    ['kill yourself', 'threat'],
    ['i will find you', 'threat'],
    ['she is underage', 'minor_safety'],
  ];

  it.each(blocked)('blocks %s as %s', (text, category) => {
    const verdict = moderateText(text);
    expect(verdict.allowed).toBe(false);
    expect(verdict.category).toBe(category);
    expect(verdict.reason).toBeTruthy();
  });

  it('throws with the member-facing reason', () => {
    expect(() => assertModerationAllowed('send me money')).toThrow(/scam pattern/i);
  });
});

describe('contact details', () => {
  const samples = [
    'call me on 08031234567',
    'my email is ada@example.com',
    'find me on whatsapp',
    'here is my paypal.me link',
  ];

  it.each(samples)('flags but allows %s in chat', (text) => {
    const verdict = moderateText(text, 'message');
    expect(verdict.allowed).toBe(true);
    expect(verdict.flagged).toBe(true);
    expect(verdict.category).toBe('contact_details');
  });

  it.each(samples)('blocks %s in a profile', (text) => {
    const verdict = moderateText(text, 'profile');
    expect(verdict.allowed).toBe(false);
    expect(verdict.category).toBe('contact_details');
  });
});

describe('describeServerModerationError', () => {
  it('translates the trigger error into member-facing copy', () => {
    expect(describeServerModerationError({ message: 'content_blocked:threat' })).toMatch(
      /threats of violence/i
    );
  });

  it('returns null for unrelated errors', () => {
    expect(describeServerModerationError({ message: 'network timeout' })).toBeNull();
  });
});
