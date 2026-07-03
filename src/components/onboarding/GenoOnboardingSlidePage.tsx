import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, LOGO_GOLD, TYPOGRAPHY, creamAlpha } from '../../theme';
import type { GenoOnboardingSlide } from './onboardingSlides';
import GenoOnboardingSlideIcon from './GenoOnboardingSlideIcon';
import { ONBOARDING_H_PAD, ONBOARDING_SCREEN_WIDTH } from './onboardingLayout';

type Props = {
  slide: GenoOnboardingSlide;
  width?: number;
  showSwipeHint?: boolean;
};

/** One full-width onboarding page — icon, story, proof points */
export default function GenoOnboardingSlidePage({
  slide,
  width = ONBOARDING_SCREEN_WIDTH,
  showSwipeHint,
}: Props) {
  return (
    <View style={[styles.page, { width, paddingHorizontal: ONBOARDING_H_PAD }]}>
      <View style={styles.inner}>
        <GenoOnboardingSlideIcon name={slide.icon} size="lg" />

        <View style={styles.kickerRow}>
          <View style={styles.kickerDot} />
          <Text style={styles.kicker}>{slide.kicker}</Text>
        </View>

        <Text style={styles.headline}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        <View style={styles.highlights}>
          {slide.highlights.map((line) => (
            <View key={line} style={styles.highlightRow}>
              <View style={styles.checkRing}>
                <Ionicons name="checkmark" size={12} color={LOGO_GOLD} />
              </View>
              <Text style={styles.highlightText}>{line}</Text>
            </View>
          ))}
        </View>

        {showSwipeHint ? (
          <View style={styles.swipeHint}>
            <Ionicons name="chevron-back" size={14} color={creamAlpha(0.35)} />
            <Text style={styles.swipeHintText}>Swipe to explore</Text>
            <Ionicons name="chevron-forward" size={14} color={creamAlpha(0.35)} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  kickerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LOGO_GOLD,
  },
  kicker: {
    ...TYPOGRAPHY.marketingKicker,
    fontSize: 10,
    letterSpacing: 2.4,
  },
  headline: {
    ...TYPOGRAPHY.serifHeadline,
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    color: COLORS.text,
    maxWidth: 320,
  },
  body: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    maxWidth: 310,
    lineHeight: 24,
    color: creamAlpha(0.78),
  },
  highlights: {
    width: '100%',
    maxWidth: 300,
    gap: 10,
    marginTop: 8,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    ...TYPOGRAPHY.bodyStrong,
    flex: 1,
    fontSize: 14,
    color: creamAlpha(0.88),
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  swipeHintText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: creamAlpha(0.4),
  },
});
