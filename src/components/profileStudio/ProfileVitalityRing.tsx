import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { FONT_FAMILY, COLORS } from '../../theme';

type Props = {
  percent: number;
  size?: number;
};

export default function ProfileVitalityRing({ percent, size = 76 }: Props) {
  const gradId = useRef(`vitalityGrad-${Math.random().toString(36).slice(2, 9)}`).current;
  const anim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const [strokeOffset, setStrokeOffset] = useState(0);
  const stroke = size >= 70 ? 6 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fontSize = size >= 70 ? 17 : size >= 52 ? 13 : 11;

  useEffect(() => {
    const listener = anim.addListener(({ value }) => {
      setStrokeOffset(circumference * (1 - value));
    });
    Animated.timing(anim, {
      toValue: Math.min(100, Math.max(0, percent)) / 100,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [anim, circumference, percent]);

  useEffect(() => {
    if (percent < 80) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [percent, pulse]);

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {percent >= 80 ? (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size + 12,
              height: size + 12,
              borderRadius: (size + 12) / 2,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
          pointerEvents="none"
        />
      ) : null}
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.gold} />
            <Stop offset="100%" stopColor={COLORS.verified} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(13, 40, 24, 0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.percent, { fontSize }]}>{percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: COLORS.gold,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forestDeep,
    letterSpacing: -0.5,
  },
});
