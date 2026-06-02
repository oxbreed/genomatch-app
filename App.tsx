import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Register from './screens/Register';
import SignIn from './screens/SignIn';
import ProfileSetup from './screens/ProfileSetup';
import MainTabs from './screens/MainTabs';
import { resolveInitialScreen } from './src/lib/profiles';
import { logAuthState } from './src/lib/auth';
import { supabase } from './src/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  teal: '#1B7A6E',
  gold: '#C9872B',
  ivory: '#FAFAF7',
  white: '#FFFFFF',
};

const ONBOARDING_SLIDES = [
  {
    emoji: '🧬',
    title: 'Science-Led Compatibility',
    subtitle: 'GENOTYPE-AWARE MATCHING',
    body:
      'Meet people with confidence through thoughtful genotype compatibility, designed for modern West African love stories.',
  },
  {
    emoji: '💚',
    title: 'Emotionally Intelligent Profiles',
    subtitle: 'DEEPER SIGNALS, BETTER DATES',
    body:
      'Every profile blends emotional style, communication rhythm, and long-term intent so connections feel meaningful from day one.',
  },
  {
    emoji: '🌟',
    title: 'Premium Journey to Forever',
    subtitle: 'TRUSTED BY INTENTIONAL SINGLES',
    body:
      'From first match to first meeting, guided prompts and shared milestones help you build chemistry with clarity.',
  },
];

export default function App() {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [screen, setScreen] = useState<
    'onboarding' | 'register' | 'signIn' | 'profileSetup' | 'main'
  >('onboarding');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log('[App] startup session', {
          hasSession: !!session,
          userId: session?.user?.id ?? null,
          email: session?.user?.email ?? null,
          emailConfirmed: !!session?.user?.email_confirmed_at,
          expiresAt: session?.expires_at ?? null,
          sessionError: sessionError?.message ?? null,
        });

        await logAuthState('App.startup');

        const initial = await resolveInitialScreen();
        console.log('[App] resolveInitialScreen →', initial);

        if (mounted && initial !== 'onboarding') {
          setScreen(initial);
        }
      } catch (err) {
        console.error('[App] bootstrap failed', err);
        // Stay on onboarding if profile check fails
      } finally {
        if (mounted) setBootstrapping(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[App] auth state change', {
        event,
        hasSession: !!session,
        userId: session?.user?.id ?? null,
      });

      if (!session) {
        setScreen('onboarding');
        setShowOnboarding(true);
        setCurrentSlide(0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0.88)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.85)).current;
  const onboardingOpacity = useRef(new Animated.Value(0)).current;
  const onboardingTranslateY = useRef(new Animated.Value(28)).current;
  const carouselX = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const ringRotateInner = useRef(new Animated.Value(0)).current;

  const ringSpin = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const ringSpinInner = ringRotateInner.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  useEffect(() => {
    const ringLoop = Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const ringInnerLoop = Animated.loop(
      Animated.timing(ringRotateInner, {
        toValue: 1,
        duration: 6500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    ringLoop.start();
    ringInnerLoop.start();

    const splashIn = Animated.parallel([
      Animated.timing(splashScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowPulse, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const floatingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -7,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 7,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    splashIn.start();
    floatingLoop.start();

    const transitionTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 550,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(splashScale, {
          toValue: 1.06,
          duration: 550,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          return;
        }

        setShowOnboarding(true);
        Animated.parallel([
          Animated.timing(onboardingOpacity, {
            toValue: 1,
            duration: 650,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(onboardingTranslateY, {
            toValue: 0,
            duration: 650,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2500);

    return () => {
      clearTimeout(transitionTimeout);
      floatingLoop.stop();
      ringLoop.stop();
      ringInnerLoop.stop();
    };
  }, [
    glowPulse,
    logoFloat,
    onboardingOpacity,
    onboardingTranslateY,
    ringRotate,
    ringRotateInner,
    splashOpacity,
    splashScale,
  ]);

  const activeSlide = ONBOARDING_SLIDES[currentSlide];
  const ctaLabel = useMemo(
    () => (currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Create Your Profile' : 'Continue'),
    [currentSlide]
  );

  const onContinue = () => {
    if (currentSlide === ONBOARDING_SLIDES.length - 1) {
      setScreen('register');
      return;
    }

    const nextSlide = Math.min(currentSlide + 1, ONBOARDING_SLIDES.length - 1);
    if (nextSlide !== currentSlide) {
      setCurrentSlide(nextSlide);
      Animated.timing(carouselX, {
        toValue: -nextSlide * SCREEN_WIDTH,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  };

  const onCtaPressIn = () => {
    Animated.spring(ctaScale, {
      toValue: 0.97,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  const onCtaPressOut = () => {
    Animated.spring(ctaScale, {
      toValue: 1,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  if (bootstrapping) {
    return (
      <View style={styles.bootstrap}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  if (screen === 'register') {
    return (
      <Register
        onBack={() => setScreen('onboarding')}
        onSignIn={() => setScreen('signIn')}
        onSuccess={() => setScreen('profileSetup')}
      />
    );
  }

  if (screen === 'signIn') {
    return (
      <SignIn
        onBack={() => setScreen('register')}
        onCreateAccount={() => setScreen('register')}
        onSignedIn={(destination) => setScreen(destination)}
      />
    );
  }

  if (screen === 'profileSetup') {
    return <ProfileSetup onComplete={() => setScreen('main')} />;
  }

  if (screen === 'main') {
    return (
      <MainTabs
        onSignOut={() => {
          setScreen('onboarding');
          setShowOnboarding(true);
          setCurrentSlide(0);
        }}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {!showOnboarding && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.splashLayer,
            {
              opacity: splashOpacity,
              transform: [{ scale: splashScale }],
            },
          ]}
        >
          <Animated.View style={[styles.splashGlow, { transform: [{ scale: glowPulse }] }]} />
          <View style={styles.logoStack}>
            <Animated.View
              style={[styles.logoRingOuter, { transform: [{ rotate: ringSpin }] }]}
            />
            <Animated.View
              style={[styles.logoRingInner, { transform: [{ rotate: ringSpinInner }] }]}
            />
            <Animated.View style={[styles.logoOrb, { transform: [{ translateY: logoFloat }] }]}>
              <Text style={styles.logoEmoji}>🧬</Text>
            </Animated.View>
          </View>
          <Text style={styles.brandWordmark}>GenoMatch</Text>
          <Text style={styles.brandTagline}>Connecting Hearts. Aligning Genes.</Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.onboardingLayer,
          {
            opacity: onboardingOpacity,
            transform: [{ translateY: onboardingTranslateY }],
          },
        ]}
      >
        <View style={styles.topBar}>
          <Text style={styles.brandMini}>GENOMATCH</Text>
          <Pressable
            onPress={() => {
              const lastIndex = ONBOARDING_SLIDES.length - 1;
              setCurrentSlide(lastIndex);
              Animated.timing(carouselX, {
                toValue: -lastIndex * SCREEN_WIDTH,
                duration: 420,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }).start();
            }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <Animated.View style={[styles.slidesTrack, { transform: [{ translateX: carouselX }] }]}>
          {ONBOARDING_SLIDES.map((slide) => (
            <View key={slide.title} style={styles.slide}>
              <View style={styles.iconCard}>
                <Text style={styles.slideEmoji}>{slide.emoji}</Text>
              </View>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideBody}>{slide.body}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.progressDots}>
            {ONBOARDING_SLIDES.map((slide, index) => (
              <Pressable
                key={slide.title}
                onPress={() => {
                  setCurrentSlide(index);
                  Animated.timing(carouselX, {
                    toValue: -index * SCREEN_WIDTH,
                    duration: 420,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                  }).start();
                }}
                style={[styles.dot, index === currentSlide && styles.dotActive]}
              />
            ))}
          </View>

          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <Pressable
              style={styles.ctaButton}
              onPressIn={onCtaPressIn}
              onPressOut={onCtaPressOut}
              onPress={onContinue}
            >
              <Text style={styles.ctaLabel}>{ctaLabel}</Text>
            </Pressable>
          </Animated.View>

          <Text style={styles.helperText}>
            {currentSlide === ONBOARDING_SLIDES.length - 1
              ? 'Premium onboarding complete. Next: secure signup.'
              : `${currentSlide + 1} of ${ONBOARDING_SLIDES.length} insights`}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.teal,
  },
  splashLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashGlow: {
    position: 'absolute',
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoStack: {
    width: 168,
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  logoRingOuter: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderTopColor: 'transparent',
    borderRightColor: 'rgba(201, 135, 43, 0.35)',
  },
  logoRingInner: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  logoOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  logoEmoji: {
    fontSize: 54,
  },
  brandWordmark: {
    color: COLORS.ivory,
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -1.1,
  },
  brandTagline: {
    marginTop: 8,
    color: 'rgba(250, 250, 247, 0.72)',
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: '500',
  },
  onboardingLayer: {
    flex: 1,
    paddingTop: 62,
    paddingBottom: 34,
  },
  topBar: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandMini: {
    color: COLORS.gold,
    fontSize: 12,
    letterSpacing: 2.4,
    fontWeight: '700',
  },
  skipText: {
    color: 'rgba(250, 250, 247, 0.72)',
    fontSize: 15,
    fontWeight: '600',
  },
  slidesTrack: {
    flexDirection: 'row',
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconCard: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  slideEmoji: {
    fontSize: 44,
  },
  slideSubtitle: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  slideTitle: {
    color: COLORS.ivory,
    fontSize: 39,
    lineHeight: 45,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 14,
    maxWidth: '95%',
  },
  slideBody: {
    color: 'rgba(250, 250, 247, 0.78)',
    fontSize: 17,
    lineHeight: 29,
    fontWeight: '500',
    maxWidth: '96%',
  },
  footer: {
    paddingHorizontal: 24,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(250, 250, 247, 0.28)',
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.gold,
  },
  ctaButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  helperText: {
    marginTop: 14,
    color: 'rgba(250, 250, 247, 0.6)',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  bootstrap: {
    flex: 1,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});