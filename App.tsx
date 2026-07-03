import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Animated, Linking, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { FONTS_TO_LOAD, MOTION } from './src/theme';
import GenoSplashScreen from './src/components/onboarding/GenoSplashScreen';
import GenoErrorBoundary from './src/components/shell/GenoErrorBoundary';
import { getAuthenticatedUserId, logAuthState } from './src/lib/auth';
import { enforceAccountAccess } from './src/lib/security';
import { syncPushTokenToProfile } from './src/lib/pushRegistration';
import { establishSessionFromResetUrl, isResetPasswordDeepLink } from './src/lib/resetPassword';
import { supabase } from './src/lib/supabase';

/** Expo Go: always land on onboarding after splash — signed-in cold route loads MainTabs and OOMs */
const FORCE_ONBOARDING_AFTER_SPLASH = __DEV__;

type AppScreen =
  | 'onboarding'
  | 'register'
  | 'signIn'
  | 'resetPassword'
  | 'profileSetup'
  | 'interestedInGate'
  | 'main';

function bootLog(message: string, extra?: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[App:boot] ${message}`, extra ?? '');
  }
}

/** Heavy post-onboarding screens — never load at cold start */
function LazyScreen({
  screen,
  resetPasswordEmail,
  onScreen,
  onResetPasswordEmail,
}: {
  screen: Exclude<AppScreen, 'onboarding'>;
  resetPasswordEmail: string | null;
  onScreen: (next: AppScreen) => void;
  onResetPasswordEmail: (email: string | null) => void;
}) {
  const [content, setContent] = useState<ReactNode>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    setError(null);
    bootLog('lazy load start', { screen });

    (async () => {
      try {
        let node: ReactNode = null;

        switch (screen) {
          case 'register': {
            const { default: Register } = await import('./screens/Register');
            node = (
              <Register
                onBack={() => onScreen('onboarding')}
                onSignIn={() => onScreen('signIn')}
                onSuccess={() => onScreen('profileSetup')}
              />
            );
            break;
          }
          case 'signIn': {
            const { default: SignIn } = await import('./screens/SignIn');
            node = (
              <SignIn
                onBack={() => onScreen('register')}
                onCreateAccount={() => onScreen('register')}
                onSignedIn={(destination) => onScreen(destination)}
                onNavigateResetPassword={(resetEmail) => {
                  onResetPasswordEmail(resetEmail);
                  onScreen('resetPassword');
                }}
              />
            );
            break;
          }
          case 'resetPassword': {
            const { default: ResetPassword } = await import('./screens/ResetPassword');
            node = (
              <ResetPassword
                email={resetPasswordEmail ?? undefined}
                onBack={() => onScreen('signIn')}
                onCreateAccount={() => onScreen('register')}
                onSuccess={() => onScreen('signIn')}
              />
            );
            break;
          }
          case 'profileSetup': {
            const { default: ProfileSetup } = await import('./screens/ProfileSetup');
            node = <ProfileSetup onComplete={() => onScreen('main')} />;
            break;
          }
          case 'interestedInGate': {
            const { default: InterestedInGate } = await import('./screens/InterestedInGate');
            node = <InterestedInGate onComplete={() => onScreen('main')} />;
            break;
          }
          case 'main': {
            const { default: MainTabs } = await import('./screens/MainTabs');
            node = <MainTabs onSignOut={() => onScreen('onboarding')} />;
            break;
          }
          default:
            break;
        }

        if (!cancelled) {
          bootLog('lazy load done', { screen });
          setContent(node);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[App] lazy load failed', screen, err);
        if (!cancelled) setError(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onResetPasswordEmail, onScreen, resetPasswordEmail, screen]);

  if (error) {
    return (
      <View style={styles.boot}>
        <StatusBar style="light" />
        <Text style={styles.bootError}>Failed to load {screen}</Text>
        <Text style={styles.bootLabel}>{error}</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.boot}>
        <StatusBar style="light" />
        <Text style={styles.bootLabel}>Loading {screen}…</Text>
      </View>
    );
  }

  return <>{content}</>;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONTS_TO_LOAD);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [splashDone, setSplashDone] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string | null>(null);

  const screenRef = useRef(screen);
  const splashDoneRef = useRef(false);
  const pendingScreenRef = useRef<AppScreen | null>(null);
  const deferredAuthRouteRef = useRef<AppScreen | null>(null);
  const [OnboardingFlow, setOnboardingFlow] = useState<ComponentType<{
    onFinish: () => void;
    onSignIn?: () => void;
  }> | null>(null);
  const onboardingOpacity = useRef(new Animated.Value(0)).current;

  const fontsReady = fontsLoaded || !!fontError;
  const appReady = fontsReady && !bootstrapping;

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    splashDoneRef.current = splashDone;
  }, [splashDone]);

  useEffect(() => {
    if (OnboardingFlow) return;
    void import('./src/components/onboarding/GenoOnboardingFlow')
      .then((mod) => {
        bootLog('onboarding module preloaded');
        setOnboardingFlow(() => mod.default);
      })
      .catch((err) => {
        console.error('[App] onboarding preload failed', err);
      });
  }, [OnboardingFlow]);

  useEffect(() => {
    if (fontError) {
      console.warn('[App] custom fonts failed to load — using system fallbacks', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    let mounted = true;

    const handleResetPasswordUrl = async (url: string | null): Promise<boolean> => {
      if (!url || !isResetPasswordDeepLink(url)) return false;

      const { error } = await establishSessionFromResetUrl(url);

      if (error) {
        console.error('[App] reset password deep link failed', error.message);
        return false;
      }

      if (mounted) {
        setResetPasswordEmail(null);
        pendingScreenRef.current = 'resetPassword';
        if (splashDoneRef.current) setScreen('resetPassword');
      }
      return true;
    };

    (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (await handleResetPasswordUrl(initialUrl)) {
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        bootLog('session', {
          hasSession: !!session,
          userId: session?.user?.id ?? null,
          sessionError: sessionError?.message ?? null,
        });

        if (session?.user?.id) {
          void getAuthenticatedUserId();
          const allowed = await enforceAccountAccess();
          if (!allowed) {
            pendingScreenRef.current = 'onboarding';
            return;
          }
        }

        await logAuthState('App.startup');

        const { resolveInitialScreen } = await import('./src/lib/profiles');
        const initial = await resolveInitialScreen();
        bootLog('resolved initial screen (applied after splash)', { initial });

        if (mounted) {
          if (initial === 'onboarding') {
            pendingScreenRef.current = null;
          } else {
            pendingScreenRef.current = initial;
            if (FORCE_ONBOARDING_AFTER_SPLASH) {
              deferredAuthRouteRef.current = initial;
            }
          }
        }

        void syncPushTokenToProfile().catch((err) => {
          console.warn('[App] push registration skipped', err);
        });
      } catch (err) {
        console.error('[App] bootstrap failed', err);
      } finally {
        if (mounted) setBootstrapping(false);
      }
    })();

    const bootstrapTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[App] bootstrap timeout — continuing');
        setBootstrapping(false);
      }
    }, 12000);

    const linkSubscription = Linking.addEventListener('url', (event) => {
      void handleResetPasswordUrl(event.url);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      bootLog('auth state change', { event, hasSession: !!session });
      if (!session) {
        const current = screenRef.current;
        if (current === 'main' || current === 'profileSetup' || current === 'interestedInGate') {
          setScreen('onboarding');
        }
      } else if (event === 'TOKEN_REFRESHED') {
        void enforceAccountAccess().then((allowed) => {
          if (!allowed && screenRef.current === 'main') {
            setScreen('onboarding');
          }
        });
      }
    });

    return () => {
      mounted = false;
      clearTimeout(bootstrapTimeout);
      linkSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  const finishSplash = useCallback(() => {
    const pending = pendingScreenRef.current;
    const nextScreen =
      FORCE_ONBOARDING_AFTER_SPLASH || !pending ? 'onboarding' : pending;
    bootLog('splash finished', {
      nextScreen,
      pending,
      forceOnboarding: FORCE_ONBOARDING_AFTER_SPLASH,
      deferredAuthRoute: deferredAuthRouteRef.current,
      fontsReady,
      bootstrapping,
    });

    setSplashDone(true);

    if (!FORCE_ONBOARDING_AFTER_SPLASH && pending) {
      pendingScreenRef.current = null;
      setScreen(pending);
    }
  }, [bootstrapping, fontsReady]);

  useEffect(() => {
    if (!splashDone || !OnboardingFlow) return;
    onboardingOpacity.setValue(0);
    Animated.timing(onboardingOpacity, {
      toValue: 1,
      duration: 260,
      easing: MOTION.easing.out,
      useNativeDriver: true,
    }).start();
  }, [OnboardingFlow, onboardingOpacity, splashDone]);

  useEffect(() => {
    bootLog('route', { splashDone, screen, bootstrapping, fontsReady });
  }, [bootstrapping, fontsReady, screen, splashDone]);

  if (!splashDone) {
    return (
      <View style={styles.boot}>
        <StatusBar style="light" />
        <GenoSplashScreen bootstrapping={!appReady} onFinish={finishSplash} />
      </View>
    );
  }

  if (screen === 'onboarding') {
    return (
      <GenoErrorBoundary onReset={() => setScreen('onboarding')}>
        <View style={styles.boot}>
          <StatusBar style="light" />
          {OnboardingFlow ? (
            <Animated.View style={[styles.onboardingEnter, { opacity: onboardingOpacity }]}>
              <OnboardingFlow
                onFinish={() => setScreen('register')}
                onSignIn={() => {
                  const deferred = deferredAuthRouteRef.current;
                  if (deferred && deferred !== 'onboarding') {
                    deferredAuthRouteRef.current = null;
                    setScreen(deferred);
                  } else {
                    setScreen('signIn');
                  }
                }}
              />
            </Animated.View>
          ) : (
            <ActivityIndicator size="small" color="#D4A843" />
          )}
        </View>
      </GenoErrorBoundary>
    );
  }

  return (
    <GenoErrorBoundary onReset={() => setScreen('onboarding')}>
      <LazyScreen
        screen={screen}
        resetPasswordEmail={resetPasswordEmail}
        onScreen={setScreen}
        onResetPasswordEmail={setResetPasswordEmail}
      />
    </GenoErrorBoundary>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#0B0C0E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bootLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  bootError: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  onboardingEnter: {
    flex: 1,
    width: '100%',
  },
});
