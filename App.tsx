import { useEffect, useRef, useState } from 'react';
import { Linking, View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FONTS_TO_LOAD } from './src/theme';
import { GenoOnboardingFlow, GenoSplashScreen } from './src/components/onboarding';
import type { GenoOnboardingSlide } from './src/components/onboarding';
import Register from './screens/Register';
import SignIn from './screens/SignIn';
import ResetPassword from './screens/ResetPassword';
import ProfileSetup from './screens/ProfileSetup';
import MainTabs from './screens/MainTabs';
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

type IonName = ComponentProps<typeof Ionicons>['name'];

const ONBOARDING_SLIDES: GenoOnboardingSlide[] = [
  {
    icon: 'git-network-outline' as IonName,
    title: 'Science-led compatibility',
    subtitle: 'GENOTYPE-AWARE MATCHING',
    body:
      'Meet people with confidence through thoughtful genotype compatibility — built for intentional singles across Nigeria and West Africa.',
  },
  {
    icon: 'heart-outline' as IonName,
    title: 'Profiles that feel human',
    subtitle: 'DEEPER SIGNALS, BETTER DATES',
    body:
      'Every profile blends emotional style, communication rhythm, and long-term intent so connections feel meaningful from day one.',
  },
  {
    icon: 'sparkles-outline' as IonName,
    title: 'Premium journey to forever',
    subtitle: 'TRUSTED BY INTENTIONAL SINGLES',
    body:
      'From first match to first message, guided prompts and shared milestones help you build chemistry with clarity.',
  },
];

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONTS_TO_LOAD);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [screen, setScreen] = useState<
    'onboarding' | 'register' | 'signIn' | 'resetPassword' | 'profileSetup' | 'main'
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
        if (current === 'main' || current === 'profileSetup') {
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
        <GenoSplashScreen
          bootstrapping={!appReady}
          readyToExit={appReady}
          onFinish={() => setSplashDone(true)}
        />
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
        onNavigateResetPassword={(resetEmail) => {
          setResetPasswordEmail(resetEmail);
          setScreen('resetPassword');
        }}
      />
    );
  }

  if (screen === 'resetPassword') {
    return (
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
    );
  }

  if (screen === 'profileSetup') {
    return <ProfileSetup onComplete={() => setScreen('main')} />;
  }

  if (screen === 'main') {
    return <MainTabs onSignOut={() => setScreen('onboarding')} />;
  }

  return (
    <GenoOnboardingFlow
      slides={ONBOARDING_SLIDES}
      lastCtaLabel="Create your profile"
      onFinish={() => setScreen('register')}
    />
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1 },
});
