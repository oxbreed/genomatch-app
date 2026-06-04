import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../theme';

type Props = {
  percent: number;
  size?: number;
};

export default function ProfileVitalityRing({ percent, size = 76 }: Props) {
  const gradId = useRef(`vitalityGrad-${Math.random().toString(36).slice(2, 9)}`).current;
  const anim = useRef(new Animated.Value(0)).current;
  const [strokeOffset, setStrokeOffset] = useState(0);
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

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

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
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
        <Text style={styles.percent}>{percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 17,
    color: COLORS.forestDeep,
    letterSpacing: -0.5,
  },
});
