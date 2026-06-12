import { useRef, useState } from 'react';
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
import { GenoLogoCeremony, GenoPremiumChrome } from '../src/brand/graphics';
import { AuthFormCard } from '../src/components/auth';
import { COLORS } from '../src/theme'
import { FONT_FAMILY, GLASS } from '../src/theme';
import { supabase } from '../src/lib/supabase';

type ResetPasswordProps = {
  email?: string;
  onSuccess: () => void;
};

export default function ResetPassword({ email, onSuccess }: ResetPasswordProps) {
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const introOpacity = useRef(new Animated.Value(1)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  const requiresOtp = Boolean(email?.trim());

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

  const handleSubmit = async () => {
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
          setError(verifyError.message);
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
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
          <View style={styles.logoWrap}>
            <GenoLogoCeremony variant="auth" tone="dark" />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {requiresOtp
              ? `Enter the 6-digit code we sent to ${email}, then choose a new password.`
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
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <Pressable
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPressIn={onCtaPressIn}
              onPressOut={onCtaPressOut}
              onPress={() => void handleSubmit()}
              disabled={loading}
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
    paddingTop: 58,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 20,
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
});
