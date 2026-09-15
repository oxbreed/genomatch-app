import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { GenoLogoCeremony, GenoMirrorBrandCtaFill, GenoMirrorGoldFill, GenoMirrorMetallicIcon, GenoMirrorRimFrame, GenoMirrorSteelFill, GenoGlassSurface, GenoPremiumChrome } from '../src/brand/graphics';
import { AuthFormCard } from '../src/components/auth';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import {COLORS, FONT_FAMILY, GLASS, LOGO_GOLD, RADIUS, chromeAlpha, goldAlpha} from '../src/theme';
import { resolvePostSignInScreen } from '../src/lib/profiles';
import { sendPasswordResetEmail } from '../src/lib/resetPassword';
import { enforceAccountAccess, formatSecurityError } from '../src/lib/security';
import { supabase } from '../src/lib/supabase';

type SignInProps = {
  onBack: () => void;
  onCreateAccount: () => void;
  onSignedIn: (destination: 'main' | 'profileSetup' | 'interestedInGate') => void;
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
  const [legalDoc, setLegalDoc] = useState<'privacy' | 'terms' | null>(null);

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
        setError(formatSecurityError(signInError, signInError.message));
        return;
      }

      if (!data.session) {
        setError('Sign in failed. Please try again.');
        return;
      }

      const allowed = await enforceAccountAccess();
      if (!allowed) {
        setError('This account has been suspended or banned.');
        return;
      }

      console.log('[SignIn] session active', { userId: data.user.id });

      const destination = await resolvePostSignInScreen();
      console.log('[SignIn] routing →', destination);
      onSignedIn(destination);
    } catch (err) {
      const message = formatSecurityError(
        err,
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
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

    const { error } = await sendPasswordResetEmail(trimmedEmail);
    if (error) {
      setError(error.message);
      return;
    }

    Alert.alert(
      'Check your email',
      `We sent a 6-digit code and reset link to ${trimmedEmail}. Enter the code on the next screen, or open the link on this device.`,
      [{ text: 'OK', onPress: () => onNavigateResetPassword(trimmedEmail) }]
    );
  };

  if (legalDoc === 'privacy') {
    return <PrivacyPolicy onBack={() => setLegalDoc(null)} />;
  }
  if (legalDoc === 'terms') {
    return <TermsOfService onBack={() => setLegalDoc(null)} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GenoPremiumChrome variant="forest" />
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
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [pressed && styles.backPressed]}
          >
            <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.pill} style={styles.back}>
              <GenoMirrorSteelFill style={styles.backInner}>
                <GenoMirrorMetallicIcon name="chevron-back" size={18} tone="steel" />
                <Text style={styles.backText}>Back</Text>
              </GenoMirrorSteelFill>
            </GenoMirrorRimFrame>
          </Pressable>

          <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.pill} style={styles.brandChip}>
            <GenoMirrorGoldFill style={styles.brandChipInner}>
              <GenoMirrorMetallicIcon name="sparkles" size={12} tone="gold" />
              <Text style={styles.brandChipText}>WELCOME BACK</Text>
            </GenoMirrorGoldFill>
          </GenoMirrorRimFrame>

          <GenoMirrorRimFrame kind="gold" borderRadius={28} padding={2} style={styles.logoMirror}>
            <GenoMirrorSteelFill style={styles.logoDisc}>
              <GenoLogoCeremony variant="auth" tone="dark" />
            </GenoMirrorSteelFill>
          </GenoMirrorRimFrame>

          <Text style={styles.title}>Sign in to GenoMatch</Text>
          <Text style={styles.subtitle}>
            Pick up where you left off — your matches and conversations are waiting.
          </Text>
        </Animated.View>

        <AuthFormCard
          mirror
          outerStyle={{
            opacity: introOpacity,
            transform: [{ translateY: introTranslateY }],
          }}
        >
              <Text style={[styles.label, styles.labelFirst]}>Email Address</Text>
              <GenoMirrorRimFrame
                kind={focusedField === 'email' ? 'gold' : 'steel'}
                borderRadius={RADIUS.md}
                style={styles.inputRim}
              >
                <View style={styles.inputShell}>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={goldAlpha(0.35)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </GenoMirrorRimFrame>

              <View style={styles.passwordRow}>
                <Text style={styles.label}>Password</Text>
                <Pressable onPress={() => setShowPass((prev) => !prev)} hitSlop={8}>
                  <Text style={styles.togglePassText}>{showPass ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
              <GenoMirrorRimFrame
                kind={focusedField === 'password' ? 'gold' : 'steel'}
                borderRadius={RADIUS.md}
                style={styles.inputRim}
              >
                <View style={styles.inputShell}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor={goldAlpha(0.35)}
                    secureTextEntry={!showPass}
                    autoComplete="password"
                    textContentType="password"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </GenoMirrorRimFrame>

              <Pressable
                style={styles.forgotPasswordRow}
                onPress={() => void handleForgotPassword()}
                hitSlop={8}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </Pressable>

              <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.md} style={styles.trustBox}>
                <GenoGlassSurface
                  variant="dark"
                  borderRadius={RADIUS.md - 1.5}
                  showBorder={false}
                  showSheen
                  shadow="none"
                  intensity={28}
                  contentStyle={styles.trustInner}
                >
                  <GenoMirrorMetallicIcon name="lock-closed" size={16} tone="gold" />
                  <Text style={styles.trustText}>
                    Secure sign-in with encrypted genotype-aware matching.
                  </Text>
                </GenoGlassSurface>
              </GenoMirrorRimFrame>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                <Pressable
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  onPressIn={onCtaPressIn}
                  onPressOut={onCtaPressOut}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  <GenoMirrorRimFrame kind="red" borderRadius={RADIUS.pill} style={styles.submitRim}>
                    <GenoMirrorBrandCtaFill style={styles.submitGradient}>
                      {loading ? (
                        <View style={styles.submitContent}>
                          <ActivityIndicator color={COLORS.white} size="small" />
                          <Text style={styles.submitText}>Signing in…</Text>
                        </View>
                      ) : (
                        <Text style={styles.submitText}>Sign In</Text>
                      )}
                    </GenoMirrorBrandCtaFill>
                  </GenoMirrorRimFrame>
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
                  onPress={() => setLegalDoc('terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() => setLegalDoc('privacy')}
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
    backgroundColor: COLORS.background,
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
    marginBottom: 18,
  },
  backInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  backPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  backText: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  brandChip: {
    marginBottom: 14,
  },
  brandChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
  },
  brandChipText: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  logoMirror: {
    marginBottom: 16,
  },
  logoDisc: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 26,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
    maxWidth: '96%',
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: '96%',
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: LOGO_GOLD,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 14,
    letterSpacing: 0.15,
  },
  labelFirst: {
    marginTop: 8,
  },
  inputRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  inputShell: {
    backgroundColor: GLASS.insetFill,
    borderRadius: RADIUS.md - 1.5,
    overflow: 'hidden',
  },
  input: {
    height: 52,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
  },
  passwordRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  togglePassText: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: LOGO_GOLD,
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.9,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: LOGO_GOLD,
    fontSize: 13,
    letterSpacing: 0.1,
  },
  trustBox: {
    marginTop: 16,
    alignSelf: 'stretch',
    width: '100%',
  },
  trustInner: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  trustText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    color: COLORS.textMuted,
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
  },
  submitRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  submitBtnDisabled: {
    opacity: 0.72,
  },
  submitGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: RADIUS.pill,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitText: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.white,
    fontSize: 17,
    letterSpacing: 0.1,
  },
  createRow: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  createText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    color: chromeAlpha(0.65),
    fontSize: 14,
  },
  createBold: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: LOGO_GOLD,
  },
  legalText: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.gothamMedium,
    color: goldAlpha(0.55),
    fontSize: 12,
    lineHeight: 18,
    paddingBottom: 4,
  },
  legalLink: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: LOGO_GOLD,
    textDecorationLine: 'underline',
  },
});
