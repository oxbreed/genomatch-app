import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AvatarPhotoPicker from '../src/components/AvatarPhotoPicker';
import GenotypeBadge from '../src/components/GenotypeBadge';
import { COLORS, RELATIONSHIP_GOAL_LABELS } from '../src/data/mockData';
import { pickAndUploadProfilePhoto } from '../src/lib/photoUpload';
import { mapProfileRow } from '../src/lib/profileMapper';
import { logAuthState } from '../src/lib/auth';
import {
  getCurrentProfile,
  updateProfileAvatar,
  updateProfileFields,
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
  gradient: [string, string];
};

export default function Profile({ onSignOut }: ProfileProps) {
  const [profile, setProfile] = useState<EditableProfile | null>(null);
  const [draft, setDraft] = useState<EditableProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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
        gradient: mapped.gradient,
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

  const pickAndUploadPhoto = async () => {
    setUploadingPhoto(true);
    setError('');
    try {
      const url = await pickAndUploadProfilePhoto();
      if (!url) return;

      await updateProfileAvatar(url);

      const next = {
        ...(editing ? draft : profile)!,
        avatarUrl: url,
      };
      if (editing) setDraft(next);
      setProfile(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
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
        <View style={styles.heroCard}>
          <AvatarPhotoPicker
            name={data.displayName}
            gradient={data.gradient}
            avatarUrl={data.avatarUrl}
            size={100}
            uploading={uploadingPhoto}
            onPress={pickAndUploadPhoto}
          />

          {editing ? (
            <TextInput
              style={styles.nameInput}
              value={draft?.displayName}
              onChangeText={(text) =>
                setDraft((p) => (p ? { ...p, displayName: text } : p))
              }
            />
          ) : (
            <Text style={styles.displayName}>{data.displayName}</Text>
          )}

          <View style={styles.heroMeta}>
            <GenotypeBadge genotype={data.genotype} />
            <Text style={styles.ageCity}>
              {data.age ? `${data.age} · ` : ''}
              {data.city}
            </Text>
          </View>
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
          style={[styles.signOutBtn, signingOut && styles.signOutBtnDisabled]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          <Text style={styles.signOutText}>
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </Pressable>
      </ScrollView>
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
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.8,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.forest,
  },
  editBtnText: { color: COLORS.ivory, fontSize: 14, fontWeight: '800' },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cancelText: { fontSize: 14, fontWeight: '700', color: 'rgba(7, 77, 46, 0.6)' },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.forest },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    color: '#A32D2D',
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
  retryText: { color: COLORS.ivory, fontWeight: '800' },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
  },
  displayName: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.forest,
  },
  nameInput: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.forest,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.sage,
    minWidth: 200,
    paddingVertical: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  ageCity: { fontSize: 14, fontWeight: '600', color: 'rgba(7, 77, 46, 0.65)' },
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
  goalText: { fontSize: 16, fontWeight: '800', color: COLORS.forest },
  signOutBtn: {
    marginTop: 8,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(163, 45, 45, 0.35)',
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtnDisabled: { opacity: 0.6 },
  signOutText: { fontSize: 16, fontWeight: '800', color: '#A32D2D' },
});
