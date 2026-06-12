import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
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
import {
  DiscoverActionDock,
  DiscoverMatchModal,
  DiscoverProfileSheet,
  DiscoverSwipeCard,
  DiscoverSwipeStamp,
  GenoDiscoverHeader,
} from '../src/components/discover';
import { GenoInboxIconButton } from '../src/components/inbox';
import {
  DISCOVERY_CARD_ACTIONS_LIFT,
  DISCOVERY_CARD_ACTIONS_OVERLAY,
  DISCOVERY_CARD_RADIUS,
  DISCOVERY_DECK_BOTTOM_INSET,
  DISCOVERY_HEADER_GAP,
  DISCOVERY_STACK_PEEK,
  getDiscoveryCardHeight,
} from '../src/components/navigation/tabBarLayout';
import { GenoPremiumChrome } from '../src/brand/graphics';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ReportBlockSheet from '../src/components/ReportBlockSheet';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY, getMockDiscoveryProfiles } from '../src/data/mockData';
import {
  fetchDiscoveryProfiles,
  getViewerProfileSnapshot,
  type ViewerProfileSnapshot,
} from '../src/lib/profiles';
import { recordLike, recordPass } from '../src/lib/likes';
import { getMatchIdForProfile } from '../src/lib/matches';
import { MOTION } from '../src/theme';
import type { DiscoveryProfile, Genotype } from '../src/types/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.22;
const CARD_HEIGHT = getDiscoveryCardHeight(SCREEN_HEIGHT);
const BACK_CARD_PEEK = DISCOVERY_STACK_PEEK;
const HIGH_COMPATIBILITY_MIN = 75;
const SWIPE_UP_THRESHOLD = 48;
const SHEET_TRAVEL = SCREEN_HEIGHT;
const SHEET_OPEN_SNAP = SHEET_TRAVEL * 0.42;
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
  const [sheetDragActive, setSheetDragActive] = useState(false);
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
  const sheetTranslateY = useRef(new Animated.Value(SHEET_TRAVEL)).current;
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

  const completeSheetOpen = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        ...MOTION.springSheet,
      }),
      Animated.timing(sheetBackdropOpacity, {
        toValue: 0.28,
        duration: MOTION.sheetOpenMs,
        easing: MOTION.easing.sheetOut,
        useNativeDriver: true,
      }),
    ]).start(() => {
      sheetYOffsetRef.current = 0;
      setSheetDragActive(false);
      sheetDragActiveRef.current = false;
      Animated.spring(cardScale, { toValue: 1, ...MOTION.springReset }).start();
    });
  }, [cardScale, sheetBackdropOpacity, sheetTranslateY]);

  const completeSheetClose = useCallback(
    (onClosed?: () => void) => {
      Animated.parallel([
        Animated.spring(sheetTranslateY, {
          toValue: SHEET_TRAVEL,
          ...MOTION.springSheetFloat,
        }),
        Animated.timing(sheetBackdropOpacity, {
          toValue: 0,
          duration: MOTION.sheetCloseMs,
          easing: MOTION.easing.sheetIn,
          useNativeDriver: true,
        }),
      ]).start(() => {
        sheetYOffsetRef.current = SHEET_TRAVEL;
        setProfileSheetVisible(false);
        setSheetDragActive(false);
        sheetDragActiveRef.current = false;
        Animated.spring(cardScale, { toValue: 1, ...MOTION.springReset }).start();
        onClosed?.();
      });
    },
    [sheetBackdropOpacity, sheetTranslateY]
  );

  const openProfileSheet = useCallback(() => {
    if (showMatch || !profile || profileSheetVisibleRef.current) return;

    setProfileSheetVisible(true);
    sheetTranslateY.setValue(SHEET_TRAVEL);
    sheetBackdropOpacity.setValue(0);
    completeSheetOpen();
  }, [completeSheetOpen, profile, sheetBackdropOpacity, sheetTranslateY, showMatch]);

  const closeProfileSheet = useCallback(
    (onClosed?: () => void) => {
      completeSheetClose(onClosed);
    },
    [completeSheetClose]
  );


  const handleBlockedFromDiscover = useCallback(() => {
    if (!profile) return;
    const blockedId = profile.id;
    setAllProfiles((prev) => prev.filter((p) => p.id !== blockedId));
    setShowModerationSheet(false);
    closeProfileSheet();
    setIndex((i) => Math.min(i, Math.max(0, profiles.length - 2)));
  }, [closeProfileSheet, profile, profiles.length]);

  const profileSheetVisibleRef = useRef(false);
  const sheetYOffsetRef = useRef(SHEET_TRAVEL);
  const sheetDragActiveRef = useRef(false);

  useEffect(() => {
    profileSheetVisibleRef.current = profileSheetVisible;
  }, [profileSheetVisible]);

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

  const handleSheetPass = useCallback(() => {
    closeProfileSheet(() => processSwipe('pass'));
  }, [closeProfileSheet, processSwipe]);

  const handleSheetLike = useCallback(() => {
    closeProfileSheet(() => processSwipe('like'));
  }, [closeProfileSheet, processSwipe]);

  const handleSheetSuperLike = useCallback(() => {
    closeProfileSheet(() => {
      if (seenAll || showMatch || !profile || loading || isSwipeAnimatingRef.current) return;
      triggerLikeHaptic();
      showSuperLikeToastMessage();
      processSwipe('like');
    });
  }, [
    closeProfileSheet,
    loading,
    processSwipe,
    profile,
    seenAll,
    showMatch,
    showSuperLikeToastMessage,
  ]);

  const handleLikeRef = useRef(handleLike);
  const handlePassRef = useRef(handlePass);
  handleLikeRef.current = handleLike;
  handlePassRef.current = handlePass;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (profileSheetVisibleRef.current) return false;
        return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
      },
      onMoveShouldSetPanResponderCapture: (_, gesture) => {
        if (profileSheetVisibleRef.current) return false;
        return gesture.dy < -8 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gesture) => {
        if (profileSheetVisibleRef.current && !sheetDragActiveRef.current) return;

        const absDx = Math.abs(gesture.dx);
        const absDy = Math.abs(gesture.dy);

        if (gesture.dy < 0 && absDy > absDx) {
          if (!profileSheetVisibleRef.current) {
            setProfileSheetVisible(true);
            profileSheetVisibleRef.current = true;
          }
          setSheetDragActive(true);
          sheetDragActiveRef.current = true;

          const dragUp = Math.min(SHEET_TRAVEL, Math.max(0, -gesture.dy));
          const nextY = SHEET_TRAVEL - dragUp;
          sheetYOffsetRef.current = nextY;
          sheetTranslateY.setValue(nextY);
          sheetBackdropOpacity.setValue((dragUp / SHEET_TRAVEL) * 0.28);
          cardScale.setValue(1 - (dragUp / SHEET_TRAVEL) * 0.035);
          position.setValue({ x: gesture.dx * 0.08, y: gesture.dy * 0.05 });
          return;
        }

        if (sheetDragActiveRef.current) return;
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.12 });
      },
      onPanResponderRelease: (_, gesture) => {
        const absDx = Math.abs(gesture.dx);
        const absDy = Math.abs(gesture.dy);

        if (sheetDragActiveRef.current || sheetYOffsetRef.current < SHEET_TRAVEL - 12) {
          const shouldOpen =
            gesture.dy < -SWIPE_UP_THRESHOLD ||
            gesture.vy < -0.75 ||
            sheetYOffsetRef.current < SHEET_OPEN_SNAP;

          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            ...MOTION.springReset,
          }).start();

          if (shouldOpen) {
            completeSheetOpen();
          } else {
            completeSheetClose();
          }
          return;
        }

        if (gesture.dx > SWIPE_THRESHOLD) {
          handleLikeRef.current();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handlePassRef.current();
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            ...MOTION.springReset,
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
    inputRange: [-SCREEN_WIDTH, -72, 0, 72, SCREEN_WIDTH],
    outputRange: [1, 0.985, 0.968, 0.985, 1],
    extrapolate: 'clamp',
  });

  const behindTranslateY = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, -48, 0, 48, SCREEN_WIDTH],
    outputRange: [0, 3, 8, 3, 0],
    extrapolate: 'clamp',
  });

  const behindOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, -80, 0, 80, SCREEN_WIDTH],
    outputRange: [1, 0.96, 0.9, 0.96, 1],
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
    ? 'Preview profiles · real matches\nas members join'
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
        <GenoDiscoverHeader
          subtitle={discoverSubtitle}
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
                              zIndex: 3,
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
                          <DiscoverSwipeStamp side="bond" opacity={likeOpacity} />
                          <DiscoverSwipeStamp side="pass" opacity={nopeOpacity} />
                          <Animated.View
                            pointerEvents="none"
                            style={[styles.cardDragTint, styles.cardDragTintLike, { opacity: likeTintOpacity }]}
                          />
                          <Animated.View
                            pointerEvents="none"
                            style={[styles.cardDragTint, styles.cardDragTintNope, { opacity: nopeTintOpacity }]}
                          />
                          <DiscoverSwipeCard
                            profile={stackProfile}
                            swipeIndex={index}
                            totalProfiles={profiles.length}
                            viewerGenotype={viewerGenotype}
                            progressFillWidth={progressFillWidth}
                            height={CARD_HEIGHT}
                            onExpand={openProfileSheet}
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
                            styles.card,
                            styles.cardInStack,
                            styles.cardBehind,
                            {
                              zIndex: 2,
                              opacity: behindOpacity,
                              transform: [
                                { scale: behindScale },
                                { translateY: behindTranslateY },
                              ],
                            },
                          ]}
                        >
                          <DiscoverSwipeCard profile={stackProfile} height={CARD_HEIGHT} />
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
                        <DiscoverSwipeCard profile={stackProfile} height={CARD_HEIGHT} />
                      </Animated.View>
                    );
                  })}
                </View>

                {actionError ? (
                  <Text style={styles.actionError}>{actionError}</Text>
                ) : null}
                <View style={styles.cardActionsOverlay} pointerEvents="box-none">
                  <DiscoverActionDock
                    variant="glass"
                    onPass={handlePass}
                    onLike={handleLike}
                    onSuperLike={handleSuperLike}
                    likePulseScale={likePulseScale}
                    disabled={showMatch}
                    style={styles.cardActionsRow}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </View>


      <DiscoverProfileSheet
        visible={profileSheetVisible}
        profile={profile ?? null}
        viewerGenotype={viewerGenotype}
        backdropOpacity={sheetBackdropOpacity}
        translateY={sheetTranslateY}
        likePulseScale={likePulseScale}
        interactionLocked={sheetDragActive}
        onClose={() => closeProfileSheet()}
        onPass={handleSheetPass}
        onLike={handleSheetLike}
        onSuperLike={handleSheetSuperLike}
      />

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
    paddingHorizontal: 10,
    paddingTop: DISCOVERY_HEADER_GAP,
    paddingBottom: DISCOVERY_DECK_BOTTOM_INSET,
  },
  deckColumn: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  deckCardSlot: {
    width: '100%',
    height: CARD_HEIGHT + BACK_CARD_PEEK,
    position: 'relative',
    overflow: 'visible',
  },
  cardActionsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top:
      CARD_HEIGHT -
      DISCOVERY_CARD_ACTIONS_OVERLAY -
      DISCOVERY_CARD_ACTIONS_LIFT,
    height: DISCOVERY_CARD_ACTIONS_OVERLAY,
    justifyContent: 'center',
    zIndex: 40,
  },
  cardActionsRow: {
    zIndex: 2,
  },
  cardStackContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_HEIGHT + BACK_CARD_PEEK,
    overflow: 'visible',
  },
  cardInStack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  cardBehind: {
    zIndex: 2,
  },
  cardStackBack: {
    opacity: 0,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: DISCOVERY_CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'transparent',
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
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 7,
    overflow: 'hidden',
  },
  swipeProgressFill: {
    height: 4,
    backgroundColor: COLORS.gold,
  },
  genotypeCompatRow: {
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
  genotypeCompatText: {
    flex: 1,
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: 'rgba(245, 239, 230, 0.9)',
    lineHeight: 17,
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
  btnDisabled: {
    opacity: 0.5,
  },
  cardMedia: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardMediaImage: {
    borderRadius: 24,
  },
  cardNoPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoPlaceholderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  noPhotoCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(212, 168, 67, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoInitials: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 40,
    color: 'rgba(212, 168, 67, 0.75)',
    textAlign: 'center',
    letterSpacing: 1,
  },
  noPhotoCaption: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: COLORS.sage,
    marginTop: 10,
    textAlign: 'center',
  },
  cardTopShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '22%',
    zIndex: 2,
  },
  cardBottomShade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '58%',
    zIndex: 2,
  },
  cardInfoFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 22,
    zIndex: 3,
  },
  nameSection: {
    marginBottom: 6,
  },
  cardInfoAccent: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginBottom: 8,
    opacity: 0.9,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 8,
  },
  nameBadgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  cardName: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.linen,
    letterSpacing: -0.4,
    flexShrink: 1,
    minWidth: 0,
    textShadowColor: 'rgba(13, 40, 24, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    fontWeight: '500',
    color: COLORS.sage,
  },
  cardBio: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(245, 239, 230, 0.88)',
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
    backgroundColor: 'rgba(212, 168, 67, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.42)',
  },
  tagText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: COLORS.linen,
  },
  photoDots: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 5,
  },
  photoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
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
    gap: 4,
  },
  matchPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  matchPillText: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.forestDeep,
    letterSpacing: -0.2,
  },
  matchPillLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 0.6,
    color: COLORS.linen,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDragTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
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
    top:
      CARD_HEIGHT -
      DISCOVERY_CARD_ACTIONS_OVERLAY -
      DISCOVERY_CARD_ACTIONS_LIFT -
      28,
    left: 16,
    right: 16,
    zIndex: 41,
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
