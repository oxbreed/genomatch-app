import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from '../../theme/typography';

/** Instagram-style discover card tokens (2024–25 suggested-profiles aesthetic). */
export const DISCOVER_IG = {
  cardRadius: 20,
  photoBarHeight: 3,
  photoBarGap: 4,
  photoBarTop: 10,
  photoBarInset: 10,
  stampLike: '#00D632',
  stampNope: '#FF3040',
  heartRed: '#FF3040',
  scrim: ['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.82)'] as const,
  scrimLocations: [0, 0.45, 0.78, 1] as const,
  actionBtnSize: 56,
  actionLikeSize: 64,
  actionGap: 28,
} as const;

export const discoverIgType = StyleSheet.create({
  name: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 26,
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  meta: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.88)',
  },
  compat: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.72)',
  },
});
