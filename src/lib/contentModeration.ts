/**
 * Proactive content screening for member-authored text.
 *
 * App Store Guideline 1.2 requires a method for filtering objectionable
 * material BEFORE it is posted, not only a way to report it afterwards.
 * Report and block cover the afterwards; this covers the before.
 *
 * Deliberately conservative. A dating app that swallows ordinary messages
 * trains people to work around it, so this blocks a narrow set of categories
 * where the harm is clear, and flags a wider set for human review without
 * stopping the send.
 *
 * The same rules exist in SQL (see the moderation migration) because a client
 * check is advisory: anyone with the anon key can insert directly.
 */

export type ModerationVerdict = {
  /** False when the content must not be posted at all. */
  allowed: boolean;
  /** True when the content posts but is queued for a human to look at. */
  flagged: boolean;
  /** Machine-readable category, for the review queue. */
  category: ModerationCategory | null;
  /** Message shown to the author. Written to be corrective, not accusatory. */
  reason: string | null;
};

export type ModerationCategory =
  | 'sexual_solicitation'
  | 'slur'
  | 'threat'
  | 'scam_or_payment'
  | 'contact_details'
  | 'minor_safety';

const OK: ModerationVerdict = { allowed: true, flagged: false, category: null, reason: null };

/**
 * Collapse the evasion tricks people use to slip a term past a filter:
 * diacritics, zero-width joiners, digit and symbol substitution, and padding
 * a word out with repeated or separating characters.
 */
const LEET_SUBSTITUTIONS: Record<string, string> = {
  '0': 'o',
  '@': 'o',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '3': 'e',
  '5': 's',
  $: 's',
  '4': 'a',
  '7': 't',
};

/**
 * Substitute only where the character sits between two letters, so "m0n3y"
 * folds to "money" while trailing "!!!" stays punctuation and is stripped.
 * Substituting unconditionally turned "money!!!" into "moneyiii".
 */
function foldLeetInsideWords(value: string): string {
  const chars = [...value];
  const isLetter = (c: string | undefined) => !!c && c >= 'a' && c <= 'z';

  return chars
    .map((char, i) => {
      const sub = LEET_SUBSTITUTIONS[char];
      if (!sub) return char;
      return isLetter(chars[i - 1]) && isLetter(chars[i + 1]) ? sub : char;
    })
    .join('');
}

export function normaliseForMatching(input: string): string {
  const folded = foldLeetInsideWords(
    input
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[​-‏⁠﻿]/g, '')
      .toLowerCase()
  );

  return folded
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/(\S)\1{2,}/g, '$1$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Matches a whole word, so "assist" never trips a rule written for "ass". */
function hasWord(haystack: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`, 'i').test(haystack);
}

function hasAnyWord(haystack: string, words: readonly string[]): boolean {
  return words.some((w) => hasWord(haystack, w));
}

/**
 * Hard blocks. Kept short on purpose — every entry here stops a real person
 * from sending a real message, so the bar is content that has no legitimate
 * use in a first conversation on a dating app.
 */
const BLOCK_RULES: { category: ModerationCategory; reason: string; terms: readonly string[] }[] = [
  {
    category: 'minor_safety',
    reason:
      'GenoMatch is strictly 18+. Messages that describe anyone as underage are not allowed and are reported.',
    terms: ['underage', 'under age', 'minor girl', 'minor boy', 'jailbait', 'school girl', 'school boy'],
  },
  {
    category: 'sexual_solicitation',
    reason:
      'Explicit sexual propositions are not allowed on GenoMatch. Keep first messages to how you would speak to someone in person.',
    terms: [
      'send nudes',
      'send nude',
      'send pics of your',
      'sex now',
      'want sex',
      'for sex',
      'sex chat',
      'horny',
      'dick pic',
      'nude pic',
      'nude photo',
      'naked pic',
      'naked photo',
    ],
  },
  {
    category: 'threat',
    reason: 'Threats of violence are not allowed and may result in a permanent ban.',
    terms: [
      'i will kill you',
      'kill yourself',
      'kys',
      'i will find you',
      'i will hurt you',
      'you will die',
      'rape you',
    ],
  },
  {
    category: 'scam_or_payment',
    reason:
      'Asking for money, gift cards or crypto is the most common scam pattern on dating apps. GenoMatch does not allow it.',
    terms: [
      'send me money',
      'send money',
      'gift card',
      'bitcoin',
      'btc wallet',
      'usdt',
      'crypto wallet',
      'western union',
      'wire transfer',
      'investment opportunity',
      'bank details',
      'account number',
      'atm pin',
      'bvn',
    ],
  },
];

/**
 * Slurs are handled separately from the phrase rules because they are single
 * words and the list is intentionally not spelled out in source. Each entry is
 * a pattern over the normalised string.
 */
const SLUR_PATTERNS: readonly RegExp[] = [
  /\bn[i]gg[ae]r?s?\b/,
  /\bf[a]gg?[oe]ts?\b/,
  /\btr[a]nn(?:y|ies)\b/,
  /\bret[a]rds?\b/,
  /\bc[u]nts?\b/,
];

/** Contact details in a first message: flagged for review, not blocked. */
const CONTACT_PATTERNS: readonly RegExp[] = [
  // Phone numbers, including Nigerian local and +234 forms.
  /(?:\+?234|0)\d{10}\b/,
  /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/,
  /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,
  /\b(?:wa\.me|t\.me|telegram|whatsapp|snapchat|cashapp|paypal\.me)\b/i,
];

export type ModerationSurface = 'message' | 'profile';

/**
 * Screen member-authored text before it is stored.
 *
 * `surface` changes only the contact-details rule: sharing a phone number in a
 * chat you have already matched into is a personal choice, while putting one in
 * a public profile is how spam accounts operate.
 */
export function moderateText(
  input: string,
  surface: ModerationSurface = 'message'
): ModerationVerdict {
  const text = (input ?? '').trim();
  if (!text) return OK;

  const normalised = normaliseForMatching(text);

  for (const rule of BLOCK_RULES) {
    if (hasAnyWord(normalised, rule.terms)) {
      return { allowed: false, flagged: true, category: rule.category, reason: rule.reason };
    }
  }

  if (SLUR_PATTERNS.some((p) => p.test(normalised))) {
    return {
      allowed: false,
      flagged: true,
      category: 'slur',
      reason: 'That message contains a slur. GenoMatch does not allow abusive language.',
    };
  }

  const hasContact = CONTACT_PATTERNS.some((p) => p.test(text));

  if (hasContact && surface === 'profile') {
    return {
      allowed: false,
      flagged: true,
      category: 'contact_details',
      reason:
        'Phone numbers, emails and payment links are not allowed in profiles. Share them in chat once you trust someone.',
    };
  }

  if (hasContact) {
    return {
      allowed: true,
      flagged: true,
      category: 'contact_details',
      reason:
        'Heads up: you are sharing contact details. Most dating scams start this way. Only do this once you trust the person.',
    };
  }

  return OK;
}

/** Throws with the member-facing reason when content must not be posted. */
export function assertModerationAllowed(
  input: string,
  surface: ModerationSurface = 'message'
): ModerationVerdict {
  const verdict = moderateText(input, surface);
  if (!verdict.allowed && verdict.reason) throw new Error(verdict.reason);
  return verdict;
}

const SERVER_BLOCK_MESSAGES: Record<string, string> = {
  minor_safety:
    'GenoMatch is strictly 18+. Messages that describe anyone as underage are not allowed and are reported.',
  sexual_solicitation:
    'Explicit sexual propositions are not allowed on GenoMatch. Keep first messages to how you would speak to someone in person.',
  threat: 'Threats of violence are not allowed and may result in a permanent ban.',
  scam_or_payment:
    'Asking for money, gift cards or crypto is the most common scam pattern on dating apps. GenoMatch does not allow it.',
  slur: 'That message contains a slur. GenoMatch does not allow abusive language.',
  contact_details:
    'Phone numbers, emails and payment links are not allowed in profiles. Share them in chat once you trust someone.',
};

/**
 * The database trigger raises `content_blocked:<category>`. Postgres errors
 * reach the client verbatim, so translate them before they are shown.
 * Returns null when the error is not a moderation rejection.
 */
export function describeServerModerationError(error: unknown): string | null {
  const message =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : '';

  const match = /content_blocked:(\w+)/.exec(message);
  if (!match) return null;

  return (
    SERVER_BLOCK_MESSAGES[match[1]] ??
    'That content breaks the GenoMatch community guidelines and was not posted.'
  );
}
