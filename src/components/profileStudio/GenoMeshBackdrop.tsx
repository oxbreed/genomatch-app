import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../../theme';

type Props = {
  /** Stronger motion & contrast in studio (edit) mode */
  studio?: boolean;
};

const ORB_A = ['rgba(212, 168, 67, 0.22)', 'rgba(212, 168, 67, 0)'] as const;
const ORB_B = ['rgba(61, 122, 82, 0.2)', 'rgba(61, 122, 82, 0)'] as const;
const ORB_C = ['rgba(26, 61, 40, 0.14)', 'rgba(26, 61, 40, 0)'] as const;

function HelixDecor({ opacity }: { opacity: number }) {
  return (
    <Svg
      width="100%"
      height={140}
      viewBox="0 0 400 140"
      style={[styles.helix, { opacity }]}
      pointerEvents="none"
    >
      <Path
        d="M20 70 C60 20, 100 120, 140 70 S220 20, 260 70 S340 120, 380 70"
        stroke={COLORS.gold}
        strokeWidth={1.2}
        fill="none"
        strokeOpacity={0.35}
      />
      <Path
        d="M20 70 C60 120, 100 20, 140 70 S220 120, 260 70 S340 20, 380 70"
        stroke={COLORS.forest}
        strokeWidth={1.2}
        fill="none"
        strokeOpacity={0.25}
      />
      {[40, 100, 160, 220, 280, 340].map((cx, i) => (
        <Circle
          key={cx}
          cx={cx}
          cy={i % 2 === 0 ? 48 : 92}
          r={3}
          fill={i % 2 === 0 ? COLORS.gold : COLORS.verified}
          fillOpacity={0.5}
        />
      ))}
    </Svg>
  );
}

export default function GenoMeshBackdrop({ studio = false }: Props) {
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: studio ? 14000 : 20000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: studio ? 2400 : 3600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: studio ? 2400 : 3600,
          easing: Easing.inOut(Easing.quad),
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
  }, [drift, pulse, studio]);

  const orb1X = drift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-24, 18, -24],
  });
  const orb2Y = drift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [12, -20, 12],
  });
  const meshOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [studio ? 0.55 : 0.35, studio ? 0.85 : 0.5],
  });

  return (
    <View style={styles.root} pointerEvents="none">
      <Animated.View style={[styles.meshFade, { opacity: meshOpacity }]}>
        <Animated.View style={[styles.orb, styles.orbTopRight, { transform: [{ translateX: orb1X }] }]}>
          <LinearGradient colors={ORB_A} style={styles.orbGradient} />
        </Animated.View>
        <Animated.View style={[styles.orb, styles.orbMidLeft, { transform: [{ translateY: orb2Y }] }]}>
          <LinearGradient colors={ORB_B} style={styles.orbGradientLg} />
        </Animated.View>
        <View style={[styles.orb, styles.orbLowRight]}>
          <LinearGradient colors={ORB_C} style={styles.orbGradientSm} />
        </View>
        <HelixDecor opacity={studio ? 0.9 : 0.55} />
      </Animated.View>
      <View style={[styles.vignette, studio && styles.vignetteStudio]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  meshFade: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
  orbTopRight: {
    top: 72,
    right: -40,
  },
  orbMidLeft: {
    top: 280,
    left: -60,
  },
  orbLowRight: {
    bottom: 120,
    right: -20,
  },
  orbGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  orbGradientLg: {
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  orbGradientSm: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  helix: {
    position: 'absolute',
    top: 420,
    left: 0,
    right: 0,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  vignetteStudio: {
    backgroundColor: 'rgba(245, 239, 230, 0.08)',
  },
});
