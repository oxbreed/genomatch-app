import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';

export { COLORS, GLASS, FOREST_DEEP, FOREST, GOLD, LINEN, SAGE, MINT, WHITE } from './colors';
export { TYPOGRAPHY, FONT_FAMILY, FONT_ROLE, SYSTEM_FONT } from './typography';
export { RADIUS, SHADOWS } from './shadows';
export { SCENE } from './sceneLayout';
export { MOTION } from './motion';

/**
 * Load with `useFonts(FONTS_TO_LOAD)` in App.tsx before rendering UI.
 *
 * Typography hierarchy:
 * - Gotham Rounded (Montserrat stand-in) — primary UI
 * - Proxima Nova (Montserrat ExtraBold stand-in) — marketing / editorial
 * - Helvetica / Roboto — system nav (no load required)
 *
 * Replace stand-ins with licensed files — see assets/fonts/README.md.
 */
export const FONTS_TO_LOAD = {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} as const;
