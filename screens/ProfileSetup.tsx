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
import AvatarPhotoPicker from '../src/components/AvatarPhotoPicker';
import { gradientFromId } from '../src/lib/profileMapper';
import { pickAndUploadProfilePhoto } from '../src/lib/photoUpload';
import { getCurrentProfile } from '../src/lib/profiles';
import { supabase } from '../src/lib/supabase';

const COLORS = {
  forest: '#074D2E',
  sage: '#A8D5BA',
  gold: '#FFE082',
  ivory: '#FAFAF7',
  white: '#FFFFFF',
};

const STEPS = ['Basic Info', 'About You', 'Your Goal'];
const TOTAL_STEPS = STEPS.length;

const INTERESTS = [
  'Music',
  'Travel',
  'Fitness',
  'Food',
  'Reading',
  'Movies',
  'Fashion',
  'Tech',
  'Sports',
  'Art',
  'Gaming',
  'Nature',
];

const GENDERS = ['Male', 'Female', 'Other'] as const;

const RELATIONSHIP_GOALS = [
  {
    id: 'serious',
    title: 'Serious Relationship',
    icon: '💚',
    description: 'Ready to build something real with someone who shares your values.',
  },
  {
    id: 'marriage',
    title: 'Marriage',
    icon: '💍',
    description: 'Looking for a lifelong partner and a future built together.',
  },
  {
    id: 'friendship',
    title: 'Friendship',
    icon: '🤝',
    description: 'Open to meaningful connections that may grow into more over time.',
  },
];

type Gender = (typeof GENDERS)[number];

function ageToDateOfBirth(age: number): string {
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

export default function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [relationshipGoal, setRelationshipGoal] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarGradient, setAvatarGradient] = useState<[string, string]>(['#074D2E', '#1B7A6E']);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / TOTAL_STEPS,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, step]);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setAvatarGradient(gradientFromId(session.user.id));
      }
    })();
  }, []);

  const animateStepChange = (nextStep: number, direction: 'forward' | 'back') => {
    const exitX = direction === 'forward' ? -24 : 24;
    const enterX = direction === 'forward' ? 24 : -24;

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: exitX,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      contentTranslateX.setValue(enterX);
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateX, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!displayName.trim()) return 'Please enter your display name.';
      const ageNum = parseInt(age, 10);
      if (!age || Number.isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        return 'Please enter a valid age (18–100).';
      }
      if (!gender) return 'Please select your gender.';
      if (!city.trim()) return 'Please enter your city.';
    }
    if (step === 1) {
      if (bio.trim().length < 20) return 'Tell us a bit more — bio must be at least 20 characters.';
      if (interests.length < 2) return 'Pick at least 2 interests.';
    }
    if (step === 2) {
      if (!relationshipGoal) return 'Please select your relationship goal.';
    }
    return null;
  };

  const handlePhotoUpload = async () => {
    setUploadingPhoto(true);
    setError('');
    try {
      const url = await pickAndUploadProfilePhoto();
      if (url) setAvatarUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleNext = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');

    if (step < TOTAL_STEPS - 1) {
      animateStepChange(step + 1, 'forward');
      return;
    }

    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        throw new Error('You must be signed in to complete your profile.');
      }

      const ageNum = parseInt(age, 10);
      const profilePayload = {
        display_name: displayName.trim(),
        city: city.trim(),
        bio: bio.trim(),
        date_of_birth: ageToDateOfBirth(ageNum),
        gender,
        interests,
        relationship_goal: relationshipGoal,
        onboarding_completed: true,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      };

      const existing = await getCurrentProfile();
      const saveResult = existing
        ? await supabase
            .from('profiles')
            .update(profilePayload)
            .eq('id', user.id)
            .select('id, display_name, onboarding_completed')
            .single()
        : await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email ?? null,
              ...profilePayload,
            })
            .select('id, display_name, onboarding_completed')
            .single();

      console.log('[ProfileSetup] save result', saveResult.data, saveResult.error);

      if (saveResult.error) {
        throw saveResult.error;
      }

      if (!saveResult.data?.onboarding_completed) {
        throw new Error('Profile saved but onboarding flag was not set. Please try again.');
      }

      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          gender,
          interests,
          relationship_goal: relationshipGoal,
        },
      });

      if (metaError) {
        throw metaError;
      }

      onComplete();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save your profile. Please try again.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    setError('');
    animateStepChange(step - 1, 'back');
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Let's get to know you</Text>
            <Text style={styles.stepSubheading}>Basic details help us personalize your matches.</Text>

            <View style={styles.photoSection}>
              <AvatarPhotoPicker
                name={displayName.trim() || 'You'}
                gradient={avatarGradient}
                avatarUrl={avatarUrl}
                size={96}
                uploading={uploadingPhoto}
                onPress={handlePhotoUpload}
              />
              <Text style={styles.photoHint}>Optional — add a photo to stand out</Text>
            </View>

            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="How should we call you?"
              placeholderTextColor="rgba(7, 77, 46, 0.35)"
              autoCapitalize="words"
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
              placeholder="18+"
              placeholderTextColor="rgba(7, 77, 46, 0.35)"
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDERS.map((option) => {
                const selected = gender === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setGender(option)}
                    style={[styles.genderBtn, selected && styles.genderBtnSelected]}
                  >
                    <Text style={[styles.genderBtnText, selected && styles.genderBtnTextSelected]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Lagos, Accra, Abuja"
              placeholderTextColor="rgba(7, 77, 46, 0.35)"
              autoCapitalize="words"
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>About you</Text>
            <Text style={styles.stepSubheading}>Share your story and what makes you, you.</Text>

            <View style={styles.bioHeader}>
              <Text style={styles.label}>Bio</Text>
              <Text style={styles.charCounter}>{bio.length}/500</Text>
            </View>
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={(text) => setBio(text.slice(0, 500))}
              placeholder="What are you passionate about? What kind of connection are you hoping for?"
              placeholderTextColor="rgba(7, 77, 46, 0.35)"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.label}>Interests</Text>
            <Text style={styles.hint}>Select at least 2</Text>
            <View style={styles.chipGrid}>
              {INTERESTS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <Pressable
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {interest}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Your relationship goal</Text>
            <Text style={styles.stepSubheading}>Choose what you're looking for right now.</Text>

            {RELATIONSHIP_GOALS.map((goal) => {
              const selected = relationshipGoal === goal.id;
              return (
                <Pressable
                  key={goal.id}
                  onPress={() => setRelationshipGoal(goal.id)}
                  style={[styles.goalCard, selected && styles.goalCardSelected]}
                >
                  <View style={styles.goalIconWrap}>
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                  </View>
                  <View style={styles.goalTextWrap}>
                    <Text style={[styles.goalTitle, selected && styles.goalTitleSelected]}>
                      {goal.title}
                    </Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  </View>
                  {selected && (
                    <View style={styles.goalCheck}>
                      <Text style={styles.goalCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <View style={styles.stepIndicatorRow}>
          {STEPS.map((label, index) => {
            const active = index === step;
            const done = index < step;
            return (
              <View key={label} style={styles.stepIndicatorItem}>
                <View
                  style={[
                    styles.stepDot,
                    active && styles.stepDotActive,
                    done && styles.stepDotDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepDotText,
                      (active || done) && styles.stepDotTextActive,
                    ]}
                  >
                    {done ? '✓' : index + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateX: contentTranslateX }],
          }}
        >
          {renderStepContent()}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.footerActions}>
          {step > 0 && (
            <Pressable style={styles.backBtn} onPress={handleBack} disabled={saving}>
              <Text style={styles.backBtnText}>Back</Text>
            </Pressable>
          )}

          <Animated.View
            style={[styles.ctaWrap, step === 0 && styles.ctaWrapFull, { transform: [{ scale: ctaScale }] }]}
          >
            <Pressable
              style={[styles.ctaBtn, saving && styles.ctaBtnDisabled]}
              disabled={saving}
              onPressIn={() => {
                Animated.spring(ctaScale, {
                  toValue: 0.97,
                  friction: 8,
                  tension: 180,
                  useNativeDriver: true,
                }).start();
              }}
              onPressOut={() => {
                Animated.spring(ctaScale, {
                  toValue: 1,
                  friction: 8,
                  tension: 180,
                  useNativeDriver: true,
                }).start();
              }}
              onPress={handleNext}
            >
              {saving ? (
                <View style={styles.ctaInner}>
                  <ActivityIndicator color={COLORS.forest} size="small" />
                  <Text style={styles.ctaText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.ctaText}>
                  {step === TOTAL_STEPS - 1 ? 'Complete Profile' : 'Continue'}
                </Text>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.ivory,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(7, 77, 46, 0.08)',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.forest,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepIndicatorItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 213, 186, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.forest,
  },
  stepDotDone: {
    backgroundColor: COLORS.sage,
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(7, 77, 46, 0.5)',
  },
  stepDotTextActive: {
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(7, 77, 46, 0.45)',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.forest,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  stepContent: {
    gap: 4,
  },
  stepHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  stepSubheading: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(7, 77, 46, 0.65)',
    fontWeight: '500',
    marginBottom: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  photoHint: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(7, 77, 46, 0.5)',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.forest,
    marginTop: 14,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(7, 77, 46, 0.55)',
    marginTop: -4,
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.14)',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1D2B23',
    fontWeight: '500',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.14)',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnSelected: {
    borderColor: COLORS.forest,
    backgroundColor: 'rgba(168, 213, 186, 0.25)',
  },
  genderBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(7, 77, 46, 0.6)',
  },
  genderBtnTextSelected: {
    color: COLORS.forest,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  charCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(7, 77, 46, 0.5)',
    marginBottom: 8,
  },
  bioInput: {
    minHeight: 140,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.14)',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#1D2B23',
    fontWeight: '500',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.14)',
    backgroundColor: COLORS.white,
  },
  chipSelected: {
    borderColor: COLORS.forest,
    backgroundColor: COLORS.forest,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(7, 77, 46, 0.7)',
  },
  chipTextSelected: {
    color: COLORS.ivory,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.12)',
    backgroundColor: COLORS.white,
    marginBottom: 12,
    gap: 14,
  },
  goalCardSelected: {
    borderColor: COLORS.forest,
    backgroundColor: 'rgba(168, 213, 186, 0.2)',
    shadowColor: COLORS.forest,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  goalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 213, 186, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIcon: {
    fontSize: 26,
  },
  goalTextWrap: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.forest,
    marginBottom: 4,
  },
  goalTitleSelected: {
    color: COLORS.forest,
  },
  goalDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(7, 77, 46, 0.62)',
    fontWeight: '500',
  },
  goalCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCheckText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 12,
    backgroundColor: COLORS.ivory,
    borderTopWidth: 1,
    borderTopColor: 'rgba(7, 77, 46, 0.08)',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  backBtn: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.forest,
  },
  ctaWrap: {
    flex: 1,
  },
  ctaWrapFull: {
    flex: 1,
  },
  ctaBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnDisabled: {
    opacity: 0.75,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.forest,
  },
  error: {
    color: '#A32D2D',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
});
