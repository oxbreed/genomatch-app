import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoLogoCeremony, GenoPremiumChrome } from '../src/brand/graphics';
import { AuthFormCard } from '../src/components/auth';
import { COLORS, RADIUS, SHADOWS } from '../src/theme'
import { FONT_FAMILY, GLASS } from '../src/theme';
import { resolvePostSignInScreen } from '../src/lib/profiles';
import { supabase } from '../src/lib/supabase';

type SignInProps = {
  onBack: () => void;
  onCreateAccount: () => void;
  onSignedIn: (destination: 'main' | 'profileSetup') => void;
  onNavigateResetPassword: (email: string) => void;
};

export default function SignIn({
  onBack,
  onCreateAccount,
  onSignedIn,
  onNavigateResetPassword,
}: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const introOpacity = useRef(new Animated.Value(0)).current;
  const introTranslateY = useRef(new Animated.Value(18)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

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
    ]).start();
  }, [introOpacity, introTranslateY]);

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

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Please enter your email address first.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://www.genomatch.app/reset-password',
    });
    if (error) {
      setError(error.message);
      return;
    }

    Alert.alert(
      'Check your email',
      'We sent a password reset link to ' + email.trim() + '. Open it on this phone to reset your password.',
      [{ text: 'OK', onPress: () => onNavigateResetPassword(email.trim()) }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GenoPremiumChrome variant="linen" />
      <StatusBar style="dark" />
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
          <Pressable
            style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={18} color={COLORS.forestDeep} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.brandChip}>
            <Ionicons name="sparkles-outline" size={11} color={COLORS.gold} />
            <Text style={styles.brandChipText}>WELCOME BACK</Text>
          </View>

          <View style={styles.logoWrap}>
            <GenoLogoCeremony variant="auth" tone="dark" />
          </View>

          <Text style={styles.title}>Sign In to GenoMatch</Text>
          <Text style={styles.subtitle}>
            Pick up where you left off — your matches and conversations are waiting.
          </Text>
        </Animated.View>

        <AuthFormCard
          outerStyle={{
            opacity: introOpacity,
            transform: [{ translateY: introTranslateY }],
          }}
        >
              <Text style={[styles.label, styles.labelFirst]}>Email Address</Text>
              <TextInput
                style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="rgba(27, 122, 110, 0.35)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />

              <View style={styles.passwordRow}>
                <Text style={styles.label}>Password</Text>
                <Pressable onPress={() => setShowPass((prev) => !prev)} hitSlop={8}>
                  <Text style={styles.togglePassText}>{showPass ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
              <TextInput
                style={[styles.input, focusedField === 'password' && styles.inputFocused]}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor="rgba(27, 122, 110, 0.35)"
                secureTextEntry={!showPass}
                autoComplete="password"
                textContentType="password"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />

              <Pressable
                style={styles.forgotPasswordRow}
                onPress={() => void handleForgotPassword()}
                hitSlop={8}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </Pressable>

              <View style={styles.trustBox}>
                <View style={styles.trustIcon}>
                  <Ionicons name="lock-closed" size={16} color={COLORS.verified} />
                </View>
                <Text style={styles.trustText}>
                  Secure sign-in with encrypted genotype-aware matching.
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
                  <LinearGradient
                    colors={[COLORS.gold, '#E8C56A', '#C49A3A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitGradient}
                  >
                    {loading ? (
                      <View style={styles.submitContent}>
                        <ActivityIndicator color={COLORS.forestDeep} size="small" />
                        <Text style={styles.submitText}>Signing in…</Text>
                      </View>
                    ) : (
                      <Text style={styles.submitText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              <Pressable style={styles.createRow} onPress={onCreateAccount}>
                <Text style={styles.createText}>
                  New to GenoMatch? <Text style={styles.createBold}>Create account</Text>
                </Text>
              </Pressable>

              <Text style={styles.legalText}>
                By continuing you agree to our{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() => void Linking.openURL('https://genomatch.app/terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() => void Linking.openURL('https://genomatch.app/privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
        </AuthFormCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 44,
  },
  hero: {
    marginBottom: 22,
  },
  back: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: GLASS.insetBorder,
    backgroundColor: GLASS.insetFill,
    marginBottom: 18,
    ...SHADOWS.card,
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  backPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  backText: {
    color: COLORS.forestDeep,
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  brandChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(212, 168, 67, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    marginBottom: 14,
  },
  brandChipText: {
    color: '#8C6A00',
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  logoWrap: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forestDeep,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
    maxWidth: '96%',
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    color: 'rgba(13, 40, 24, 0.62)',
    fontSize: 15,
    lineHeight: 24,
    maxWidth: '96%',
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forest,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 14,
    letterSpacing: 0.15,
  },
  labelFirst: {
    marginTop: 8,
  },
  input: {
    height: 54,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 122, 110, 0.16)',
    backgroundColor: GLASS.insetFill,
    paddingHorizontal: 14,
    color: COLORS.forestDeep,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: 'rgba(212, 168, 67, 0.65)',
    ...SHADOWS.card,
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  passwordRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  togglePassText: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forest,
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.8,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: '#8C6A00',
    fontSize: 13,
    letterSpacing: 0.1,
  },
  trustBox: {
    marginTop: 16,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(61, 122, 82, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.14)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  trustIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(61, 122, 82, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    color: COLORS.forest,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    marginTop: 12,
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.error,
    fontSize: 13,
  },
  submitBtn: {
    marginTop: 20,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    ...SHADOWS.button,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.28,
  },
  submitBtnDisabled: {
    opacity: 0.72,
  },
  submitGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitText: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forestDeep,
    fontSize: 17,
    letterSpacing: 0.1,
  },
  createRow: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  createText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    color: 'rgba(27, 122, 110, 0.65)',
    fontSize: 14,
  },
  createBold: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forest,
  },
  legalText: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.gothamMedium,
    color: 'rgba(27, 122, 110, 0.55)',
    fontSize: 12,
    lineHeight: 18,
    paddingBottom: 4,
  },
  legalLink: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forest,
    textDecorationLine: 'underline',
  },
});
