import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoGlassSurface, GenoMirrorRimFrame } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, LOGO_GOLD, RADIUS } from '../../theme';

type Props = {
  percent: number;
  essentialsDone: number;
  essentialsTotal: number;
};

export default function StudioCompletionStrip({
  percent,
  essentialsDone,
  essentialsTotal,
}: Props) {
  return (
    <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.lg} style={styles.wrap}>
      <GenoGlassSurface
        variant="dark"
        borderRadius={RADIUS.lg - 1.5}
        showBorder={false}
        showSheen
        shadow="none"
        intensity={32}
        contentStyle={styles.inner}
      >
        <View style={styles.row}>
          <Text style={styles.label}>Profile strength</Text>
          <Text style={styles.value}>{percent}%</Text>
        </View>
        <View style={styles.track}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.35)', LOGO_GOLD]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.fill, { width: `${Math.min(100, Math.max(0, percent))}%` }]}
          />
        </View>
        <Text style={styles.hint}>
          {essentialsDone} of {essentialsTotal} essentials complete
        </Text>
      </GenoGlassSurface>
    </GenoMirrorRimFrame>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    alignSelf: 'stretch',
    width: 'auto',
  },
  inner: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  value: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: LOGO_GOLD,
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  fill: {
    height: 5,
    borderRadius: 3,
  },
  hint: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
