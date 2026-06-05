import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../theme';

type Props = {
  active?: boolean;
  verified?: boolean;
};

export default function ProfileBondAura({ active, verified }: Props) {
  const driftA = useRef(new Animated.Value(0)).current;
  const driftB = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(driftA, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(driftA, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(driftB, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(driftB, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: active ? 14000 : 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loopA.start();
    loopB.start();
    spinLoop.start();
    return () => {
      loopA.stop();
      loopB.stop();
      spinLoop.stop();
    };
  }, [active, driftA, driftB, spin]);

  const orbAY = driftA.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const orbBX = driftB.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.orbA, { transform: [{ translateY: orbAY }] }]}>
        <LinearGradient
          colors={
            verified
              ? ['rgba(61, 122, 82, 0.32)', 'rgba(212, 168, 67, 0.12)']
              : ['rgba(212, 168, 67, 0.26)', 'rgba(61, 122, 82, 0.1)']
          }
          style={styles.orbFill}
        />
      </Animated.View>
      <Animated.View style={[styles.orbB, { transform: [{ translateX: orbBX }] }]}>
        <LinearGradient
          colors={['rgba(13, 40, 24, 0.06)', 'rgba(212, 168, 67, 0.18)']}
          style={styles.orbFill}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.orbit,
          active && styles.orbitStudio,
          { transform: [{ rotate }] },
        ]}
      >
        <Svg width={100} height={100} viewBox="0 0 100 100">
          <Circle
            cx={50}
            cy={50}
            r={44}
            stroke={COLORS.gold}
            strokeWidth={1}
            strokeOpacity={active ? 0.4 : 0.2}
            strokeDasharray="6 10"
            fill="none"
          />
          <Circle cx={50} cy={6} r={4} fill={COLORS.gold} fillOpacity={active ? 0.95 : 0.5} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orbA: {
    position: 'absolute',
    top: 48,
    right: -36,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  orbB: {
    position: 'absolute',
    bottom: 140,
    left: -44,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  orbFill: {
    flex: 1,
    borderRadius: 999,
  },
  orbit: {
    position: 'absolute',
    top: 120,
    right: 28,
    width: 100,
    height: 100,
    opacity: 0.55,
  },
  orbitStudio: {
    opacity: 1,
  },
});
