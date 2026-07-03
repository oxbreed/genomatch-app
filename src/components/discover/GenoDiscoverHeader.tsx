import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GenoGlassSurface,
  GenoLogoCeremony,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import { FONT_FAMILY, COLORS, LOGO_GOLD, RADIUS, TYPOGRAPHY, chromeAlpha, goldAlpha } from '../../theme';

type Props = {
  subtitle: string;
  right?: ReactNode;
};

/** Compact mirror-gloss Discover chrome — frees vertical space for the swipe card. */
export default function GenoDiscoverHeader({ subtitle, right }: Props) {
  return (
    <View style={styles.wrap}>
      <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.xl} style={styles.glassRim}>
        <GenoGlassSurface
          variant="dark"
          borderRadius={RADIUS.xl - 1.5}
          shadow="glassFloat"
          showTopRule
          showSheen
          intensity={58}
          style={styles.glass}
          contentStyle={styles.glassInner}
        >
          <View style={styles.row}>
            <GenoMirrorRimFrame kind="gold" borderRadius={20} padding={1.5} style={styles.markRim}>
              <GenoMirrorSteelFill style={styles.markWrap}>
                <GenoLogoCeremony variant="mark" tone="dark" />
              </GenoMirrorSteelFill>
            </GenoMirrorRimFrame>
            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <View style={styles.titleBlock}>
                  <Text style={styles.kicker}>GENOMATCH</Text>
                  <Text style={styles.title}>Discover</Text>
                </View>
                {right}
              </View>
              <Text style={styles.subtitle} numberOfLines={3}>
                {subtitle}
              </Text>
            </View>
          </View>
          <LinearGradient
            colors={['transparent', chromeAlpha(0.35), LOGO_GOLD, goldAlpha(0.35), 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.rule}
            pointerEvents="none"
          />
        </GenoGlassSurface>
      </GenoMirrorRimFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 46,
    paddingHorizontal: 12,
    paddingBottom: 0,
    zIndex: 4,
  },
  glassRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  glass: {
    overflow: 'hidden',
  },
  glassInner: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 5,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  markRim: {
    marginTop: 1,
  },
  markWrap: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
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
    ...TYPOGRAPHY.marketingKicker,
    fontSize: 10,
    letterSpacing: 2,
    color: LOGO_GOLD,
  },
  title: {
    ...TYPOGRAPHY.headingSm,
    fontSize: 20,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    minWidth: 0,
    flexShrink: 1,
  },
  rule: {
    height: 1,
    borderRadius: 1,
  },
});
