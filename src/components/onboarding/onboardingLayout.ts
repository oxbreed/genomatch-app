import { Platform } from 'react-native';
import Constants from 'expo-constants';
import ribbonMeta from '../../../assets/genomatch-ribbon-meta.json';
import { ONBOARDING_SCREEN_HEIGHT, ONBOARDING_SCREEN_WIDTH } from './onboardingScreen';

export { ONBOARDING_SCREEN_WIDTH, ONBOARDING_SCREEN_HEIGHT };

const RIBBON_ASPECT = ribbonMeta.nativeWidth / ribbonMeta.nativeHeight;
const WIDTH_FRACTION = ribbonMeta.logoWidthFraction ?? 0.68;
const MIN_LOGO_WIDTH = ribbonMeta.minLogoWidth ?? 240;
const MAX_LOGO_WIDTH = ribbonMeta.maxLogoWidth ?? 288;

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

export const ONBOARDING_H_PAD = 28;

export const ONBOARDING_CONTENT_WIDTH = ONBOARDING_SCREEN_WIDTH - ONBOARDING_H_PAD * 2;

export const ONBOARDING_TAGLINE_GAP = 8;

export const ONBOARDING_TAGLINE_BLOCK_HEIGHT = 72;

export const ONBOARDING_HERO_CLUSTER_HEIGHT =
  ONBOARDING_LOGO_HEIGHT + ONBOARDING_TAGLINE_GAP + ONBOARDING_TAGLINE_BLOCK_HEIGHT;

export const ONBOARDING_TOP_PAD = Math.max(
  Math.round((Constants.statusBarHeight ?? 0) + 8),
  Platform.OS === 'ios' ? 48 : 20
);

export const ONBOARDING_CTA_WIDTH = ONBOARDING_CONTENT_WIDTH;

export const ONBOARDING_CTA_HEIGHT = 54;

export const ONBOARDING_CTA_MARGIN_BOTTOM = 14;

export const ONBOARDING_TRUST_MARGIN_BOTTOM = 12;

export const ONBOARDING_AGE_MARGIN_BOTTOM = 16;

export const ONBOARDING_BOTTOM_PAD = Platform.OS === 'ios' ? 34 : 28;

/** Reserved footer space so CTA never jumps when age gate appears */
export const ONBOARDING_AGE_SLOT_HEIGHT = 88;

export const ONBOARDING_FOOTER_MIN_HEIGHT =
  10 +
  14 +
  ONBOARDING_AGE_SLOT_HEIGHT +
  ONBOARDING_CTA_HEIGHT +
  14 +
  22 +
  ONBOARDING_BOTTOM_PAD;

export const ONBOARDING_ACTION_ZONE_HEIGHT =
  ONBOARDING_CTA_HEIGHT +
  ONBOARDING_CTA_MARGIN_BOTTOM +
  20 +
  ONBOARDING_TRUST_MARGIN_BOTTOM +
  18 +
  ONBOARDING_AGE_MARGIN_BOTTOM +
  22 +
  ONBOARDING_BOTTOM_PAD;

export const ONBOARDING_BRAND_ZONE_HEIGHT =
  ONBOARDING_SCREEN_HEIGHT - ONBOARDING_TOP_PAD - ONBOARDING_ACTION_ZONE_HEIGHT;
