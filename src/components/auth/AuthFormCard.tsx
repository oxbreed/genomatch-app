import type { ReactNode } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoGlassSurface } from '../../brand/graphics';
import { GENO_VISUAL } from '../../brand/graphics/genoVisualTokens';
import { RADIUS, SHADOWS } from '../../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  outerStyle?: StyleProp<ViewStyle>;
};

/** Frosted form panel for sign-in, register, and reset flows */
export default function AuthFormCard({ children, style, outerStyle }: Props) {
  return (
    <Animated.View style={[styles.outer, outerStyle, style]}>
      <LinearGradient
        colors={GENO_VISUAL.chrome.cardBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        <GenoGlassSurface
          variant="linen"
          borderRadius={RADIUS.xl - 1.5}
          shadow="glassElevated"
          showTopRule
          showBorder={false}
          style={styles.glass}
          contentStyle={styles.inner}
        >
          {children}
        </GenoGlassSurface>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {},
  border: {
    borderRadius: RADIUS.xl,
    padding: 1.5,
    ...SHADOWS.glassElevated,
    shadowColor: '#D4A843',
    shadowOpacity: 0.16,
  },
  glass: {
    overflow: 'hidden',
  },
  inner: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 22,
  },
});
