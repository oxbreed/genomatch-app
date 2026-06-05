import { useEffect, useState } from 'react';
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
import { logAuthState } from './src/lib/auth';
import { registerForPushNotifications } from './src/lib/notifications';
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
  const [fontsLoaded] = useFonts(FONTS_TO_LOAD);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [screen, setScreen] = useState<
    'onboarding' | 'register' | 'signIn' | 'resetPassword' | 'profileSetup' | 'main'
  >('onboarding');
  const [splashDone, setSplashDone] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const isResetPasswordDeepLink = (url: string) =>
      url.includes('genomatch://reset-password') || url.includes('genomatch.app/reset-password');

    const extractResetTokens = (url: string) => {
      const hashStart = url.indexOf('#');
      const hash = hashStart >= 0 ? url.slice(hashStart + 1) : '';
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      if (!access_token) return null;
      return {
        access_token,
        refresh_token: params.get('refresh_token') ?? '',
      };
    };

    const handleResetPasswordUrl = async (url: string | null): Promise<boolean> => {
      if (!url || !isResetPasswordDeepLink(url)) return false;

      const tokens = extractResetTokens(url);
      if (!tokens) return false;

      const { error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      if (error) {
        console.error('[App] reset password deep link failed', error.message);
        return false;
      }

      if (mounted) {
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

        await logAuthState('App.startup');
        await registerForPushNotifications();

        const initial = await resolveInitialScreen();
        if (mounted && initial !== 'onboarding') {
          setScreen(initial);
        }
      } catch (err) {
        console.error('[App] bootstrap failed', err);
      } finally {
        if (mounted) setBootstrapping(false);
      }
    })();

    const linkSubscription = Linking.addEventListener('url', (event) => {
      void handleResetPasswordUrl(event.url);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[App] auth state change', { event, hasSession: !!session });
      if (!session) {
        setScreen('onboarding');
      }
    });

    return () => {
      mounted = false;
      linkSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded || !splashDone || bootstrapping) {
    return (
      <View style={styles.boot}>
        <StatusBar style="light" />
        <GenoSplashScreen bootstrapping={bootstrapping} onFinish={() => setSplashDone(true)} />
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
