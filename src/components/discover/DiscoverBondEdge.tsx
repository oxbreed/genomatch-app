import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

type Props = {
  percent: number;
};

/** GenoMatch signature — vertical bond strength strip on the card edge */
export default function DiscoverBondEdge({ percent }: Props) {
  const clamped = Math.min(100, Math.max(0, percent));
  const high = clamped >= 80;
  const mid = clamped >= 60;

  const fillColors: [string, string] = high
    ? [COLORS.gold, '#C49A3A']
    : mid
      ? [COLORS.sage, '#5E9470']
      : ['rgba(245, 239, 230, 0.85)', 'rgba(245, 239, 230, 0.45)'];

  return (
    <View style={styles.track} pointerEvents="none">
      <LinearGradient
        colors={fillColors}
        style={[styles.fill, { height: `${clamped}%` }]}
      />
      <View style={styles.glow} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    zIndex: 9,
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
