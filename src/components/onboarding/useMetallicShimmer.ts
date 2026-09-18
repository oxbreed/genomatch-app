import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const METALLIC_SHIMMER_MS = 4000;

/** Shared 4s metallic pulse + sweep driver (0 → 1 loop) */
export function useMetallicShimmer(durationMs = METALLIC_SHIMMER_MS) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: durationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: durationMs / 2,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: durationMs / 2,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [durationMs, pulse, shimmer]);

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08],
  });

  return { shimmer, pulseOpacity };
}
