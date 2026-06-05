import { Platform } from 'react-native';

/** Footprint of GenoTabBar — main tab content must not extend into this zone. */
export const GENO_TAB_BAR_HEIGHT = Platform.select({
  ios: 82,
  android: 68,
  default: 76,
}) as number;

/** Discover inbox header block (title + subtitle + rule). */
export const DISCOVERY_HEADER_HEIGHT = 112;

/** Pass · super-like · heart row with padding. */
export const DISCOVERY_ACTION_BAR_HEIGHT = 92;

const DISCOVERY_VERTICAL_GAP = 8;

/** Card height that fits above action bar + tab bar without overlap. */
export function getDiscoveryCardHeight(screenHeight: number): number {
  const reserved =
    DISCOVERY_HEADER_HEIGHT +
    DISCOVERY_ACTION_BAR_HEIGHT +
    GENO_TAB_BAR_HEIGHT +
    DISCOVERY_VERTICAL_GAP;
  const available = screenHeight - reserved;
  /** Original Discover used ~55% of screen height — cap by safe area above tab bar. */
  const preferred = screenHeight * 0.54;
  return Math.max(300, Math.min(preferred, available));
}

/** Extra list padding so last rows clear the tab bar comfortably. */
export const TAB_SCENE_BOTTOM_PADDING = GENO_TAB_BAR_HEIGHT + 8;
