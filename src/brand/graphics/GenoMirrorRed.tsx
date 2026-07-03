import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_FAMILY, LOGO_RED_DEEP, METALLIC_GRAPHITE, METALLIC_SLATE, MIRROR_GRADIENTS, MIRROR_RED_TEXT, silverAlpha } from '../../theme';

type FillProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Horizontal shine sweep (default: vertical depth) */
  horizontal?: boolean;
};

function GoldMirrorLayers({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <>
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.goldCta]}
        start={horizontal ? { x: 0, y: 0.5 } : { x: 0.12, y: 0 }}
        end={horizontal ? { x: 1, y: 0.5 } : { x: 0.88, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.goldSheen]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={styles.sheen}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaStreak]}
        start={{ x: 0, y: 0.38 }}
        end={{ x: 1, y: 0.62 }}
        style={styles.streak}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaRim]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.rim}
        pointerEvents="none"
      />
    </>
  );
}

/** Glossy metallic-gold fill for inbox actions, badges, and CTAs */
export function GenoMirrorGoldFill({ children, style, horizontal = false }: FillProps) {
  return (
    <View style={[styles.fillWrap, style]}>
      <GoldMirrorLayers horizontal={horizontal} />
      {children}
    </View>
  );
}

function SteelMirrorLayers({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <>
      <LinearGradient
        colors={[METALLIC_SLATE, METALLIC_GRAPHITE, '#101216']}
        start={horizontal ? { x: 0, y: 0.5 } : { x: 0.12, y: 0 }}
        end={horizontal ? { x: 1, y: 0.5 } : { x: 0.88, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.chromeGloss]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.55 }}
        style={styles.sheen}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaStreak]}
        start={{ x: 0, y: 0.38 }}
        end={{ x: 1, y: 0.62 }}
        style={styles.streak}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[silverAlpha(0.35), 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={styles.rim}
        pointerEvents="none"
      />
    </>
  );
}

/** Glossy metallic-steel fill — pass / neutral actions */
export function GenoMirrorSteelFill({ children, style, horizontal = false }: FillProps) {
  return (
    <View style={[styles.fillWrap, style]}>
      <SteelMirrorLayers horizontal={horizontal} />
      {children}
    </View>
  );
}

function MirrorRedLayers({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <>
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.cta]}
        start={horizontal ? { x: 0, y: 0.5 } : { x: 0.12, y: 0 }}
        end={horizontal ? { x: 1, y: 0.5 } : { x: 0.88, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaSheen]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={styles.sheen}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaStreak]}
        start={{ x: 0, y: 0.38 }}
        end={{ x: 1, y: 0.62 }}
        style={styles.streak}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaRim]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.rim}
        pointerEvents="none"
      />
    </>
  );
}

/** Glossy mirror-red fill for buttons, chips, badges, and CTAs */
export function GenoMirrorRedFill({ children, style, horizontal = false }: FillProps) {
  return (
    <View style={[styles.fillWrap, style]}>
      <MirrorRedLayers horizontal={horizontal} />
      {children}
    </View>
  );
}

/** Onboarding hero CTA — soft rose → gold with full metallic sheen */
export function GenoOnboardingCtaFill({ children, style }: FillProps) {
  return (
    <View style={[styles.fillWrap, style]}>
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.onboardingCta]}
        locations={[0, 0.28, 0.62, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.onboardingCtaSheen]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.sheen}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaStreak]}
        start={{ x: 0, y: 0.38 }}
        end={{ x: 1, y: 0.62 }}
        style={styles.streak}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaRim]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.rim}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.08)']}
        start={{ x: 0.5, y: 0.55 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bevel}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

/** Gold-to-red ribbon blend CTA — hearts & genes merging */
export function GenoMirrorBrandCtaFill({ children, style, horizontal = false }: FillProps) {
  return (
    <View style={[styles.fillWrap, style]}>
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ribbonBlend]}
        start={horizontal ? { x: 0, y: 0.5 } : { x: 0.05, y: 0.2 }}
        end={horizontal ? { x: 1, y: 0.5 } : { x: 0.95, y: 0.8 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ribbonBlendSheen]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.sheen}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaStreak]}
        start={{ x: 0, y: 0.38 }}
        end={{ x: 1, y: 0.62 }}
        style={styles.streak}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[...MIRROR_GRADIENTS.ctaRim]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.rim}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

type TextProps = {
  children: string;
  style?: StyleProp<TextStyle>;
};

/** Layered mirror-red text — bright chrome face with depth and highlight */
export function GenoMirrorRedText({ children, style }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const fontSize = flat.fontSize ?? 14;
  const fontFamily = flat.fontFamily ?? FONT_FAMILY.gothamBold;
  const letterSpacing = flat.letterSpacing;
  const textAlign = flat.textAlign;
  const lineHeight = flat.lineHeight;

  const base: TextStyle = {
    fontSize,
    fontFamily,
    letterSpacing,
    textAlign,
    lineHeight,
  };

  return (
    <View style={styles.textWrap}>
      <Text style={[base, styles.textDepth, style]} aria-hidden>
        {children}
      </Text>
      <Text style={[base, MIRROR_RED_TEXT, style]}>{children}</Text>
      <Text style={[base, styles.textHighlight, style]} pointerEvents="none" aria-hidden>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fillWrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  sheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.88,
  },
  streak: {
    position: 'absolute',
    top: '10%',
    left: '-6%',
    right: '-6%',
    height: '44%',
    opacity: 0.72,
    transform: [{ rotate: '-7deg' }],
  },
  rim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '36%',
    opacity: 0.55,
  },
  bevel: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.65,
  },
  textWrap: {
    position: 'relative',
  },
  textDepth: {
    position: 'absolute',
    top: 1,
    left: 0.5,
    color: LOGO_RED_DEEP,
    opacity: 0.5,
  },
  textHighlight: {
    position: 'absolute',
    top: -0.5,
    left: 0,
    color: 'rgba(255, 255, 255, 0.42)',
    opacity: 0.9,
  },
});
