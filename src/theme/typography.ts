import { TextStyle } from 'react-native';
import { COLORS } from './colors';

/** Keys must match `FONTS_TO_LOAD` in src/theme/index.ts (PostScript names used by expo-font). */
export const FONT_FAMILY = {
  clashSemibold: 'ClashDisplay-Semibold',
  clashMedium: 'ClashDisplay-Medium',
  clashRegular: 'ClashDisplay-Regular',
  satoshiRegular: 'Satoshi-Regular',
  satoshiMedium: 'Satoshi-Medium',
  satoshiBold: 'Satoshi-Bold',
} as const;

function clashSemibold(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.clashSemibold, ...extra };
}

function clashMedium(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.clashMedium, ...extra };
}

function clashRegular(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.clashRegular, ...extra };
}

function satoshiRegular(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.satoshiRegular, ...extra };
}

function satoshiMedium(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.satoshiMedium, ...extra };
}

function satoshiBold(extra?: TextStyle): TextStyle {
  return { fontFamily: FONT_FAMILY.satoshiBold, ...extra };
}

export const TYPOGRAPHY = {
  display: {
    ...clashSemibold(),
    fontSize: 32,
    letterSpacing: -0.8,
    color: COLORS.forestDeep,
  } satisfies TextStyle,
  screenTitle: {
    ...clashMedium(),
    fontSize: 26,
    letterSpacing: -0.5,
    color: COLORS.forestDeep,
  } satisfies TextStyle,
  heading: {
    ...clashMedium(),
    fontSize: 26,
    letterSpacing: -0.5,
    color: COLORS.forestDeep,
  } satisfies TextStyle,
  headingSm: {
    ...clashRegular(),
    fontSize: 20,
    letterSpacing: -0.3,
    color: COLORS.forestDeep,
  } satisfies TextStyle,
  name: {
    ...satoshiMedium(),
    fontSize: 17,
    letterSpacing: -0.2,
    color: COLORS.forestDeep,
  } satisfies TextStyle,
  body: {
    ...satoshiRegular(),
    fontSize: 15,
    lineHeight: 22.5,
    color: COLORS.textMuted,
  } satisfies TextStyle,
  bodyStrong: {
    ...satoshiMedium(),
    fontSize: 15,
    lineHeight: 22.5,
    color: COLORS.forestDeep,
  } satisfies TextStyle,
  label: {
    ...satoshiMedium(),
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: COLORS.sage,
  } satisfies TextStyle,
  caption: {
    ...satoshiRegular(),
    fontSize: 13,
    lineHeight: 19.5,
    color: COLORS.textSubtle,
  } satisfies TextStyle,
  button: {
    ...satoshiBold(),
    fontSize: 16,
    letterSpacing: 0.2,
    color: COLORS.forestDeep,
  } satisfies TextStyle,
} as const;
