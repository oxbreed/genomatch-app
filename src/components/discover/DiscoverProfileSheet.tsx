import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../../brand';
import {
  GenoCardFrame,
  GenoGlassSurface,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import GenoCompatRing from '../genomatch/GenoCompatRing';
import DiscoverActionDock from './DiscoverActionDock';
import DiscoverDetailRows from './DiscoverDetailRows';
import DiscoverInterestChips from './DiscoverInterestChips';
import DiscoverPremiumSection from './DiscoverPremiumSection';
import VerifiedBadge from '../VerifiedBadge';
import GenotypeBadge from '../GenotypeBadge';
import FamilyPlanningCard from '../FamilyPlanningCard';
import PresenceBadge from '../PresenceBadge';
import LocationLine from '../LocationLine';
import {
  EDUCATION_LABELS,
  HABIT_LABELS,
  RELIGION_LABELS,
  formatHeightCm,
} from '../../lib/profileDetails';
import { getGenotypeRiskShort } from '../../lib/compatibility';
import { GENO_TAB_BAR_HEIGHT } from '../navigation/tabBarLayout';
import { getInitials, RELATIONSHIP_GOAL_LABELS } from '../../data/mockData';
import { FONT_FAMILY, COLORS, LOGO_GOLD, MOTION, RADIUS, SHADOWS, TYPOGRAPHY } from '../../theme';
import type { DiscoveryProfile, Genotype } from '../../types/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.56);
const DISMISS_DRAG = 90;
const SHEET_HEIGHT = SCREEN_HEIGHT;

type Props = {
  visible: boolean;
  profile: DiscoveryProfile | null;
  viewerGenotype: Genotype | null;
  hideGenotype?: boolean;
  backdropOpacity: Animated.Value;
  translateY: Animated.Value;
  likePulseScale: Animated.Value;
  /** Card is driving the sheet — don't steal touches mid-drag */
  interactionLocked?: boolean;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
};

function formatGoal(goal?: string | null): string {
  if (!goal) return 'Not specified';
  return RELATIONSHIP_GOAL_LABELS[goal] ?? goal;
}

function buildDetailRows(profile: DiscoveryProfile): { icon: 'resize-outline' | 'sparkles-outline' | 'wine-outline' | 'cloud-outline' | 'school-outline'; label: string }[] {
  const rows: { icon: 'resize-outline' | 'sparkles-outline' | 'wine-outline' | 'cloud-outline' | 'school-outline'; label: string }[] = [];
  const height = formatHeightCm(profile.heightCm);
  if (height) rows.push({ icon: 'resize-outline', label: height });
  if (profile.religion) {
    rows.push({
      icon: 'sparkles-outline',
      label: RELIGION_LABELS[profile.religion] ?? profile.religion,
    });
  }
  if (profile.drinkingStatus) {
    rows.push({
      icon: 'wine-outline',
      label: `Drinks · ${HABIT_LABELS[profile.drinkingStatus] ?? profile.drinkingStatus}`,
    });
  }
  if (profile.smokingStatus) {
    rows.push({
      icon: 'cloud-outline',
      label: `Smokes · ${HABIT_LABELS[profile.smokingStatus] ?? profile.smokingStatus}`,
    });
  }
  if (profile.educationStatus) {
    rows.push({
      icon: 'school-outline',
      label: EDUCATION_LABELS[profile.educationStatus] ?? profile.educationStatus,
    });
  }
  return rows;
}

export default function DiscoverProfileSheet({
  visible,
  profile,
  viewerGenotype,
  hideGenotype = false,
  backdropOpacity,
  translateY,
  likePulseScale,
  interactionLocked = false,
  onClose,
  onLike,
  onPass,
  onSuperLike,
}: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const scrollAtTop = useRef(true);
  const photoScrollRef = useRef<ScrollView>(null);

  const gallery = useMemo(() => {
    if (!profile) return [] as string[];
    if (profile.photos.length > 0) return profile.photos;
    if (profile.avatarUrl) return [profile.avatarUrl];
    return [];
  }, [profile]);

  useEffect(() => {
    setPhotoIndex(0);
    photoScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [profile?.id]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        scrollAtTop.current && gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
          backdropOpacity.setValue(Math.max(0, 0.28 - gesture.dy / (SCREEN_HEIGHT * 0.5)));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > DISMISS_DRAG || gesture.vy > 0.55) {
          onClose();
          return;
        }
        Animated.parallel([
          Animated.spring(translateY, { toValue: 0, ...MOTION.springSheetFloat }),
          Animated.timing(backdropOpacity, {
            toValue: 0.28,
            duration: MOTION.sheetCloseMs,
            easing: MOTION.easing.sheetOut,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  const onMainScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollAtTop.current = event.nativeEvent.contentOffset.y <= 4;
  }, []);

  const onPhotoScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setPhotoIndex(next);
    },
    []
  );

  if (!visible || !profile) return null;

  const detailRows = buildDetailRows(profile);
  const hasPhotos = gallery.length > 0;

  return (
    <View
      style={styles.overlayRoot}
      pointerEvents={interactionLocked ? 'box-none' : 'auto'}
    >
      <Pressable
        style={styles.backdropPress}
        onPress={onClose}
        pointerEvents={interactionLocked ? 'none' : 'auto'}
      >
        <Animated.View style={[styles.backdropWash, { opacity: backdropOpacity }]} />
      </Pressable>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        pointerEvents={interactionLocked ? 'none' : 'auto'}
      >
          <View style={styles.dragZone} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            style={styles.mainScroll}
            contentContainerStyle={styles.mainScrollContent}
            showsVerticalScrollIndicator={false}
            bounces
            scrollEventThrottle={16}
            onScroll={onMainScroll}
          >
            <View style={styles.hero}>
              {hasPhotos ? (
                <ScrollView
                  ref={photoScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onPhotoScrollEnd}
                  decelerationRate="fast"
                  bounces={false}
                >
                  {gallery.map((uri, index) => (
                    <ImageBackground
                      key={`${uri}-${index}`}
                      source={{ uri }}
                      style={styles.heroPhoto}
                      imageStyle={styles.heroPhotoImage}
                      resizeMode="cover"
                    >
                      <LinearGradient
                        colors={['rgba(255,255,255,0.22)', 'transparent', 'transparent']}
                        locations={[0, 0.35, 1]}
                        style={styles.heroGlossTop}
                        pointerEvents="none"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(10, 10, 10, 0.15)', 'rgba(10, 10, 10, 0.72)']}
                        locations={[0.35, 0.65, 1]}
                        style={styles.heroGlossBottom}
                        pointerEvents="none"
                      />
                    </ImageBackground>
                  ))}
                </ScrollView>
              ) : (
                <LinearGradient
                  colors={[COLORS.forestDeep, COLORS.forest, COLORS.brandRedDeep]}
                  style={styles.heroPhoto}
                >
                  <View style={styles.noPhotoCircle}>
                    <Text style={styles.noPhotoInitials}>{getInitials(profile.name)}</Text>
                  </View>
                </LinearGradient>
              )}

              {gallery.length > 1 ? (
                <View style={styles.photoBars} pointerEvents="none">
                  {gallery.map((_, index) => (
                    <View
                      key={index}
                      style={[styles.photoBar, index === photoIndex && styles.photoBarActive]}
                    />
                  ))}
                </View>
              ) : null}

              <Pressable
                style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
                onPress={onClose}
                accessibilityLabel="Close profile"
                hitSlop={8}
              >
                <GenoMirrorRimFrame kind="steel" borderRadius={19} padding={1.5}>
                  <GenoMirrorSteelFill style={styles.closeBtnInner}>
                    <GenoMirrorMetallicIcon name="chevron-down" size={20} tone="chrome" />
                  </GenoMirrorSteelFill>
                </GenoMirrorRimFrame>
              </Pressable>

              <View style={styles.heroIdentity} pointerEvents="none">
                <Text style={styles.heroName}>
                  {profile.name}
                  {profile.age != null ? `, ${profile.age}` : ''}
                </Text>
                <LocationLine city={profile.city} distanceBand={profile.distanceBand} dark />
                <View style={styles.heroBadges}>
                  {!hideGenotype ? <GenotypeBadge genotype={profile.genotype} /> : null}
                  {profile.genotypeVerified ? <VerifiedBadge compact /> : null}
                  {profile.presenceState !== 'offline' || profile.isNewMember ? (
                    <PresenceBadge
                      presenceState={profile.presenceState}
                      isNewMember={profile.isNewMember}
                    />
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.infoBody}>
              <GenoCardFrame mirror showWatermark={false} style={styles.bondFrame}>
                <View style={styles.bondPanel}>
                  <View style={styles.bondHeader}>
                    <GenoMirrorRimFrame kind="gold" borderRadius={18} padding={1.5}>
                      <GenoMirrorSteelFill style={styles.bondMark}>
                        <GenoBondMark size={20} opacity={0.95} />
                      </GenoMirrorSteelFill>
                    </GenoMirrorRimFrame>
                    <Text style={styles.bondKicker}>Compatibility Profile</Text>
                  </View>
                  <Text style={styles.bondScoreLabel}>Compatibility score</Text>
                  <GenoCompatRing percent={profile.compatibility} size={96} glow />
                  <Text style={styles.bondRisk}>
                    {profile.compatibility}% compatible · {getGenotypeRiskShort(viewerGenotype, profile.genotype)}
                  </Text>
                  <Text style={styles.bondDisclaimer}>
                    Educational information only. Not medical advice.
                  </Text>
                </View>
              </GenoCardFrame>

              {profile.bio?.trim() ? (
                <DiscoverPremiumSection title="About">
                  <Text style={styles.bio}>{profile.bio.trim()}</Text>
                </DiscoverPremiumSection>
              ) : null}

              <FamilyPlanningCard
                viewerGenotype={viewerGenotype}
                candidateGenotype={profile.genotype}
                locked={hideGenotype}
                mirror
              />

              {detailRows.length > 0 ? (
                <DiscoverPremiumSection title="Details">
                  <DiscoverDetailRows rows={detailRows} />
                </DiscoverPremiumSection>
              ) : null}

              {profile.interests.length > 0 ? (
                <DiscoverPremiumSection title="Interests">
                  <DiscoverInterestChips interests={profile.interests} selectable />
                </DiscoverPremiumSection>
              ) : null}

              <DiscoverPremiumSection title="Looking for" accent>
                <Text style={styles.goalValue}>{formatGoal(profile.relationshipGoal)}</Text>
              </DiscoverPremiumSection>

              <View style={styles.scrollSpacer} />
            </View>
          </ScrollView>

          <View style={styles.floatingActions} pointerEvents="box-none">
            <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.xl} style={styles.dockRim}>
              <GenoGlassSurface
                variant="dark"
                borderRadius={RADIUS.xl - 1.5}
                showBorder={false}
                showSheen
                showTopRule
                shadow="none"
                intensity={42}
                contentStyle={styles.dockInner}
              >
                <DiscoverActionDock
                  variant="glass"
                  onPass={onPass}
                  onLike={onLike}
                  onSuperLike={onSuperLike}
                  likePulseScale={likePulseScale}
                />
              </GenoGlassSurface>
            </GenoMirrorRimFrame>
          </View>
        </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
    justifyContent: 'flex-end',
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    ...SHADOWS.glassElevated,
    shadowOpacity: 0.12,
  },
  dragZone: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
    zIndex: 20,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 120,
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: COLORS.forestDeep,
  },
  heroPhoto: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    justifyContent: 'flex-end',
  },
  heroPhotoImage: {
    resizeMode: 'cover',
  },
  heroGlossTop: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGlossBottom: {
    ...StyleSheet.absoluteFillObject,
  },
  photoBars: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 56,
    flexDirection: 'row',
    gap: 4,
    zIndex: 12,
  },
  photoBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  photoBarActive: {
    backgroundColor: LOGO_GOLD,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    zIndex: 14,
  },
  closeBtnInner: {
    width: 38,
    height: 38,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  heroIdentity: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    gap: 6,
    zIndex: 10,
  },
  heroName: {
    ...TYPOGRAPHY.displayName,
    fontSize: 32,
    color: COLORS.linen,
    textShadowColor: 'rgba(10, 10, 10, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  noPhotoCircle: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 239, 230, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  noPhotoInitials: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 44,
    color: COLORS.linen,
  },
  infoBody: {
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 20,
    backgroundColor: COLORS.background,
  },
  bondFrame: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  bondPanel: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  bondMark: {
    width: 36,
    height: 36,
    borderRadius: 16.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bondHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bondKicker: {
    ...TYPOGRAPHY.sectionLabel,
    fontFamily: FONT_FAMILY.marketingExtrabold,
    color: LOGO_GOLD,
    letterSpacing: 2,
  },
  bondScoreLabel: {
    ...TYPOGRAPHY.serifTitle,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
  },
  bondRisk: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '92%',
  },
  bondDisclaimer: {
    ...TYPOGRAPHY.disclaimer,
    textAlign: 'center',
    maxWidth: '92%',
    alignSelf: 'center',
  },
  bio: {
    ...TYPOGRAPHY.editorialBio,
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.text,
  },
  goalValue: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: -0.15,
  },
  scrollSpacer: {
    height: 8,
  },
  floatingActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: GENO_TAB_BAR_HEIGHT + 6,
    paddingTop: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dockRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  dockInner: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
});
