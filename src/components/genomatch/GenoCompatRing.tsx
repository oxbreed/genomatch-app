import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondHalo } from '../../brand/graphics';
import { FONT_FAMILY, COLORS } from '../../theme';

type Props = {
  percent: number;
  size?: number;
};

/** GenoMatch-only animated compatibility ring */
export default function GenoCompatRing({ percent, size = 88 }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;

  const high = percent >= 80;
  const accent = high ? COLORS.gold : COLORS.sage;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.06,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breathe, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const inner = size - 16;

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width: size, height: size, transform: [{ scale: breathe }] },
      ]}
    >
      <GenoBondHalo size={size + 8} opacity={0.55} />
      <Animated.View
        style={[
          styles.orbit,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ rotate }],
          },
        ]}
      >
        <LinearGradient
          colors={[accent, 'transparent', accent, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.orbitGradient, { borderRadius: size / 2 }]}
        />
      </Animated.View>
      <View
        style={[
          styles.inner,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            borderColor: `${accent}55`,
          },
        ]}
      >
        <Text style={[styles.percent, { color: accent }]}>{percent}%</Text>
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
  orbit: {
    position: 'absolute',
    padding: 3,
  },
  orbitGradient: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inner: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  percent: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.sage,
    marginTop: 1,
  },
});
