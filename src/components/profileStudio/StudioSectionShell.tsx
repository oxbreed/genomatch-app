import { useEffect, useRef } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../theme';

type Props = {
  active: boolean;
  children: React.ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
};

function cornerTransform(flip?: 'tr' | 'bl' | 'br'): string | undefined {
  if (flip === 'tr') return 'scale(-1, 1)';
  if (flip === 'bl') return 'scale(1, -1)';
  if (flip === 'br') return 'scale(-1, -1)';
  return undefined;
}

function CornerBracket({ flip }: { flip?: 'tr' | 'bl' | 'br' }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" transform={cornerTransform(flip)}>
      <Path
        d="M2 8 V2 H8 M14 2 H20 V8 M20 14 V20 H14 M8 20 H2 V14"
        stroke={COLORS.gold}
        strokeWidth={1.5}
        fill="none"
        strokeOpacity={0.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function StudioSectionShell({ active, children, onLayout, style }: Props) {
  const pulse = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(pulse, {
      toValue: active ? 1 : 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [active, pulse]);

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const innerOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.78, 1],
  });

  return (
    <View onLayout={onLayout} style={[styles.outer, style]}>
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(212, 168, 67, 0.35)', 'transparent', 'rgba(61, 122, 82, 0.2)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <View style={[styles.card, active && styles.cardActive]}>
        <View style={styles.cornerTL} pointerEvents="none">
          <CornerBracket />
        </View>
        <View style={styles.cornerTR} pointerEvents="none">
          <CornerBracket flip="tr" />
        </View>
        <View style={styles.cornerBL} pointerEvents="none">
          <CornerBracket flip="bl" />
        </View>
        <View style={styles.cornerBR} pointerEvents="none">
          <CornerBracket flip="br" />
        </View>
        <Animated.View style={[styles.inner, { opacity: innerOpacity }]}>{children}</Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 16,
    marginTop: 12,
    position: 'relative',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    margin: -4,
  },
  card: {
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: 'rgba(13, 40, 24, 0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  cardActive: {
    borderColor: 'rgba(212, 168, 67, 0.55)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  inner: {
    padding: 16,
  },
  cornerTL: { position: 'absolute', top: 8, left: 8, zIndex: 2 },
  cornerTR: { position: 'absolute', top: 8, right: 8, zIndex: 2 },
  cornerBL: { position: 'absolute', bottom: 8, left: 8, zIndex: 2 },
  cornerBR: { position: 'absolute', bottom: 8, right: 8, zIndex: 2 },
});
