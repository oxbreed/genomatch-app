import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../theme';
import { GENO_VISUAL } from './genoVisualTokens';

type Props = {
  size: number;
  opacity?: number;
  animated?: boolean;
};

/** Rotating bond-node halo — frames avatars, empty states, compat rings */
export default function GenoBondHalo({ size, opacity = 1, animated = true }: Props) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: GENO_VISUAL.motion.haloMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [animated, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const r = size / 2 - 2;
  const cx = size / 2;
  const nodes = 8;

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width: size, height: size, opacity },
        animated && { transform: [{ rotate }] },
      ]}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={COLORS.gold}
          strokeWidth={1}
          strokeOpacity={0.35}
          fill="none"
          strokeDasharray="8 12"
        />
        {Array.from({ length: nodes }).map((_, i) => {
          const angle = (i / nodes) * Math.PI * 2 - Math.PI / 2;
          const nx = cx + r * Math.cos(angle);
          const ny = cx + r * Math.sin(angle);
          return (
            <Circle
              key={i}
              cx={nx}
              cy={ny}
              r={i % 2 === 0 ? 3.5 : 2.5}
              fill={i % 2 === 0 ? COLORS.gold : COLORS.verified}
              fillOpacity={0.65}
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
