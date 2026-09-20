import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  BRAND_BLACK,
  COLORS,
  LOGO_RED,
  LOGO_RED_HOT,
  TYPOGRAPHY,
} from '../../theme';
import GenoOnboardingAgeGate from './GenoOnboardingAgeGate';
import GenoOnboardingProgress from './GenoOnboardingProgress';
import GenoOnboardingSlidePage from './GenoOnboardingSlidePage';
import GenoPremiumOnboardingBackdrop from './GenoPremiumOnboardingBackdrop';
import GenoRibbonLogoAnimated from './GenoRibbonLogoAnimated';
import GenoWordmark from './GenoWordmark';
import { GENO_ONBOARDING_SLIDES } from './onboardingSlides';
import {
  ONBOARDING_AGE_SLOT_HEIGHT,
  ONBOARDING_BOTTOM_PAD,
  ONBOARDING_CTA_HEIGHT,
  ONBOARDING_CTA_WIDTH,
  ONBOARDING_FOOTER_MIN_HEIGHT,
  ONBOARDING_H_PAD,
  ONBOARDING_TOP_PAD,
} from './onboardingLayout';

type Props = {
  onFinish: () => void;
  onSignIn?: () => void;
  lastCtaLabel?: string;
};

const SLIDE_COUNT = GENO_ONBOARDING_SLIDES.length;

function clampSlide(index: number) {
  return Math.max(0, Math.min(SLIDE_COUNT - 1, index));
}

export default function GenoOnboardingFlow({
  onFinish,
  onSignIn,
  lastCtaLabel = 'Create your profile',
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const [slide, setSlide] = useState(0);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageNudge, setAgeNudge] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const slideRef = useRef(0);
  const ctaScale = useRef(new Animated.Value(1)).current;

  const isLast = slide === SLIDE_COUNT - 1;

  const ctaLabel = useMemo(
    () => (isLast ? lastCtaLabel : 'Continue'),
    [isLast, lastCtaLabel]
  );

  useEffect(() => {
    slideRef.current = slide;
  }, [slide]);

  const goToSlide = useCallback(
    (index: number) => {
      const next = clampSlide(index);
      if (next === slideRef.current) return;
      setAgeNudge(false);
      setSlide(next);
      scrollRef.current?.scrollTo({ x: next * screenWidth, animated: true });
    },
    [screenWidth]
  );

  const resolveSlideFromOffset = useCallback(
    (offsetX: number) => clampSlide(Math.round(offsetX / screenWidth)),
    [screenWidth]
  );

  const onScrollSettled = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = resolveSlideFromOffset(event.nativeEvent.contentOffset.x);
      if (next !== slideRef.current) {
        setAgeNudge(false);
        setSlide(next);
      }
    },
    [resolveSlideFromOffset]
  );

  const onContinue = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isLast) {
      goToSlide(slide + 1);
      return;
    }
    if (!ageConfirmed) {
      setAgeNudge(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFinish();
  };

  const skipToEnd = () => {
    void Haptics.selectionAsync();
    goToSlide(SLIDE_COUNT - 1);
  };

  const ctaReady = !isLast || ageConfirmed;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GenoPremiumOnboardingBackdrop />

      <View style={styles.shell}>
        <View style={[styles.header, { paddingTop: ONBOARDING_TOP_PAD }]}>
          <View style={styles.brandRow}>
            <GenoRibbonLogoAnimated width={40} height={40} variant="static" />
            <GenoWordmark />
          </View>
          {!isLast ? (
            <Pressable
              onPress={skipToEnd}
              hitSlop={14}
              accessibilityRole="button"
              accessibilityLabel="Skip to last step"
            >
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onMomentumScrollEnd={onScrollSettled}
          onScrollEndDrag={onScrollSettled}
          style={styles.pager}
          contentContainerStyle={styles.pagerContent}
        >
          {GENO_ONBOARDING_SLIDES.map((item, index) => (
            <GenoOnboardingSlidePage
              key={item.kicker}
              slide={item}
              width={screenWidth}
              showSwipeHint={index === 0 && slide === 0}
            />
          ))}
        </ScrollView>

        <View style={[styles.footer, { minHeight: ONBOARDING_FOOTER_MIN_HEIGHT }]}>
          <LinearGradient
            colors={['transparent', BRAND_BLACK]}
            style={styles.footerFade}
            pointerEvents="none"
          />

          <View style={[styles.footerInner, { paddingBottom: ONBOARDING_BOTTOM_PAD }]}>
            <GenoOnboardingProgress
              total={SLIDE_COUNT}
              current={slide}
              onSelect={goToSlide}
            />

            <View
              style={[
                styles.ageSlot,
                { height: isLast ? ONBOARDING_AGE_SLOT_HEIGHT : 0 },
              ]}
            >
              {isLast ? (
                <GenoOnboardingAgeGate
                  confirmed={ageConfirmed}
                  onToggle={() => {
                    setAgeConfirmed((v) => !v);
                    setAgeNudge(false);
                  }}
                  showHelper={ageNudge}
                />
              ) : null}
            </View>

            <Animated.View style={[styles.ctaWrap, { transform: [{ scale: ctaScale }] }]}>
              <Pressable
                onPressIn={() =>
                  Animated.spring(ctaScale, { toValue: 0.98, useNativeDriver: true }).start()
                }
                onPressOut={() =>
                  Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true }).start()
                }
                onPress={onContinue}
                disabled={isLast && !ageConfirmed}
                accessibilityRole="button"
                accessibilityState={{ disabled: isLast && !ageConfirmed }}
                style={[styles.ctaOuter, !ctaReady && styles.ctaOuterMuted]}
              >
                <View style={styles.cta}>
                  <View style={styles.ctaInner}>
                    <Text style={styles.ctaText}>{ctaLabel}</Text>
                    {!isLast ? (
                      <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            </Animated.View>

            {onSignIn ? (
              <Pressable onPress={onSignIn} hitSlop={12} style={styles.signInRow}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <Text style={styles.signInLink}>Sign in</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BLACK,
  },
  shell: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ONBOARDING_H_PAD,
    minHeight: 40,
    zIndex: 2,
  },
  headerSpacer: {
    width: 44,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skip: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 14,
    color: 'rgba(250, 248, 245, 0.7)',
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    alignItems: 'stretch',
  },
  footer: {
    position: 'relative',
  },
  footerFade: {
    position: 'absolute',
    top: -48,
    left: 0,
    right: 0,
    height: 48,
  },
  footerInner: {
    paddingHorizontal: ONBOARDING_H_PAD,
    paddingTop: 10,
    gap: 14,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: BRAND_BLACK,
  },
  ageSlot: {
    width: '100%',
    overflow: 'hidden',
  },
  ctaWrap: {
    width: ONBOARDING_CTA_WIDTH,
    maxWidth: '100%',
  },
  ctaOuter: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: LOGO_RED,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaOuterMuted: {
    opacity: 0.5,
  },
  cta: {
    height: ONBOARDING_CTA_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: LOGO_RED,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    ...TYPOGRAPHY.button,
    fontSize: 17,
    color: COLORS.linen,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: -2,
  },
  signInText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: 'rgba(250, 248, 245, 0.7)',
  },
  signInLink: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 14,
    color: LOGO_RED_HOT,
  },
});
