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
import {
  DISCOVERY_CARD_FOOTER_BOTTOM,
  DISCOVERY_CARD_HINT_BOTTOM,
  DISCOVERY_CARD_RADIUS,
  getDiscoveryCardHeight,
} from '../../components/navigation/tabBarLayout';
import GenotypeBadge from '../GenotypeBadge';
import LocationLine from '../LocationLine';
import { COLORS, getInitials } from '../../data/mockData';
import { FONT_FAMILY, SHADOWS } from '../../theme';
import { getGenotypeRiskShort } from '../../lib/compatibility';
import type { DiscoveryProfile, Genotype } from '../../types/database';
import DiscoverMatchPill from './DiscoverMatchPill';
import { DISCOVER_GLASS_ICON, discoverGlassType } from './discoverGlassType';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
export const DISCOVER_CARD_HEIGHT = getDiscoveryCardHeight(SCREEN_HEIGHT);

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
  height?: number;
  onExpand?: () => void;
};

/** Full-bleed bond card — seamless photo, no frame seam */
export default function DiscoverSwipeCard({
  profile,
  swipeIndex,
  totalProfiles,
  viewerGenotype,
  progressFillWidth,
  height = DISCOVER_CARD_HEIGHT,
  onExpand,
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
    <View style={[styles.cardShell, { height }]}>
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
          <View style={styles.noPhotoCircle}>
            <Text style={styles.noPhotoInitials}>{getInitials(profile.name)}</Text>
          </View>
          <Text style={styles.noPhotoCaption}>No photo yet</Text>
        </LinearGradient>
      )}

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.14)', 'transparent', 'transparent']}
        locations={[0, 0.25, 1]}
        style={styles.cardGloss}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['rgba(13, 40, 24, 0.22)', 'transparent']}
        style={styles.cardTopShade}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['transparent', 'rgba(13, 40, 24, 0.5)', 'rgba(13, 40, 24, 0.88)']}
        locations={[0, 0.45, 1]}
        style={styles.cardBottomShade}
        pointerEvents="none"
      />

      <Pressable
        style={styles.cardInfoFooter}
        onPress={onExpand}
        disabled={!onExpand}
        accessibilityLabel="View full profile"
      >
        <View style={styles.nameBadgeRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {profile.name}
            {profile.age != null ? `, ${profile.age}` : ''}
          </Text>
          <View style={styles.nameBadgeCluster}>
            <GenotypeBadge genotype={profile.genotype} />
            {profile.genotypeVerified ? (
              <Ionicons
                name="shield-checkmark"
                size={17}
                color={COLORS.verified}
                accessibilityLabel="Genotype verified"
              />
            ) : null}
          </View>
        </View>

        <LocationLine city={profile.city} distanceBand={profile.distanceBand} dark />

        <View style={styles.compatRow}>
          <View
            style={[
              styles.compatDot,
              { backgroundColor: getCompatDotColor(profile.compatibility) },
            ]}
          />
          <Text style={styles.compatText} numberOfLines={1}>
            {profile.compatibility}% · {riskShort}
          </Text>
        </View>
      </Pressable>

      {onExpand ? (
        <Pressable
          style={styles.expandHintWrap}
          onPress={onExpand}
          accessibilityLabel="Swipe up for more profile details"
          hitSlop={10}
        >
          <Ionicons name="chevron-up" size={12} color={DISCOVER_GLASS_ICON} />
          <Text style={discoverGlassType.hint}>Swipe up for more</Text>
        </Pressable>
      ) : null}

      {hasMultiple ? (
        <>
          <View style={styles.photoBars} pointerEvents="none">
            {gallery.map((_, i) => (
              <View
                key={i}
                style={[styles.photoBar, i === photoIndex && styles.photoBarActive]}
              />
            ))}
          </View>
          <Pressable
            style={styles.photoTapLeft}
            onPress={() => setPhotoIndex((i) => (i <= 0 ? gallery.length - 1 : i - 1))}
            accessibilityLabel="Previous photo"
          />
          <Pressable
            style={styles.photoTapRight}
            onPress={() => setPhotoIndex((i) => (i >= gallery.length - 1 ? 0 : i + 1))}
            accessibilityLabel="Next photo"
          />
        </>
      ) : null}

      <DiscoverMatchPill percent={profile.compatibility} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    width: '100%',
    borderRadius: DISCOVERY_CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: COLORS.forestDeep,
    ...SHADOWS.glassElevated,
    shadowColor: COLORS.forest,
    shadowOpacity: 0.16,
  },
  swipeProgressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 7,
    overflow: 'hidden',
  },
  swipeProgressFill: {
    height: 2,
    backgroundColor: COLORS.gold,
  },
  cardMedia: {
    ...StyleSheet.absoluteFillObject,
  },
  cardMediaImage: {
    borderRadius: DISCOVERY_CARD_RADIUS,
  },
  cardNoPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noPhotoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 239, 230, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  noPhotoInitials: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 44,
    color: COLORS.linen,
    letterSpacing: 2,
  },
  noPhotoCaption: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    color: COLORS.sage,
  },
  cardGloss: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  cardTopShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20%',
    zIndex: 2,
  },
  cardBottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    zIndex: 2,
  },
  cardInfoFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: DISCOVERY_CARD_FOOTER_BOTTOM,
    paddingHorizontal: 18,
    zIndex: 6,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 8,
    marginBottom: 6,
  },
  nameBadgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  cardName: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 25,
    color: COLORS.linen,
    letterSpacing: -0.4,
    flexShrink: 1,
    minWidth: 0,
    textShadowColor: 'rgba(13, 40, 24, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  compatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  compatDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 5,
  },
  compatText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(245, 239, 230, 0.9)',
  },
  expandHintWrap: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: DISCOVERY_CARD_HINT_BOTTOM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 14,
  },
  photoBars: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
    zIndex: 8,
  },
  photoBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  photoBarActive: {
    backgroundColor: COLORS.linen,
  },
  photoTapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 100,
    width: '34%',
    zIndex: 5,
  },
  photoTapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 100,
    width: '34%',
    zIndex: 5,
  },
});
