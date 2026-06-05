import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

function getMatchLabel(percent: number): string {
  if (percent >= 80) return 'Great bond';
  if (percent >= 60) return 'Good bond';
  return 'Compatible';
}

type Props = {
  percent: number;
};

export default function DiscoverMatchPill({ percent }: Props) {
  const high = percent >= 75;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient
        colors={
          high
            ? ['rgba(212, 168, 67, 0.95)', 'rgba(196, 154, 58, 0.9)']
            : ['rgba(61, 122, 82, 0.9)', 'rgba(45, 95, 65, 0.9)']
        }
        style={styles.pill}
      >
        <Text style={styles.percent}>{percent}%</Text>
      </LinearGradient>
      <Text style={styles.label}>{getMatchLabel(percent)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 8,
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  percent: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 15,
    color: COLORS.forestDeep,
    letterSpacing: -0.2,
  },
  label: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 0.6,
    color: COLORS.linen,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
