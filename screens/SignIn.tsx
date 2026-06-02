import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { resolvePostSignInScreen } from '../src/lib/profiles';
import { supabase } from '../src/lib/supabase';

const COLORS = {
  teal: '#1B7A6E',
  gold: '#C9872B',
  ivory: '#FAFAF7',
  white: '#FFFFFF',
};

type SignInProps = {
  onBack: () => void;
  onCreateAccount: () => void;
  onSignedIn: (destination: 'main' | 'profileSetup') => void;
};

export default function SignIn({ onBack, onCreateAccount, onSignedIn }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const introOpacity = useRef(new Animated.Value(0)).current;
  const introTranslateY = useRef(new Animated.Value(18)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const logoPulse = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(introTranslateY, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoPulse, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [introOpacity, introTranslateY, logoPulse]);

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!data.session) {
        setError('Sign in failed. Please try again.');
        return;
      }

      console.log('[SignIn] session active', { userId: data.user.id });

      const destination = await resolvePostSignInScreen();
      console.log('[SignIn] routing →', destination);
      onSignedIn(destination);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: introOpacity,
              transform: [{ translateY: introTranslateY }],
            },
          ]}
        >
          <Pressable style={styles.back} onPress={onBack}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.brandChip}>
            <Text style={styles.brandChipText}>WELCOME BACK</Text>
          </View>
          <Animated.View style={[styles.logoOrb, { transform: [{ scale: logoPulse }] }]}>
            <Text style={styles.logoEmoji}>🧬</Text>
          </Animated.View>
          <Text style={styles.title}>Sign In to GenoMatch</Text>
          <Text style={styles.subtitle}>
            Pick up where you left off — your matches and conversations are waiting.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: introOpacity,
              transform: [{ translateY: introTranslateY }],
            },
          ]}
        >
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="rgba(27, 122, 110, 0.35)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <View style={styles.passwordRow}>
            <Text style={styles.label}>Password</Text>
            <Pressable onPress={() => setShowPass((prev) => !prev)}>
              <Text style={styles.togglePassText}>{showPass ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor="rgba(27, 122, 110, 0.35)"
            secureTextEntry={!showPass}
            autoComplete="password"
            textContentType="password"
          />

          <View style={styles.trustBox}>
            <Text style={styles.trustText}>
              🔒 Secure sign-in with encrypted genotype-aware matching.
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <Pressable
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPressIn={onCtaPressIn}
              onPressOut={onCtaPressOut}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.submitContent}>
                  <ActivityIndicator color={COLORS.white} size="small" />
                  <Text style={styles.submitText}>Signing in...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Sign In</Text>
              )}
            </Pressable>
          </Animated.View>

          <Pressable style={styles.createRow} onPress={onCreateAccount}>
            <Text style={styles.createText}>
              New to GenoMatch? <Text style={styles.createBold}>Create account</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.teal,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 20,
  },
  back: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(250, 250, 247, 0.26)',
    backgroundColor: 'rgba(250, 250, 247, 0.07)',
    marginBottom: 18,
  },
  backText: {
    color: COLORS.ivory,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  brandChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 135, 43, 0.22)',
    marginBottom: 16,
  },
  brandChipText: {
    color: COLORS.gold,
    fontSize: 11,
    letterSpacing: 1.1,
    fontWeight: '800',
  },
  logoOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(250, 250, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 250, 247, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 34,
  },
  title: {
    color: COLORS.ivory,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -0.7,
    fontWeight: '800',
    marginBottom: 10,
    maxWidth: '95%',
  },
  subtitle: {
    color: 'rgba(250, 250, 247, 0.76)',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    maxWidth: '96%',
  },
  formCard: {
    backgroundColor: COLORS.ivory,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  label: {
    color: COLORS.teal,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 14,
    letterSpacing: 0.2,
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 122, 110, 0.18)',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    color: '#1D2B23',
    fontSize: 16,
    fontWeight: '500',
  },
  passwordRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  togglePassText: {
    color: COLORS.teal,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    opacity: 0.75,
  },
  trustBox: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(27, 122, 110, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(27, 122, 110, 0.14)',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  trustText: {
    color: COLORS.teal,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  error: {
    marginTop: 12,
    color: '#A32D2D',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 18,
    height: 56,
    borderRadius: 15,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.72,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  createRow: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  createText: {
    color: 'rgba(27, 122, 110, 0.65)',
    fontSize: 14,
    fontWeight: '500',
  },
  createBold: {
    color: COLORS.teal,
    fontWeight: '800',
  },
});
