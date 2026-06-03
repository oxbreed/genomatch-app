export { COLORS, FOREST_DEEP, FOREST, GOLD, LINEN, SAGE, MINT, WHITE } from './colors';
export { TYPOGRAPHY, FONT_FAMILY } from './typography';
export { RADIUS, SHADOWS } from './shadows';

/** Load with `useFonts(FONTS_TO_LOAD)` in App.tsx before rendering UI */
export const FONTS_TO_LOAD = {
  'ClashDisplay-Semibold': require('../../assets/fonts/ClashDisplay-Semibold.otf'),
  'ClashDisplay-Medium': require('../../assets/fonts/ClashDisplay-Medium.otf'),
  'ClashDisplay-Regular': require('../../assets/fonts/ClashDisplay-Regular.otf'),
  'Satoshi-Regular': require('../../assets/fonts/Satoshi-Regular.otf'),
  'Satoshi-Medium': require('../../assets/fonts/Satoshi-Medium.otf'),
  'Satoshi-Bold': require('../../assets/fonts/Satoshi-Bold.otf'),
} as const;
