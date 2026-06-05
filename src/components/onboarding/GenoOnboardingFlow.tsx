import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import * as Haptics from 'expo-haptics';
import { GenoPremiumChrome, GenoHelixField } from '../../brand/graphics';
import { GenoBondMark } from '../../brand';
import GenoMatchLogo from '../GenoMatchLogo';
import { COLORS } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type IonName = ComponentProps<typeof Ionicons>['name'];

export type GenoOnboardingSlide = {
  icon: IonName;
  title: string;
  subtitle: string;
  body: string;
};

type Props = {
  slides: GenoOnboardingSlide[];
  onFinish: () => void;
  lastCtaLabel?: string;
};

export default function GenoOnboardingFlow({
  slides,
  onFinish,
  lastCtaLabel = 'Create your profile',
}: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const layerOpacity = useRef(new Animated.Value(0)).current;
  const layerY = useRef(new Animated.Value(24)).current;
  const carouselX = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(layerOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(layerY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [iconPulse, layerOpacity, layerY]);

  const ctaLabel = useMemo(
    () => (currentSlide === slides.length - 1 ? lastCtaLabel : 'Continue'),
    [currentSlide, lastCtaLabel, slides.length]
  );

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    Animated.timing(carouselX, {
      toValue: -index * SCREEN_WIDTH,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const onContinue = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide === slides.length - 1) {
      onFinish();
      return;
    }
    goToSlide(Math.min(currentSlide + 1, slides.length - 1));
  };

  const skipToEnd = () => {
    void Haptics.selectionAsync();
    goToSlide(slides.length - 1);
  };

  return (
    <View style={styles.root}>
      <GenoPremiumChrome variant="forest" />
      <StatusBar style="light" />

      <View style={styles.helixDecor} pointerEvents="none">
        <GenoHelixField width={280} height={100} opacity={0.18} />
      </View>

      <Animated.View
        style={[
          styles.layer,
          { opacity: layerOpacity, transform: [{ translateY: layerY }] },
        ]}
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <GenoMatchLogo size={36} />
            <GenoBondMark size={24} opacity={0.9} />
          </View>
          <Pressable onPress={skipToEnd} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <Animated.View style={[styles.track, { transform: [{ translateX: carouselX }] }]}>
          {slides.map((slide) => (
            <View key={slide.title} style={styles.slide}>
              <LinearGradient
                colors={['rgba(212, 168, 67, 0.35)', 'rgba(61, 122, 82, 0.25)']}
                style={styles.slideCardBorder}
              >
                <View style={styles.slideCard}>
                  <Animated.View style={{ transform: [{ scale: iconPulse }] }}>
                    <LinearGradient
                      colors={['rgba(237, 243, 238, 0.15)', 'rgba(212, 168, 67, 0.2)']}
                      style={styles.iconOrb}
                    >
                      <Ionicons name={slide.icon} size={40} color={COLORS.gold} />
                    </LinearGradient>
                  </Animated.View>
                  <Text style={styles.slideKicker}>{slide.subtitle}</Text>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideBody}>{slide.body}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((slide, index) => (
              <Pressable
                key={slide.title}
                onPress={() => goToSlide(index)}
                style={[styles.dot, index === currentSlide && styles.dotActive]}
              />
            ))}
          </View>

          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <Pressable
              onPressIn={() =>
                Animated.spring(ctaScale, {
                  toValue: 0.97,
                  useNativeDriver: true,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(ctaScale, {
                  toValue: 1,
                  useNativeDriver: true,
                }).start()
              }
              onPress={onContinue}
            >
              <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.cta}>
                <Text style={styles.ctaText}>{ctaLabel}</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.forestDeep} />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Text style={styles.helper}>
            {currentSlide === slides.length - 1
              ? 'Join thousands building intentional, genotype-aware love stories.'
              : `${currentSlide + 1} of ${slides.length} — your premium bond journey`}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.forestDeep,
  },
  helixDecor: {
    position: 'absolute',
    top: 80,
    right: -40,
    zIndex: 1,
  },
  layer: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: 32,
    zIndex: 2,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skip: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: 'rgba(245, 239, 230, 0.7)',
  },
  track: {
    flexDirection: 'row',
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  slideCardBorder: {
    borderRadius: 28,
    padding: 2,
  },
  slideCard: {
    backgroundColor: 'rgba(13, 40, 24, 0.75)',
    borderRadius: 26,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.25)',
  },
  iconOrb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  slideKicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.gold,
    marginBottom: 8,
  },
  slideTitle: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 32,
    lineHeight: 38,
    color: COLORS.linen,
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  slideBody: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(245, 239, 230, 0.8)',
  },
  footer: {
    paddingHorizontal: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 239, 230, 0.25)',
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.gold,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 58,
    borderRadius: 16,
  },
  ctaText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 17,
    color: COLORS.forestDeep,
  },
  helper: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: 'rgba(245, 239, 230, 0.55)',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
});
