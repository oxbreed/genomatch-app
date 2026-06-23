import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { Ionicons } from '@expo/vector-icons';
import { GenoLogoCeremony, GenoPremiumChrome } from '../src/brand/graphics';
import { AuthFormCard } from '../src/components/auth';
import { COLORS, RADIUS, SHADOWS } from '../src/theme';
import { FONT_FAMILY, GLASS } from '../src/theme';
import {
  isRecoveryTokenExpiredMessage,
  sendPasswordResetEmail,
} from '../src/lib/resetPassword';
import { supabase } from '../src/lib/supabase';

const RESEND_COOLDOWN_SECONDS = 60;

type ResetPasswordProps = {
  email?: string;
  onBack: () => void;
  onCreateAccount: () => void;
  onSuccess: () => void;
};

export default function ResetPassword({
  email,
  onBack,
  onCreateAccount,
  onSuccess,
}: ResetPasswordProps) {
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  const introOpacity = useRef(new Animated.Value(1)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  const requiresOtp = Boolean(email?.trim());

  useEffect(() => {
    if (requiresOtp) return;

    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        setSessionExpired(true);
        setError('Your reset link has expired. Go back to sign in and request a new code.');
      }
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted || requiresOtp) return;
      if (!session) {
        setSessionExpired(true);
        setError('Your reset session expired. Go back to sign in and request a new code.');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [requiresOtp]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const handleResendCode = async () => {
    if (!email?.trim() || resendCooldown > 0 || resending) return;

    setResending(true);
    setError('');

    try {
      const { error: resendError } = await sendPasswordResetEmail(email);

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setOtpCode('');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert(
        'New code sent',
        `We sent a fresh 6-digit code to ${email}. Enter it below along with your new password.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    if (sessionExpired && !requiresOtp) {
      setError('Your reset link has expired. Go back to sign in and request a new code.');
      return;
    }

    if (requiresOtp) {
      const trimmedOtp = otpCode.trim();
      if (!trimmedOtp || trimmedOtp.length !== 6) {
        setError('Please enter the 6-digit code from your email.');
        return;
      }
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (requiresOtp && email) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otpCode.trim(),
          type: 'recovery',
        });

        if (verifyError) {
          const message = verifyError.message;
          if (isRecoveryTokenExpiredMessage(message)) {
            setError(`${message} Tap "Resend code" below to get a new one.`);
          } else {
            setError(message);
          }
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        const message = updateError.message;
        if (isRecoveryTokenExpiredMessage(message)) {
          setError(`${message} Go back to sign in and request a new reset code.`);
          setSessionExpired(true);
        } else {
          setError(message);
        }
        return;
      }

      await supabase.auth.signOut();

      Alert.alert('Password updated successfully! Please sign in.', '', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Animated.View style={[styles.hero, { opacity: introOpacity }]}>
          <Pressable
            style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back to sign in"
          >
            <Ionicons name="chevron-back" size={18} color={COLORS.forestDeep} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.logoWrap}>
            <GenoLogoCeremony variant="auth" tone="dark" />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {requiresOtp
              ? `Enter the 6-digit code we sent to ${email}, then choose a new password. You can also open the reset link from your email on this device.`
              : 'Choose a new password for your GenoMatch account.'}
          </Text>
        </Animated.View>

        <AuthFormCard outerStyle={{ opacity: introOpacity }}>
          {requiresOtp ? (
            <>
              <Text style={styles.label}>6-Digit Code</Text>
              <TextInput
                style={styles.otpInput}
                value={otpCode}
                onChangeText={(text) => setOtpCode(text.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                placeholderTextColor="rgba(27, 122, 110, 0.35)"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
              />
              <Pressable
                style={styles.resendRow}
                onPress={() => void handleResendCode()}
                disabled={resending || resendCooldown > 0}
                hitSlop={8}
              >
                {resending ? (
                  <ActivityIndicator color={COLORS.forest} size="small" />
                ) : (
                  <Text
                    style={[
                      styles.resendText,
                      resendCooldown > 0 && styles.resendTextDisabled,
                    ]}
                  >
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : 'Resend code'}
                  </Text>
                )}
              </Pressable>
            </>
          ) : null}

          <Text style={styles.hint}>Password must be at least 8 characters</Text>

          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordRow}>
            <View style={styles.passwordLabelSpacer} />
            <Pressable onPress={() => setShowPass((prev) => !prev)}>
              <Text style={styles.togglePassText}>{showPass ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor="rgba(27, 122, 110, 0.35)"
            secureTextEntry={!showPass}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!sessionExpired || requiresOtp}
          />

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordRow}>
            <View style={styles.passwordLabelSpacer} />
            <Pressable onPress={() => setShowConfirmPass((prev) => !prev)}>
              <Text style={styles.togglePassText}>{showConfirmPass ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            placeholderTextColor="rgba(27, 122, 110, 0.35)"
            secureTextEntry={!showConfirmPass}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!sessionExpired || requiresOtp}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <Pressable
              style={[styles.submitBtn, (loading || sessionExpired) && styles.submitBtnDisabled]}
              onPressIn={onCtaPressIn}
              onPressOut={onCtaPressOut}
              onPress={() => void handleSubmit()}
              disabled={loading || (sessionExpired && !requiresOtp)}
            >
              {loading ? (
                <View style={styles.submitContent}>
                  <ActivityIndicator color={COLORS.forest} size="small" />
                  <Text style={styles.submitText}>Updating…</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </Pressable>
          </Animated.View>

          <Pressable style={styles.createRow} onPress={onCreateAccount}>
            <Text style={styles.createText}>
              New to GenoMatch? <Text style={styles.createBold}>Create account</Text>
            </Text>
          </Pressable>
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
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 20,
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
  logoWrap: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forestDeep,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -0.7,
    marginBottom: 10,
    maxWidth: '95%',
  },
  subtitle: {
    color: 'rgba(27, 122, 110, 0.72)',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    maxWidth: '96%',
  },
  hint: {
    color: 'rgba(27, 122, 110, 0.65)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 4,
  },
  label: {
    color: COLORS.forest,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 14,
    letterSpacing: 0.2,
  },
  otpInput: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 122, 110, 0.18)',
    backgroundColor: GLASS.insetFill,
    paddingHorizontal: 14,
    color: '#1D2B23',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
  },
  resendRow: {
    alignSelf: 'flex-end',
    marginTop: 10,
    minHeight: 28,
    justifyContent: 'center',
  },
  resendText: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: '#8C6A00',
    fontSize: 13,
    letterSpacing: 0.1,
  },
  resendTextDisabled: {
    color: 'rgba(27, 122, 110, 0.45)',
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 122, 110, 0.18)',
    backgroundColor: GLASS.insetFill,
    paddingHorizontal: 14,
    color: '#1D2B23',
    fontSize: 16,
    fontWeight: '500',
  },
  passwordRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  passwordLabelSpacer: {
    flex: 1,
  },
  togglePassText: {
    color: COLORS.forest,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    opacity: 0.75,
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
    color: COLORS.forest,
    fontSize: 17,
    fontWeight: '700',
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
});
