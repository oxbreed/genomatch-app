import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../theme';

type Props = {
  doneCount: number;
  totalCount: number;
  opacity?: Animated.Value;
};

function SparkGlyph() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Path
        d="M14 2 L16 12 L26 14 L16 16 L14 26 L12 16 L2 14 L12 12 Z"
        fill={COLORS.gold}
        fillOpacity={0.85}
      />
    </Svg>
  );
}

export default function StudioBanner({ doneCount, totalCount, opacity }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    shimmerLoop.start();
    spinLoop.start();
    return () => {
      shimmerLoop.stop();
      spinLoop.stop();
    };
  }, [shimmer, spin]);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const content = (
    <LinearGradient
      colors={['#1A3D28', '#0D2818', '#142E22']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.pattern} pointerEvents="none">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.patternDot, { left: 24 + i * 52, top: 12 + (i % 2) * 28 }]}
          />
        ))}
      </View>
      <Animated.View style={[styles.iconOrbit, { transform: [{ rotate }] }]}>
        <View style={styles.iconRing} />
      </Animated.View>
      <View style={styles.iconCore}>
        <Animated.View style={{ opacity: shimmerOpacity }}>
          <SparkGlyph />
        </Animated.View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.kicker}>GENOMATCH STUDIO</Text>
        <Text style={styles.title}>Craft your presence</Text>
        <Text style={styles.sub}>
          Private until you publish · {doneCount}/{totalCount} essentials glowing
        </Text>
        <View style={styles.dots}>
          {Array.from({ length: totalCount }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < doneCount && styles.dotLit]}
            />
          ))}
        </View>
      </View>
      <Ionicons
        name="chevron-down-outline"
        size={18}
        color="rgba(245, 239, 230, 0.45)"
        style={styles.chevron}
      />
    </LinearGradient>
  );

  if (opacity) {
    return <Animated.View style={{ opacity, marginHorizontal: 16, marginTop: 12 }}>{content}</Animated.View>;
  }

  return <View style={styles.wrap}>{content}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
  },
  patternDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
  },
  iconOrbit: {
    position: 'absolute',
    left: 14,
    top: 14,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.4)',
    borderStyle: 'dashed',
  },
  iconCore: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    marginLeft: 48,
    gap: 4,
  },
  kicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 2.2,
    color: COLORS.gold,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 20,
    color: COLORS.linen,
    letterSpacing: -0.3,
  },
  sub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(245, 239, 230, 0.72)',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 239, 230, 0.2)',
  },
  dotLit: {
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  chevron: {
    position: 'absolute',
    right: 14,
    bottom: 12,
  },
});
