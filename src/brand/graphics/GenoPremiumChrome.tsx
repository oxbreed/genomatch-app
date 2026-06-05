import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../GenoSignaturePattern';
import GenoGlowField from './GenoGlowField';
import GenoHelixField from './GenoHelixField';
import GenoSparkCeremony from './GenoSparkCeremony';
import { GENO_VISUAL, type GenoChromeVariant } from './genoVisualTokens';
import { COLORS } from '../../theme';

type Props = {
  variant?: GenoChromeVariant;
  animated?: boolean;
};

/**
 * App-wide premium backdrop — helix field, glow orbs, bond mark, ceremony line.
 * Use behind Matches, Messages, Discover, Profile, Chat.
 */
export default function GenoPremiumChrome({
  variant = 'linen',
  animated = true,
}: Props) {
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.8)).current;
  const isForest = variant === 'forest';
  const isDiscover = variant === 'discover';

  useEffect(() => {
    if (!animated) return;
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: GENO_VISUAL.motion.driftMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: GENO_VISUAL.motion.driftMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: GENO_VISUAL.motion.pulseMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.72,
          duration: GENO_VISUAL.motion.pulseMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    driftLoop.start();
    pulseLoop.start();
    return () => {
      driftLoop.stop();
      pulseLoop.stop();
    };
  }, [animated, drift, pulse]);

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  const washColors =
    variant === 'mint'
      ? GENO_VISUAL.chrome.washMint
      : isDiscover
        ? GENO_VISUAL.chrome.washDiscover
        : GENO_VISUAL.chrome.washLinen;

  const helixOpacity = isForest
    ? GENO_VISUAL.helix.opacity.rich
    : isDiscover
      ? GENO_VISUAL.helix.opacity.medium
      : GENO_VISUAL.helix.opacity.subtle;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient colors={washColors} style={StyleSheet.absoluteFill} />
      <GenoGlowField variant={isForest ? 'forest' : 'linen'} />

      <Animated.View
        style={[
          isDiscover ? styles.helixLeft : styles.helixTop,
          animated && { transform: [{ translateY }] },
        ]}
      >
        <GenoHelixField
          width={isDiscover ? 300 : 340}
          height={isDiscover ? 140 : 160}
          opacity={helixOpacity}
        />
      </Animated.View>

      <View style={isDiscover ? styles.helixRight : styles.helixBottom}>
        <GenoHelixField
          width={isDiscover ? 260 : 280}
          height={isDiscover ? 120 : 130}
          opacity={helixOpacity * 0.65}
        />
      </View>

      <Animated.View style={[styles.bondMark, { opacity: pulse }]}>
        <GenoBondMark
          size={isDiscover ? GENO_VISUAL.sizes.bondMarkSm : GENO_VISUAL.sizes.bondMarkMd}
          opacity={isForest ? 0.18 : 0.12}
        />
      </Animated.View>

      <GenoSparkCeremony variant={isForest ? 'forest' : 'linen'} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: COLORS.linen,
  },
  helixTop: {
    position: 'absolute',
    top: 40,
    right: -56,
  },
  helixBottom: {
    position: 'absolute',
    bottom: 100,
    left: -48,
    transform: [{ rotate: '180deg' }],
  },
  helixLeft: {
    position: 'absolute',
    top: -8,
    left: -64,
  },
  helixRight: {
    position: 'absolute',
    top: 24,
    right: -72,
    transform: [{ rotate: '180deg' }],
  },
  bondMark: {
    position: 'absolute',
    bottom: '26%',
    right: 20,
  },
});
