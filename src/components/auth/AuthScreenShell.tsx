import type { ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoSignaturePattern } from '../../brand';
import { GenoGlassSurface } from '../../brand/graphics';
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
        <GenoSignaturePattern width={320} height={160} opacity={0.2} />
      </View>
      <LinearGradient
        colors={['rgba(212, 168, 67, 0.12)', 'transparent']}
        style={styles.topGlow}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.hero,
          {
            opacity: introOpacity,
            transform: [{ translateY: introTranslateY }],
          },
        ]}
      >
        <GenoGlassSurface
          variant="dark"
          borderRadius={RADIUS.pill}
          shadow="glass"
          intensity={36}
          style={styles.backGlass}
          contentStyle={styles.backInner}
        >
          <Pressable style={styles.back} onPress={onBack} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={20} color={COLORS.linen} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </GenoGlassSurface>

        <View style={styles.kickerRow}>
          <View style={styles.kickerDot} />
          <Text style={styles.kicker}>{kicker}</Text>
        </View>

        {showLogo && logoScale ? (
          <Animated.View style={[styles.logoOrb, { transform: [{ scale: logoScale }] }]}>
            <GenoGlassSurface
              variant="dark"
              borderRadius={40}
              shadow="glassFloat"
              intensity={32}
              contentStyle={styles.logoOrbInner}
            >
              <GenoMatchLogo size={52} />
            </GenoGlassSurface>
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
        <LinearGradient
          colors={['rgba(212, 168, 67, 0.45)', 'rgba(61, 122, 82, 0.28)', 'rgba(212, 168, 67, 0.38)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.formBorder}
        >
          <GenoGlassSurface
            variant="linen"
            borderRadius={25}
            shadow="glassElevated"
            showTopRule
            contentStyle={styles.formCard}
          >
            <View style={styles.formAccent} pointerEvents="none" />
            {children}
          </GenoGlassSurface>
        </LinearGradient>
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
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  hero: {
    marginBottom: 22,
  },
  backGlass: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    overflow: 'hidden',
  },
  backInner: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.linen,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  kicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.gold,
  },
  logoOrb: {
    marginBottom: 16,
  },
  logoOrbInner: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
    color: COLORS.linen,
    marginBottom: 10,
    maxWidth: '95%',
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(245, 239, 230, 0.78)',
    maxWidth: '96%',
  },
  formWrap: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  formBorder: {
    borderRadius: 26,
    padding: 1,
  },
  formCard: {
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  formAccent: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    opacity: 0.6,
  },
});
