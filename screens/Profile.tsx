import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import PhotoGrid from '../src/components/PhotoGrid';
import CommunityGuidelines from './CommunityGuidelines';
import PrivacyPolicy from './PrivacyPolicy';
import GenotypeBadge from '../src/components/GenotypeBadge';
import { COLORS, RELATIONSHIP_GOAL_LABELS } from '../src/data/mockData';
import { uploadAdditionalPhoto } from '../src/lib/photoUpload';
import { mapProfileRow } from '../src/lib/profileMapper';
import { logAuthState } from '../src/lib/auth';
import {
  getCurrentProfile,
  updateProfileFields,
  updateProfilePhotos,
  verifyGenotype,
} from '../src/lib/profiles';
import { supabase } from '../src/lib/supabase';
import type { DiscoveryProfile, Genotype } from '../src/types/database';

type ProfileProps = {
  onSignOut?: () => void;
};

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
};

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

  const loadProfile = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await logAuthState('Profile.loadProfile');
      const row = await getCurrentProfile();
      console.log('[Profile] fetch result', {
        found: !!row,
        display_name: row?.display_name,
        genotype: row?.genotype,
        city: row?.city,
        bio: row?.bio,
        interests: row?.interests,
        relationship_goal: row?.relationship_goal,
      });

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
      };
      setProfile(loaded);
      setDraft(loaded);
    } catch (err) {
      console.error('[Profile] load failed', err);
      setError(err instanceof Error ? err.message : 'Could not load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const startEdit = () => {
    if (!profile) return;
    setDraft({ ...profile });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      const ageNum = parseInt(draft.age, 10);
      const year = Number.isNaN(ageNum)
        ? null
        : new Date().getFullYear() - ageNum;

      await updateProfileFields({
        display_name: draft.displayName.trim(),
        city: draft.city.trim(),
        bio: draft.bio.trim(),
        date_of_birth: year ? `${year}-01-01` : undefined,
        interests: draft.interests,
        relationship_goal: draft.relationshipGoal,
      });

      setProfile({ ...draft });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const applyPhotosLocally = (photos: string[]) => {
    const avatarUrl = photos[0] ?? null;
    const next = {
      ...(editing ? draft : profile)!,
      photos,
      avatarUrl,
    };
    if (editing) setDraft(next);
    setProfile(next);
  };

  const handleAddPhoto = async () => {
    const current = editing ? draft : profile;
    if (!current || current.photos.length >= 6) return;

    setUploadingPhoto(true);
    setError('');
    try {
      const url = await uploadAdditionalPhoto();
      if (!url) return;

      const nextPhotos = [...current.photos, url];
      await updateProfilePhotos(nextPhotos);
      applyPhotosLocally(nextPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleConfirmVerification = async () => {
    setVerifying(true);
    setError('');
    try {
      await verifyGenotype();
      const applyVerified = (p: EditableProfile) => ({ ...p, genotypeVerified: true });
      setProfile((p) => (p ? applyVerified(p) : p));
      setDraft((p) => (p ? applyVerified(p) : p));
      setShowVerifyModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify genotype');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    const current = editing ? draft : profile;
    if (!current) return;

    setError('');
    try {
      const nextPhotos = current.photos.filter((_, i) => i !== index);
      await updateProfilePhotos(nextPhotos);
      applyPhotosLocally(nextPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove photo');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await supabase.auth.signOut();
          } catch {
            // continue
          } finally {
            setSigningOut(false);
            onSignOut?.();
          }
        },
      },
    ]);
  };

  const data = editing ? draft : profile;
  const goalLabel = data
    ? RELATIONSHIP_GOAL_LABELS[data.relationshipGoal] ?? data.relationshipGoal
    : '';

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.forest} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>
          {authUserId
            ? 'No profile found yet. Complete profile setup to continue.'
            : 'Sign in to view your profile.'}
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
    return (
      <CommunityGuidelines onBack={() => setShowCommunityGuidelines(false)} />
    );
  }

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {!editing ? (
          <Pressable style={styles.editBtn} onPress={startEdit}>
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        ) : (
          <View style={styles.editActions}>
            <Pressable onPress={() => { setDraft(profile); setEditing(false); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={saveEdit} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PhotoGrid
          photos={data.photos}
          onAddPhoto={handleAddPhoto}
          onDeletePhoto={handleDeletePhoto}
          uploading={uploadingPhoto}
          maxPhotos={6}
        />

        <View style={styles.scrollContent}>
        <View style={styles.profileSummary}>
          {editing ? (
            <TextInput
              style={styles.summaryNameInput}
              value={draft?.displayName}
              onChangeText={(text) =>
                setDraft((p) => (p ? { ...p, displayName: text } : p))
              }
              placeholder="Display name"
              placeholderTextColor={COLORS.textMuted}
            />
          ) : (
            <Text style={styles.summaryName}>{data.displayName}</Text>
          )}
          <View style={styles.summaryMeta}>
            <View style={styles.genotypeRow}>
              <GenotypeBadge genotype={data.genotype} />
              {data.genotypeVerified ? (
                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color="#2E7D32"
                  accessibilityLabel="Genotype verified"
                />
              ) : null}
            </View>
            <Text style={styles.summaryMetaText}>
              {data.age ? `${data.age} ù ` : ''}
              {data.city}
            </Text>
          </View>

          {!data.genotypeVerified ? (
            <View style={styles.verifyBanner}>
              <Text style={styles.verifyBannerText}>
                Verify your genotype to build trust with matches
              </Text>
              <Pressable
                style={({ pressed }) => [styles.verifyBtn, pressed && styles.verifyBtnPressed]}
                onPress={() => setShowVerifyModal(true)}
              >
                <Text style={styles.verifyBtnText}>Verify</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>City</Text>
          {editing ? (
            <TextInput
              style={styles.fieldInput}
              value={draft?.city}
              onChangeText={(text) => setDraft((p) => (p ? { ...p, city: text } : p))}
            />
          ) : (
            <Text style={styles.sectionValue}>{data.city}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bio</Text>
          {editing ? (
            <TextInput
              style={[styles.fieldInput, styles.bioInput]}
              value={draft?.bio}
              onChangeText={(text) => setDraft((p) => (p ? { ...p, bio: text } : p))}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          ) : (
            <Text style={styles.bio}>{data.bio || 'Add a bio to stand out.'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.chipRow}>
            {data.interests.length > 0 ? (
              data.interests.map((interest) => (
                <View key={interest} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.sectionValue}>No interests added yet</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Relationship goal</Text>
          <View style={styles.goalCard}>
            <Text style={styles.goalText}>{goalLabel}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.privacyLink, pressed && styles.privacyLinkPressed]}
          onPress={() => setShowCommunityGuidelines(true)}
        >
          <Text style={styles.privacyLinkText}>Community Guidelines</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.privacyLink, pressed && styles.privacyLinkPressed]}
          onPress={() => setShowPrivacy(true)}
        >
          <Text style={styles.privacyLinkText}>Privacy Policy</Text>
        </Pressable>

        <Pressable
          style={[styles.signOutBtn, signingOut && styles.signOutBtnDisabled]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          <Text style={styles.signOutText}>
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showVerifyModal}
        transparent
        animationType="fade"
        onRequestClose={() => !verifying && setShowVerifyModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Your Genotype</Text>
            <Text style={styles.modalBody}>
              By verifying, you confirm that your genotype ({data.genotype}) is accurate to
              the best of your knowledge. This builds trust with your matches.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.modalConfirmBtn,
                pressed && styles.verifyBtnPressed,
                verifying && styles.modalBtnDisabled,
              ]}
              onPress={handleConfirmVerification}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color={COLORS.forest} size="small" />
              ) : (
                <Text style={styles.modalConfirmText}>Yes, I confirm</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.modalCancelBtn}
              onPress={() => setShowVerifyModal(false)}
              disabled={verifying}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.forest,
    letterSpacing: -0.8,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.forest,
  },
  editBtnText: { color: COLORS.ivory, fontSize: 14, fontWeight: '700' },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cancelText: { fontSize: 14, fontWeight: '700', color: 'rgba(7, 77, 46, 0.6)' },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.forest },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.errorBg,
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: { color: 'rgba(7, 77, 46, 0.6)', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.forest,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: COLORS.ivory, fontWeight: '700' },
  scroll: { paddingBottom: 24 },
  scrollContent: { paddingHorizontal: 20 },
  profileSummary: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryName: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.forest,
    letterSpacing: -0.5,
  },
  summaryNameInput: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.forest,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.sage,
    paddingVertical: 4,
    marginBottom: 4,
  },
  summaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  summaryMetaText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  genotypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyBanner: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'rgba(255, 224, 130, 0.35)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 135, 43, 0.2)',
  },
  verifyBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.forest,
    lineHeight: 18,
  },
  verifyBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  verifyBtnPressed: {
    opacity: 0.9,
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.forest,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 77, 46, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.forest,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  modalBody: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 20,
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBtnDisabled: {
    opacity: 0.6,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.forest,
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.forest,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.sage,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionValue: { fontSize: 16, fontWeight: '600', color: COLORS.forest },
  fieldInput: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.forest,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.ivory,
  },
  bioInput: { minHeight: 100 },
  bio: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(7, 77, 46, 0.78)',
    fontWeight: '500',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.forest },
  goalCard: {
    backgroundColor: 'rgba(255, 224, 130, 0.35)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 135, 43, 0.25)',
  },
  goalText: { fontSize: 16, fontWeight: '600', color: COLORS.forest },
  privacyLink: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  privacyLinkPressed: {
    opacity: 0.75,
  },
  privacyLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.forest,
    textDecorationLine: 'underline',
  },
  signOutBtn: {
    marginTop: 8,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(163, 45, 45, 0.35)',
    backgroundColor: COLORS.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtnDisabled: { opacity: 0.6 },
  signOutText: { fontSize: 16, fontWeight: '600', color: COLORS.error },
});
