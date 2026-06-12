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
import { GenoLogoCeremony } from '../../brand/graphics';
import { GenoBondMark } from '../../brand';
import GenotypeBadge from '../GenotypeBadge';
import VerifiedBadge from '../VerifiedBadge';
import { FONT_FAMILY, COLORS } from '../../theme';
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
          colors={['rgba(22, 53, 34, 0.82)', 'rgba(22, 53, 34, 0.82)']}
          style={styles.heroPlaceholder}
        >
          <GenoLogoCeremony variant="hero" tone="light" />
          {!studioMode ? (
            <Text style={styles.placeholderHint}>Add a photo in Profile Studio</Text>
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
        <View style={[styles.brandPill, studioMode && styles.studioPill]}>
          <GenoBondMark size={18} opacity={0.95} />
          <Text style={[styles.brandText, studioMode && styles.studioPillText]}>
            {studioMode ? 'Studio' : 'GenoMatch'}
          </Text>
        </View>
        {!studioMode && !editing ? (
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
            onPress={onEdit}
          >
            <Ionicons name="color-wand-outline" size={15} color={COLORS.linen} />
            <Text style={styles.editText}>Studio</Text>
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
    color: 'rgba(143, 175, 149, 0.85)',
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
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(13, 40, 24, 0.52)',
    borderWidth: 1,
    borderColor: 'rgba(245, 239, 230, 0.12)',
  },
  studioPill: {
    borderColor: 'rgba(212, 168, 67, 0.55)',
    backgroundColor: 'rgba(13, 40, 24, 0.78)',
  },
  brandText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    color: COLORS.linen,
    letterSpacing: 0.3,
  },
  studioPillText: {
    color: COLORS.gold,
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
    borderBottomColor: 'rgba(212, 168, 67, 0.6)',
    minWidth: 120,
    flexShrink: 1,
    paddingVertical: 2,
  },
  location: {
    ...PROFILE_TYPE.heroMeta,
    color: 'rgba(245, 239, 230, 0.82)',
  },
  locationInput: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: COLORS.linen,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 168, 67, 0.5)',
    paddingVertical: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 239, 230, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 239, 230, 0.28)',
  },
  editText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 12,
    color: COLORS.linen,
    letterSpacing: 0.2,
  },
  pressed: { opacity: 0.88 },
});
