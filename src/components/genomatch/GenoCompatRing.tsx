import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoOrbitBall } from '../../brand/graphics';
import { ORBIT_ROTATION_MS } from '../../lib/orbitAnimation';
import {
  COLORS,
  LOGO_RED,
  LOGO_GOLD,
  MIRROR_RED_TEXT,
  TYPOGRAPHY,
  redAlpha,
  goldAlpha,
} from '../../theme';
import { DISCOVER_PREMIUM } from '../discover/discoverPremium';

type Props = {
  percent: number;
  size?: number;
  /** Show outer gold glow halo */
  glow?: boolean;
};

/** Genetic Harmony Score — premium orbit ring with red-gold glow */
export default function GenoCompatRing({ percent, size = 88, glow = true }: Props) {
  const orbit = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;

  const orbitDiameter = Math.round(size * 1.02);
  const ballSize = Math.max(10, Math.round(size * 0.12));
  const inner = Math.round(size - ballSize * 2 - 8);
  const glowSize = Math.round(size * 1.28);

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: ORBIT_ROTATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.04,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    spin.start();
    pulse.start();
    return () => {
      spin.stop();
      pulse.stop();
    };
  }, [breathe, orbit]);

  const rotate = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width: size, height: size, transform: [{ scale: breathe }] },
      ]}
    >
      {glow ? (
        <View
          style={[
            styles.glowHalo,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              marginLeft: -(glowSize - size) / 2,
              marginTop: -(glowSize - size) / 2,
            },
          ]}
          pointerEvents="none"
        />
      ) : null}

      <Animated.View
        style={[
          styles.orbitRing,
          {
            width: orbitDiameter,
            height: orbitDiameter,
            borderRadius: orbitDiameter / 2,
            transform: [{ rotate }],
          },
        ]}
        pointerEvents="none"
      >
        <GenoOrbitBall
          variant="red"
          size={ballSize}
          style={{ top: -ballSize / 2, left: '50%', marginLeft: -ballSize / 2 }}
        />
        <GenoOrbitBall
          variant="gold"
          size={ballSize}
          style={{ bottom: -ballSize / 2, left: '50%', marginLeft: -ballSize / 2 }}
        />
      </Animated.View>

      <LinearGradient
        colors={[goldAlpha(0.35), redAlpha(0.2), goldAlpha(0.3)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.ringGradient,
          {
            width: inner + 6,
            height: inner + 6,
            borderRadius: (inner + 6) / 2,
          },
        ]}
        pointerEvents="none"
      />

      <View
        style={[
          styles.inner,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
          },
        ]}
      >
        <Text style={[styles.percent, MIRROR_RED_TEXT]}>{percent}%</Text>
        <Text style={styles.label}>Match</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowHalo: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    backgroundColor: DISCOVER_PREMIUM.harmonyGlow,
    shadowColor: LOGO_GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 8,
  },
  orbitRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: redAlpha(0.18),
    borderStyle: 'dashed',
  },
  ringGradient: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    borderColor: goldAlpha(0.45),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: LOGO_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  percent: {
    ...TYPOGRAPHY.displayName,
    fontSize: 24,
    ...MIRROR_RED_TEXT,
  },
  label: {
    ...TYPOGRAPHY.sectionLabel,
    fontSize: 10,
    letterSpacing: 1.3,
    color: LOGO_GOLD,
    marginTop: 2,
  },
});
