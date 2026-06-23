import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import About from './About';
import CommunityGuidelines from './CommunityGuidelines';
import PrivacyPolicy from './PrivacyPolicy';
import { GenoPremiumChrome, GenoLogoCeremony } from '../src/brand/graphics';
import EmptyState from '../src/components/EmptyState';
import { GenoInboxHeader, GenoInboxIconButton, GenoInboxRetryPanel } from '../src/components/inbox';
import {
  ProfileDetailsFields,
  ProfileEditFields,
  ProfileFooterCard,
  ProfileDeleteAccountModal,
  ProfileGenotypeVerifyModal,
  ProfileHero,
  ProfilePhotosGrid,
  ProfileSectionCard,
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
  StudioCompletionStrip,
  StudioSaveDock,
  type StudioSaveState,
} from '../src/components/profileStudio';
import { GENO_TAB_BAR_HEIGHT } from '../src/components/navigation/tabBarLayout';
import { FONT_FAMILY, COLORS, MOTION } from '../src/theme';
import { uploadAdditionalPhoto } from '../src/lib/photoUpload';
import { mapProfileRow } from '../src/lib/profileMapper';
import { logAuthState } from '../src/lib/auth';
import { deleteUserAccount } from '../src/lib/accountDeletion';
import { GENOMATCH_COMPANY } from '../src/constants/company';
import { detectDeviceCity, syncProfileCityFromDevice } from '../src/lib/location';
import { fetchMatches } from '../src/lib/matches';
import {
  getCurrentProfile,
  updateProfileFields,
  updateProfilePhotos,
  verifyGenotype,
} from '../src/lib/profiles';
import { getVerificationEligibility, type VerificationProfileInput } from '../src/lib/verification';
import { supabase } from '../src/lib/supabase';
import type { DiscoveryProfile, Genotype, ProfileRow } from '../src/types/database';

const HERO_HEIGHT = 288;
const HERO_HEIGHT_STUDIO = 200;
const AUTOSAVE_MS = 1200;

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

const PLACEHOLDER_DISPLAY_NAME = 'GenoMatch Member';

function buildVerificationInput(
  data: EditableProfile,
  dbRow: ProfileRow | null
): VerificationProfileInput {
  const dbName = dbRow?.display_name?.trim() ?? '';
  const localName = data.displayName.trim();
  const display_name =
    dbName || (localName === PLACEHOLDER_DISPLAY_NAME ? '' : localName);

  return {
    display_name: display_name || null,
    genotype: data.genotype,
    avatar_url: data.avatarUrl,
    photos: data.photos,
    genotype_verified: data.genotypeVerified,
    verification_status: data.genotypeVerified ? 'verified' : 'unverified',
  };
}

export default function Profile({ onSignOut }: ProfileProps) {
  const [profile, setProfile] = useState<EditableProfile | null>(null);
  const [draft, setDraft] = useState<EditableProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showCommunityGuidelines, setShowCommunityGuidelines] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [locatingCity, setLocatingCity] = useState(false);
  const [error, setError] = useState('');
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({ matches: 0, likesReceived: 0, profileViews: 0 });
  const [saveState, setSaveState] = useState<StudioSaveState>('idle');

  const scrollRef = useRef<ScrollView>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const studioFade = useRef(new Animated.Value(0)).current;
  const viewFade = useRef(new Animated.Value(0)).current;

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
    if (loading || editing) return;

    void (async () => {
      const result = await syncProfileCityFromDevice();
      if (result.updated && result.city) {
        const applyCity = (p: EditableProfile) => ({ ...p, city: result.city! });
        setProfile((p) => (p ? applyCity(p) : p));
        setDraft((p) => (p ? applyCity(p) : p));
      }
    })();
  }, [loading, editing]);

  useEffect(() => {
    Animated.timing(studioFade, {
      toValue: editing ? 1 : 0,
      duration: MOTION.sheetOpenMs,
      easing: MOTION.easing.sheetOut,
      useNativeDriver: true,
    }).start();
  }, [editing, studioFade]);

  useEffect(() => {
    if (loading || editing) return;
    viewFade.setValue(0);
    Animated.timing(viewFade, {
      toValue: 1,
      duration: MOTION.tabFadeMs + 80,
      easing: MOTION.easing.sheetOut,
      useNativeDriver: true,
    }).start();
  }, [editing, loading, viewFade]);

  const data = editing ? draft : profile;
  const completionPercent = data ? calculateProfileCompletion(data) : 0;
  const essentialsDone = data ? countStudioEssentials(data) : 0;
  const hasChanges = useMemo(
    () => !!(profile && draft && editing && !profilesEqual(profile, draft)),
    [profile, draft, editing]
  );

  const persistProfileFields = useCallback(async (target: EditableProfile) => {
    const ageNum = parseInt(target.age, 10);
    const year = Number.isNaN(ageNum) ? null : new Date().getFullYear() - ageNum;
    await updateProfileFields({
      display_name: target.displayName.trim(),
      city: target.city.trim(),
      bio: target.bio.trim(),
      date_of_birth: year ? `${year}-01-01` : undefined,
      interests: target.interests,
      relationship_goal: target.relationshipGoal,
      height_cm: target.heightCm,
      religion: target.religion || null,
      drinking_status: target.drinkingStatus || null,
      smoking_status: target.smokingStatus || null,
      education_status: target.educationStatus || null,
    });
  }, []);

  const runAutosave = useCallback(
    async (target: EditableProfile) => {
      setSaveState('saving');
      setError('');
      try {
        await persistProfileFields(target);
        setProfile({ ...target });
        setSaveState('saved');
      } catch (err) {
        setSaveState('error');
        setError(err instanceof Error ? err.message : 'Could not save profile');
      }
    },
    [persistProfileFields]
  );

  useEffect(() => {
    if (!editing || !draft || !hasChanges) return;

    setSaveState((prev) => (prev === 'saving' ? prev : 'idle'));
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      void runAutosave(draft);
    }, AUTOSAVE_MS);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [draft, editing, hasChanges, runAutosave]);

  const startStudio = () => {
    if (!profile) return;
    setDraft({ ...profile });
    setEditing(true);
    setSaveState('idle');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const closeStudio = () => {
    setEditing(false);
    setSaveState('idle');
  };

  const flushAndCloseStudio = async () => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }

    if (draft && hasChanges) {
      setSaving(true);
      setSaveState('saving');
      try {
        await persistProfileFields(draft);
        setProfile({ ...draft });
        setSaveState('saved');
      } catch (err) {
        setSaveState('error');
        Alert.alert(
          'Could not save',
          err instanceof Error ? err.message : 'Check your connection and try again.'
        );
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    closeStudio();
  };

  const requestExitStudio = () => {
    void flushAndCloseStudio();
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
      'Delete account permanently?',
      'This will permanently delete your profile, photos, matches, and messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => setShowDeleteModal(true),
        },
      ]
    );
  };

  const handleDeleteAccount = async (password: string) => {
    setDeletingAccount(true);
    try {
      await deleteUserAccount(password);

      try {
        await supabase.auth.signOut();
      } catch {
        // Session may already be invalid after account deletion.
      }

      setShowDeleteModal(false);
      Alert.alert(
        'Account deleted',
        'Your GenoMatch account and personal data have been permanently removed.',
        [{ text: 'OK', onPress: () => onSignOut?.() }]
      );
    } catch (err) {
      Alert.alert(
        'Could not delete account',
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const refreshLocationFromDevice = async () => {
    setLocatingCity(true);
    setError('');
    try {
      const { city: detected, permissionDenied } = await detectDeviceCity();
      if (detected) {
        setDraft((p) => (p ? { ...p, city: detected } : p));
        return;
      }
      if (permissionDenied) {
        Alert.alert(
          'Location access',
          'Enable location in Settings or type your city manually.'
        );
      } else {
        Alert.alert('Could not detect city', 'Please try again or enter your city manually.');
      }
    } catch (err) {
      Alert.alert(
        'Could not detect city',
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setLocatingCity(false);
    }
  };

  const requestVerification = async () => {
    if (!data) return;

    if (editing && draft && hasChanges) {
      try {
        await persistProfileFields(draft);
        setProfile({ ...draft });
        setSaveState('saved');
      } catch (err) {
        Alert.alert(
          'Save your profile first',
          err instanceof Error ? err.message : 'Finish saving before verifying.'
        );
        return;
      }
    }

    try {
      const row = await getCurrentProfile();
      const eligibility = getVerificationEligibility(buildVerificationInput(data, row));

      if (!eligibility.ok) {
        if (eligibility.reason === 'missing_photo') {
          Alert.alert('Add a profile photo', eligibility.message, [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Add photos',
              onPress: () => startStudio(),
            },
          ]);
          return;
        }

        if (eligibility.reason === 'missing_name') {
          Alert.alert('Add your display name', eligibility.message, [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Edit profile',
              onPress: () => startStudio(),
            },
          ]);
          return;
        }

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

  const handleConfirmVerification = async () => {
    setVerifying(true);
    try {
      await verifyGenotype();
      const markVerified = (p: EditableProfile) => ({ ...p, genotypeVerified: true });
      setProfile((p) => (p ? markVerified(p) : p));
      setDraft((p) => (p ? markVerified(p) : p));
      setShowVerifyModal(false);
      await loadProfile();
      Alert.alert(
        'You are verified',
        'Matches will now see your verified badge on your profile.'
      );
    } catch (err) {
      Alert.alert(
        'Verification failed',
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setVerifying(false);
    }
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
        <GenoPremiumChrome variant="linen" />
        {authUserId ? (
          <GenoInboxRetryPanel
            message="Complete profile setup to continue."
            onRetry={loadProfile}
          />
        ) : (
          <EmptyState
            type="no-profiles"
            title="Sign in required"
            subtitle="Sign in to view and edit your profile."
          />
        )}
      </View>
    );
  }

  if (showAbout) {
    return <About onBack={() => setShowAbout(false)} />;
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
          title={editing ? 'Edit profile' : 'Profile'}
          subtitle={
            editing
              ? 'Scroll to update · changes save automatically'
              : `${completionPercent}% complete · live on Discover`
          }
          ceremonyMark={editing}
          glass
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
          <ProfileHeroChrome studio={editing} height={editing ? HERO_HEIGHT_STUDIO : HERO_HEIGHT}>
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
              onRefreshLocation={() => void refreshLocationFromDevice()}
              locatingCity={locatingCity}
              onEdit={startStudio}
              onCancel={requestExitStudio}
            />
          </ProfileHeroChrome>

          {editing && draft ? (
            <Animated.View style={[styles.studioStack, { opacity: studioFade }]}>
              <StudioCompletionStrip
                percent={completionPercent}
                essentialsDone={essentialsDone}
                essentialsTotal={6}
              />

              <ProfileSectionCard
                kicker="GALLERY"
                label="Photos"
                hint="Up to 6 photos · first image is your main"
                editing
              >
                <ProfilePhotosGrid
                  photos={draft.photos}
                  editing
                  canAdd={draft.photos.length < 6}
                  uploading={uploadingPhoto}
                  onAdd={async () => {
                    if (draft.photos.length >= 6) return;
                    setUploadingPhoto(true);
                    try {
                      const url = await uploadAdditionalPhoto();
                      if (url) await applyPhotos([...draft.photos, url]);
                    } finally {
                      setUploadingPhoto(false);
                    }
                  }}
                  onDelete={async (index) => {
                    await applyPhotos(draft.photos.filter((_, i) => i !== index));
                  }}
                />
              </ProfileSectionCard>

              <ProfileSectionCard
                kicker="YOUR STORY"
                label="About you"
                hint="Bio, interests, and what you are looking for"
                editing
              >
                <ProfileEditFields
                  bio={draft.bio}
                  interests={draft.interests}
                  relationshipGoal={draft.relationshipGoal}
                  onChangeBio={(t) => setDraft((p) => (p ? { ...p, bio: t } : p))}
                  onToggleInterest={toggleInterest}
                  onSelectGoal={(g) => setDraft((p) => (p ? { ...p, relationshipGoal: g } : p))}
                  hideHint
                />
              </ProfileSectionCard>

              <ProfileSectionCard
                kicker="DETAILS"
                label="Lifestyle"
                hint="Optional details shown on your profile"
                editing
              >
                <ProfileDetailsFields
                  heightCm={draft.heightCm}
                  religion={draft.religion}
                  drinkingStatus={draft.drinkingStatus}
                  smokingStatus={draft.smokingStatus}
                  educationStatus={draft.educationStatus}
                  onSelectHeight={(cm) => setDraft((p) => (p ? { ...p, heightCm: cm } : p))}
                  onSelectReligion={(id) => setDraft((p) => (p ? { ...p, religion: id } : p))}
                  onSelectDrinking={(id) =>
                    setDraft((p) => (p ? { ...p, drinkingStatus: id } : p))
                  }
                  onSelectSmoking={(id) =>
                    setDraft((p) => (p ? { ...p, smokingStatus: id } : p))
                  }
                  onSelectEducation={(id) =>
                    setDraft((p) => (p ? { ...p, educationStatus: id } : p))
                  }
                />
              </ProfileSectionCard>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.viewStack, { opacity: viewFade }]}>
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
            </Animated.View>
          )}

          {!editing ? (
            <View style={styles.viewStack}>
              <ProfileSectionCard
                kicker="YOUR PHOTOS"
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

              <ProfileSectionCard
                kicker="YOUR STORY"
                label="About you"
                hint="How matches see your bond on Discover"
              >
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

              <ProfileSectionCard
                kicker="ABOUT & LEGAL"
                label="Company & policies"
                hint="Operator details and member policies"
              >
                <ProfileFooterCard
                  signingOut={signingOut}
                  onAbout={() => setShowAbout(true)}
                  onCommunity={() => setShowCommunityGuidelines(true)}
                  onPrivacy={() => setShowPrivacy(true)}
                  onTerms={() => void Linking.openURL(`https://${GENOMATCH_COMPANY.website}/terms`)}
                  onDeleteAccount={requestDeleteAccount}
                  onSignOut={() => {
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
                />
              </ProfileSectionCard>
            </View>
          ) : null}
        </ScrollView>

        {editing ? (
          <StudioSaveDock
            saveState={saveState}
            busy={saving || saveState === 'saving'}
            onDone={() => void flushAndCloseStudio()}
          />
        ) : null}
      </KeyboardAvoidingView>

      <ProfileGenotypeVerifyModal
        visible={showVerifyModal}
        genotype={data.genotype}
        verifying={verifying}
        onConfirm={() => void handleConfirmVerification()}
        onClose={() => !verifying && setShowVerifyModal(false)}
      />

      <ProfileDeleteAccountModal
        visible={showDeleteModal}
        deleting={deletingAccount}
        onConfirm={(password) => void handleDeleteAccount(password)}
        onClose={() => !deletingAccount && setShowDeleteModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.linen },
  flex: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { paddingBottom: GENO_TAB_BAR_HEIGHT + 20, paddingTop: 2 },
  scrollStudio: { paddingBottom: GENO_TAB_BAR_HEIGHT + 118 },
  studioStack: {
    gap: 2,
    paddingTop: 2,
  },
  viewStack: {
    gap: 2,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 80, 60, 0.1)',
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: COLORS.forest,
  },
  emptyText: {
    fontFamily: FONT_FAMILY.gothamMedium,
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
  retryText: { fontFamily: FONT_FAMILY.gothamBold, fontSize: 15, color: COLORS.forest },
  loadingText: {
    marginTop: 16,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: COLORS.sage,
  },
});
