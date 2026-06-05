import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { COLORS } from '../../theme';

type Props = {
  variant?: 'linen' | 'forest';
};

/** Soft brand orbs — gold + verified sage, slow breathe */
export default function GenoGlowField({ variant = 'linen' }: Props) {
  const breathe = useRef(new Animated.Value(0)).current;
  const isForest = variant === 'forest';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  const goldScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const sageOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [isForest ? 0.1 : 0.06, isForest ? 0.16 : 0.1],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.orbGold,
          {
            opacity: isForest ? 0.14 : 0.09,
            transform: [{ scale: goldScale }],
          },
        ]}
      />
      <Animated.View style={[styles.orbSage, { opacity: sageOpacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orbGold: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -70,
    right: -90,
    backgroundColor: COLORS.gold,
  },
  orbSage: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: 80,
    left: -130,
    backgroundColor: COLORS.verified,
  },
});
