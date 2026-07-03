import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GenoCardFrame } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, LOGO_GOLD, TYPOGRAPHY } from '../../theme';
import { premiumSectionTitle } from './discoverPremium';

type Props = {
  title: string;
  children: ReactNode;
  accent?: boolean;
  /** Serif title for harmony / brand moments */
  serif?: boolean;
};

export default function DiscoverPremiumSection({ title, children, accent, serif }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={serif ? premiumSectionTitle.serif : styles.kicker}>{title}</Text>
      <GenoCardFrame mirror showWatermark={false} style={styles.cardFrame}>
        <View style={[styles.panel, accent && styles.panelAccent]}>{children}</View>
      </GenoCardFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  kicker: {
    ...TYPOGRAPHY.sectionLabel,
    fontFamily: FONT_FAMILY.marketingExtrabold,
    color: LOGO_GOLD,
    letterSpacing: 1.6,
  },
  cardFrame: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  panel: {
    padding: 18,
    gap: 4,
  },
  panelAccent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.28)',
  },
});
