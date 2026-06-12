import { Platform } from 'react-native';

/** Gap between tab pill and screen bottom (home indicator zone). */
export const GENO_TAB_BAR_BOTTOM_MARGIN = Platform.select({
  ios: 10,
  android: 8,
  default: 10,
}) as number;

/** Visual height of the floating tab pill itself. */
export const GENO_TAB_BAR_PILL_HEIGHT = Platform.select({
  ios: 52,
  android: 46,
  default: 50,
}) as number;

/** Footprint of GenoTabBar — pill + bottom margin; main content must clear this zone. */
export const GENO_TAB_BAR_HEIGHT =
  GENO_TAB_BAR_PILL_HEIGHT + GENO_TAB_BAR_BOTTOM_MARGIN;

/**
 * GenoInboxHeader block on Discover — keep in sync with `GenoInboxHeader` wrap styles.
 * Inlined to avoid importing inbox tokens (circular dependency with theme).
 */
const DISCOVERY_HEADER_ROW_HEIGHT = Math.max(36 + 6, 10 + 2 + 26 + 1 + 18);

export const DISCOVERY_HEADER_HEIGHT =
  56 + DISCOVERY_HEADER_ROW_HEIGHT + 14 + 1 + 14;

/** Visible gap between card bottom edge and tab bar top. */
export const DISCOVERY_CARD_TAB_GAP = 10;

/** Bottom inset for the discover deck (tab bar + breathing room). */
export const DISCOVERY_DECK_BOTTOM_INSET =
  GENO_TAB_BAR_HEIGHT + DISCOVERY_CARD_TAB_GAP;

/** Floating glass action dock band height. */
export const DISCOVERY_CARD_ACTIONS_OVERLAY = 72;

/** Action dock inset from the card bottom edge. */
export const DISCOVERY_CARD_ACTIONS_LIFT = 14;

/** Glass swipe-up hint sits above the action dock. */
export const DISCOVERY_CARD_HINT_BOTTOM =
  DISCOVERY_CARD_ACTIONS_LIFT + DISCOVERY_CARD_ACTIONS_OVERLAY + 8;

/** Name / meta block above hint + actions. */
export const DISCOVERY_CARD_FOOTER_BOTTOM = DISCOVERY_CARD_HINT_BOTTOM + 36;

/** Visible gap between stacked cards at rest. */
export const DISCOVERY_STACK_PEEK = 6;

/** Corner radius for discover swipe cards. */
export const DISCOVERY_CARD_RADIUS = 26;

/** Minimal gap under header before card starts. */
const DISCOVERY_HEADER_GAP = 4;

/** Card fills from Discover header down to just above the tab bar. */
export function getDiscoveryCardHeight(screenHeight: number): number {
  const reserved =
    DISCOVERY_HEADER_HEIGHT +
    DISCOVERY_HEADER_GAP +
    DISCOVERY_DECK_BOTTOM_INSET;
  return Math.max(380, screenHeight - reserved);
}

/** @deprecated Actions overlay the card; kept for layout imports. */
export const DISCOVERY_CARD_ACTIONS_HEIGHT = DISCOVERY_CARD_ACTIONS_OVERLAY;
export const DISCOVERY_ACTIONS_ROW_HEIGHT = DISCOVERY_CARD_ACTIONS_OVERLAY;
export const DISCOVERY_TAB_BAR_INSET = GENO_TAB_BAR_HEIGHT + 2;

/** Extra list padding so last rows clear the tab bar comfortably. */
export const TAB_SCENE_BOTTOM_PADDING = GENO_TAB_BAR_HEIGHT + 8;
