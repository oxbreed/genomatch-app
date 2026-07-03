import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from '../../theme';

/** Transparent liquid-glass typography — letters only, no pill or bar */
export const discoverGlassType = StyleSheet.create({
  percent: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    letterSpacing: -0.3,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(10, 10, 10, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  hint: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: 'rgba(255, 255, 255, 0.88)',
    textShadowColor: 'rgba(10, 10, 10, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
});

export const DISCOVER_GLASS_ICON = 'rgba(255, 255, 255, 0.85)' as const;
