import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GENO_VISUAL } from './genoVisualTokens';
import { GLASS, RADIUS, SHADOWS } from '../../theme';

export type GenoGlassVariant = 'light' | 'dark' | 'linen' | 'sheet' | 'tabBar';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: GenoGlassVariant;
  intensity?: number;
  borderRadius?: number;
  showSheen?: boolean;
  showTopRule?: boolean;
  showBorder?: boolean;
  shadow?: keyof typeof SHADOWS | 'glass' | 'glassElevated' | 'none';
  overflow?: 'hidden' | 'visible';
};

function resolveSpec(variant: GenoGlassVariant) {
  return GENO_VISUAL.glass.variants[variant];
}

function defaultSheen(_variant: GenoGlassVariant): boolean {
  return true;
}

export default function GenoGlassSurface({
  children,
  style,
  contentStyle,
  variant = 'light',
  intensity,
  borderRadius = RADIUS.lg,
  showSheen,
  showTopRule = false,
  showBorder = true,
  shadow = 'glass',
  overflow = 'hidden',
}: Props) {
  const spec = resolveSpec(variant);
  const sheenOn = showSheen ?? defaultSheen(variant);
  const blurIntensity = intensity ?? spec.intensity;
  const shadowStyle =
    shadow === 'none'
      ? null
      : shadow === 'glass' || shadow === 'glassElevated'
        ? SHADOWS[shadow]
        : SHADOWS[shadow];

  return (
    <View
      style={[
        styles.outer,
        { borderRadius, overflow },
        shadowStyle,
        showBorder && {
          borderWidth: 1,
          borderColor: spec.border,
        },
        style,
      ]}
    >
      <BlurView
        intensity={blurIntensity}
        tint={spec.blurTint}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: spec.tint, borderRadius },
        ]}
        pointerEvents="none"
      />
      {sheenOn ? (
        <LinearGradient
          colors={spec.sheen}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.sheen, { borderRadius }]}
          pointerEvents="none"
        />
      ) : null}
      {sheenOn ? (
        <LinearGradient
          colors={GLASS.mirrorStreak}
          start={{ x: 0, y: 0.35 }}
          end={{ x: 1, y: 0.55 }}
          style={[styles.mirrorStreak, { borderRadius }]}
          pointerEvents="none"
        />
      ) : null}
      {showTopRule ? (
        <LinearGradient
          colors={GENO_VISUAL.glass.topRule}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.topRule}
          pointerEvents="none"
        />
      ) : null}
      {sheenOn ? (
        <View
          style={[styles.rim, { backgroundColor: GLASS.edgeHighlight, borderRadius }]}
          pointerEvents="none"
        />
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

/** Full-screen modal backdrop with adaptive blur */
export function GenoGlassBackdrop({
  style,
  variant = 'dark',
}: {
  style?: StyleProp<ViewStyle>;
  variant?: 'dark' | 'light';
}) {
  const spec = GENO_VISUAL.glass.backdrop[variant];
  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <BlurView
        intensity={spec.intensity}
        tint={spec.blurTint}
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: spec.tint }]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    opacity: 0.95,
  },
  mirrorStreak: {
    position: 'absolute',
    top: '18%',
    left: '-8%',
    right: '-8%',
    height: '38%',
    opacity: 0.55,
    transform: [{ rotate: '-8deg' }],
  },
  rim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 2,
  },
  topRule: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    zIndex: 2,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
