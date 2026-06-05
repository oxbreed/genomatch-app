import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoBondHalo } from '../../brand/graphics';
import GenotypeBadge from '../GenotypeBadge';
import VerifiedBadge from '../VerifiedBadge';
import { COLORS, getInitials } from '../../data/mockData';
import { getGenotypeRiskShort } from '../../lib/compatibility';
import type { DiscoveryProfile, Genotype } from '../../types/database';
import DiscoverMatchPill from './DiscoverMatchPill';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
export const DISCOVER_CARD_HEIGHT = SCREEN_HEIGHT * 0.55;

function getCompatDotColor(percent: number): string {
  if (percent >= 80) return COLORS.gold;
  if (percent >= 60) return COLORS.sage;
  return COLORS.linen;
}

type Props = {
  profile: DiscoveryProfile;
  swipeIndex?: number;
  totalProfiles?: number;
  viewerGenotype?: Genotype | null;
  progressFillWidth?: Animated.AnimatedInterpolation<string | number>;
};

export default function DiscoverSwipeCard({
  profile,
  swipeIndex,
  totalProfiles,
  viewerGenotype,
  progressFillWidth,
}: Props) {
  const gallery = useMemo(() => {
    if (profile.photos.length > 0) return profile.photos;
    if (profile.avatarUrl) return [profile.avatarUrl];
    return [];
  }, [profile.photos, profile.avatarUrl]);

  const [photoIndex, setPhotoIndex] = useState(0);
  const hasMultiple = gallery.length > 1;
  const currentUri = gallery[photoIndex] ?? gallery[0];
  const riskShort = getGenotypeRiskShort(viewerGenotype ?? null, profile.genotype);

  useEffect(() => {
    setPhotoIndex(0);
  }, [profile.id]);

  const progressRatio =
    swipeIndex != null && totalProfiles != null && totalProfiles > 0
      ? Math.min(1, Math.max(0, swipeIndex / totalProfiles))
      : 0;

  return (
    <LinearGradient
      colors={['rgba(212, 168, 67, 0.55)', 'rgba(61, 122, 82, 0.35)', 'rgba(212, 168, 67, 0.45)']}
      style={styles.cardFrame}
    >
      <View style={styles.cardBody}>
        {totalProfiles != null && totalProfiles > 0 && swipeIndex != null ? (
          <View style={styles.swipeProgressTrack} pointerEvents="none">
            <Animated.View
              style={[
                styles.swipeProgressFill,
                progressFillWidth
                  ? { width: progressFillWidth }
                  : { width: `${progressRatio * 100}%` },
              ]}
            />
          </View>
        ) : null}

        {currentUri ? (
          <ImageBackground
            source={{ uri: currentUri }}
            style={styles.cardMedia}
            imageStyle={styles.cardMediaImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[COLORS.forestDeep, COLORS.forest]}
            style={[styles.cardMedia, styles.cardNoPhoto]}
          >
            <GenoBondHalo size={120} opacity={0.4} animated />
            <Text style={styles.noPhotoInitials}>{getInitials(profile.name)}</Text>
            <Text style={styles.noPhotoCaption}>No photo yet</Text>
          </LinearGradient>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(13, 40, 24, 0.55)', 'rgba(13, 40, 24, 0.92)']}
          style={styles.cardBottomShade}
          pointerEvents="none"
        />

        <View style={styles.cardInfoFooter} pointerEvents="box-none">
          <View style={styles.nameBadgeRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {profile.name}
              {profile.age != null ? `, ${profile.age}` : ''}
            </Text>
            <GenotypeBadge genotype={profile.genotype} />
            {profile.genotypeVerified ? <VerifiedBadge compact /> : null}
          </View>

          <View style={styles.cityRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.sage} />
            <Text style={styles.cityText}>{profile.city}</Text>
          </View>

          <View style={styles.compatRow}>
            <View
              style={[
                styles.compatDot,
                { backgroundColor: getCompatDotColor(profile.compatibility) },
              ]}
            />
            <Text style={styles.compatText} numberOfLines={2}>
              {profile.compatibility}% bond · {riskShort}
            </Text>
          </View>

          <Text style={styles.cardBio} numberOfLines={3} ellipsizeMode="tail">
            {profile.bio || 'Tap to view full profile'}
          </Text>

          <View style={styles.tagsRow}>
            {profile.interests.slice(0, 4).map((interest) => (
              <View key={interest} style={styles.tagChip}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {hasMultiple ? (
          <>
            <View style={styles.photoDots} pointerEvents="none">
              {gallery.map((_, i) => (
                <View
                  key={i}
                  style={[styles.photoDot, i === photoIndex && styles.photoDotActive]}
                />
              ))}
            </View>
            <Pressable
              style={styles.photoTapLeft}
              onPress={() => setPhotoIndex((i) => (i <= 0 ? gallery.length - 1 : i - 1))}
            />
            <Pressable
              style={styles.photoTapRight}
              onPress={() =>
                setPhotoIndex((i) => (i >= gallery.length - 1 ? 0 : i + 1))
              }
            />
          </>
        ) : null}

        <DiscoverMatchPill percent={profile.compatibility} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  cardFrame: {
    flex: 1,
    borderRadius: 26,
    padding: 2,
    shadowColor: COLORS.forest,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  cardBody: {
    width: '100%',
    height: DISCOVER_CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.forestDeep,
  },
  swipeProgressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 7,
    overflow: 'hidden',
  },
  swipeProgressFill: {
    height: 4,
    backgroundColor: COLORS.gold,
  },
  cardMedia: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMediaImage: {
    borderRadius: 24,
  },
  cardNoPhoto: {
    gap: 8,
  },
  noPhotoInitials: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 56,
    color: COLORS.linen,
    letterSpacing: 2,
  },
  noPhotoCaption: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: COLORS.sage,
  },
  cardBottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  cardInfoFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 12,
    zIndex: 6,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  cardName: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 26,
    color: COLORS.linen,
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  cityText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.sage,
  },
  compatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  compatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  compatText: {
    flex: 1,
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(245, 239, 230, 0.9)',
  },
  cardBio: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(245, 239, 230, 0.85)',
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 168, 67, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.4)',
  },
  tagText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: COLORS.linen,
  },
  photoDots: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    zIndex: 8,
  },
  photoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  photoDotActive: {
    width: 18,
    backgroundColor: COLORS.gold,
  },
  photoTapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '35%',
    zIndex: 5,
  },
  photoTapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '35%',
    zIndex: 5,
  },
});
