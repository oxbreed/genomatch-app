import { Platform, TextStyle } from 'react-native';
import { COLORS } from './colors';

/**
 * Platform system stack — Helvetica (iOS) / Roboto (Android).
 * Use for tab labels, technical settings, and background nav copy.
 */
export const SYSTEM_FONT = Platform.select({
  ios: 'Helvetica',
  android: 'Roboto',
  default: 'Helvetica',
}) as string;

/**
 * Font family load names (expo-font keys).
 * Gotham Rounded & Proxima Nova use Montserrat as a licensed-font stand-in.
 * Drop in real files via FONTS_TO_LOAD when you have them — see assets/fonts/README.md.
 */
export const FONT_FAMILY = {
  /** Primary app interface — Gotham Rounded */
  gothamBold: 'Montserrat_700Bold',
  gothamSemiBold: 'Montserrat_600SemiBold',
  gothamMedium: 'Montserrat_500Medium',
  gothamBook: 'Montserrat_400Regular',

  /** Marketing & editorial — Proxima Nova */
  marketingExtrabold: 'Montserrat_800ExtraBold',
  marketingBold: 'Montserrat_700Bold',

  /** Technical / system layout */
  system: SYSTEM_FONT,

  /** @deprecated Prefer gotham* — aliases preserve existing imports */
  clashSemibold: 'Montserrat_700Bold',
  clashMedium: 'Montserrat_600SemiBold',
  clashRegular: 'Montserrat_400Regular',
  satoshiRegular: 'Montserrat_400Regular',
  satoshiMedium: 'Montserrat_500Medium',
  satoshiBold: 'Montserrat_700Bold',
} as const;

function gothamBold(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.gothamBold, ...extra };
}

function gothamSemiBold(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.gothamSemiBold, ...extra };
}

function gothamMedium(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.gothamMedium, ...extra };
}

function gothamBook(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.gothamBook, ...extra };
}

function marketingExtrabold(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.marketingExtrabold, ...extra };
}

function marketingBold(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.marketingBold, ...extra };
}

function systemRegular(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.system, fontWeight: '400', ...extra };
}

/** Semantic roles — map to CSS utility classes in web exports */
export const FONT_ROLE = {
  primaryHeading: FONT_FAMILY.gothamBold,
  userProfile: FONT_FAMILY.gothamBold,
  uiBody: FONT_FAMILY.gothamBook,
  uiBodyStrong: FONT_FAMILY.gothamMedium,
  uiLabel: FONT_FAMILY.gothamMedium,
  marketing: FONT_FAMILY.marketingExtrabold,
  marketingSub: FONT_FAMILY.marketingBold,
  navLabel: FONT_FAMILY.system,
} as const;

export const TYPOGRAPHY = {
  /** Large hero / display — Gotham Bold */
  display: {
    ...gothamBold(),
    fontSize: 32,
    letterSpacing: -0.6,
    color: COLORS.forestDeep,
  } satisfies TextStyle,

  /** Screen & inbox titles */
  screenTitle: {
    ...gothamSemiBold(),
    fontSize: 26,
    letterSpacing: -0.4,
    color: COLORS.forestDeep,
  } satisfies TextStyle,

  heading: {
    ...gothamSemiBold(),
    fontSize: 26,
    letterSpacing: -0.4,
    color: COLORS.forestDeep,
  } satisfies TextStyle,

  headingSm: {
    ...gothamMedium(),
    fontSize: 20,
    letterSpacing: -0.2,
    color: COLORS.forestDeep,
  } satisfies TextStyle,

  /** Profile names, match names */
  name: {
    ...gothamBold(),
    fontSize: 17,
    letterSpacing: -0.15,
    color: COLORS.forestDeep,
  } satisfies TextStyle,

  /** Ages, meta on profiles */
  profileMeta: {
    ...gothamMedium(),
    fontSize: 14,
    letterSpacing: 0.1,
    color: COLORS.sage,
  } satisfies TextStyle,

  body: {
    ...gothamBook(),
    fontSize: 15,
    lineHeight: 22.5,
    color: COLORS.textMuted,
  } satisfies TextStyle,

  bodyStrong: {
    ...gothamMedium(),
    fontSize: 15,
    lineHeight: 22.5,
    color: COLORS.forestDeep,
  } satisfies TextStyle,

  label: {
    ...gothamMedium(),
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: COLORS.sage,
  } satisfies TextStyle,

  caption: {
    ...gothamBook(),
    fontSize: 13,
    lineHeight: 19.5,
    color: COLORS.textSubtle,
  } satisfies TextStyle,

  button: {
    ...gothamBold(),
    fontSize: 16,
    letterSpacing: 0.15,
    color: COLORS.forestDeep,
  } satisfies TextStyle,

  /** GENOMATCH kickers, onboarding, splash — Proxima Nova */
  marketingKicker: {
    ...marketingExtrabold(),
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: COLORS.gold,
  } satisfies TextStyle,

  marketingTitle: {
    ...marketingExtrabold(),
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: COLORS.linen,
  } satisfies TextStyle,

  marketingSubhead: {
    ...marketingBold(),
    fontSize: 13,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: COLORS.gold,
  } satisfies TextStyle,

  /** Tab bar, system nav */
  navLabel: {
    ...systemRegular(),
    fontSize: 10,
    letterSpacing: 0.12,
    color: 'rgba(22, 53, 34, 0.42)',
  } satisfies TextStyle,

  navLabelActive: {
    ...systemRegular(),
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.12,
    color: COLORS.forestDeep,
  } satisfies TextStyle,
} as const;
