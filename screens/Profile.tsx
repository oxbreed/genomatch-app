import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CommunityGuidelines from './CommunityGuidelines';
import PrivacyPolicy from './PrivacyPolicy';
import { GenoCardFrame, GenoPremiumChrome, GenoLogoCeremony } from '../src/brand/graphics';
import { Ionicons } from '@expo/vector-icons';
import { GenoInboxHeader, GenoInboxIconButton } from '../src/components/inbox';
import {
  ProfileDetailsFields,
  ProfileEditFields,
  ProfileGenotypeVerifyModal,
  ProfileHero,
  ProfilePhotosGrid,
  ProfileSectionCard,
  ProfileSectionHeader,
  ProfileStudioCTA,
  ProfileViewSections,
} from '../src/components/profile';
import {
  GenoMeshBackdrop,
  ProfileBondAura,
  ProfileHeroChrome,
  ProfileIdentityRibbon,
  ProfileStatGems,
  ProfileStrengthPanel,
  ProfileVitalityRing,
  StudioBanner,
  StudioSaveDock,
  StudioSectionShell,
  StudioStepRail,
  type StudioStep,
} from '../src/components/profileStudio';
import { GENO_TAB_BAR_HEIGHT } from '../src/components/navigation/tabBarLayout';
import { PROFILE } from '../src/components/profile/profileTokens';
import { COLORS, RADIUS } from '../src/theme';
import { uploadAdditionalPhoto } from '../src/lib/photoUpload';
import { mapProfileRow } from '../src/lib/profileMapper';
import { logAuthState } from '../src/lib/auth';
import { fetchMatches } from '../src/lib/matches';
import {
  getCurrentProfile,
  updateProfileFields,
  updateProfilePhotos,
  verifyGenotype,
} from '../src/lib/profiles';
import { getVerificationEligibility } from '../src/lib/verification';
import { supabase } from '../src/lib/supabase';
import type { DiscoveryProfile, Genotype } from '../src/types/database';

const HERO_HEIGHT = 288;

const STUDIO_STEPS: StudioStep[] = [
  { id: 'photos', label: 'Photos', icon: 'images-outline' },
  { id: 'story', label: 'Story', icon: 'document-text-outline' },
  { id: 'intent', label: 'Intent', icon: 'heart-outline' },
  { id: 'details', label: 'Details', icon: 'options-outline' },
];

type ProfileProps = { onSignOut?: () => void };

type EditableProfile = {
  displayName: string;
  city: string;
  bio: string;
  age: string;
  genotype: Genotype;
  interests: string[];
  relationshipGoal: string;
  avatarUrl: string | null;
  photos: string[];
  gradient: [string, string];
  genotypeVerified: boolean;
  heightCm: number | null;
  religion: string;
  drinkingStatus: string;
  smokingStatus: string;
  educationStatus: string;
};

function calculateProfileCompletion(data: EditableProfile): number {
  let score = 0;
  if (data.photos.length > 0 || data.avatarUrl) score += 20;
  if (data.bio.trim().length > 0) score += 20;
  if (data.interests.length > 0) score += 20;
  if (data.city.trim().length > 0) score += 20;
  if (data.relationshipGoal.trim().length > 0) score += 20;
  return score;
}

function getStrengthLabel(percent: number): string {
  return percent >= 80 ? 'Strong bond profile' : 'Complete your profile for better matches';
}

function countStudioEssentials(data: EditableProfile): number {
  let n = 0;
  if (data.photos.length > 0 || data.avatarUrl) n += 1;
  if (data.bio.trim()) n += 1;
  if (data.interests.length > 0) n += 1;
  if (data.city.trim()) n += 1;
  if (data.relationshipGoal.trim()) n += 1;
  if (data.drinkingStatus || data.smokingStatus || data.educationStatus) n += 1;
  return n;
}

function profilesEqual(a: EditableProfile, b: EditableProfile): boolean {
  return (
    a.displayName === b.displayName &&
    a.city === b.city &&
    a.bio === b.bio &&
    a.relationshipGoal === b.relationshipGoal &&
    a.heightCm === b.heightCm &&
    a.religion === b.religion &&
    a.drinkingStatus === b.drinkingStatus &&
    a.smokingStatus === b.smokingStatus &&
    a.educationStatus === b.educationStatus &&
    JSON.stringify(a.interests) === JSON.stringify(b.interests) &&
    JSON.stringify(a.photos) === JSON.stringify(b.photos)
  );
}

export default function Profile({ onSignOut }: ProfileProps) {
  const [profile, setProfile] = useState<EditableProfile | null>(null);
  const [draft, setDraft] = useState<EditableProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showCommunityGuidelines, setShowCommunityGuidelines] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({ matches: 0, likesReceived: 0, profileViews: 0 });
  const [activeStep, setActiveStep] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const studioFade = useRef(new Animated.Value(0)).current;

  const loadProfile = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await logAuthState('Profile.loadProfile');
      const row = await getCurrentProfile();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAuthUserId(session?.user?.id ?? null);

      if (!row) {
        setProfile(null);
        return;
      }

      const mapped: DiscoveryProfile = mapProfileRow(row, row.genotype);
      const loaded: EditableProfile = {
        displayName: mapped.name,
        city: mapped.city,
        bio: mapped.bio,
        age: mapped.age != null ? String(mapped.age) : '',
        genotype: mapped.genotype,
        interests: mapped.interests,
        relationshipGoal: row.relationship_goal ?? 'serious',
        avatarUrl: mapped.avatarUrl,
        photos: mapped.photos,
        gradient: mapped.gradient,
        genotypeVerified: mapped.genotypeVerified,
        heightCm: row.height_cm ?? null,
        religion: row.religion ?? '',
        drinkingStatus: row.drinking_status ?? '',
        smokingStatus: row.smoking_status ?? '',
        educationStatus: row.education_status ?? '',
      };
      setProfile(loaded);
      setDraft(loaded);

      const userId = session?.user?.id;
      if (userId) {
        try {
          const [matchResult, likesResult] = await Promise.all([
            fetchMatches(),
            supabase.from('likes').select('id', { count: 'exact', head: true }).eq('liked_id', userId),
          ]);
          setStats({
            matches: matchResult.matches.length,
            likesReceived: likesResult.count ?? 0,
            profileViews: 0,
          });
        } catch {
          setStats({ matches: 0, likesReceived: 0, profileViews: 0 });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    Animated.timing(studioFade, {
      toValue: editing ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [editing, studioFade]);

  const data = editing ? draft : profile;
  const completionPercent = data ? calculateProfileCompletion(data) : 0;
  const essentialsDone = data ? countStudioEssentials(data) : 0;
  const hasChanges = useMemo(
    () => !!(profile && draft && editing && !profilesEqual(profile, draft)),
    [profile, draft, editing]
  );

  const stepComplete = useMemo((): boolean[] => {
    if (!draft) return [false, false, false, false];
    return [
      draft.photos.length > 0 || !!draft.avatarUrl,
      !!draft.bio.trim() && draft.interests.length > 0,
      !!draft.relationshipGoal.trim(),
      !!(draft.drinkingStatus || draft.smokingStatus || draft.educationStatus || draft.heightCm || draft.religion),
    ];
  }, [draft]);

  const startStudio = () => {
    if (!profile) return;
    setDraft({ ...profile });
    setEditing(true);
    setActiveStep(0);
  };

  const discardStudio = () => {
    setDraft(profile);
    setEditing(false);
    setActiveStep(0);
  };

  const requestExitStudio = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard changes?',
        'Unpublished edits will be lost.',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: discardStudio },
        ]
      );
      return;
    }
    discardStudio();
  };

  const requestDiscardFromDock = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard draft?',
        'Your studio changes have not been published.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: discardStudio },
        ]
      );
      return;
    }
    discardStudio();
  };

  const saveEdit = async () => {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      const ageNum = parseInt(draft.age, 10);
      const year = Number.isNaN(ageNum) ? null : new Date().getFullYear() - ageNum;
      await updateProfileFields({
        display_name: draft.displayName.trim(),
        city: draft.city.trim(),
        bio: draft.bio.trim(),
        date_of_birth: year ? `${year}-01-01` : undefined,
        interests: draft.interests,
        relationship_goal: draft.relationshipGoal,
        height_cm: draft.heightCm,
        religion: draft.religion || null,
        drinking_status: draft.drinkingStatus || null,
        smoking_status: draft.smokingStatus || null,
        education_status: draft.educationStatus || null,
      });
      setProfile({ ...draft });
      setEditing(false);
      setActiveStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setDraft((p) => {
      if (!p) return p;
      const has = p.interests.includes(interest);
      return {
        ...p,
        interests: has ? p.interests.filter((i) => i !== interest) : [...p.interests, interest],
      };
    });
  };

  const applyPhotos = async (nextPhotos: string[]) => {
    await updateProfilePhotos(nextPhotos);
    const avatarUrl = nextPhotos[0] ?? null;
    const apply = (p: EditableProfile) => ({ ...p, photos: nextPhotos, avatarUrl });
    setDraft((p) => (p ? apply(p) : p));
    setProfile((p) => (p ? apply(p) : p));
  };

  const requestDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone. Please email hello@genomatch.app to complete deletion.'
    );
  };

  const requestVerification = async () => {
    try {
      const row = await getCurrentProfile();
      const eligibility = getVerificationEligibility(row);
      if (!eligibility.ok) {
        Alert.alert('Verification unavailable', eligibility.message);
        return;
      }
      setShowVerifyModal(true);
    } catch (err) {
      Alert.alert(
        'Could not start verification',
        err instanceof Error ? err.message : 'Please try again.'
      );
    }
  };

  const scrollToStep = (index: number) => {
    setActiveStep(index);
    const id = STUDIO_STEPS[index]?.id;
    const y = id ? sectionOffsets.current[id] : undefined;
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  };

  const onSectionLayout = (id: string) => (e: LayoutChangeEvent) => {
    sectionOffsets.current[id] = e.nativeEvent.layout.y;
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <GenoMeshBackdrop />
        <GenoPremiumChrome variant="linen" />
        <GenoLogoCeremony variant="auth" tone="dark" />
        <Text style={styles.loadingText}>Loading your profile…</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.root, styles.centered]}>
        <GenoMeshBackdrop />
        <Text style={styles.emptyText}>
          {authUserId ? 'Complete profile setup to continue.' : 'Sign in to view your profile.'}
        </Text>
        {authUserId ? (
          <Pressable style={styles.retryBtn} onPress={loadProfile}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (showCommunityGuidelines) {
    return <CommunityGuidelines onBack={() => setShowCommunityGuidelines(false)} />;
  }
  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  const heroPhotoUri = data.photos[0] ?? data.avatarUrl ?? null;

  return (
    <View style={styles.root}>
      <GenoMeshBackdrop studio={editing} />
      <ProfileBondAura active={editing} verified={data.genotypeVerified && editing} />
      <GenoPremiumChrome variant="linen" />
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <GenoInboxHeader
          title={editing ? 'Profile studio' : 'Profile'}
          subtitle={
            editing
              ? 'Edit photos, story & intent — publish when ready'
              : `${completionPercent}% complete · live on Discover`
          }
          ceremonyMark={editing}
          right={
            editing ? (
              <GenoInboxIconButton
                icon="close"
                variant="muted"
                onPress={requestExitStudio}
                accessibilityLabel="Exit profile studio"
              />
            ) : (
              <ProfileVitalityRing percent={completionPercent} size={52} />
            )
          }
        />

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scroll, editing && styles.scrollStudio]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ProfileHeroChrome studio={editing} height={HERO_HEIGHT}>
            <ProfileHero
              displayName={data.displayName}
              city={data.city}
              age={data.age}
              genotype={data.genotype}
              genotypeVerified={data.genotypeVerified}
              heroPhotoUri={heroPhotoUri}
              editing={editing}
              saving={saving}
              studioMode={editing}
              draftName={draft?.displayName}
              draftCity={draft?.city}
              onChangeName={(t) => setDraft((p) => (p ? { ...p, displayName: t } : p))}
              onChangeCity={(t) => setDraft((p) => (p ? { ...p, city: t } : p))}
              onEdit={startStudio}
              onCancel={requestExitStudio}
              onSave={saveEdit}
            />
          </ProfileHeroChrome>

          {editing ? (
            <Animated.View style={{ opacity: studioFade }}>
              <StudioBanner doneCount={essentialsDone} totalCount={6} />
              <StudioStepRail
                steps={STUDIO_STEPS}
                activeIndex={activeStep}
                onSelect={scrollToStep}
                completedSteps={stepComplete}
              />
              {!data.genotypeVerified ? (
                <ProfileIdentityRibbon
                  verified={false}
                  genotype={data.genotype}
                  onVerify={requestVerification}
                />
              ) : null}
            </Animated.View>
          ) : (
            <>
              <ProfileStrengthPanel
                percent={completionPercent}
                hint={getStrengthLabel(completionPercent)}
              />
              <ProfileStatGems {...stats} />
              <ProfileStudioCTA percent={completionPercent} onPress={startStudio} />
              <ProfileIdentityRibbon
                verified={data.genotypeVerified}
                genotype={data.genotype}
                onVerify={requestVerification}
              />
            </>
          )}

          {editing ? (
            <>
              <StudioSectionShell
                active={activeStep === 0}
                onLayout={onSectionLayout('photos')}
              >
                <ProfileSectionHeader
                  kicker="01 · GALLERY"
                  title="Photos"
                  hint="Up to 6 photos · first image is your main"
                />
                <ProfilePhotosGrid
                  photos={data.photos}
                  editing
                  canAdd={data.photos.length < 6}
                  uploading={uploadingPhoto}
                  onAdd={async () => {
                    if (data.photos.length >= 6) return;
                    setUploadingPhoto(true);
                    try {
                      const url = await uploadAdditionalPhoto();
                      if (url) await applyPhotos([...data.photos, url]);
                    } finally {
                      setUploadingPhoto(false);
                    }
                  }}
                  onDelete={async (index) => {
                    await applyPhotos(data.photos.filter((_, i) => i !== index));
                  }}
                />
              </StudioSectionShell>

              <StudioSectionShell active={activeStep === 1} onLayout={onSectionLayout('story')}>
                <ProfileSectionHeader
                  kicker="02 · STORY"
                  title="Bio & interests"
                  hint="Refine how matches see your bond profile"
                />
                <ProfileEditFields
                  bio={draft?.bio ?? ''}
                  interests={draft?.interests ?? []}
                  relationshipGoal={draft?.relationshipGoal ?? 'serious'}
                  onChangeBio={(t) => setDraft((p) => (p ? { ...p, bio: t } : p))}
                  onToggleInterest={toggleInterest}
                  onSelectGoal={(g) => setDraft((p) => (p ? { ...p, relationshipGoal: g } : p))}
                  showGoals={false}
                  hideHint
                />
              </StudioSectionShell>

              <StudioSectionShell
                active={activeStep === 2}
                onLayout={onSectionLayout('intent')}
              >
                <ProfileSectionHeader
                  kicker="03 · INTENT"
                  title="Relationship goal"
                  hint="How you appear on Discover & Matches"
                />
                <ProfileEditFields
                  bio={draft?.bio ?? ''}
                  interests={draft?.interests ?? []}
                  relationshipGoal={draft?.relationshipGoal ?? 'serious'}
                  onChangeBio={() => {}}
                  onToggleInterest={() => {}}
                  onSelectGoal={(g) => setDraft((p) => (p ? { ...p, relationshipGoal: g } : p))}
                  showBio={false}
                  showInterests={false}
                  showGoals
                />
              </StudioSectionShell>

              <StudioSectionShell
                active={activeStep === 3}
                onLayout={onSectionLayout('details')}
                style={{ marginBottom: 8 }}
              >
                <ProfileSectionHeader
                  kicker="04 · DETAILS"
                  title="Lifestyle & background"
                  hint="Drinking, smoking, education & more — shown on your profile"
                />
                <ProfileDetailsFields
                  heightCm={draft?.heightCm ?? null}
                  religion={draft?.religion ?? ''}
                  drinkingStatus={draft?.drinkingStatus ?? ''}
                  smokingStatus={draft?.smokingStatus ?? ''}
                  educationStatus={draft?.educationStatus ?? ''}
                  onSelectHeight={(cm) => setDraft((p) => (p ? { ...p, heightCm: cm } : p))}
                  onSelectReligion={(id) => setDraft((p) => (p ? { ...p, religion: id } : p))}
                  onSelectDrinking={(id) => setDraft((p) => (p ? { ...p, drinkingStatus: id } : p))}
                  onSelectSmoking={(id) => setDraft((p) => (p ? { ...p, smokingStatus: id } : p))}
                  onSelectEducation={(id) => setDraft((p) => (p ? { ...p, educationStatus: id } : p))}
                />
              </StudioSectionShell>
            </>
          ) : (
            <>
              <ProfileSectionCard
                label="Gallery"
                hint={
                  data.photos.length > 0
                    ? `${data.photos.length} photo${data.photos.length === 1 ? '' : 's'} on your profile`
                    : 'Add photos in Profile Studio'
                }
              >
                <ProfilePhotosGrid
                  photos={data.photos}
                  editing={false}
                  canAdd={false}
                  uploading={false}
                  onAdd={() => {}}
                  onDelete={() => {}}
                />
              </ProfileSectionCard>

              <ProfileSectionCard label="About you" hint="How matches see your bond on Discover">
                <ProfileViewSections
                  bio={data.bio}
                  interests={data.interests}
                  relationshipGoal={data.relationshipGoal}
                  drinkingStatus={data.drinkingStatus}
                  smokingStatus={data.smokingStatus}
                  educationStatus={data.educationStatus}
                  heightCm={data.heightCm}
                  religion={data.religion}
                />
              </ProfileSectionCard>

              <GenoCardFrame showWatermark={false}>
                <View style={styles.footerInner}>
                  <Pressable
                    style={({ pressed }) => [styles.footerLink, pressed && styles.footerLinkPressed]}
                    onPress={() => setShowCommunityGuidelines(true)}
                  >
                    <Text style={styles.footerLinkText}>Community Guidelines</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.sage} />
                  </Pressable>
                  <View style={styles.footerDivider} />
                  <Pressable
                    style={({ pressed }) => [styles.footerLink, pressed && styles.footerLinkPressed]}
                    onPress={() => setShowPrivacy(true)}
                  >
                    <Text style={styles.footerLinkText}>Privacy Policy</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.sage} />
                  </Pressable>
                  <View style={styles.footerDivider} />
                  <Pressable
                    style={({ pressed }) => [styles.footerLink, pressed && styles.footerLinkPressed]}
                    onPress={requestDeleteAccount}
                  >
                    <Text style={styles.deleteAccountText}>Delete Account</Text>
                  </Pressable>
                  <View style={styles.footerDivider} />
                  <Pressable
                    style={({ pressed }) => [
                      styles.signOutBtn,
                      pressed && styles.footerLinkPressed,
                      signingOut && styles.signOutDisabled,
                    ]}
                    onPress={() => {
                      Alert.alert('Sign Out', 'Are you sure?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Sign Out',
                          style: 'destructive',
                          onPress: async () => {
                            setSigningOut(true);
                            try {
                              await supabase.auth.signOut();
                            } finally {
                              setSigningOut(false);
                              onSignOut?.();
                            }
                          },
                        },
                      ]);
                    }}
                    disabled={signingOut}
                  >
                    <Ionicons name="log-out-outline" size={18} color={COLORS.forestDeep} />
                    <Text style={styles.signOutText}>
                      {signingOut ? 'Signing out…' : 'Sign out'}
                    </Text>
                  </Pressable>
                </View>
              </GenoCardFrame>
            </>
          )}
        </ScrollView>

        {editing ? (
          <StudioSaveDock
            hasChanges={hasChanges}
            saving={saving}
            saveDisabled={saving || !hasChanges}
            onDiscard={requestDiscardFromDock}
            onSave={saveEdit}
          />
        ) : null}
      </KeyboardAvoidingView>

      <ProfileGenotypeVerifyModal
        visible={showVerifyModal}
        genotype={data.genotype}
        verifying={verifying}
        onConfirm={async () => {
          setVerifying(true);
          try {
            await verifyGenotype();
            const v = (p: EditableProfile) => ({ ...p, genotypeVerified: true });
            setProfile((p) => (p ? v(p) : p));
            setDraft((p) => (p ? v(p) : p));
            setShowVerifyModal(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Verification failed');
          } finally {
            setVerifying(false);
          }
        }}
        onClose={() => !verifying && setShowVerifyModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.linen },
  flex: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { paddingBottom: GENO_TAB_BAR_HEIGHT + 20, paddingTop: 2 },
  scrollStudio: { paddingBottom: 148 },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 80, 60, 0.1)',
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.forest,
  },
  emptyText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: COLORS.forest,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
  },
  retryText: { fontFamily: 'Satoshi-Bold', fontSize: 15, color: COLORS.forest },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.sage,
  },
  footerInner: {
    paddingVertical: 4,
    paddingHorizontal: PROFILE.cardPadding,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  footerLinkPressed: { opacity: 0.82 },
  footerLinkText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: COLORS.forestDeep,
  },
  footerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  deleteAccountText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: COLORS.error,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutDisabled: { opacity: 0.6 },
  signOutText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: COLORS.forestDeep,
  },
});
