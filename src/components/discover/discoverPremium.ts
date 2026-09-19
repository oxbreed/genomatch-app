import { StyleSheet, type ViewStyle } from 'react-native';
import {
  COLORS,
  CREAM,
  LOGO_GOLD,
  LOGO_RED,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  goldAlpha,
  redAlpha,
  silverAlpha,
} from '../../theme';

/** Premium discover / match profile — metallic gloss surfaces */
export const DISCOVER_PREMIUM = {
  cardBg: COLORS.surface,
  cardBorder: silverAlpha(0.22),
  cardAccent: silverAlpha(0.35),
  sectionKicker: LOGO_RED,
  chipBg: silverAlpha(0.08),
  chipBorder: silverAlpha(0.2),
  chipSelectedBg: redAlpha(0.12),
  chipSelectedBorder: LOGO_GOLD,
  detailIconBg: silverAlpha(0.1),
  detailIconBorder: silverAlpha(0.22),
  harmonyGlow: goldAlpha(0.3),
  bodyText: COLORS.text,
  mutedText: COLORS.textMuted,
} as const;

export const premiumCard: ViewStyle = {
  backgroundColor: DISCOVER_PREMIUM.cardBg,
  borderRadius: RADIUS.xl,
  borderWidth: 1,
  borderColor: DISCOVER_PREMIUM.cardBorder,
  ...SHADOWS.cardElevated,
  shadowColor: COLORS.metallicGraphite,
  shadowOpacity: 0.3,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 8 },
};

export const premiumSectionTitle = StyleSheet.create({
  kicker: {
    ...TYPOGRAPHY.sectionLabel,
    color: LOGO_GOLD,
  },
  serif: {
    ...TYPOGRAPHY.serifTitle,
    color: CREAM,
    textAlign: 'left',
  },
});
