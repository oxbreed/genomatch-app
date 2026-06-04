import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
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
import CommunityGuidelines from './CommunityGuidelines';
import PrivacyPolicy from './PrivacyPolicy';
import GenotypeBadge from '../src/components/GenotypeBadge';
import { COLORS, RELATIONSHIP_GOAL_LABELS, getInitials } from '../src/data/mockData';
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
import { supabase } from '../src/lib/supabase';
import type { DiscoveryProfile, Genotype } from '../src/types/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 320;
const PHOTO_COLS = 3;
const PHOTO_GAP = 8;
const PHOTO_MARGIN = 16;
const PHOTO_CELL_SIZE =
  (SCREEN_WIDTH - PHOTO_MARGIN * 2 - PHOTO_GAP * (PHOTO_COLS - 1)) / PHOTO_COLS;

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

type ProfileStats = {
  matches: number;
  likesReceived: number;
  profileViews: number;
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
  return percent >= 80 ? 'Strong Profile' : 'Complete your profile';
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
  const [stats, setStats] = useState<ProfileStats>({
    matches: 0,
    likesReceived: 0,
    profileViews: 0,
  });

  const completionAnim = useRef(new Animated.Value(0)).current;

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
      const userId = session?.user?.id ?? null;
      setAuthUserId(userId);

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

      if (userId) {
        try {
          const [matchRows, likesResult] = await Promise.all([
            fetchMatches(),
            supabase
              .from('likes')
              .select('id', { count: 'exact', head: true })
              .eq('liked_id', userId),
          ]);

          const likesReceived =
            likesResult.error || likesResult.count == null ? 0 : likesResult.count;

          setStats({
            matches: matchRows.length,
            likesReceived,
            profileViews: 0,
          });
        } catch {
          setStats({ matches: 0, likesReceived: 0, profileViews: 0 });
        }
      }
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

  const data = editing ? draft : profile;
  const completionPercent = data ? calculateProfileCompletion(data) : 0;

  useEffect(() => {
    Animated.timing(completionAnim, {
      toValue: completionPercent / 100,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [completionAnim, completionPercent]);

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

  const goalLabel = data
    ? RELATIONSHIP_GOAL_LABELS[data.relationshipGoal] ?? data.relationshipGoal
    : '';
  const heroPhotoUri = data?.photos[0] ?? data?.avatarUrl ?? null;
  const canAddPhoto = data ? data.photos.length < 6 : false;
  const completionWidth = completionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
      <StatusBar style="light" />

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {heroPhotoUri ? (
            <Image source={{ uri: heroPhotoUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroInitials}>{getInitials(data.displayName)}</Text>
            </View>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(13,40,24,0.95)']}
            style={styles.heroGradient}
            pointerEvents="none"
          />

          <View style={styles.heroOverlayContent}>
            <View style={styles.heroNameRow}>
              {editing ? (
                <TextInput
                  style={styles.heroNameInput}
                  value={draft?.displayName}
                  onChangeText={(text) =>
                    setDraft((p) => (p ? { ...p, displayName: text } : p))
                  }
                  placeholder="Display name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              ) : (
                <Text style={styles.heroName}>{data.displayName}</Text>
              )}
              <GenotypeBadge genotype={data.genotype} />
              {data.genotypeVerified ? (
                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color={COLORS.verified}
                  accessibilityLabel="Genotype verified"
                />
              ) : null}
            </View>

            {editing ? (
              <TextInput
                style={styles.heroLocationInput}
                value={draft?.city}
                onChangeText={(text) => setDraft((p) => (p ? { ...p, city: text } : p))}
                placeholder="City"
                placeholderTextColor="rgba(143, 175, 149, 0.7)"
              />
            ) : (
              <Text style={styles.heroLocation}>
                {data.age ? `${data.age} · ` : ''}
                {data.city}
              </Text>
            )}
          </View>

          <View style={styles.heroEditFloating}>
            {!editing ? (
              <Pressable style={styles.editPill} onPress={startEdit}>
                <Text style={styles.editPillText}>Edit</Text>
              </Pressable>
            ) : (
              <View style={styles.editPillRow}>
                <Pressable
                  style={styles.cancelPill}
                  onPress={() => {
                    setDraft(profile);
                    setEditing(false);
                  }}
                >
                  <Text style={styles.cancelPillText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.savePill} onPress={saveEdit} disabled={saving}>
                  <Text style={styles.savePillText}>{saving ? 'Saving...' : 'Save'}</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.strengthHeader}>
            <Text style={styles.strengthTitle}>Profile Strength</Text>
            <Text style={styles.strengthPercent}>{completionPercent}%</Text>
          </View>
          <View style={styles.strengthTrack}>
            <Animated.View style={[styles.strengthFill, { width: completionWidth }]} />
          </View>
          <Text style={styles.strengthHint}>{getStrengthLabel(completionPercent)}</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.matches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.likesReceived}</Text>
            <Text style={styles.statLabel}>Likes Received</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.profileViews}</Text>
            <Text style={styles.statLabel}>Profile Views</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>Photos</Text>
          <View style={styles.photoGrid}>
            {data.photos.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.photoCell}>
                <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                {index === 0 ? (
                  <View style={styles.mainPhotoBadge}>
                    <Text style={styles.mainPhotoBadgeText}>Main</Text>
                  </View>
                ) : null}
                <Pressable
                  style={({ pressed }) => [styles.photoDeleteBtn, pressed && styles.pressed]}
                  onPress={() => handleDeletePhoto(index)}
                  accessibilityLabel="Delete photo"
                >
                  <Ionicons name="close" size={14} color={COLORS.white} />
                </Pressable>
              </View>
            ))}

            {canAddPhoto ? (
              <Pressable
                style={({ pressed }) => [
                  styles.photoCell,
                  styles.photoAddCell,
                  pressed && styles.pressed,
                ]}
                onPress={handleAddPhoto}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator color="#D4A843" size="small" />
                ) : (
                  <>
                    <Text style={styles.photoAddPlus}>+</Text>
                  </>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>

        {!data.genotypeVerified ? (
          <View style={styles.infoCard}>
            <View style={styles.verifyBanner}>
              <Text style={styles.verifyBannerText}>
                Verify your genotype to build trust with matches
              </Text>
              <Pressable
                style={({ pressed }) => [styles.verifyBtn, pressed && styles.pressed]}
                onPress={() => setShowVerifyModal(true)}
              >
                <Text style={styles.verifyBtnText}>Verify</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.infoCard}>
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

        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.chipRow}>
            {data.interests.length > 0 ? (
              data.interests.map((interest) => (
                <View key={interest} style={styles.chipMint}>
                  <Text style={styles.chipMintText}>{interest}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.sectionValue}>No interests added yet</Text>
            )}
          </View>
        </View>

        <View style={styles.goalCard}>
          <Text style={styles.sectionLabel}>Relationship Goal</Text>
          <Text style={styles.goalValue}>{goalLabel}</Text>
        </View>

        <View style={styles.footerCard}>
          <Pressable
            style={({ pressed }) => [styles.privacyLink, pressed && styles.pressed]}
            onPress={() => setShowCommunityGuidelines(true)}
          >
            <Text style={styles.privacyLinkText}>Community Guidelines</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.privacyLink, pressed && styles.pressed]}
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
                pressed && styles.pressed,
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
  container: { flex: 1, backgroundColor: COLORS.linen },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 36 },
  hero: {
    width: '100%',
    height: HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT,
  },
  heroPlaceholder: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: '#1A3D28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInitials: {
    fontSize: 80,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.5,
  },
  heroOverlayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 22,
    zIndex: 2,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  heroNameInput: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 2,
    minWidth: 140,
    flexShrink: 1,
  },
  heroLocation: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    fontWeight: '600',
    color: '#8FAF95',
  },
  heroLocationInput: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    fontWeight: '600',
    color: '#8FAF95',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(143, 175, 149, 0.55)',
    paddingVertical: 2,
    minWidth: 120,
  },
  heroEditFloating: {
    position: 'absolute',
    top: 54,
    right: 16,
    zIndex: 10,
  },
  editPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#D4A843',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  editPillText: {
    color: '#0D2818',
    fontSize: 14,
    fontWeight: '700',
  },
  editPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  cancelPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(13, 40, 24, 0.65)',
  },
  savePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#D4A843',
  },
  savePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D2818',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  footerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  strengthTitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.forest,
  },
  strengthPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D4A843',
  },
  strengthTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(143, 175, 149, 0.25)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D4A843',
  },
  strengthHint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    fontWeight: '600',
    color: '#8FAF95',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 18,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4A843',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    fontWeight: '600',
    color: '#8FAF95',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(143, 175, 149, 0.35)',
  },
  sectionLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    fontWeight: '700',
    color: '#8FAF95',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionValue: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.forest,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PHOTO_GAP,
  },
  photoCell: {
    width: PHOTO_CELL_SIZE,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.linen,
  },
  photoCellSpacer: {
    width: PHOTO_CELL_SIZE,
    aspectRatio: 1,
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  mainPhotoBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: '#D4A843',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  mainPhotoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0D2818',
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddCell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 168, 67, 0.08)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D4A843',
  },
  photoAddPlus: {
    fontSize: 34,
    fontWeight: '300',
    color: '#D4A843',
    lineHeight: 36,
  },
  pressed: { opacity: 0.88 },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D4A843',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  goalValue: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.forest,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipMint: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.mint,
  },
  chipMintText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.forest,
  },
  errorBanner: {
    fontFamily: 'Satoshi-Medium',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.errorBg,
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 20,
  },
  errorText: {
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(13, 40, 24, 0.6)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.forest,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: COLORS.linen, fontWeight: '700' },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  verifyBannerText: {
    flex: 1,
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.forest,
    lineHeight: 18,
  },
  verifyBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  verifyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.forest,
  },
  fieldInput: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.forest,
    borderWidth: 1.5,
    borderColor: 'rgba(13, 40, 24, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.linen,
  },
  bioInput: { minHeight: 100 },
  bio: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(13, 40, 24, 0.78)',
    fontWeight: '500',
  },
  privacyLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  privacyLinkText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.forest,
    textDecorationLine: 'underline',
  },
  signOutBtn: {
    marginTop: 4,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(163, 45, 45, 0.35)',
    backgroundColor: '#0D2818',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtnDisabled: { opacity: 0.6 },
  signOutText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 40, 24, 0.5)',
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
    fontFamily: 'Satoshi-Medium',
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
});
