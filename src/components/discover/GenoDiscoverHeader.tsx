import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoGlassSurface, GenoLogoCeremony } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  subtitle: string;
  right?: ReactNode;
};

/** Compact liquid-glass Discover chrome — frees vertical space for the swipe card. */
export default function GenoDiscoverHeader({ subtitle, right }: Props) {
  return (
    <View style={styles.wrap}>
      <GenoGlassSurface
        variant="light"
        borderRadius={RADIUS.xl}
        shadow="glassFloat"
        showTopRule
        showSheen
        intensity={60}
        style={styles.glass}
        contentStyle={styles.glassInner}
      >
        <View style={styles.row}>
          <GenoLogoCeremony variant="mark" tone="dark" style={styles.mark} />
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <View style={styles.titleBlock}>
                <Text style={styles.kicker}>GENOMATCH</Text>
                <Text style={styles.title}>Discover</Text>
              </View>
              {right}
            </View>
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          </View>
        </View>
        <LinearGradient
          colors={['transparent', COLORS.gold, 'rgba(61, 122, 82, 0.35)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.rule}
          pointerEvents="none"
        />
      </GenoGlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 50,
    paddingHorizontal: 12,
    paddingBottom: 4,
    zIndex: 4,
  },
  glass: {
    overflow: 'hidden',
  },
  glassInner: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  mark: {
    width: 34,
    height: 34,
    marginTop: 2,
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleBlock: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  kicker: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: 9,
    letterSpacing: 2.4,
    color: COLORS.gold,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 22,
    letterSpacing: -0.35,
    color: COLORS.forestDeep,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.sage,
  },
  rule: {
    height: 1,
    borderRadius: 1,
    marginTop: 2,
  },
});
