import { Platform } from 'react-native';
import Constants from 'expo-constants';
import ribbonMeta from '../../../assets/genomatch-ribbon-meta.json';
import { ONBOARDING_SCREEN_HEIGHT, ONBOARDING_SCREEN_WIDTH } from './onboardingScreen';

export { ONBOARDING_SCREEN_WIDTH, ONBOARDING_SCREEN_HEIGHT };

const RIBBON_ASPECT = ribbonMeta.nativeWidth / ribbonMeta.nativeHeight;

/** Horizontal screen padding */
export const ONBOARDING_H_PAD = 24;

export const ONBOARDING_CONTENT_WIDTH = ONBOARDING_SCREEN_WIDTH - ONBOARDING_H_PAD * 2;

/** Fixed visual area — larger, clearer hero mark */
export const ONBOARDING_SLOT_LOGO_WIDTH = Math.min(
  Math.round(ONBOARDING_CONTENT_WIDTH * 0.62),
  228
);
export const ONBOARDING_SLOT_LOGO_HEIGHT = Math.round(
  ONBOARDING_SLOT_LOGO_WIDTH / RIBBON_ASPECT
);
export const ONBOARDING_VISUAL_HEIGHT = ONBOARDING_SLOT_LOGO_HEIGHT + 20;

/** Splash sizing — crisp from 2048px poster on retina */
const WIDTH_FRACTION = ribbonMeta.logoWidthFraction ?? 0.84;
const MIN_LOGO_WIDTH = ribbonMeta.minLogoWidth ?? 276;
const MAX_LOGO_WIDTH = ribbonMeta.maxLogoWidth ?? 324;

function snapLogoWidth(screenWidth: number): number {
  const width = screenWidth > 0 ? screenWidth : 390;
  return Math.min(
    Math.max(Math.round(width * WIDTH_FRACTION), MIN_LOGO_WIDTH),
    MAX_LOGO_WIDTH
  );
}

const LOGO_W = snapLogoWidth(ONBOARDING_SCREEN_WIDTH);
export const ONBOARDING_LOGO_WIDTH = LOGO_W;
export const ONBOARDING_LOGO_HEIGHT = Math.round(LOGO_W / RIBBON_ASPECT);

export const ONBOARDING_TOP_PAD = Math.max(
  Math.round((Constants.statusBarHeight ?? 0) + 8),
  Platform.OS === 'ios' ? 48 : 20
);

export const ONBOARDING_CTA_WIDTH = ONBOARDING_CONTENT_WIDTH;
export const ONBOARDING_CTA_HEIGHT = 52;

export const ONBOARDING_BOTTOM_PAD = Platform.OS === 'ios' ? 34 : 24;

/** Reserved footer space — age gate on last slide */
export const ONBOARDING_AGE_SLOT_HEIGHT = 56;

export const ONBOARDING_FOOTER_MIN_HEIGHT =
  12 + 18 + 12 + ONBOARDING_AGE_SLOT_HEIGHT + ONBOARDING_CTA_HEIGHT + 12 + 20 + ONBOARDING_BOTTOM_PAD;

export const ONBOARDING_TEXT_GAP = 8;
export const ONBOARDING_SECTION_GAP = 20;
