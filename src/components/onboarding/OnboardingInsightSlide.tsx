import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoSignaturePattern } from '../../brand';
import { FONT_FAMILY, COLORS } from '../../theme';
import type { OnboardingInsight } from './onboardingInsights';

type Props = {
  slide: OnboardingInsight;
  width: number;
};

const ACCENT_COLORS = {
  gold: COLORS.gold,
  sage: COLORS.sage,
  mint: COLORS.mint,
};

export default function OnboardingInsightSlide({ slide, width }: Props) {
  const accent = ACCENT_COLORS[slide.accent];

  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.pattern} pointerEvents="none">
        <GenoSignaturePattern width={width * 0.9} height={140} opacity={0.22} />
      </View>

      <View style={styles.iconOuter}>
        <LinearGradient
          colors={['rgba(212, 168, 67, 0.35)', 'rgba(143, 175, 149, 0.2)']}
          style={styles.iconRing}
        >
          <View style={[styles.iconCard, { borderColor: `${accent}55` }]}>
            <Ionicons name={slide.icon} size={42} color={accent} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: accent }]}>{slide.stat}</Text>
        <Text style={styles.statLabel}>{slide.statLabel}</Text>
      </View>

      <Text style={styles.kicker}>{slide.kicker}</Text>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>

      <LinearGradient
        colors={['transparent', 'rgba(212, 168, 67, 0.5)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.rule}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    paddingHorizontal: 28,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  pattern: {
    position: 'absolute',
    top: 40,
    right: -20,
  },
  iconOuter: {
    marginBottom: 22,
  },
  iconRing: {
    width: 108,
    height: 108,
    borderRadius: 32,
    padding: 3,
    alignSelf: 'flex-start',
  },
  iconCard: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCard: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 239, 230, 0.12)',
  },
  statValue: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: 'rgba(245, 239, 230, 0.65)',
  },
  kicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    letterSpacing: 2.4,
    color: COLORS.gold,
    marginBottom: 10,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
    color: COLORS.linen,
    marginBottom: 14,
    maxWidth: '98%',
  },
  body: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(245, 239, 230, 0.82)',
    maxWidth: '96%',
  },
  rule: {
    marginTop: 28,
    height: 1,
    width: '80%',
    alignSelf: 'flex-start',
  },
});
