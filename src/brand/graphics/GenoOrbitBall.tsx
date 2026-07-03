import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LOGO_GOLD, LOGO_GOLD_DEEP, MIRROR_GRADIENTS, COLORS } from '../../theme';

type Variant = 'red' | 'gold';

type Props = {
  size: number;
  variant: Variant;
  style?: StyleProp<ViewStyle>;
};

/** Glossy red or gold orb — matches onboarding logo orbit balls */
export function GenoOrbitBall({ size, variant, style }: Props) {
  const colors =
    variant === 'red'
      ? MIRROR_GRADIENTS.cta
      : ([LOGO_GOLD, LOGO_GOLD_DEEP] as const);

  return (
    <View style={[styles.shell, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <LinearGradient
        colors={[...colors]}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.85, y: 0.95 }}
        style={[styles.fill, { borderRadius: size / 2 }]}
      />
      {variant === 'red' ? (
        <LinearGradient
          colors={[...MIRROR_GRADIENTS.ctaStreak]}
          start={{ x: 0, y: 0.35 }}
          end={{ x: 1, y: 0.65 }}
          style={[styles.gloss, { borderRadius: size / 2 }]}
          pointerEvents="none"
        />
      ) : null}
      <View
        style={[
          styles.shine,
          {
            width: size * 0.38,
            height: size * 0.28,
            borderRadius: size / 2,
            top: size * 0.14,
            left: size * 0.18,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  gloss: {
    position: 'absolute',
    top: '6%',
    left: '4%',
    right: '4%',
    height: '52%',
    opacity: 0.82,
  },
  shine: {
    position: 'absolute',
    backgroundColor: COLORS.chipSolid,
  },
});
