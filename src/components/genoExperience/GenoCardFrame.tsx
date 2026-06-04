import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function cornerTransform(flip?: 'tr' | 'bl' | 'br'): string | undefined {
  if (flip === 'tr') return 'scale(-1, 1)';
  if (flip === 'bl') return 'scale(1, -1)';
  if (flip === 'br') return 'scale(-1, -1)';
  return undefined;
}

function Corner({ flip }: { flip?: 'tr' | 'bl' | 'br' }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" transform={cornerTransform(flip)}>
      <Path
        d="M3 11 V3 H11 M17 3 H25 V11 M25 17 V25 H17 M11 25 H3 V17"
        stroke={COLORS.gold}
        strokeWidth={2}
        fill="none"
        strokeOpacity={0.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Premium frame for discovery cards and hero panels */
export default function GenoCardFrame({ children, style }: Props) {
  return (
    <View style={[styles.frame, style]}>
      <LinearGradient
        colors={['rgba(212, 168, 67, 0.45)', 'rgba(13, 40, 24, 0.2)', 'rgba(61, 122, 82, 0.35)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGlow}
        pointerEvents="none"
      />
      <View style={styles.inner}>{children}</View>
      <View style={styles.cTL} pointerEvents="none">
        <Corner />
      </View>
      <View style={styles.cTR} pointerEvents="none">
        <Corner flip="tr" />
      </View>
      <View style={styles.cBL} pointerEvents="none">
        <Corner flip="bl" />
      </View>
      <View style={styles.cBR} pointerEvents="none">
        <Corner flip="br" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  inner: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: COLORS.forestDeep,
    margin: 2,
  },
  cTL: { position: 'absolute', top: 10, left: 10, zIndex: 6 },
  cTR: { position: 'absolute', top: 10, right: 10, zIndex: 6 },
  cBL: { position: 'absolute', bottom: 10, left: 10, zIndex: 6 },
  cBR: { position: 'absolute', bottom: 10, right: 10, zIndex: 6 },
});
