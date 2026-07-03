import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium_Italic,
} from '@expo-google-fonts/playfair-display';

export {
  COLORS,
  GLASS,
  MIRROR_GRADIENTS,
  MIRROR_RED_TEXT,
  ACCENT_GOLD_TEXT,
  redAlpha,
  goldAlpha,
  creamAlpha,
  silverAlpha,
  chromeAlpha,
  LOGO_RED,
  LOGO_RED_DEEP,
  LOGO_RED_BRIGHT,
  LOGO_GOLD,
  LOGO_GOLD_DEEP,
  LOGO_GOLD_BRIGHT,
  BRAND_BLACK,
  BRAND_CHARCOAL,
  METALLIC_GRAPHITE,
  METALLIC_SLATE,
  METALLIC_STEEL,
  METALLIC_SILVER,
  METALLIC_CHROME,
  BRAND_RED,
  BRAND_RED_DEEP,
  BRAND_RED_SOFT,
  MIRROR_WHITE,
  MIRROR_SILVER,
  MIRROR_FOG,
  GOLD,
  GOLD_BRIGHT,
  GOLD_DEEP,
  CREAM,
  LINEN,
  BLUSH,
  TAUPE,
  WHITE,
  FOREST_DEEP,
  FOREST,
  SAGE,
  MINT,
} from './colors';
export { TYPOGRAPHY, FONT_FAMILY, FONT_ROLE, SYSTEM_FONT } from './typography';
export { RADIUS, SHADOWS } from './shadows';
export type { MirrorActionKind, MirrorIconTone } from './mirrorActions';
export { MIRROR_ACTION, mirrorActionShadow } from './mirrorActions';
export { MOTION } from './motion';

/**
 * Satoshi — modern elegant UI face (see mockup reference).
 * Slightly rounded, premium, legible on mobile.
 */
export const FONTS_TO_LOAD = {
  'Satoshi-Regular': require('../../assets/fonts/Satoshi-Regular.otf'),
  'Satoshi-Medium': require('../../assets/fonts/Satoshi-Medium.otf'),
  'Satoshi-Bold': require('../../assets/fonts/Satoshi-Bold.otf'),
  'Satoshi-LightItalic': require('../../assets/fonts/Satoshi-LightItalic.otf'),
  'Satoshi-Italic': require('../../assets/fonts/Satoshi-Italic.otf'),
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium_Italic,
} as const;
