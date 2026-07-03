import type { ReactNode } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoGlassSurface } from '../../brand/graphics';
import { GENO_VISUAL } from '../../brand/graphics/genoVisualTokens';
import { COLORS, MIRROR_ACTION, RADIUS, SHADOWS, LOGO_GOLD, mirrorActionShadow } from '../../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  outerStyle?: StyleProp<ViewStyle>;
  /** Stronger chrome rim + dark mirror glass (sign-in welcome) */
  mirror?: boolean;
};

/** Frosted form panel for sign-in, register, and reset flows */
export default function AuthFormCard({ children, style, outerStyle, mirror = false }: Props) {
  if (mirror) {
    const rim = MIRROR_ACTION.gold.rim;
    return (
      <Animated.View style={[styles.outer, outerStyle, style]}>
        <LinearGradient
          colors={[...rim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.mirrorBorder, mirrorActionShadow('gold')]}
        >
          <GenoGlassSurface
            variant="dark"
            borderRadius={RADIUS.xl - 1.5}
            shadow="none"
            showTopRule
            showSheen
            showBorder={false}
            intensity={40}
            style={styles.glass}
            contentStyle={styles.inner}
          >
            {children}
          </GenoGlassSurface>
        </LinearGradient>
      </Animated.View>
    );
  }

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
          showTopRule={false}
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
    shadowColor: LOGO_GOLD,
    shadowOpacity: 0.12,
  },
  mirrorBorder: {
    borderRadius: RADIUS.xl,
    padding: 1.5,
    ...SHADOWS.glassElevated,
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
