import { Platform, TextStyle } from 'react-native';
import { ACCENT_GOLD_TEXT, COLORS, CREAM, LOGO_GOLD, LOGO_RED, MIRROR_RED_TEXT, creamAlpha } from './colors';

/**
 * GenoMatch typography — two fonts only.
 *
 * Serif (Playfair Display): romantic taglines, screen titles, harmony moments, bios.
 * Sans (Satoshi): body, labels, names, chips, CTAs, navigation, metadata.
 */

export const SYSTEM_FONT = Platform.select({
  ios: 'Helvetica',
  android: 'Roboto',
  default: 'Helvetica',
}) as string;

export const FONT_FAMILY = {
  /** Sans — primary UI */
  gothamBold: 'Satoshi-Bold',
  gothamSemiBold: 'Satoshi-Bold',
  gothamMedium: 'Satoshi-Medium',
  gothamBook: 'Satoshi-Regular',

  satoshiRegular: 'Satoshi-Regular',
  satoshiMedium: 'Satoshi-Medium',
  satoshiBold: 'Satoshi-Bold',
  satoshiLightItalic: 'Satoshi-LightItalic',
  satoshiItalic: 'Satoshi-Italic',

  /** Serif — brand & editorial */
  playfairRegular: 'PlayfairDisplay_400Regular',
  playfairItalic: 'PlayfairDisplay_400Regular_Italic',
  playfairMediumItalic: 'PlayfairDisplay_500Medium_Italic',

  /** Legacy aliases */
  marketingExtrabold: 'Satoshi-Bold',
  marketingBold: 'Satoshi-Bold',
  taglineItalic: 'Satoshi-LightItalic',
  clashSemibold: 'Satoshi-Bold',
  clashMedium: 'Satoshi-Medium',
  clashRegular: 'Satoshi-Regular',
  system: SYSTEM_FONT,
} as const;

function serif(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.playfairRegular, ...extra };
}

function serifItalic(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.playfairItalic, fontStyle: 'italic', ...extra };
}

function bold(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.gothamBold, ...extra };
}

function medium(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.gothamMedium, ...extra };
}

function regular(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.gothamBook, ...extra };
}

export const FONT_ROLE = {
  primaryHeading: FONT_FAMILY.playfairRegular,
  userProfile: FONT_FAMILY.gothamBold,
  uiBody: FONT_FAMILY.gothamBook,
  uiBodyStrong: FONT_FAMILY.gothamMedium,
  uiLabel: FONT_FAMILY.gothamMedium,
  marketing: FONT_FAMILY.playfairRegular,
  marketingSub: FONT_FAMILY.gothamBold,
  tagline: FONT_FAMILY.playfairItalic,
  navLabel: FONT_FAMILY.gothamMedium,
} as const;

export const TYPOGRAPHY = {
  /** Playfair — onboarding tagline line 1, screen titles */
  serifHeadline: {
    ...serif(),
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.25,
    color: LOGO_GOLD,
  } satisfies TextStyle,

  /** Playfair italic — tagline accent, romantic emphasis */
  serifAccent: {
    ...serifItalic(),
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: LOGO_RED,
  } satisfies TextStyle,

  /** Playfair — harmony score title, premium section headers */
  serifTitle: {
    ...serif(),
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.15,
    color: CREAM,
  } satisfies TextStyle,

  /** Playfair italic — bio copy (read & write) */
  editorialBio: {
    ...serifItalic(),
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.12,
    color: COLORS.textMuted,
  } satisfies TextStyle,

  /** Satoshi caps — discover section kickers (About, Details) */
  sectionLabel: {
    ...bold(),
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: LOGO_RED,
  } satisfies TextStyle,

  /** Satoshi caps — edit-profile / settings field labels */
  sectionLabelGold: {
    ...medium(),
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: LOGO_GOLD,
  } satisfies TextStyle,

  /** Satoshi — profile & card names */
  displayName: {
    ...bold(),
    fontSize: 28,
    letterSpacing: -0.5,
    color: COLORS.text,
  } satisfies TextStyle,

  /** Satoshi — body paragraphs */
  body: {
    ...regular(),
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.08,
    color: COLORS.textMuted,
  } satisfies TextStyle,

  bodyStrong: {
    ...medium(),
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.06,
    color: COLORS.text,
  } satisfies TextStyle,

  /** Satoshi — chips & detail row values */
  chip: {
    ...medium(),
    fontSize: 13,
    letterSpacing: 0.1,
    color: COLORS.text,
  } satisfies TextStyle,

  /** Satoshi — primary buttons */
  cta: {
    ...bold(),
    fontSize: 16,
    letterSpacing: 0.55,
    color: COLORS.white,
  } satisfies TextStyle,

  /** Satoshi — small red kickers (onboarding steps, marketing) */
  /** Legal / medical disclaimers — readable on dark */
  disclaimer: {
    ...regular(),
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.08,
    color: creamAlpha(0.62),
  } satisfies TextStyle,

  /** Secondary helper under inputs and CTAs */
  helper: {
    ...regular(),
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.06,
    color: creamAlpha(0.68),
  } satisfies TextStyle,

  marketingKicker: {
    ...bold(),
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    ...MIRROR_RED_TEXT,
  } satisfies TextStyle,

  /** Satoshi — onboarding step headlines */
  stepHeadline: {
    ...bold(),
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: CREAM,
  } satisfies TextStyle,

  /** Satoshi — tab bar */
  navLabel: {
    ...medium(),
    fontSize: 11,
    letterSpacing: 0.1,
    color: creamAlpha(0.55),
  } satisfies TextStyle,

  navLabelActive: {
    ...bold(),
    fontSize: 11,
    letterSpacing: 0.1,
    ...MIRROR_RED_TEXT,
  } satisfies TextStyle,

  // —— Legacy aliases (keep existing call sites stable) ——

  display: {
    ...bold(),
    fontSize: 32,
    letterSpacing: -0.4,
    color: COLORS.text,
  } satisfies TextStyle,

  screenTitle: {
    ...serif(),
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: COLORS.text,
  } satisfies TextStyle,

  heading: {
    ...bold(),
    fontSize: 26,
    letterSpacing: -0.2,
    color: COLORS.text,
  } satisfies TextStyle,

  impactHeading: {
    ...bold(),
    fontSize: 13,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: LOGO_RED,
  } satisfies TextStyle,

  headingSm: {
    ...medium(),
    fontSize: 20,
    letterSpacing: 0.1,
    color: COLORS.text,
  } satisfies TextStyle,

  name: {
    ...bold(),
    fontSize: 17,
    letterSpacing: 0.05,
    color: COLORS.text,
  } satisfies TextStyle,

  profileMeta: {
    ...medium(),
    fontSize: 14,
    letterSpacing: 0.2,
    color: COLORS.sage,
  } satisfies TextStyle,

  label: {
    ...medium(),
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: COLORS.sage,
  } satisfies TextStyle,

  caption: {
    ...regular(),
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: creamAlpha(0.62),
  } satisfies TextStyle,

  button: {
    ...bold(),
    fontSize: 16,
    letterSpacing: 0.4,
    color: COLORS.text,
  } satisfies TextStyle,

  tagline: {
    fontFamily: FONT_FAMILY.satoshiLightItalic,
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.35,
    ...ACCENT_GOLD_TEXT,
  } satisfies TextStyle,

  accentGold: {
    ...medium(),
    fontSize: 13,
    letterSpacing: 0.6,
    ...ACCENT_GOLD_TEXT,
  } satisfies TextStyle,

  marketingTitle: {
    ...serif(),
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.2,
    color: COLORS.linen,
  } satisfies TextStyle,

  marketingSubhead: {
    ...bold(),
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: LOGO_GOLD,
  } satisfies TextStyle,
} as const;
