import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoHelixField } from '../../brand/graphics';
import { COLORS } from '../../theme';

type Props = {
  percent: number;
  fillWidth: Animated.AnimatedInterpolation<string | number>;
  hint: string;
};

export default function ProfileBondMeter({ percent, fillWidth, hint }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pattern} pointerEvents="none">
        <GenoHelixField width={120} height={48} opacity={0.12} />
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Bond profile strength</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fillWrap, { width: fillWidth }]}>
          <LinearGradient
            colors={[COLORS.gold, COLORS.verified, COLORS.forest]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  pattern: {
    position: 'absolute',
    right: -20,
    top: -8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  percent: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: COLORS.gold,
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(143, 175, 149, 0.25)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  fillWrap: {
    height: 10,
  },
  fill: {
    flex: 1,
    height: 10,
    borderRadius: 999,
  },
  hint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: COLORS.sage,
  },
});
