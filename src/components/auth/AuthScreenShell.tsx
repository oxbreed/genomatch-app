import type { ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenoSignaturePattern } from '../../brand';
import { GenoGlassSurface } from '../../brand/graphics';
import { GenoMirrorRedFill } from '../../brand/graphics';
import GenoMatchLogo from '../GenoMatchLogo';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  kicker: string;
  title: string;
  subtitle: string;
  onBack: () => void;
  introOpacity: Animated.Value;
  introTranslateY: Animated.Value;
  showLogo?: boolean;
  logoScale?: Animated.Value;
  children: ReactNode;
};

export default function AuthScreenShell({
  kicker,
  title,
  subtitle,
  onBack,
  introOpacity,
  introTranslateY,
  showLogo = false,
  logoScale,
  children,
}: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.patternTop} pointerEvents="none">
        <GenoSignaturePattern width={320} height={160} opacity={0.06} />
      </View>

      <Animated.View
        style={[
          styles.hero,
          {
            opacity: introOpacity,
            transform: [{ translateY: introTranslateY }],
          },
        ]}
      >
        <Pressable style={styles.back} onPress={onBack} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.kickerRow}>
          <GenoMirrorRedFill style={styles.kickerDot}>
            <View style={styles.kickerDotCore} />
          </GenoMirrorRedFill>
          <Text style={styles.kicker}>{kicker}</Text>
        </View>

        {showLogo && logoScale ? (
          <Animated.View style={[styles.logoOrb, { transform: [{ scale: logoScale }] }]}>
            <GenoMatchLogo size={52} surface="light" />
          </Animated.View>
        ) : null}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.formWrap,
          {
            opacity: introOpacity,
            transform: [{ translateY: introTranslateY }],
          },
        ]}
      >
        <GenoGlassSurface
          variant="linen"
          borderRadius={20}
          shadow="card"
          contentStyle={styles.formCard}
        >
          {children}
        </GenoGlassSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: 8,
  },
  patternTop: {
    position: 'absolute',
    top: -20,
    right: -40,
  },
  hero: {
    marginBottom: 22,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  backText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.text,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  kickerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  kickerDotCore: {
    flex: 1,
  },
  kicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.textMuted,
  },
  logoOrb: {
    marginBottom: 16,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
    color: COLORS.text,
    marginBottom: 10,
    maxWidth: '95%',
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textMuted,
    maxWidth: '96%',
  },
  formWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  formCard: {
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
});
