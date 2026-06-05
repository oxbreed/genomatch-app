import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoBondHalo, GenoSparkCeremony } from '../../brand/graphics';
import { GenoBondMark } from '../../brand';
import GenotypeBadge from '../GenotypeBadge';
import VerifiedBadge from '../VerifiedBadge';
import { INBOX } from '../inbox/inboxTokens';
import { COLORS } from '../../theme';
import { getInitials } from '../../data/mockData';
import type { Genotype } from '../../types/database';

type Props = {
  displayName: string;
  city: string;
  age: string;
  genotype: Genotype;
  genotypeVerified: boolean;
  heroPhotoUri: string | null;
  editing: boolean;
  saving: boolean;
  draftName?: string;
  draftCity?: string;
  onChangeName?: (text: string) => void;
  onChangeCity?: (text: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  completionPercent: number;
  /** Studio edit: hero chrome + bottom dock handle actions */
  studioMode?: boolean;
};

const HERO_HEIGHT = 300;

export default function ProfileHero({
  displayName,
  city,
  age,
  genotype,
  genotypeVerified,
  heroPhotoUri,
  editing,
  saving,
  draftName,
  draftCity,
  onChangeName,
  onChangeCity,
  onEdit,
  onCancel,
  onSave,
  completionPercent,
  studioMode = false,
}: Props) {
  return (
    <View style={[styles.hero, editing && styles.heroEditing]}>
      <GenoSparkCeremony variant="forest" />
      {heroPhotoUri ? (
        <Image source={{ uri: heroPhotoUri }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[COLORS.forest, COLORS.forestDeep]}
          style={styles.heroPlaceholder}
        >
          <View style={styles.haloWrap}>
            <GenoBondHalo size={140} opacity={0.5} animated />
            <Text style={styles.initials}>{getInitials(displayName)}</Text>
          </View>
        </LinearGradient>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(13,40,24,0.5)', 'rgba(13,40,24,0.96)']}
        style={styles.heroGradient}
        pointerEvents="none"
      />

      <View style={styles.topBar}>
        <View style={styles.brandPill}>
          <GenoBondMark size={22} opacity={0.95} />
          <Text style={styles.brandText}>Your bond</Text>
        </View>
        <View style={styles.topRight}>
          {!studioMode && !editing ? (
            <Pressable
              style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
              onPress={onEdit}
            >
              <LinearGradient colors={INBOX.colors.goldBtn} style={styles.editGradient}>
                <Ionicons name="color-wand-outline" size={16} color={COLORS.forestDeep} />
                <Text style={styles.editText}>Open studio</Text>
              </LinearGradient>
            </Pressable>
          ) : null}
          {!studioMode && editing ? (
            <View style={styles.editRow}>
              <Pressable style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={onSave} disabled={saving}>
                <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.saveGradient}>
                  {saving ? (
                    <ActivityIndicator color={COLORS.forestDeep} size="small" />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.overlay}>
        <View style={styles.nameRow}>
          {editing ? (
            <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={onChangeName}
              placeholder="Display name"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />
          ) : (
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
          )}
          <GenotypeBadge genotype={genotype} />
          {genotypeVerified ? <VerifiedBadge compact /> : null}
        </View>
        {editing ? (
          <TextInput
            style={styles.locationInput}
            value={draftCity}
            onChangeText={onChangeCity}
            placeholder="City"
            placeholderTextColor="rgba(143, 175, 149, 0.6)"
          />
        ) : (
          <Text style={styles.location}>
            {age ? `${age} · ` : ''}
            {city}
          </Text>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  heroEditing: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.gold,
  },
  heroImage: { width: '100%', height: HERO_HEIGHT },
  heroPlaceholder: {
    width: '100%',
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    position: 'absolute',
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 72,
    color: COLORS.linen,
    letterSpacing: 2,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.65,
  },
  topBar: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 3,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(13, 40, 24, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  brandText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: COLORS.linen,
  },
  completionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  completionText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: COLORS.forestDeep,
  },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 56,
    zIndex: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 28,
    color: COLORS.linen,
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  nameInput: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 26,
    color: COLORS.linen,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(212, 168, 67, 0.6)',
    minWidth: 120,
    flexShrink: 1,
    paddingVertical: 2,
  },
  location: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: 'rgba(143, 175, 149, 0.95)',
  },
  locationInput: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.linen,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 168, 67, 0.5)',
    paddingVertical: 2,
  },
  editBtn: { borderRadius: 999, overflow: 'hidden' },
  editGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  editText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  editRow: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  cancelText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.textSubtle,
  },
  saveBtn: { borderRadius: 999, overflow: 'hidden' },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 88,
    justifyContent: 'center',
  },
  saveText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  pressed: { opacity: 0.9 },
});
