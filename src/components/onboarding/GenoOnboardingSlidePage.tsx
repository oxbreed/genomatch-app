import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, LOGO_GOLD, TYPOGRAPHY, creamAlpha } from '../../theme';
import type { GenoOnboardingSlide } from './onboardingSlides';
import GenoOnboardingHeroCluster from './GenoOnboardingHeroCluster';
import GenoOnboardingSlideIcon from './GenoOnboardingSlideIcon';
import {
  ONBOARDING_CONTENT_WIDTH,
  ONBOARDING_H_PAD,
  ONBOARDING_SCREEN_WIDTH,
  ONBOARDING_SECTION_GAP,
  ONBOARDING_TEXT_GAP,
} from './onboardingLayout';

type Props = {
  slide: GenoOnboardingSlide;
  index: number;
  width?: number;
};

function FeatureList({ items }: { items: readonly [string, string] }) {
  return (
    <View style={styles.featureCard}>
      {items.map((line) => (
        <View key={line} style={styles.featureRow}>
          <Ionicons name="checkmark" size={14} color={LOGO_GOLD} />
          <Text style={styles.featureText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Standard onboarding page structure (every slide):
 * 1. Visual slot  2. Kicker  3. Title  4. Body  5. Feature card
 */
export default function GenoOnboardingSlidePage({
  slide,
  index,
  width = ONBOARDING_SCREEN_WIDTH,
}: Props) {
  const isFirst = index === 0;

  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.content}>
        {isFirst ? (
          <GenoOnboardingHeroCluster />
        ) : (
          <GenoOnboardingSlideIcon name={slide.icon} />
        )}

        <View style={styles.textBlock}>
          <Text style={styles.kicker}>{slide.kicker}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>

        <FeatureList items={slide.highlights} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: ONBOARDING_H_PAD,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: ONBOARDING_CONTENT_WIDTH,
    width: '100%',
    alignSelf: 'center',
    gap: ONBOARDING_SECTION_GAP,
    paddingBottom: 16,
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    gap: ONBOARDING_TEXT_GAP,
  },
  kicker: {
    ...TYPOGRAPHY.marketingKicker,
    fontSize: 11,
    letterSpacing: 1.8,
    color: LOGO_GOLD,
    textAlign: 'center',
  },
  title: {
    ...TYPOGRAPHY.serifTitle,
    fontSize: 26,
    lineHeight: 32,
    color: COLORS.text,
    textAlign: 'center',
  },
  body: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 23,
    color: creamAlpha(0.72),
    textAlign: 'center',
    maxWidth: 320,
  },
  featureCard: {
    width: '100%',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: creamAlpha(0.1),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    ...TYPOGRAPHY.bodyStrong,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: creamAlpha(0.88),
  },
});
