import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ProfileAvatar from '../src/components/ProfileAvatar';
import {
  COLORS,
  CurrentUserProfile,
  MOCK_CURRENT_USER,
  RELATIONSHIP_GOAL_LABELS,
} from '../src/data/mockData';
import { supabase } from '../src/lib/supabase';

type ProfileProps = {
  onSignOut?: () => void;
};

export default function Profile({ onSignOut }: ProfileProps) {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<CurrentUserProfile>(MOCK_CURRENT_USER);
  const [draft, setDraft] = useState<CurrentUserProfile>(MOCK_CURRENT_USER);
  const [signingOut, setSigningOut] = useState(false);

  const startEdit = () => {
    setDraft({ ...profile });
    setEditing(true);
  };

  const saveEdit = () => {
    setProfile({ ...draft });
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({ ...profile });
    setEditing(false);
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
            // Continue to reset app state even if sign-out fails
          } finally {
            setSigningOut(false);
            onSignOut?.();
          }
        },
      },
    ]);
  };

  const data = editing ? draft : profile;
  const goalLabel =
    RELATIONSHIP_GOAL_LABELS[data.relationshipGoal] ?? data.relationshipGoal;

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
            <Pressable onPress={cancelEdit}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={saveEdit}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <ProfileAvatar
            name={data.displayName}
            gradient={data.gradient}
            size={100}
          />
          {editing ? (
            <TextInput
              style={styles.nameInput}
              value={draft.displayName}
              onChangeText={(text) => setDraft((p) => ({ ...p, displayName: text }))}
              placeholder="Display name"
              placeholderTextColor="rgba(7, 77, 46, 0.35)"
            />
          ) : (
            <Text style={styles.displayName}>{data.displayName}</Text>
          )}
          <View style={styles.heroMeta}>
            <GenotypeBadge genotype={data.genotype} />
            <Text style={styles.ageCity}>
              {data.age} · {data.city}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>City</Text>
          {editing ? (
            <TextInput
              style={styles.fieldInput}
              value={draft.city}
              onChangeText={(text) => setDraft((p) => ({ ...p, city: text }))}
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
              value={draft.bio}
              onChangeText={(text) => setDraft((p) => ({ ...p, bio: text }))}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          ) : (
            <Text style={styles.bio}>{data.bio}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.chipRow}>
            {data.interests.map((interest) => (
              <View key={interest} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
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
  editBtnText: {
    color: COLORS.ivory,
    fontSize: 14,
    fontWeight: '800',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(7, 77, 46, 0.6)',
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.forest,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
    shadowColor: COLORS.forest,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  displayName: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.4,
  },
  nameInput: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.forest,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.sage,
    paddingVertical: 4,
    minWidth: 200,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  ageCity: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(7, 77, 46, 0.65)',
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
  sectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.forest,
  },
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
  bioInput: {
    minHeight: 100,
  },
  bio: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(7, 77, 46, 0.78)',
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.forest,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 224, 130, 0.35)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 135, 43, 0.25)',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.forest,
  },
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
  signOutBtnDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#A32D2D',
  },
});
