import { Easing } from 'react-native';

/** Shared motion presets — fast, fluid, native-feeling */
export const MOTION = {
  /** Snappy spring for tabs, sheets, micro-interactions */
  springSnappy: {
    friction: 8,
    tension: 200,
    useNativeDriver: true as const,
  },
  /** Card swipe-off and dismiss */
  springSwipe: {
    friction: 9,
    tension: 260,
    useNativeDriver: true as const,
  },
  /** Gentle return-to-center after drag */
  springReset: {
    friction: 7,
    tension: 220,
    useNativeDriver: true as const,
  },
  /** Tab scene crossfade */
  tabFadeMs: 160,
  tabSlidePx: 5,
  /** Card exit swipe */
  swipeOutMs: 200,
  /** Sheet open/close — same-page expansion */
  sheetOpenMs: 360,
  sheetCloseMs: 280,
  sheetDragOpenThreshold: 68,
  springSheet: {
    friction: 14,
    tension: 88,
    useNativeDriver: true as const,
  },
  springSheetFloat: {
    friction: 15,
    tension: 82,
    useNativeDriver: true as const,
  },
  /** Progress bars */
  progressMs: 200,
  easing: {
    out: Easing.out(Easing.cubic),
    outExp: Easing.out(Easing.exp),
    inOut: Easing.inOut(Easing.cubic),
    /** Smooth deceleration — sheet reveal */
    sheetOut: Easing.bezier(0.16, 1, 0.3, 1),
    /** Gentle settle — sheet dismiss */
    sheetIn: Easing.bezier(0.4, 0, 0.68, 0.06),
  },
} as const;
