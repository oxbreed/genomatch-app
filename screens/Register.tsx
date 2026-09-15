import { useEffect, useMemo, useRef, useState } from 'react';
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
import * as Haptics from 'expo-haptics';
import {
  GenoGlassSurface,
  GenoLogoCeremony,
  GenoMirrorBrandCtaFill,
  GenoMirrorGoldFill,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
  GenoPremiumChrome,
} from '../src/brand/graphics';
import { AuthFormCard } from '../src/components/auth';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import { COLORS, FONT_FAMILY, GLASS, LOGO_GOLD, RADIUS, chromeAlpha, goldAlpha } from '../src/theme';
import { formatSecurityError } from '../src/lib/security';
import { supabase } from '../src/lib/supabase';
import { validateEmail } from '../src/lib/validation';
import { GENOTYPE_SELF_REPORT_DISCLAIMER } from '../src/constants/healthDisclaimers';
import { AUTH_GENOTYPE_OPTIONS } from '../src/constants/authGenotypes';

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
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [legalDoc, setLegalDoc] = useState<'privacy' | 'terms' | null>(null);

  const introOpacity = useRef(new Animated.Value(0)).current;
  const introTranslateY = useRef(new Animated.Value(18)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const pickerPulse = useRef(new Animated.Value(0.95)).current;
  const cardScales = useRef(AUTH_GENOTYPE_OPTIONS.map(() => new Animated.Value(1))).current;

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
    AUTH_GENOTYPE_OPTIONS.forEach((item, index) => {
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
    if (!ageConfirmed) {
      setError('You must confirm that you are at least 18 years old.');
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
        setError(formatSecurityError(signUpError, signUpError.message));
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
    () => AUTH_GENOTYPE_OPTIONS.find((item) => item.id === genotype),
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
              <GenoMirrorMetallicIcon name="diamond" size={12} tone="gold" />
              <Text style={styles.brandChipText}>CREATE ACCOUNT</Text>
            </GenoMirrorGoldFill>
          </GenoMirrorRimFrame>

          <GenoMirrorRimFrame kind="gold" borderRadius={28} padding={2} style={styles.logoMirror}>
            <GenoMirrorSteelFill style={styles.logoDisc}>
              <GenoLogoCeremony variant="auth" tone="dark" />
            </GenoMirrorSteelFill>
          </GenoMirrorRimFrame>

          <Text style={styles.title}>Create Your GenoMatch Account</Text>
          <Text style={styles.subtitle}>
            Join intentional singles across West Africa with secure genotype-aware matching.
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
                    placeholder="At least 8 characters"
                    placeholderTextColor={goldAlpha(0.35)}
                    secureTextEntry={!showPass}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </GenoMirrorRimFrame>

              <View style={styles.genotypeHeader}>
                <Text style={styles.label}>Select Your Genotype</Text>
                <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.pill} style={styles.requiredPill}>
                  <GenoMirrorGoldFill style={styles.requiredPillInner}>
                    <Text style={styles.requiredPillText}>Required</Text>
                  </GenoMirrorGoldFill>
                </GenoMirrorRimFrame>
              </View>

              <Animated.View style={[styles.genoGrid, { transform: [{ scale: pickerPulse }] }]}>
                {AUTH_GENOTYPE_OPTIONS.map((item, index) => {
                  const isSelected = genotype === item.id;
                  return (
                    <Animated.View
                      key={item.id}
                      style={[styles.genoCardWrap, { transform: [{ scale: cardScales[index] }] }]}
                    >
                      <Pressable
                        onPress={() => selectGenotype(item.id)}
                        style={({ pressed }) => [pressed && styles.genoCardPressed]}
                      >
                        <GenoMirrorRimFrame
                          kind={isSelected ? 'gold' : 'steel'}
                          borderRadius={RADIUS.md}
                          style={styles.genoCardRim}
                        >
                          <View style={[styles.genoCard, isSelected && styles.genoCardSelected]}>
                            <View style={styles.genoIconBubble}>
                              <GenoMirrorMetallicIcon
                                name={item.icon}
                                size={22}
                                tone={isSelected ? 'gold' : 'steel'}
                              />
                            </View>
                            <Text style={[styles.genoId, isSelected && styles.genoIdSelected]}>
                              {item.id}
                            </Text>
                            <Text style={styles.genoName}>{item.name}</Text>
                            {isSelected ? (
                              <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.pill} style={styles.selectedBadgeRim}>
                                <GenoMirrorGoldFill style={styles.selectedBadge}>
                                  <GenoMirrorMetallicIcon name="checkmark" size={10} tone="gold" />
                                  <Text style={styles.selectedBadgeText}>Selected</Text>
                                </GenoMirrorGoldFill>
                              </GenoMirrorRimFrame>
                            ) : null}
                          </View>
                        </GenoMirrorRimFrame>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </Animated.View>

              <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.md} style={styles.privacyBox}>
                <GenoGlassSurface
                  variant="dark"
                  borderRadius={RADIUS.md - 1.5}
                  showBorder={false}
                  showSheen
                  shadow="none"
                  intensity={28}
                  contentStyle={styles.privacyInner}
                >
                  <GenoMirrorMetallicIcon name="shield-checkmark" size={16} tone="gold" />
                  <Text style={styles.privacyText}>
                    Your genotype is kept private and used for compatibility only.{' '}
                    {GENOTYPE_SELF_REPORT_DISCLAIMER}
                  </Text>
                </GenoGlassSurface>
              </GenoMirrorRimFrame>

              {selectedGenotype ? (
                <Text style={styles.selectionHint}>
                  You selected{' '}
                  <Text style={styles.selectionHintBold}>{selectedGenotype.id}</Text>
                  {' — '}
                  {selectedGenotype.name}
                </Text>
              ) : null}

              <Pressable
                style={styles.ageConfirmRow}
                onPress={() => setAgeConfirmed((prev) => !prev)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: ageConfirmed }}
              >
                <GenoMirrorRimFrame
                  kind={ageConfirmed ? 'gold' : 'steel'}
                  borderRadius={6}
                  padding={1.5}
                  style={styles.ageConfirmRim}
                >
                  <View style={[styles.ageConfirmBox, ageConfirmed && styles.ageConfirmBoxChecked]}>
                    {ageConfirmed ? (
                      <GenoMirrorMetallicIcon name="checkmark" size={14} tone="gold" />
                    ) : null}
                  </View>
                </GenoMirrorRimFrame>
                <Text style={styles.ageConfirmText}>
                  I confirm I am at least 18 years old.
                </Text>
              </Pressable>

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {successMessage ? (
                <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.md} style={styles.successBox}>
                  <GenoGlassSurface
                    variant="dark"
                    borderRadius={RADIUS.md - 1.5}
                    showBorder={false}
                    showSheen
                    shadow="none"
                    intensity={28}
                    contentStyle={styles.successInner}
                  >
                    <GenoMirrorMetallicIcon name="mail" size={18} tone="gold" />
                    <Text style={styles.successText}>{successMessage}</Text>
                  </GenoGlassSurface>
                </GenoMirrorRimFrame>
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
                  <GenoMirrorRimFrame kind="red" borderRadius={RADIUS.pill} style={styles.submitRim}>
                    <GenoMirrorBrandCtaFill style={styles.submitGradient}>
                      {loading ? (
                        <View style={styles.submitContent}>
                          <ActivityIndicator color={COLORS.white} size="small" />
                          <Text style={styles.submitText}>Creating account…</Text>
                        </View>
                      ) : (
                        <Text style={styles.submitText}>
                          {successMessage ? 'Account created' : 'Create Account'}
                        </Text>
                      )}
                    </GenoMirrorBrandCtaFill>
                  </GenoMirrorRimFrame>
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
  genotypeHeader: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requiredPill: {
    marginTop: 10,
  },
  requiredPillInner: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  requiredPillText: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.text,
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
  genoCardRim: {
    width: '100%',
  },
  genoCard: {
    minHeight: 128,
    borderRadius: RADIUS.md - 1.5,
    backgroundColor: GLASS.insetFill,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genoCardSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  genoCardPressed: {
    opacity: 0.92,
  },
  genoIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  genoId: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 22,
    color: COLORS.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  genoIdSelected: {
    color: LOGO_GOLD,
  },
  genoName: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    color: goldAlpha(0.58),
    textAlign: 'center',
  },
  selectedBadgeRim: {
    marginTop: 8,
  },
  selectedBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  selectedBadgeText: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.text,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  privacyBox: {
    marginTop: 8,
    alignSelf: 'stretch',
    width: '100%',
  },
  privacyInner: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  privacyText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  selectionHint: {
    marginTop: 10,
    fontFamily: FONT_FAMILY.gothamMedium,
    color: goldAlpha(0.7),
    fontSize: 12,
  },
  selectionHintBold: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: LOGO_GOLD,
  },
  ageConfirmRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageConfirmRim: {},
  ageConfirmBox: {
    width: 22,
    height: 22,
    borderRadius: 4.5,
    backgroundColor: GLASS.insetFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageConfirmBoxChecked: {
    backgroundColor: goldAlpha(0.12),
  },
  ageConfirmText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    marginTop: 12,
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.error,
    fontSize: 13,
  },
  successBox: {
    marginTop: 12,
    alignSelf: 'stretch',
    width: '100%',
  },
  successInner: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  successText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
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
  signInRow: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  signInText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    color: chromeAlpha(0.65),
    fontSize: 14,
  },
  signInBold: {
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
