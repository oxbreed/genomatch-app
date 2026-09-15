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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  BRAND_BLACK,
  COLORS,
  LOGO_RED,
  LOGO_RED_BRIGHT,
  MOTION,
  TYPOGRAPHY,
  creamAlpha,
} from '../../theme';
import GenoOnboardingAgeGate from './GenoOnboardingAgeGate';
import GenoOnboardingProgress from './GenoOnboardingProgress';
import GenoOnboardingSlidePage from './GenoOnboardingSlidePage';
import GenoPremiumOnboardingBackdrop from './GenoPremiumOnboardingBackdrop';
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
  const enterOpacity = useRef(new Animated.Value(0)).current;

  const isLast = slide === SLIDE_COUNT - 1;

  const ctaLabel = useMemo(
    () => (isLast ? lastCtaLabel : 'Continue'),
    [isLast, lastCtaLabel]
  );

  useEffect(() => {
    slideRef.current = slide;
  }, [slide]);

  useEffect(() => {
    Animated.timing(enterOpacity, {
      toValue: 1,
      duration: 280,
      easing: MOTION.easing.out,
      useNativeDriver: true,
    }).start();
  }, [enterOpacity]);

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
        void Haptics.selectionAsync();
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
    <Animated.View style={[styles.root, { opacity: enterOpacity }]}>
      <StatusBar style="light" />
      <GenoPremiumOnboardingBackdrop />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: ONBOARDING_TOP_PAD }]}>
        <GenoWordmark />
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

      {/* ── Slides ── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        removeClippedSubviews
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
            index={index}
            width={screenWidth}
          />
        ))}
      </ScrollView>

      {/* ── Footer dock ── */}
      <View style={[styles.footer, { minHeight: ONBOARDING_FOOTER_MIN_HEIGHT }]}>
        <View style={styles.footerInner}>
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
                Animated.spring(ctaScale, { ...MOTION.springSnappy, toValue: 0.98 }).start()
              }
              onPressOut={() =>
                Animated.spring(ctaScale, { ...MOTION.springSnappy, toValue: 1 }).start()
              }
              onPress={onContinue}
              accessibilityRole="button"
              style={[styles.cta, !ctaReady && styles.ctaMuted]}
            >
              <View style={styles.ctaInner}>
                <Text style={styles.ctaText}>{ctaLabel}</Text>
                {!isLast ? (
                  <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
                ) : null}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BLACK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ONBOARDING_H_PAD,
    paddingBottom: 8,
    zIndex: 2,
  },
  headerSpacer: {
    width: 40,
  },
  skip: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 14,
    color: creamAlpha(0.55),
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    alignItems: 'stretch',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: creamAlpha(0.08),
    backgroundColor: BRAND_BLACK,
  },
  footerInner: {
    paddingHorizontal: ONBOARDING_H_PAD,
    paddingTop: 16,
    paddingBottom: ONBOARDING_BOTTOM_PAD,
    gap: 14,
    alignItems: 'center',
  },
  ageSlot: {
    width: '100%',
    overflow: 'hidden',
  },
  ctaWrap: {
    width: ONBOARDING_CTA_WIDTH,
    maxWidth: '100%',
  },
  cta: {
    width: '100%',
    height: ONBOARDING_CTA_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: LOGO_RED,
  },
  ctaMuted: {
    opacity: 0.45,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    ...TYPOGRAPHY.cta,
    fontSize: 16,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  signInText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: creamAlpha(0.55),
  },
  signInLink: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 14,
    color: LOGO_RED_BRIGHT,
  },
});
