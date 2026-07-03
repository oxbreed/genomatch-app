import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoLogoCeremony, GenoMirrorMetallicIcon, GenoMirrorRimFrame, GenoMirrorSteelFill } from '../../brand/graphics';
import { GenoBondMark } from '../../brand';
import GenotypeBadge from '../GenotypeBadge';
import VerifiedBadge from '../VerifiedBadge';
import {FONT_FAMILY, COLORS, LOGO_GOLD, RADIUS} from '../../theme';
import { PROFILE_TYPE } from './profileTokens';
import type { Genotype } from '../../types/database';

type Props = {
  displayName: string;
  city: string;
  age: string;
  genotype: Genotype;
  genotypeVerified: boolean;
  heroPhotoUri: string | null;
  editing: boolean;
  saving?: boolean;
  draftName?: string;
  draftCity?: string;
  onChangeName?: (text: string) => void;
  onChangeCity?: (text: string) => void;
  onRefreshLocation?: () => void;
  locatingCity?: boolean;
  cityLocked?: boolean;
  onEdit: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  studioMode?: boolean;
};

export default function ProfileHero({
  displayName,
  city,
  age,
  genotype,
  genotypeVerified,
  heroPhotoUri,
  editing,
  draftName,
  draftCity,
  onChangeName,
  onChangeCity,
  onRefreshLocation,
  locatingCity = false,
  cityLocked = false,
  onEdit,
  studioMode = false,
}: Props) {
  const showInlineEdit = studioMode && editing;

  return (
    <View style={styles.hero}>
      {heroPhotoUri ? (
        <Image source={{ uri: heroPhotoUri }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={['rgba(26, 20, 18, 0.82)', 'rgba(26, 20, 18, 0.82)']}
          style={styles.heroPlaceholder}
        >
          <GenoLogoCeremony variant="hero" tone="light" />
          {!studioMode ? (
            <Text style={styles.placeholderHint}>Add a photo when you edit your profile.</Text>
          ) : null}
        </LinearGradient>
      )}

      {heroPhotoUri && studioMode ? (
        <View style={styles.photoSeal} pointerEvents="none">
          <GenoLogoCeremony variant="mark" tone="light" subtle style={styles.sealMark} />
        </View>
      ) : null}

      <LinearGradient
        colors={['transparent', 'rgba(13,40,24,0.42)', 'rgba(13,40,24,0.94)']}
        style={styles.heroGradient}
        pointerEvents="none"
      />

      <View style={styles.topBar}>
        <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.pill} style={styles.brandPillWrap}>
          <GenoMirrorSteelFill style={[styles.brandPill, studioMode && styles.studioPill]}>
            <GenoBondMark size={18} opacity={0.95} surface="dark" />
            <Text style={[styles.brandText, studioMode && styles.studioPillText]}>
              {studioMode ? 'Studio' : 'GenoMatch'}
            </Text>
          </GenoMirrorSteelFill>
        </GenoMirrorRimFrame>
        {!studioMode && !editing ? (
          <Pressable
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={onEdit}
          >
            <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.pill}>
              <GenoMirrorSteelFill style={styles.editBtn}>
                <GenoMirrorMetallicIcon name="sparkles" size={15} tone="gold" />
                <Text style={styles.editText}>Studio</Text>
              </GenoMirrorSteelFill>
            </GenoMirrorRimFrame>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.overlay}>
        <View style={styles.nameRow}>
          {showInlineEdit ? (
            <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={onChangeName}
              placeholder="Display name"
              placeholderTextColor="rgba(255,255,255,0.45)"
            />
          ) : (
            <View style={styles.nameBlock}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              <View style={styles.nameAccent} />
            </View>
          )}
          <GenotypeBadge genotype={genotype} />
          {genotypeVerified ? <VerifiedBadge compact /> : null}
        </View>
        {showInlineEdit ? (
          <View style={styles.locationRow}>
            {cityLocked ? (
              <View style={styles.locationLocked}>
                <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.75)" />
                <Text style={styles.locationLockedText}>{draftCity || city || 'City locked'}</Text>
              </View>
            ) : (
              <TextInput
                style={styles.locationInput}
                value={draftCity}
                onChangeText={onChangeCity}
                placeholder="City"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
              />
            )}
            {!cityLocked ? (
              <Pressable
                style={({ pressed }) => [pressed && styles.pressed]}
                onPress={onRefreshLocation}
                disabled={locatingCity || !onRefreshLocation}
                accessibilityLabel="Use current location"
              >
                <GenoMirrorRimFrame kind="steel" borderRadius={18} padding={1.5}>
                  <GenoMirrorSteelFill style={styles.locationRefresh}>
                    <GenoMirrorMetallicIcon
                      name={locatingCity ? 'hourglass-outline' : 'locate'}
                      size={18}
                      tone="steel"
                    />
                  </GenoMirrorSteelFill>
                </GenoMirrorRimFrame>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <Text style={styles.location}>
            {age ? `${age} · ` : ''}
            {city || 'Add your city'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderHint: {
    position: 'absolute',
    bottom: 72,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  photoSeal: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
    opacity: 0.85,
  },
  sealMark: {
    width: 44,
    height: 44,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 3,
  },
  brandPillWrap: {
    maxWidth: '58%',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  studioPill: {},
  brandText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    color: COLORS.linen,
    letterSpacing: 0.3,
  },
  studioPillText: {
    color: LOGO_GOLD,
    letterSpacing: 0.8,
  },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 22,
    zIndex: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  nameBlock: {
    flexShrink: 1,
    gap: 4,
  },
  name: {
    ...PROFILE_TYPE.heroName,
    color: COLORS.linen,
    flexShrink: 1,
  },
  nameAccent: {
    width: 32,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.7,
  },
  nameInput: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 24,
    color: COLORS.linen,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
    minWidth: 120,
    flexShrink: 1,
    paddingVertical: 2,
  },
  location: {
    ...PROFILE_TYPE.heroMeta,
    color: 'rgba(245, 239, 230, 0.82)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: COLORS.linen,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 2,
  },
  locationLocked: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  locationLockedText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: 'rgba(245, 239, 230, 0.82)',
  },
  locationRefresh: {
    width: 36,
    height: 36,
    borderRadius: 16.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  editText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 12,
    color: COLORS.linen,
    letterSpacing: 0.2,
  },
  pressed: { opacity: 0.88 },
});
