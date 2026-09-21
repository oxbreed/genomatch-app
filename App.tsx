import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS_TO_LOAD } from './src/theme';
import { GenoOnboardingFlow } from './src/components/onboarding';
import SplashVideoScreen from './screens/SplashVideoScreen';
import GenoErrorBoundary from './src/components/shell/GenoErrorBoundary';
import { resolveInitialScreen } from './src/lib/profiles';
import { getAuthenticatedUserId, logAuthState } from './src/lib/auth';
import { enforceAccountAccess } from './src/lib/security';
import { syncPushTokenToProfile } from './src/lib/pushRegistration';
import { startInboxRealtime } from './src/lib/messages';
import {
  establishSessionFromResetUrl,
  isResetPasswordDeepLink,
} from './src/lib/resetPassword';
import { supabase } from './src/lib/supabase';

const Register = lazy(() => import('./screens/Register'));
const SignIn = lazy(() => import('./screens/SignIn'));
const ResetPassword = lazy(() => import('./screens/ResetPassword'));
const ProfileSetup = lazy(() => import('./screens/ProfileSetup'));
const InterestedInGate = lazy(() => import('./screens/InterestedInGate'));
const MainTabs = lazy(() => import('./screens/MainTabs'));

function ScreenFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator size="large" color={COLORS.goldDeep} />
    </View>
  );
}

function AppInner() {
  const [fontsLoaded, fontError] = useFonts(FONTS_TO_LOAD);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [screen, setScreen] = useState<
    'onboarding' | 'register' | 'signIn' | 'resetPassword' | 'profileSetup' | 'interestedInGate' | 'main'
  >('onboarding');
  const [splashDone, setSplashDone] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string | null>(null);
  const screenRef = useRef(screen);

  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);
  const appReady = fontsReady && !bootstrapping;

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
        setScreen('resetPassword');
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

        console.log('[App] startup session', {
          hasSession: !!session,
          userId: session?.user?.id ?? null,
          sessionError: sessionError?.message ?? null,
        });

        if (session?.user?.id) {
          void getAuthenticatedUserId();
          const allowed = await enforceAccountAccess();
          if (!allowed) {
            if (mounted) setScreen('onboarding');
            return;
          }
          startInboxRealtime();
        }

        await logAuthState('App.startup');

        const initial = await resolveInitialScreen();
        if (mounted && initial !== 'onboarding') {
          setScreen(initial);
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
      console.log('[App] auth state change', { event, hasSession: !!session });
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

  if (!splashDone) {
    return (
      <View style={styles.boot}>
        <StatusBar style="light" />
        <SplashVideoScreen
          bootstrapping={!appReady}
          readyToExit={appReady}
          onFinish={() => setSplashDone(true)}
        />
      </View>
    );
  }

  if (screen === 'register') {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <Register
          onBack={() => setScreen('onboarding')}
          onSignIn={() => setScreen('signIn')}
          onSuccess={() => setScreen('profileSetup')}
        />
      </Suspense>
    );
  }

  if (screen === 'signIn') {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <SignIn
          onBack={() => setScreen('register')}
          onCreateAccount={() => setScreen('register')}
          onSignedIn={(destination) => setScreen(destination)}
          onNavigateResetPassword={(resetEmail) => {
            setResetPasswordEmail(resetEmail);
            setScreen('resetPassword');
          }}
        />
      </Suspense>
    );
  }

  if (screen === 'resetPassword') {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <ResetPassword
          email={resetPasswordEmail ?? undefined}
          onBack={() => {
            setResetPasswordEmail(null);
            setScreen('signIn');
          }}
          onCreateAccount={() => {
            setResetPasswordEmail(null);
            setScreen('register');
          }}
          onSuccess={() => {
            setResetPasswordEmail(null);
            setScreen('signIn');
          }}
        />
      </Suspense>
    );
  }

  if (screen === 'profileSetup') {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <ProfileSetup onComplete={() => setScreen('interestedInGate')} />
      </Suspense>
    );
  }

  if (screen === 'interestedInGate') {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <InterestedInGate onComplete={() => setScreen('main')} />
      </Suspense>
    );
  }

  if (screen === 'main') {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <MainTabs onSignOut={() => setScreen('onboarding')} />
      </Suspense>
    );
  }

  return (
    <GenoOnboardingFlow
      lastCtaLabel="Create your profile"
      onFinish={() => setScreen('register')}
      onSignIn={() => setScreen('signIn')}
    />
  );
}

export default function App() {
  return (
    <GenoErrorBoundary>
      <AppInner />
    </GenoErrorBoundary>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
