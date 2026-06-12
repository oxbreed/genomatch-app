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
    paddingTop: 46,
    paddingHorizontal: 12,
    paddingBottom: 4,
    zIndex: 4,
  },
  glass: {
    overflow: 'hidden',
  },
  glassInner: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  mark: {
    width: 28,
    height: 28,
    marginTop: 1,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  titleBlock: {
    flex: 1,
    gap: 0,
    minWidth: 0,
  },
  kicker: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: 8,
    letterSpacing: 2.2,
    color: COLORS.gold,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 19,
    letterSpacing: -0.35,
    color: COLORS.forestDeep,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 10,
    lineHeight: 13,
    color: COLORS.sage,
    minWidth: 0,
    flexShrink: 1,
  },
  rule: {
    height: 1,
    borderRadius: 1,
  },
});
