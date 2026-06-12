import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { GenoBondMark } from '../../brand';
import GenoCompatRing from '../genomatch/GenoCompatRing';
import DiscoverActionDock from './DiscoverActionDock';
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
import { COLORS, getInitials, RELATIONSHIP_GOAL_LABELS } from '../../data/mockData';
import { FONT_FAMILY, MOTION, RADIUS, SHADOWS } from '../../theme';
import type { DiscoveryProfile, Genotype } from '../../types/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.56);
const DISMISS_DRAG = 90;
const SHEET_HEIGHT = SCREEN_HEIGHT;

type Props = {
  visible: boolean;
  profile: DiscoveryProfile | null;
  viewerGenotype: Genotype | null;
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

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoTitle}>{title}</Text>
      <View style={styles.infoPanel}>{children}</View>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
      <View style={styles.detailIconWrap}>
        <Ionicons name={icon} size={15} color={COLORS.gold} />
      </View>
      <Text style={styles.detailText}>{label}</Text>
    </View>
  );
}

function buildDetailRows(profile: DiscoveryProfile): { icon: keyof typeof Ionicons.glyphMap; label: string }[] {
  const rows: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [];
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
  const riskShort = getGenotypeRiskShort(viewerGenotype, profile.genotype);
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
                        colors={['transparent', 'rgba(13, 40, 24, 0.15)', 'rgba(13, 40, 24, 0.72)']}
                        locations={[0.35, 0.65, 1]}
                        style={styles.heroGlossBottom}
                        pointerEvents="none"
                      />
                    </ImageBackground>
                  ))}
                </ScrollView>
              ) : (
                <LinearGradient
                  colors={[COLORS.forestDeep, COLORS.forest, '#2A5A3E']}
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
                <Ionicons name="chevron-down" size={22} color={COLORS.linen} />
              </Pressable>

              <View style={styles.heroIdentity} pointerEvents="none">
                <Text style={styles.heroName}>
                  {profile.name}
                  {profile.age != null ? `, ${profile.age}` : ''}
                </Text>
                <LocationLine city={profile.city} distanceBand={profile.distanceBand} dark />
                <View style={styles.heroBadges}>
                  <GenotypeBadge genotype={profile.genotype} />
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
              <View style={styles.bondPanel}>
                <View style={styles.bondHeader}>
                  <GenoBondMark size={18} opacity={0.75} />
                  <Text style={styles.bondKicker}>Genotype bond</Text>
                </View>
                <GenoCompatRing percent={profile.compatibility} size={88} />
                <Text style={styles.bondRisk}>{riskShort}</Text>
                <Text style={styles.bondDisclaimer}>Informational only — not medical advice.</Text>
              </View>

              {profile.bio?.trim() ? (
                <InfoSection title="About">
                  <Text style={styles.bio}>{profile.bio.trim()}</Text>
                </InfoSection>
              ) : null}

              <FamilyPlanningCard
                viewerGenotype={viewerGenotype}
                candidateGenotype={profile.genotype}
              />

              {detailRows.length > 0 ? (
                <InfoSection title="Details">
                  {detailRows.map((row, index) => (
                    <DetailRow
                      key={`${row.icon}-${row.label}`}
                      icon={row.icon}
                      label={row.label}
                      isLast={index === detailRows.length - 1}
                    />
                  ))}
                </InfoSection>
              ) : null}

              {profile.interests.length > 0 ? (
                <InfoSection title="Interests">
                  <View style={styles.chipRow}>
                    {profile.interests.map((interest) => (
                      <View key={interest} style={styles.chip}>
                        <Text style={styles.chipText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </InfoSection>
              ) : null}

              <InfoSection title="Looking for">
                <Text style={styles.goalValue}>{formatGoal(profile.relationshipGoal)}</Text>
              </InfoSection>

              <View style={styles.scrollSpacer} />
            </View>
          </ScrollView>

          <View style={styles.floatingActions} pointerEvents="box-none">
            <DiscoverActionDock
              variant="glass"
              onPass={onPass}
              onLike={onLike}
              onSuperLike={onSuperLike}
              likePulseScale={likePulseScale}
            />
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
    backgroundColor: COLORS.linen,
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.linen,
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
    backgroundColor: 'rgba(22, 53, 34, 0.14)',
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
    backgroundColor: COLORS.linen,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(13, 40, 24, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 14,
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
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 32,
    color: COLORS.linen,
    letterSpacing: -0.6,
    textShadowColor: 'rgba(13, 40, 24, 0.55)',
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
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  noPhotoInitials: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 44,
    color: COLORS.linen,
  },
  infoBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  bondPanel: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(13, 40, 24, 0.08)',
    ...SHADOWS.card,
    shadowOpacity: 0.06,
  },
  bondHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bondKicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: COLORS.forest,
  },
  bondRisk: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.forestDeep,
    textAlign: 'center',
    maxWidth: '92%',
  },
  bondDisclaimer: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.textSubtle,
    textAlign: 'center',
  },
  infoSection: {
    gap: 10,
  },
  infoTitle: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.forest,
    opacity: 0.8,
  },
  infoPanel: {
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(13, 40, 24, 0.08)',
    ...SHADOWS.card,
    shadowOpacity: 0.05,
  },
  bio: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
    lineHeight: 25,
    color: COLORS.forestDeep,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  detailRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(13, 40, 24, 0.08)',
  },
  detailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.forestDeep,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: 'rgba(13, 40, 24, 0.1)',
  },
  chipText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: COLORS.forestDeep,
  },
  goalValue: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 18,
    color: COLORS.forestDeep,
    letterSpacing: -0.2,
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
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
});
