import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import type { ComponentProps } from 'react';
import * as Haptics from 'expo-haptics';
import { GenoLogoCeremony, GenoPremiumChrome, GENO_VISUAL } from '../src/brand/graphics';
import { COLORS, RADIUS, SHADOWS } from '../src/theme';
import { supabase } from '../src/lib/supabase';
import { validateEmail } from '../src/lib/validation';

type IonName = ComponentProps<typeof Ionicons>['name'];

const GENOTYPES: { id: string; icon: IonName; name: string; accent: string }[] = [
  { id: 'AA', icon: 'heart', name: 'Double Healthy', accent: COLORS.forest },
  { id: 'AS', icon: 'star-half', name: 'Carrier', accent: '#BA7517' },
  { id: 'SS', icon: 'medical', name: 'Sickle Cell', accent: COLORS.error },
  { id: 'AC', icon: 'water', name: 'AC Carrier', accent: '#185FA5' },
];

export default function Register({
  onBack,
  onSignIn,
  onSuccess,
}: {
  onBack: () => void;
  onSignIn: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [genotype, setGenotype] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const introOpacity = useRef(new Animated.Value(0)).current;
  const introTranslateY = useRef(new Animated.Value(18)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const pickerPulse = useRef(new Animated.Value(0.95)).current;
  const cardScales = useRef(GENOTYPES.map(() => new Animated.Value(1))).current;

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
      Animated.timing(pickerPulse, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [introOpacity, introTranslateY, pickerPulse]);

  useEffect(() => {
    GENOTYPES.forEach((item, index) => {
      Animated.spring(cardScales[index], {
        toValue: genotype === item.id ? 1.03 : 1,
        friction: 8,
        tension: 160,
        useNativeDriver: true,
      }).start();
    });
  }, [cardScales, genotype]);

  const handleRegister = async () => {
    if (successMessage) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password || !genotype) {
      setError('Please fill in all fields and select your genotype.');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { genotype },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!data.user) {
        setError('Sign up failed. Please try again.');
        return;
      }

      if (data.session) {
        console.log('[Register] signUp session active', { userId: data.user.id });
        onSuccess();
        return;
      }

      console.log('[Register] signUp — email confirmation required, no session yet');
      setSuccessMessage(
        'Check your email to verify your account, then sign in to continue.'
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedGenotype = useMemo(
    () => GENOTYPES.find((item) => item.id === genotype),
    [genotype]
  );

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

  const selectGenotype = (id: string) => {
    void Haptics.selectionAsync();
    setGenotype(id);
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
            <Ionicons name="diamond-outline" size={11} color={COLORS.gold} />
            <Text style={styles.brandChipText}>PREMIUM ACCESS</Text>
          </View>

          <View style={styles.logoWrap}>
            <GenoLogoCeremony variant="auth" tone="dark" />
          </View>

          <Text style={styles.title}>Create Your GenoMatch Account</Text>
          <Text style={styles.subtitle}>
            Join intentional singles across West Africa with secure genotype-aware matching.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.formCardOuter,
            {
              opacity: introOpacity,
              transform: [{ translateY: introTranslateY }],
            },
          ]}
        >
          <LinearGradient
            colors={GENO_VISUAL.chrome.cardBorder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formCardBorder}
          >
            <View style={styles.formCard}>
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
                placeholder="At least 8 characters"
                placeholderTextColor="rgba(27, 122, 110, 0.35)"
                secureTextEntry={!showPass}
                autoComplete="new-password"
                textContentType="newPassword"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />

              <View style={styles.genotypeHeader}>
                <Text style={styles.label}>Select Your Genotype</Text>
                <View style={styles.requiredPill}>
                  <Text style={styles.requiredPillText}>Required</Text>
                </View>
              </View>

              <Animated.View style={[styles.genoGrid, { transform: [{ scale: pickerPulse }] }]}>
                {GENOTYPES.map((item, index) => {
                  const isSelected = genotype === item.id;
                  return (
                    <Animated.View
                      key={item.id}
                      style={[styles.genoCardWrap, { transform: [{ scale: cardScales[index] }] }]}
                    >
                      <Pressable
                        onPress={() => selectGenotype(item.id)}
                        style={({ pressed }) => [
                          styles.genoCard,
                          isSelected && styles.genoCardSelected,
                          isSelected && { borderColor: item.accent },
                          pressed && styles.genoCardPressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.genoIconBubble,
                            isSelected && { backgroundColor: `${item.accent}18` },
                          ]}
                        >
                          <Ionicons
                            name={item.icon}
                            size={22}
                            color={isSelected ? item.accent : COLORS.forest}
                          />
                        </View>
                        <Text style={[styles.genoId, isSelected && { color: item.accent }]}>
                          {item.id}
                        </Text>
                        <Text style={styles.genoName}>{item.name}</Text>
                        {isSelected ? (
                          <View style={[styles.selectedBadge, { backgroundColor: item.accent }]}>
                            <Ionicons name="checkmark" size={10} color={COLORS.white} />
                            <Text style={styles.selectedBadgeText}>Selected</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </Animated.View>

              <View style={styles.privacyBox}>
                <View style={styles.privacyIcon}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.verified} />
                </View>
                <Text style={styles.privacyText}>
                  Your genotype is kept private, secured, and only used for compatibility intelligence.
                </Text>
              </View>

              {selectedGenotype ? (
                <Text style={styles.selectionHint}>
                  You selected{' '}
                  <Text style={{ color: selectedGenotype.accent, fontFamily: 'Satoshi-Bold' }}>
                    {selectedGenotype.id}
                  </Text>
                  {' — '}
                  {selectedGenotype.name}
                </Text>
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {successMessage ? (
                <View style={styles.successBox}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.verified} />
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              ) : null}

              <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                <Pressable
                  style={[
                    styles.submitBtn,
                    (loading || !!successMessage) && styles.submitBtnDisabled,
                  ]}
                  onPressIn={onCtaPressIn}
                  onPressOut={onCtaPressOut}
                  onPress={handleRegister}
                  disabled={loading || !!successMessage}
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
                        <Text style={styles.submitText}>Creating account…</Text>
                      </View>
                    ) : (
                      <Text style={styles.submitText}>
                        {successMessage ? 'Account created' : 'Create Account'}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              <Pressable style={styles.signInRow} onPress={onSignIn}>
                <Text style={styles.signInText}>
                  Already have an account? <Text style={styles.signInBold}>Sign In</Text>
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
            </View>
          </LinearGradient>
        </Animated.View>
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
    borderColor: 'rgba(13, 40, 24, 0.1)',
    backgroundColor: COLORS.white,
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
    fontFamily: 'Satoshi-Bold',
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
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 1.6,
  },
  logoWrap: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    color: COLORS.forestDeep,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
    maxWidth: '96%',
  },
  subtitle: {
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(13, 40, 24, 0.62)',
    fontSize: 15,
    lineHeight: 24,
    maxWidth: '96%',
  },
  formCardOuter: {
    width: '100%',
  },
  formCardBorder: {
    borderRadius: RADIUS.xl,
    padding: 1.5,
    ...SHADOWS.cardElevated,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.12,
  },
  formCard: {
    backgroundColor: COLORS.ivory,
    borderRadius: RADIUS.xl - 1.5,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 22,
  },
  label: {
    fontFamily: 'Satoshi-Bold',
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
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    color: COLORS.forestDeep,
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
  },
  inputFocused: {
    borderColor: 'rgba(212, 168, 67, 0.65)',
    backgroundColor: COLORS.white,
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
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forest,
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.8,
  },
  genotypeHeader: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requiredPill: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(212, 168, 67, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.3)',
  },
  requiredPillText: {
    fontFamily: 'Satoshi-Bold',
    color: '#8C6A00',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  genoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 0,
  },
  genoCardWrap: {
    width: '48.2%',
    marginBottom: 12,
  },
  genoCard: {
    minHeight: 128,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 122, 110, 0.12)',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  genoCardSelected: {
    backgroundColor: '#FAFCFB',
    borderWidth: 2,
    ...SHADOWS.cardElevated,
    shadowOpacity: 0.1,
  },
  genoCardPressed: {
    opacity: 0.92,
  },
  genoIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(27, 122, 110, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  genoId: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 22,
    color: COLORS.forestDeep,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  genoName: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: 'rgba(27, 122, 110, 0.58)',
    textAlign: 'center',
  },
  selectedBadge: {
    marginTop: 8,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  selectedBadgeText: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.white,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  privacyBox: {
    marginTop: 8,
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
  privacyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(61, 122, 82, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    flex: 1,
    fontFamily: 'Satoshi-Medium',
    color: COLORS.forest,
    fontSize: 12,
    lineHeight: 18,
  },
  selectionHint: {
    marginTop: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(27, 122, 110, 0.7)',
    fontSize: 12,
  },
  error: {
    marginTop: 12,
    fontFamily: 'Satoshi-Bold',
    color: COLORS.error,
    fontSize: 13,
  },
  successBox: {
    marginTop: 12,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(61, 122, 82, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.22)',
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  successText: {
    flex: 1,
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forest,
    fontSize: 14,
    lineHeight: 21,
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
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forestDeep,
    fontSize: 17,
    letterSpacing: 0.1,
  },
  signInRow: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  signInText: {
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(27, 122, 110, 0.65)',
    fontSize: 14,
  },
  signInBold: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forest,
  },
  legalText: {
    textAlign: 'center',
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(27, 122, 110, 0.55)',
    fontSize: 12,
    lineHeight: 18,
    paddingBottom: 4,
  },
  legalLink: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forest,
    textDecorationLine: 'underline',
  },
});
