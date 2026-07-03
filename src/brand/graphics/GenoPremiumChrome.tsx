import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { COLORS, MIRROR_GRADIENTS } from '../../theme';

type Props = {
  variant?: 'linen' | 'mint' | 'forest' | 'discover';
  animated?: boolean;
};

/** Metallic gray-black backdrop with chrome gloss + soft ribbon accents */
export default function GenoPremiumChrome({ variant = 'forest' }: Props) {
  const isDark = variant === 'forest' || variant === 'discover';

  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient
        colors={MIRROR_GRADIENTS.metallicPanel}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.base}
      />
      <LinearGradient
        colors={MIRROR_GRADIENTS.metallicSweep}
        start={{ x: 0, y: 0.12 }}
        end={{ x: 1, y: 0.38 }}
        style={styles.glossSweep}
      />
      <LinearGradient
        colors={MIRROR_GRADIENTS.chromeGloss}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
        style={styles.topGloss}
      />
      {isDark ? (
        <>
          <LinearGradient
            colors={['transparent', MIRROR_GRADIENTS.redGlow[0], 'transparent']}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 0.55 }}
            style={styles.glowRed}
          />
          <LinearGradient
            colors={['transparent', MIRROR_GRADIENTS.goldGlow[0], 'transparent']}
            start={{ x: 0.75, y: 0.1 }}
            end={{ x: 0.2, y: 0.65 }}
            style={styles.glowGold}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
  },
  glossSweep: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  topGloss: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  glowRed: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  glowGold: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.32,
  },
});
