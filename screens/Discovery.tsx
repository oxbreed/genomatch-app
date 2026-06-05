import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../src/components/EmptyState';
import FilterSheet, {
  DEFAULT_DISCOVERY_FILTERS,
  applyDiscoveryFilters,
  countActiveDiscoveryFilters,
  hasActiveDiscoveryFilters,
  type DiscoveryFilters,
} from '../src/components/FilterSheet';
import { DiscoverMatchModal } from '../src/components/discover';
import { GenoInboxHeader, GenoInboxIconButton } from '../src/components/inbox';
import { getDiscoveryCardHeight } from '../src/components/navigation/tabBarLayout';
import { GenoPremiumChrome } from '../src/brand/graphics';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ReportBlockSheet from '../src/components/ReportBlockSheet';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY, getInitials, getMockDiscoveryProfiles } from '../src/data/mockData';
import {
  fetchDiscoveryProfiles,
  getViewerProfileSnapshot,
  type ViewerProfileSnapshot,
} from '../src/lib/profiles';
import { recordLike, recordPass } from '../src/lib/likes';
import { getMatchIdForProfile } from '../src/lib/matches';
import type { DiscoveryProfile, Genotype } from '../src/types/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.22;
const CARD_HEIGHT = getDiscoveryCardHeight(SCREEN_HEIGHT);
const BACK_CARD_PEEK = 12;
const BACK_CARD_VISIBLE = 60;
const HIGH_COMPATIBILITY_MIN = 75;
const SWIPE_UP_THRESHOLD = 55;
const PROFILE_SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;
const SUPER_LIKE_STAR_COUNT = 6;

function triggerLikeHaptic() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

function triggerPassHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function triggerMatchCelebrationHaptic() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, 300);
}

function getMatchLabel(percent: number): string {
  if (percent >= 80) return 'Great match';
  if (percent >= 60) return 'Good match';
  return 'Compatible';
}


function getGenotypeCompatibilityLine(
  viewerGenotype: Genotype | null,
  candidateGenotype: Genotype
): string {
  const viewer = viewerGenotype ?? 'AA';
  const pairLabel = `${viewer} × ${candidateGenotype}`;
  const pairKey = [viewer, candidateGenotype].sort().join('');
  const riskByPair: Record<string, string> = {
    AAAA: 'Very low sickle cell risk',
    AAAS: 'Low sickle cell risk',
    AAAC: 'Low sickle cell risk',
    AASS: 'Elevated sickle cell risk',
    ASAS: 'Moderate sickle cell risk',
    ASAC: 'Moderate sickle cell risk',
    ASSS: 'Higher sickle cell risk',
    ACAC: 'Moderate sickle cell risk',
    ACCC: 'Moderate sickle cell risk',
    SSSS: 'Higher sickle cell risk',
  };
  const risk = riskByPair[pairKey] ?? 'Genotype-compatible match';
  return `${pairLabel} — ${risk}`;
}


function getCompatDotColor(percent: number): string {
  if (percent >= 80) return '#D4A843';
  if (percent >= 60) return '#8FAF95';
  return '#FFFFFF';
}

function formatRelationshipGoal(goal: string | null | undefined): string {
  if (!goal?.trim()) return 'Not specified';
  return goal
    .trim()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

type SuperLikeButtonProps = {
  onPress: () => void;
  disabled?: boolean;
};

function SuperLikeButton({ onPress, disabled }: SuperLikeButtonProps) {
  const burstStars = useRef(
    Array.from({ length: SUPER_LIKE_STAR_COUNT }, () => ({
      translate: new Animated.ValueXY({ x: 0, y: 0 }),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const runBurst = useCallback(() => {
    burstStars.forEach((star, index) => {
      const angle = (index / SUPER_LIKE_STAR_COUNT) * Math.PI * 2;
      const distance = 44;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      star.translate.setValue({ x: 0, y: 0 });
      star.opacity.setValue(1);

      Animated.parallel([
        Animated.timing(star.translate, {
          toValue: { x: targetX, y: targetY },
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(420),
          Animated.timing(star.opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, [burstStars]);

  const handlePress = () => {
    runBurst();
    onPress();
  };

  return (
    <View style={styles.superLikeBtnWrap}>
      {burstStars.map((star, index) => (
        <Animated.Text
          key={`burst-${index}`}
          pointerEvents="none"
          style={[
            styles.superLikeBurstStar,
            {
              opacity: star.opacity,
              transform: star.translate.getTranslateTransform(),
            },
          ]}
        >
          ⭐
        </Animated.Text>
      ))}
      <Pressable
        style={({ pressed }) => [
          styles.superLikeBtn,
          pressed && styles.btnPressed,
          disabled && styles.btnDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Ionicons name="star" size={28} color="#D4A843" />
      </Pressable>
    </View>
  );
}

function MatchPill({ percent }: { percent: number }) {
  return (
    <View style={styles.matchPillWrap} pointerEvents="none">
      <View style={styles.matchPill}>
        <Text style={styles.matchPillText}>{percent}%</Text>
      </View>
      <Text style={styles.matchPillLabel}>{getMatchLabel(percent)}</Text>
    </View>
  );
}

type ProfileCardProps = {
  profile: DiscoveryProfile;
  swipeIndex?: number;
  totalProfiles?: number;
  viewerGenotype?: Genotype | null;
  progressFillWidth?: Animated.AnimatedInterpolation<string | number>;
};

function ProfileCard({ profile, swipeIndex, totalProfiles, viewerGenotype, progressFillWidth }: ProfileCardProps) {
  const gallery = useMemo(() => {
    if (profile.photos.length > 0) return profile.photos;
    if (profile.avatarUrl) return [profile.avatarUrl];
    return [];
  }, [profile.photos, profile.avatarUrl]);

  const [photoIndex, setPhotoIndex] = useState(0);
  const hasMultiple = gallery.length > 1;
  const currentUri = gallery[photoIndex] ?? gallery[0];

  useEffect(() => {
    setPhotoIndex(0);
  }, [profile.id]);

  const showPrev = () => {
    setPhotoIndex((i) => (i <= 0 ? gallery.length - 1 : i - 1));
  };

  const showNext = () => {
    setPhotoIndex((i) => (i >= gallery.length - 1 ? 0 : i + 1));
  };

  const progressRatio =
    swipeIndex != null && totalProfiles != null && totalProfiles > 0
      ? Math.min(1, Math.max(0, swipeIndex / totalProfiles))
      : 0;

  return (
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
        <View style={[styles.cardMedia, styles.cardNoPhoto]}>
          <View style={styles.noPhotoPlaceholderWrap} pointerEvents="none">
            <View style={styles.noPhotoCircle}>
              <Text style={styles.noPhotoInitials}>{getInitials(profile.name)}</Text>
            </View>
            <Text style={styles.noPhotoCaption}>No photo yet</Text>
          </View>
        </View>
      )}

      {currentUri ? (
        <Text style={styles.initialsWatermark} pointerEvents="none">
          {getInitials(profile.name)}
        </Text>
      ) : null}

      <View style={styles.cardBottomShade} pointerEvents="none" />

      <View style={styles.cardInfoFooter} pointerEvents="box-none">
        <View style={styles.nameBadgeRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {profile.name}
            {profile.age != null ? `, ${profile.age}` : ''}
          </Text>
          <GenotypeBadge genotype={profile.genotype} />
          {profile.genotypeVerified ? (
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={COLORS.verified}
              accessibilityLabel="Genotype verified"
            />
          ) : null}
        </View>

        <View style={styles.cityRow}>
          <Ionicons name="location-outline" size={14} color="#8FAF95" />
          <Text style={styles.cityText}>{profile.city}</Text>
        </View>

        <View style={styles.genotypeCompatRow}>
          <View
            style={[
              styles.compatDot,
              { backgroundColor: getCompatDotColor(profile.compatibility) },
            ]}
          />
          <Text style={styles.genotypeCompatText}>
            {profile.compatibility}% · {getGenotypeCompatibilityLine(viewerGenotype ?? null, profile.genotype)}
          </Text>
        </View>

        <Text style={styles.cardBio} numberOfLines={3} ellipsizeMode="tail">
          {profile.bio}
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
            onPress={showPrev}
            accessibilityLabel="Previous photo"
          />
          <Pressable
            style={styles.photoTapRight}
            onPress={showNext}
            accessibilityLabel="Next photo"
          />
        </>
      ) : null}

      <MatchPill percent={profile.compatibility} />
    </View>
  );
}

type DiscoveryProps = {
  onMatchCreated?: () => void;
  onStartChat?: (matchId: string, profile?: DiscoveryProfile) => void;
};

export default function Discovery({ onMatchCreated, onStartChat }: DiscoveryProps = {}) {
  const [allProfiles, setAllProfiles] = useState<DiscoveryProfile[]>([]);
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_DISCOVERY_FILTERS);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [index, setIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedName, setMatchedName] = useState('');
  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null);
  const [matchedMatchId, setMatchedMatchId] = useState<string | null>(null);
  const [viewerSnapshot, setViewerSnapshot] = useState<ViewerProfileSnapshot | null>(null);
  const [actionError, setActionError] = useState('');
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [viewerGenotype, setViewerGenotype] = useState<Genotype | null>(null);
  const [superLikeToast, setSuperLikeToast] = useState(false);
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);
  const [showModerationSheet, setShowModerationSheet] = useState(false);

  const profiles = useMemo(
    () => applyDiscoveryFilters(allProfiles, filters),
    [allProfiles, filters]
  );

  const filtersActive = hasActiveDiscoveryFilters(filters);

  const loadProfiles = useCallback(async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [{ profiles: rows, viewerGenotype: loadedViewerGenotype }, viewer] = await Promise.all([
        fetchDiscoveryProfiles(),
        getViewerProfileSnapshot(),
      ]);
      setViewerGenotype(loadedViewerGenotype);
      setViewerSnapshot(viewer);
      if (rows.length > 0) {
        setAllProfiles(rows);
        setUsingMockFallback(false);
      } else {
        setAllProfiles(getMockDiscoveryProfiles());
        setUsingMockFallback(true);
        if (!loadedViewerGenotype) setViewerGenotype('AA');
      }
      setIndex(0);
    } catch (err) {
      const viewer = await getViewerProfileSnapshot().catch(() => null);
      setViewerSnapshot(viewer);
      setAllProfiles([]);
      setUsingMockFallback(false);
      setLoadError(err instanceof Error ? err.message : 'Could not load profiles');
      setIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const position = useRef(new Animated.ValueXY()).current;
  const isSwipeAnimatingRef = useRef(false);
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const likePulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(likePulseScale, {
          toValue: 1.08,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(likePulseScale, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [likePulseScale]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(PROFILE_SHEET_HEIGHT)).current;
  const sheetBackdropOpacity = useRef(new Animated.Value(0)).current;
  const superLikeToastY = useRef(new Animated.Value(-80)).current;
  const superLikeToastOpacity = useRef(new Animated.Value(0)).current;
  const superLikeToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profile = index < profiles.length ? profiles[index] : undefined;

  const progressFillWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  useEffect(() => {
    const ratio = profiles.length > 0 ? Math.min(1, Math.max(0, index / profiles.length)) : 0;
    Animated.timing(progressAnim, {
      toValue: ratio,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [index, profiles.length, progressAnim]);

  useEffect(() => {
    return () => {
      if (superLikeToastTimeoutRef.current) {
        clearTimeout(superLikeToastTimeoutRef.current);
      }
    };
  }, []);

  const showSuperLikeToastMessage = useCallback(() => {
    setSuperLikeToast(true);
    superLikeToastY.setValue(-80);
    superLikeToastOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(superLikeToastY, {
        toValue: 0,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(superLikeToastOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    if (superLikeToastTimeoutRef.current) {
      clearTimeout(superLikeToastTimeoutRef.current);
    }

    superLikeToastTimeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(superLikeToastOpacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(superLikeToastY, {
          toValue: -80,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSuperLikeToast(false);
      });
    }, 2000);
  }, [superLikeToastOpacity, superLikeToastY]);

  const openProfileSheet = useCallback(() => {
    if (showMatch || !profile) return;

    setProfileSheetVisible(true);
    sheetTranslateY.setValue(PROFILE_SHEET_HEIGHT);
    sheetBackdropOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        friction: 9,
        tension: 68,
        useNativeDriver: true,
      }),
      Animated.timing(sheetBackdropOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [profile, sheetBackdropOpacity, sheetTranslateY, showMatch]);

  const closeProfileSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(sheetTranslateY, {
        toValue: PROFILE_SHEET_HEIGHT,
        friction: 9,
        tension: 68,
        useNativeDriver: true,
      }),
      Animated.timing(sheetBackdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setProfileSheetVisible(false);
    });
  }, [sheetBackdropOpacity, sheetTranslateY]);

  const handleBlockedFromDiscover = useCallback(() => {
    if (!profile) return;
    const blockedId = profile.id;
    setAllProfiles((prev) => prev.filter((p) => p.id !== blockedId));
    setShowModerationSheet(false);
    closeProfileSheet();
    setIndex((i) => Math.min(i, Math.max(0, profiles.length - 2)));
  }, [closeProfileSheet, profile, profiles.length]);

  const openProfileSheetRef = useRef(openProfileSheet);
  openProfileSheetRef.current = openProfileSheet;

  const isEmpty = !loading && !loadError && allProfiles.length === 0;
  const isFilteredEmpty =
    !loading && !loadError && allProfiles.length > 0 && profiles.length === 0;
  const seenAll = !loading && !loadError && profiles.length > 0 && index >= profiles.length;

  const resetCardAnimation = useCallback(() => {
    position.setValue({ x: 0, y: 0 });
    cardOpacity.setValue(1);
    cardScale.setValue(1);
  }, [cardOpacity, cardScale, position]);

  useEffect(() => {
    setIndex(0);
    resetCardAnimation();
  }, [filters, resetCardAnimation]);


  useEffect(() => {
    if (!seenAll) return;
    setProfileSheetVisible(false);
    setShowModerationSheet(false);
    resetCardAnimation();
  }, [seenAll, resetCardAnimation]);

  const advanceProfile = useCallback(() => {
    setIndex((prev) => prev + 1);
  }, []);

  const goToNextProfile = useCallback(() => {
    resetCardAnimation();
    advanceProfile();
  }, [advanceProfile, resetCardAnimation]);

  const dismissMatchOverlay = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
    setMatchedMatchId(null);
  }, []);

  const handleSendMessageFromMatch = useCallback(async () => {
    const profile = matchedProfile;
    const profileId = profile?.id;
    let matchId = matchedMatchId;
    dismissMatchOverlay();
    if (!matchId && profileId && !profile?.isMock) {
      matchId = await getMatchIdForProfile(profileId);
    }
    if (matchId) {
      onStartChat?.(matchId, profile ?? undefined);
    }
  }, [dismissMatchOverlay, matchedMatchId, matchedProfile, onStartChat]);

  const showMatchOverlay = useCallback(
    (name: string, matched: DiscoveryProfile, matchId: string | null = null) => {
      triggerMatchCelebrationHaptic();
      setMatchedName(name);
      setMatchedProfile(matched);
      setMatchedMatchId(matchId);
      setShowMatch(true);
      onMatchCreated?.();
    },
    [onMatchCreated]
  );

  const animateSwipe = useCallback(
    (direction: 'left' | 'right', onDone: () => void) => {
      const toX = direction === 'right' ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;
      const toY = direction === 'right' ? -30 : 30;
      const swipeEasing = Easing.out(Easing.exp);
      isSwipeAnimatingRef.current = true;

      Animated.parallel([
        Animated.timing(position, {
          toValue: { x: toX, y: toY },
          duration: 280,
          easing: swipeEasing,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.92,
          duration: 280,
          easing: swipeEasing,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        isSwipeAnimatingRef.current = false;
        if (finished) {
          onDone();
        }
      });
    },
    [cardScale, position]
  );

  const processSwipe = useCallback(
    async (direction: 'like' | 'pass') => {
      if (seenAll || showMatch || !profile || loading || isSwipeAnimatingRef.current) return;

      if (direction === 'like') {
        triggerLikeHaptic();
      } else {
        triggerPassHaptic();
      }

      setActionError('');
      const firstName = profile.name.split(' ')[0];

      const afterSwipe = async () => {
        if (profile.isMock) {
          if (direction === 'like') {
            showMatchOverlay(firstName, profile);
          }
          return;
        }

        if (direction === 'like') {
          try {
            const { isMutualMatch, matchId } = await recordLike(profile.id);
            if (isMutualMatch) {
              showMatchOverlay(firstName, profile, matchId);
            }
          } catch (err) {
            setActionError(
              err instanceof Error ? err.message : 'Could not save your like'
            );
          }
        } else {
          try {
            await recordPass(profile.id);
          } catch (err) {
            setActionError(
              err instanceof Error ? err.message : 'Could not save your pass'
            );
          }
        }
      };

      animateSwipe(direction === 'like' ? 'right' : 'left', () => {
        advanceProfile();
        resetCardAnimation();
        void afterSwipe();
      });
    },
    [advanceProfile, animateSwipe, loading, profile, resetCardAnimation, seenAll, showMatch, showMatchOverlay]
  );

  const handlePass = useCallback(() => {
    processSwipe('pass');
  }, [processSwipe]);

  const handleLike = useCallback(() => {
    processSwipe('like');
  }, [processSwipe]);

  const handleSuperLike = useCallback(() => {
    if (seenAll || showMatch || !profile || loading || isSwipeAnimatingRef.current) return;

    triggerLikeHaptic();
    showSuperLikeToastMessage();
    processSwipe('like');
  }, [loading, processSwipe, profile, seenAll, showMatch, showSuperLikeToastMessage]);

  const handleLikeRef = useRef(handleLike);
  const handlePassRef = useRef(handlePass);
  handleLikeRef.current = handleLike;
  handlePassRef.current = handlePass;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.15 });
      },
      onPanResponderRelease: (_, gesture) => {
        const absDx = Math.abs(gesture.dx);
        const absDy = Math.abs(gesture.dy);

        if (gesture.dy < -SWIPE_UP_THRESHOLD && absDy > absDx) {
          openProfileSheetRef.current();
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 7,
            tension: 80,
            useNativeDriver: true,
          }).start();
          return;
        }

        if (gesture.dx > SWIPE_THRESHOLD) {
          handleLikeRef.current();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handlePassRef.current();
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 7,
            tension: 80,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const behindScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [1, 0.95, 1],
    extrapolate: 'clamp',
  });

  const behindOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [1, 0.85, 1],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-80, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const likeTintOpacity = position.x.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeTintOpacity = position.x.interpolate({
    inputRange: [-80, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const discoverSubtitle = usingMockFallback
    ? 'Preview profiles — real matches appear as members join'
    : 'Genotype-aware matches near you';

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="discover" />
      <StatusBar style="dark" />

      <View style={styles.screenRoot}>
        {superLikeToast ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.superLikeToast,
              {
                opacity: superLikeToastOpacity,
                transform: [{ translateY: superLikeToastY }],
              },
            ]}
          >
            <Text style={styles.superLikeToastText}>⭐ Super Liked!</Text>
          </Animated.View>
        ) : null}
        <GenoInboxHeader
          title="Discover"
          subtitle={discoverSubtitle}
          ceremonyMark
          right={
            <View style={styles.filterBtnWrap}>
              <GenoInboxIconButton
                icon="options-outline"
                onPress={() => setShowFilterSheet(true)}
                accessibilityLabel="Filter discovery profiles"
              />
              {filtersActive ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {countActiveDiscoveryFilters(filters)}
                  </Text>
                </View>
              ) : null}
            </View>
          }
        />

        <FilterSheet
          visible={showFilterSheet}
          filters={filters}
          previewProfiles={allProfiles}
          onClose={() => setShowFilterSheet(false)}
          onApply={setFilters}
        />

        <View style={styles.deckArea}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={COLORS.forest} />
              <Text style={styles.loadingText}>Finding compatible profiles...</Text>
            </View>
          ) : loadError ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="alert-circle-outline" size={28} color={COLORS.forest} />
              </View>
              <Text style={styles.emptyTitle}>{loadError}</Text>
              <Pressable style={styles.retryBtn} onPress={loadProfiles}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : isEmpty ? (
            <View style={styles.emptyState}>
              <EmptyState
                type="no-profiles"
                title="No profiles to show"
                subtitle="Check back soon for new people nearby."
              />
            </View>
          ) : isFilteredEmpty ? (
            <View style={styles.emptyState}>
              <EmptyState
                type="no-results"
                title="No profiles match your filters"
                subtitle="Try adjusting or resetting your filters."
                actionLabel="Adjust filters"
                onAction={() => setShowFilterSheet(true)}
              />
            </View>
          ) : seenAll ? (
            <View style={styles.seenAllWrap}>
              <LinearGradient
                colors={['rgba(212, 168, 67, 0.42)', 'rgba(61, 122, 82, 0.22)', 'rgba(212, 168, 67, 0.38)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.seenAllBorder}
              >
                <View style={styles.seenAllCard}>
                  <View style={styles.seenAllIconWrap}>
                    <Ionicons name="checkmark-done-outline" size={28} color={COLORS.forestDeep} />
                  </View>
                  <Text style={styles.seenAllTitle}>You're all caught up!</Text>
                  <Text style={styles.seenAllSubtext}>New matches appear as more members join</Text>
                  <Pressable
                    style={({ pressed }) => [styles.refreshBtnWrap, pressed && styles.btnPressed]}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      void loadProfiles();
                    }}
                  >
                    <LinearGradient
                      colors={[COLORS.gold, '#C49A38']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.refreshBtn}
                    >
                      <Ionicons name="refresh" size={18} color={COLORS.forestDeep} />
                      <Text style={styles.refreshBtnText}>Refresh</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.deckColumn}>
              <View style={styles.deckCardSlot}>
                <View style={styles.cardStackContainer}>
                  {[...profiles.slice(index)].reverse().map((stackProfile, renderIdx) => {
                    const stackSize = profiles.length - index;
                    const depthFromTop = stackSize - 1 - renderIdx;
                    const isTop = depthFromTop === 0;
                    const isBehind = depthFromTop === 1;

                    if (isTop) {
                      return (
                        <Animated.View
                          key={stackProfile.id}
                          {...panResponder.panHandlers}
                          style={[
                            styles.card,
                            styles.cardInStack,
                            {
                              zIndex: stackSize + 1,
                              opacity: cardOpacity,
                              transform: [
                                { translateX: position.x },
                                { translateY: position.y },
                                { rotate },
                                { scale: cardScale },
                              ],
                            },
                          ]}
                        >
                          <Animated.View
                            style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}
                          >
                            <Text style={styles.stampLikeText}>LIKE</Text>
                          </Animated.View>
                          <Animated.View
                            style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}
                          >
                            <Text style={styles.stampNopeText}>NOPE</Text>
                          </Animated.View>
                          <Animated.View
                            pointerEvents="none"
                            style={[styles.cardDragTint, styles.cardDragTintLike, { opacity: likeTintOpacity }]}
                          />
                          <Animated.View
                            pointerEvents="none"
                            style={[styles.cardDragTint, styles.cardDragTintNope, { opacity: nopeTintOpacity }]}
                          />
                          <ProfileCard
                            profile={stackProfile}
                            swipeIndex={index}
                            totalProfiles={profiles.length}
                            viewerGenotype={viewerGenotype}
                            progressFillWidth={progressFillWidth}
                          />
                        </Animated.View>
                      );
                    }

                    if (isBehind) {
                      return (
                        <Animated.View
                          key={stackProfile.id}
                          pointerEvents="none"
                          style={[
                            styles.cardBehindPeek,
                            styles.cardInStack,
                            {
                              zIndex: depthFromTop,
                              opacity: 0.7,
                              transform: [{ scale: 0.96 }],
                            },
                          ]}
                        >
                          <View style={styles.cardBehindClip}>
                            <View style={styles.cardBehindClipInner}>
                              <ProfileCard profile={stackProfile} />
                            </View>
                          </View>
                        </Animated.View>
                      );
                    }

                    return (
                      <Animated.View
                        key={stackProfile.id}
                        pointerEvents="none"
                        style={[
                          styles.card,
                          styles.cardInStack,
                          styles.cardStackBack,
                          { zIndex: depthFromTop, opacity: 0 },
                        ]}
                      >
                        <ProfileCard profile={stackProfile} />
                      </Animated.View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.actionBar}>
                {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
                <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [styles.passBtn, pressed && styles.btnPressed]}
                  onPress={handlePass}
                  disabled={showMatch}
                >
                  <Ionicons name="close" size={24} color="#8FAF95" />
                </Pressable>
                <SuperLikeButton onPress={handleSuperLike} disabled={showMatch} />
                <Animated.View style={{ transform: [{ scale: likePulseScale }] }}>
                  <Pressable
                    style={({ pressed }) => [styles.likeBtn, pressed && styles.btnPressed]}
                    onPress={handleLike}
                    disabled={showMatch}
                  >
                    <Ionicons name="heart" size={28} color="#FFFFFF" />
                  </Pressable>
                </Animated.View>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>


      <Modal
        visible={profileSheetVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeProfileSheet}
      >
        <View style={styles.profileSheetRoot}>
          <Pressable style={styles.profileSheetBackdropPress} onPress={closeProfileSheet}>
            <Animated.View
              style={[styles.profileSheetBackdrop, { opacity: sheetBackdropOpacity }]}
            />
          </Pressable>
          <Animated.View
            style={[styles.profileSheet, { transform: [{ translateY: sheetTranslateY }] }]}
          >
            <View style={styles.profileSheetHandle} />
            <Text style={styles.profileSheetName}>{profile?.name}</Text>
            <Text style={styles.profileSheetBio}>{profile?.bio}</Text>
            {profile?.interests?.length ? (
              <View style={styles.profileSheetTags}>
                {profile.interests.map((interest) => (
                  <View key={interest} style={styles.profileSheetTagChip}>
                    <Text style={styles.profileSheetTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Text style={styles.profileSheetMeta}>
              Relationship goal: {formatRelationshipGoal(profile?.relationshipGoal)}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.profileSheetSafetyBtn,
                pressed && styles.profileSheetChatBtnPressed,
              ]}
              onPress={() => setShowModerationSheet(true)}
            >
              <Ionicons name="shield-outline" size={18} color={COLORS.sage} />
              <Text style={styles.profileSheetSafetyText}>Report or block</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.profileSheetChatBtn,
                pressed && styles.profileSheetChatBtnPressed,
              ]}
              onPress={() => {
                closeProfileSheet();
                processSwipe('like');
              }}
            >
              <Text style={styles.profileSheetChatBtnText}>Start Chat</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {profile ? (
        <ReportBlockSheet
          visible={showModerationSheet}
          onClose={() => setShowModerationSheet(false)}
          targetUserId={profile.id}
          targetName={profile.name}
          onBlocked={handleBlockedFromDiscover}
        />
      ) : null}

      <DiscoverMatchModal
        visible={showMatch}
        matchName={matchedName}
        profile={matchedProfile}
        viewer={viewerSnapshot}
        onContinue={dismissMatchOverlay}
        onSendMessage={() => { void handleSendMessageFromMatch(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  screenRoot: {
    flex: 1,
  },
  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TYPOGRAPHY.display,
    fontFamily: 'ClashDisplay-Semibold',
    flex: 1,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(143, 175, 149, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnPressed: {
    opacity: 0.88,
  },
  filterBtnWrap: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: COLORS.forestDeep,
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  headerSubtitle: {
    marginTop: 4,
    ...TYPOGRAPHY.caption,
    fontFamily: 'Satoshi-Medium',
    color: COLORS.textMuted,
  },
  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  deckColumn: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deckCardSlot: {
    width: '100%',
    flex: 1,
    minHeight: 0,
    maxHeight: CARD_HEIGHT + BACK_CARD_PEEK,
    overflow: 'hidden',
  },
  cardStackContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_HEIGHT + BACK_CARD_PEEK,
    overflow: 'hidden',
  },
  cardInStack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  cardBehindPeek: {
    position: 'absolute',
    top: CARD_HEIGHT - BACK_CARD_VISIBLE + BACK_CARD_PEEK,
    left: 0,
    right: 0,
    height: BACK_CARD_VISIBLE,
    overflow: 'hidden',
    borderRadius: 24,
    width: '100%',
  },
  cardBehindClip: {
    height: BACK_CARD_VISIBLE,
    overflow: 'hidden',
    width: '100%',
  },
  cardBehindClipInner: {
    marginTop: -(CARD_HEIGHT - BACK_CARD_VISIBLE),
  },
  cardStackBack: {
    opacity: 0,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.forest,
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  cardBody: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  swipeProgressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    zIndex: 7,
    overflow: 'hidden',
  },
  swipeProgressFill: {
    height: 3,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  genotypeCompatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  compatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  genotypeCompatText: {
    flex: 1,
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 16,
  },
  superLikeToast: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    left: 24,
    right: 24,
    zIndex: 100,
    backgroundColor: COLORS.gold,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  superLikeToastText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D2818',
    textAlign: 'center',
  },
  superLikeBtnWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  superLikeBurstStar: {
    position: 'absolute',
    fontSize: 14,
    color: '#D4A843',
  },
  profileSheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  profileSheetBackdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  profileSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 40, 24, 0.72)',
  },
  profileSheet: {
    backgroundColor: COLORS.forest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: PROFILE_SHEET_HEIGHT,
  },
  profileSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 16,
  },
  profileSheetName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  profileSheetBio: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    opacity: 0.92,
    marginBottom: 16,
  },
  profileSheetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  profileSheetTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  profileSheetTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileSheetMeta: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: '#8FAF95',
    marginBottom: 20,
  },
  profileSheetSafetyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileSheetSafetyText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.sage,
  },
  profileSheetChatBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  profileSheetChatBtnPressed: {
    opacity: 0.9,
  },
  profileSheetChatBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D2818',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  cardMedia: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardMediaImage: {
    borderRadius: 20,
  },
  cardNoPhoto: {
    backgroundColor: '#0F2F1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoPlaceholderWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  noPhotoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212,168,67,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,168,67,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoInitials: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 36,
    color: 'rgba(212,168,67,0.6)',
    textAlign: 'center',
  },
  noPhotoCaption: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
    textAlign: 'center',
  },
  initialsWatermark: {
    position: 'absolute',
    top: '22%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 80,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 4,
    zIndex: 1,
  },
  cardBottomShade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2,
  },
  cardInfoFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 3,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  cardName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cityText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    fontWeight: '500',
    color: '#8FAF95',
  },
  cardBio: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    lineHeight: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  photoDots: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 5,
  },
  photoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  photoDotActive: {
    backgroundColor: COLORS.white,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  photoTapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '38%',
    zIndex: 4,
  },
  photoTapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '38%',
    zIndex: 4,
  },
  matchPillWrap: {
    position: 'absolute',
    top: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 6,
  },
  matchPill: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  matchPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.forest,
  },
  matchPillLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  cardDragTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    zIndex: 8,
  },
  cardDragTintLike: {
    backgroundColor: 'rgba(13, 40, 24, 0.3)',
  },
  cardDragTintNope: {
    backgroundColor: 'rgba(143, 175, 149, 0.3)',
  },
  stamp: {
    position: 'absolute',
    top: 40,
    zIndex: 10,
    borderRadius: 8,
    borderWidth: 3,
    padding: 8,
  },
  stampLike: {
    left: 24,
    borderColor: '#D4A843',
    transform: [{ rotate: '-15deg' }],
  },
  stampNope: {
    right: 24,
    borderColor: '#8FAF95',
    transform: [{ rotate: '15deg' }],
  },
  stampLikeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#D4A843',
  },
  stampNopeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#8FAF95',
  },
  superLikeBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  superLikeStar: {
    fontSize: 22,
    color: '#D4A843',
  },
  actionBar: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 6,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  passBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  likeBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  actionError: {
    fontFamily: 'Satoshi-Medium',
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    color: '#A32D2D',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '90%',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: 'rgba(13, 40, 24, 0.6)',
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.forest,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: COLORS.linen,
    fontWeight: '800',
    fontSize: 15,
  },

  seenAllWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  seenAllBorder: {
    borderRadius: RADIUS.xl,
    padding: 1.5,
    ...SHADOWS.cardElevated,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.16,
  },
  seenAllCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl - 1.5,
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.2)',
  },
  seenAllIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  seenAllTitle: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: COLORS.forestDeep,
    textAlign: 'center',
    marginBottom: 10,
  },
  seenAllSubtext: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.sage,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  refreshBtnWrap: {
    width: '100%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 24,
  },
  refreshBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    ...SHADOWS.card,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(143, 175, 149, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headingSm,
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyBody: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
  },
});
