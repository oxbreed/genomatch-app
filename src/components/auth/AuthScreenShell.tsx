import type { ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoSignaturePattern } from '../../brand';
import GenoMatchLogo from '../GenoMatchLogo';
import { COLORS } from '../../theme';

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
        <Pressable style={styles.back} onPress={onBack} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={20} color={COLORS.linen} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.kickerRow}>
          <View style={styles.kickerDot} />
          <Text style={styles.kicker}>{kicker}</Text>
        </View>

        {showLogo && logoScale ? (
          <Animated.View style={[styles.logoOrb, { transform: [{ scale: logoScale }] }]}>
            <LinearGradient
              colors={['rgba(245, 239, 230, 0.15)', 'rgba(245, 239, 230, 0.05)']}
              style={styles.logoOrbGradient}
            >
              <GenoMatchLogo size={52} />
            </LinearGradient>
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
          colors={[COLORS.white, COLORS.linen]}
          style={styles.formCard}
        >
          <View style={styles.formAccent} pointerEvents="none" />
          {children}
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
  back: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(245, 239, 230, 0.22)',
    backgroundColor: 'rgba(245, 239, 230, 0.08)',
    marginBottom: 20,
  },
  backText: {
    fontFamily: 'Satoshi-Bold',
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
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.gold,
  },
  logoOrb: {
    marginBottom: 16,
  },
  logoOrbGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 239, 230, 0.2)',
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
    color: COLORS.linen,
    marginBottom: 10,
    maxWidth: '95%',
  },
  subtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(245, 239, 230, 0.78)',
    maxWidth: '96%',
  },
  formWrap: {
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  formCard: {
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.2)',
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
