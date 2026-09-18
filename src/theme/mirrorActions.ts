import type { ViewStyle } from 'react-native';
import {
  LOGO_GOLD,
  LOGO_RED,
  METALLIC_GRAPHITE,
  goldAlpha,
  redAlpha,
  silverAlpha,
} from './colors';

/** Mirror-gloss circular actions — consistent rim / fill / icon pairing */
export type MirrorActionKind = 'steel' | 'gold' | 'red' | 'unmatch';

export type MirrorIconTone = 'steel' | 'gold' | 'chrome';

export const MIRROR_ACTION = {
  /** Pass, dismiss, inactive — gray mirror */
  steel: {
    rim: [silverAlpha(0.48), silverAlpha(0.14), silverAlpha(0.34)] as const,
    fill: 'steel' as const,
    icon: 'chrome' as const,
    shadowColor: METALLIC_GRAPHITE,
    shadowOpacity: 0.34,
    shadowRadius: 12,
  },
  /** Super like, chat, social highlight — gold mirror */
  gold: {
    rim: [goldAlpha(0.72), LOGO_GOLD, goldAlpha(0.42)] as const,
    fill: 'gold' as const,
    icon: 'chrome' as const,
    shadowColor: LOGO_GOLD,
    shadowOpacity: 0.38,
    shadowRadius: 14,
  },
  /** Primary like / love — red mirror + bright icon */
  red: {
    rim: [goldAlpha(0.52), LOGO_RED, redAlpha(0.62)] as const,
    fill: 'red' as const,
    icon: 'chrome' as const,
    shadowColor: LOGO_RED,
    shadowOpacity: 0.42,
    shadowRadius: 16,
  },
  /** Unmatch — steel tray, gold heart, steel strike */
  unmatch: {
    rim: [silverAlpha(0.44), silverAlpha(0.12), silverAlpha(0.3)] as const,
    fill: 'steel' as const,
    icon: 'steel' as const,
    shadowColor: METALLIC_GRAPHITE,
    shadowOpacity: 0.32,
    shadowRadius: 10,
  },
} as const satisfies Record<
  MirrorActionKind,
  {
    rim: readonly [string, string, string];
    fill: 'steel' | 'gold' | 'red';
    icon: MirrorIconTone;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
  }
>;

export function mirrorActionShadow(kind: MirrorActionKind): ViewStyle {
  const spec = MIRROR_ACTION[kind];
  return {
    shadowColor: spec.shadowColor,
    shadowOpacity: spec.shadowOpacity,
    shadowRadius: spec.shadowRadius,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  };
}
