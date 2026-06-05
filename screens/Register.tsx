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
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { GenoLogoCeremony, GenoPremiumChrome } from '../src/brand/graphics';
import { COLORS } from '../src/theme';
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
          <Pressable style={styles.back} onPress={onBack}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.brandChip}>
            <Text style={styles.brandChipText}>PREMIUM ACCESS</Text>
          </View>
          <View style={styles.logoWrap}>
            <GenoLogoCeremony variant="auth" tone="light" />
          </View>
          <Text style={styles.title}>Create Your GenoMatch Account</Text>
          <Text style={styles.subtitle}>
            Join intentional singles across West Africa with secure genotype-aware matching.
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
            placeholder="At least 8 characters"
            placeholderTextColor="rgba(27, 122, 110, 0.35)"
            secureTextEntry={!showPass}
          />

          <View style={styles.genotypeHeader}>
            <Text style={styles.label}>Select Your Genotype</Text>
            <Text style={styles.requiredPill}>Required</Text>
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
                    onPress={() => setGenotype(item.id)}
                    style={[
                      styles.genoCard,
                      isSelected && styles.genoCardSelected,
                      isSelected && { borderColor: item.accent },
                    ]}
                  >
                    <View
                      style={[
                        styles.genoIconBubble,
                        isSelected && { backgroundColor: `${item.accent}20` },
                      ]}
                    >
                      <Ionicons name={item.icon} size={22} color={isSelected ? item.accent : COLORS.forest} />
                    </View>
                    <Text style={[styles.genoId, isSelected && { color: item.accent }]}>{item.id}</Text>
                    <Text style={styles.genoName}>{item.name}</Text>
                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: item.accent }]}>
                        <Text style={styles.selectedBadgeText}>Selected</Text>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>

          <View style={styles.privacyBox}>
            <Text style={styles.privacyText}>
              Your genotype is encrypted, protected, and only used for compatibility intelligence.
            </Text>
          </View>

          {selectedGenotype && (
            <Text style={styles.selectionHint}>
              You selected <Text style={{ color: selectedGenotype.accent }}>{selectedGenotype.id}</Text>.
            </Text>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {successMessage ? (
            <View style={styles.successBox}>
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
              {loading ? (
                <View style={styles.submitContent}>
                  <ActivityIndicator color={COLORS.forest} size="small" />
                  <Text style={styles.submitText}>Creating account...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>
                  {successMessage ? 'Account created' : 'Create Account'}
                </Text>
              )}
            </Pressable>
          </Animated.View>

          <Pressable style={styles.signInRow} onPress={onSignIn}>
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInBold}>Sign In</Text>
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
    backgroundColor: COLORS.forest,
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
    marginBottom: 12,
  },
  brandChipText: {
    color: COLORS.gold,
    fontSize: 11,
    letterSpacing: 1.1,
    fontWeight: '800',
  },
  logoWrap: {
    marginBottom: 14,
    alignItems: 'flex-start',
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
    color: COLORS.forest,
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
    color: COLORS.forest,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    opacity: 0.75,
  },
  genotypeHeader: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requiredPill: {
    color: '#8C6A00',
    backgroundColor: '#FFF4CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  genoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  genoCardWrap: {
    width: '48.2%',
    marginBottom: 12,
  },
  genoCard: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 122, 110, 0.14)',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genoCardSelected: {
    backgroundColor: '#F8FBF9',
    shadowColor: COLORS.forest,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  genoIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 122, 110, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  genoEmoji: {
    fontSize: 20,
  },
  genoId: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2A23',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  genoName: {
    fontSize: 11,
    color: 'rgba(27, 122, 110, 0.58)',
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedBadge: {
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  selectedBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  privacyBox: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(27, 122, 110, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(27, 122, 110, 0.14)',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  privacyText: {
    color: COLORS.forest,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  selectionHint: {
    marginTop: 10,
    color: 'rgba(27, 122, 110, 0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    marginTop: 12,
    color: '#A32D2D',
    fontSize: 13,
    fontWeight: '600',
  },
  successBox: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(27, 122, 110, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(27, 122, 110, 0.25)',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  successText: {
    color: COLORS.forest,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: 'center',
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
  signInRow: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signInText: {
    color: 'rgba(27, 122, 110, 0.65)',
    fontSize: 14,
    fontWeight: '500',
  },
  signInBold: {
    color: COLORS.forest,
    fontWeight: '800',
  },
});