import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { GenoInboxIconButton, GenoInboxRetryPanel } from '../src/components/inbox';
import {
  DISCOVERY_CARD_ACTIONS_LIFT,
  DISCOVERY_CARD_ACTIONS_OVERLAY,
  DISCOVERY_CARD_RADIUS,
  DISCOVERY_DECK_BOTTOM_INSET,
  DISCOVERY_HEADER_GAP,
  DISCOVERY_STACK_PEEK,
  getDiscoveryCardHeight,
  getDiscoveryCardHeightFromDeck,
} from '../src/components/navigation/tabBarLayout';
import {
  GenoLogoCeremony,
  GenoMirrorBrandCtaFill,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
  GenoPremiumChrome,
} from '../src/brand/graphics';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ReportBlockSheet from '../src/components/ReportBlockSheet';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY, getMockDiscoveryProfiles } from '../src/data/mockData';
import {
  fetchDiscoveryProfiles,
  getCurrentProfile,
  getViewerProfileSnapshot,
  saveInterestedIn,
  type DiscoveryDeckStats,
  type ViewerProfileSnapshot,
} from '../src/lib/profiles';
import { parseDiscoveryInterests } from '../src/lib/discoveryInterest';
import { clearMyPasses, recordLike, recordPass } from '../src/lib/likes';
import { formatSecurityError } from '../src/lib/security';
import { getMatchIdForProfile } from '../src/lib/matches';
import { FONT_FAMILY, LOGO_GOLD, MOTION, MIRROR_RED_TEXT } from '../src/theme';
import type { DiscoveryProfile, Genotype } from '../src/types/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.22;
const FALLBACK_CARD_HEIGHT = getDiscoveryCardHeight(SCREEN_HEIGHT);
const BACK_CARD_PEEK = DISCOVERY_STACK_PEEK;
const HIGH_COMPATIBILITY_MIN = 75;
const SWIPE_UP_THRESHOLD = 48;
const SHEET_TRAVEL = SCREEN_HEIGHT;
const SHEET_OPEN_SNAP = SHEET_TRAVEL * 0.42;
const SUPER_LIKE_STAR_COUNT = 6;

function discoveryDeckHint(stats: DiscoveryDeckStats | null): string {
  if (!stats) return 'Check back soon for new people nearby.';
  if (stats.eligible === 0) {
    return 'No completed profiles yet. Check back as more members join.';
  }
  if (stats.passed > 0 && stats.liked > 0) {
    return `You passed on ${stats.passed} and liked ${stats.liked}. Tap below to show passed profiles again.`;
  }
  if (stats.passed > 0) {
    return `You passed on ${stats.passed} profile${stats.passed === 1 ? '' : 's'}. Tap below to show them again.`;
  }
  if (stats.liked > 0) {
    return `You liked ${stats.liked} profile${stats.liked === 1 ? '' : 's'}. They stay hidden here until there is a mutual match.`;
  }
  return 'You have reviewed everyone available right now.';
}

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
  isActive?: boolean;
  onMatchCreated?: () => void;
  onStartChat?: (matchId: string, profile?: DiscoveryProfile) => void;
};

export default function Discovery({ isActive = true, onMatchCreated, onStartChat }: DiscoveryProps = {}) {
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
  const [deckColumnHeight, setDeckColumnHeight] = useState(0);
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [deckStats, setDeckStats] = useState<DiscoveryDeckStats | null>(null);
  const [clearingPasses, setClearingPasses] = useState(false);
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
      const [{ profiles: rows, viewerGenotype: loadedViewerGenotype, deckStats: stats }, viewer, profile] =
        await Promise.all([
          fetchDiscoveryProfiles(),
          getViewerProfileSnapshot(),
          getCurrentProfile(),
        ]);
      const interestedIn = parseDiscoveryInterests(profile?.interested_in);
      if (interestedIn.length > 0) {
        setFilters((current) => ({ ...current, interestedIn }));
      }
      setViewerGenotype(loadedViewerGenotype);
      setViewerSnapshot(viewer);
      setDeckStats(stats);
      if (rows.length > 0) {
        setAllProfiles(rows);
        setUsingMockFallback(false);
      } else if (__DEV__) {
        setAllProfiles(getMockDiscoveryProfiles());
        setUsingMockFallback(true);
        if (!loadedViewerGenotype) setViewerGenotype('AA');
      } else {
        setAllProfiles([]);
        setUsingMockFallback(false);
      }
      setIndex(0);
    } catch (err) {
      const viewer = await getViewerProfileSnapshot().catch(() => null);
      setViewerSnapshot(viewer);
      setAllProfiles([]);
      setUsingMockFallback(false);
      setDeckStats(null);
      setLoadError(err instanceof Error ? err.message : 'Could not load profiles');
      setIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApplyFilters = useCallback(
    async (next: DiscoveryFilters) => {
      setFilters(next);
      if (next.interestedIn.length > 0) {
        try {
          await saveInterestedIn(next.interestedIn);
          await loadProfiles();
        } catch (err) {
          setActionError(
            err instanceof Error ? err.message : 'Could not save your discovery preferences.'
          );
        }
      }
    },
    [loadProfiles]
  );

  useEffect(() => {
    if (isActive) {
      void loadProfiles();
    }
  }, [isActive, loadProfiles]);

  const handleClearPasses = useCallback(async () => {
    setClearingPasses(true);
    setActionError('');
    try {
      await clearMyPasses();
      await loadProfiles();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not reset passed profiles');
    } finally {
      setClearingPasses(false);
    }
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
              formatSecurityError(err, err instanceof Error ? err.message : 'Could not save your like')
            );
          }
        } else {
          try {
            await recordPass(profile.id);
          } catch (err) {
            setActionError(
              formatSecurityError(err, err instanceof Error ? err.message : 'Could not save your pass')
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

  const canResetPasses = !usingMockFallback && (deckStats?.passed ?? 0) > 0;
  const deckEmptyHint = discoveryDeckHint(deckStats);
  const discoverSubtitle = usingMockFallback
    ? 'Preview profiles while we grow. Real matches arrive as new members join.'
    : 'Genotype-aware matches near you';


  const cardHeight = useMemo(() => {
    if (deckColumnHeight > 0) {
      return getDiscoveryCardHeightFromDeck(deckColumnHeight);
    }
    return FALLBACK_CARD_HEIGHT;
  }, [deckColumnHeight]);

  const deckSlotHeight =
    deckColumnHeight > 0 ? deckColumnHeight : cardHeight + BACK_CARD_PEEK;

  const cardLayoutStyles = useMemo(
    () => ({
      deckCardSlot: { height: deckSlotHeight },
      cardStackContainer: { height: deckSlotHeight },
      card: { height: cardHeight },
      cardBody: { height: cardHeight },
      cardActionsOverlay: {
        top:
          cardHeight -
          DISCOVERY_CARD_ACTIONS_OVERLAY -
          DISCOVERY_CARD_ACTIONS_LIFT,
      },
      actionError: {
        top:
          cardHeight -
          DISCOVERY_CARD_ACTIONS_OVERLAY -
          DISCOVERY_CARD_ACTIONS_LIFT -
          28,
      },
    }),
    [cardHeight, deckSlotHeight]
  );

  const onDeckColumnLayout = useCallback(
    (height: number) => {
      const next = Math.round(height);
      if (next > 0) {
        setDeckColumnHeight((prev) => (Math.abs(prev - next) > 1 ? next : prev));
      }
    },
    []
  );

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="discover" />
      <StatusBar style="light" />

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
                variant="muted"
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
          onApply={handleApplyFilters}
        />

        <View style={styles.deckArea}>
          {loading ? (
            <View style={styles.centered}>
              <GenoMirrorRimFrame kind="gold" borderRadius={24} padding={2}>
                <GenoMirrorSteelFill style={styles.loadingLogo}>
                  <GenoLogoCeremony variant="compact" tone="dark" />
                </GenoMirrorSteelFill>
              </GenoMirrorRimFrame>
              <Text style={styles.loadingText}>Finding compatible profiles...</Text>
            </View>
          ) : loadError ? (
            <View style={styles.centered}>
              <GenoInboxRetryPanel message={loadError} onRetry={loadProfiles} />
            </View>
          ) : isEmpty ? (
            <View style={styles.seenAllWrap}>
              <EmptyState
                type="no-profiles"
                title="No profiles to show"
                subtitle={deckEmptyHint}
                footer={
                  <>
                    {canResetPasses ? (
                      <Pressable
                        style={({ pressed }) => [pressed && styles.btnPressed, clearingPasses && styles.btnDisabled]}
                        disabled={clearingPasses}
                        onPress={() => {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          void handleClearPasses();
                        }}
                      >
                        <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.xl} style={styles.seenAllBtnRim}>
                          <GenoMirrorSteelFill style={styles.seenAllSecondaryBtn}>
                            <GenoMirrorMetallicIcon name="return-up-back-outline" size={18} tone="steel" />
                            <Text style={styles.seenAllBtnText}>
                              {clearingPasses ? 'Resetting…' : 'Show passed profiles again'}
                            </Text>
                          </GenoMirrorSteelFill>
                        </GenoMirrorRimFrame>
                      </Pressable>
                    ) : null}
                    <Pressable
                      style={({ pressed }) => [pressed && styles.btnPressed]}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        loadProfiles();
                      }}
                    >
                      <GenoMirrorRimFrame kind="red" borderRadius={RADIUS.xl} style={styles.seenAllBtnRim}>
                        <GenoMirrorBrandCtaFill style={styles.seenAllPrimaryBtn}>
                          <GenoMirrorMetallicIcon name="refresh" size={18} tone="chrome" />
                          <Text style={styles.seenAllPrimaryText}>Refresh</Text>
                        </GenoMirrorBrandCtaFill>
                      </GenoMirrorRimFrame>
                    </Pressable>
                  </>
                }
              />
            </View>
          ) : isFilteredEmpty ? (
            <View style={styles.seenAllWrap}>
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
              <EmptyState
                type="seen-all"
                title="You're all caught up!"
                subtitle={deckEmptyHint}
                footer={
                  <>
                    {canResetPasses ? (
                      <Pressable
                        style={({ pressed }) => [pressed && styles.btnPressed, clearingPasses && styles.btnDisabled]}
                        disabled={clearingPasses}
                        onPress={() => {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          void handleClearPasses();
                        }}
                      >
                        <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.xl} style={styles.seenAllBtnRim}>
                          <GenoMirrorSteelFill style={styles.seenAllSecondaryBtn}>
                            <GenoMirrorMetallicIcon name="return-up-back-outline" size={18} tone="steel" />
                            <Text style={styles.seenAllBtnText}>
                              {clearingPasses ? 'Resetting…' : 'Show passed profiles again'}
                            </Text>
                          </GenoMirrorSteelFill>
                        </GenoMirrorRimFrame>
                      </Pressable>
                    ) : null}
                    <Pressable
                      style={({ pressed }) => [pressed && styles.btnPressed]}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        void loadProfiles();
                      }}
                    >
                      <GenoMirrorRimFrame kind="red" borderRadius={RADIUS.xl} style={styles.seenAllBtnRim}>
                        <GenoMirrorBrandCtaFill horizontal style={styles.seenAllPrimaryBtn}>
                          <GenoMirrorMetallicIcon name="refresh" size={18} tone="chrome" />
                          <Text style={styles.seenAllPrimaryText}>Refresh</Text>
                        </GenoMirrorBrandCtaFill>
                      </GenoMirrorRimFrame>
                    </Pressable>
                  </>
                }
              />
            </View>
          ) : (
            <View
              style={styles.deckColumn}
              onLayout={(event) => onDeckColumnLayout(event.nativeEvent.layout.height)}
            >
              <View style={[styles.deckCardSlot, cardLayoutStyles.deckCardSlot]}>
                <View style={[styles.cardStackContainer, cardLayoutStyles.cardStackContainer]}>
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
                            cardLayoutStyles.card,
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
                            hideGenotype={true}
                            progressFillWidth={progressFillWidth}
                            height={cardHeight}
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
                            cardLayoutStyles.card,
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
                          <DiscoverSwipeCard profile={stackProfile} hideGenotype={true} height={cardHeight} />
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
                          cardLayoutStyles.card,
                          styles.cardStackBack,
                          { zIndex: depthFromTop, opacity: 0 },
                        ]}
                      >
                        <DiscoverSwipeCard profile={stackProfile} hideGenotype={true} height={cardHeight} />
                      </Animated.View>
                    );
                  })}
                </View>

                {actionError ? (
                  <Text style={[styles.actionError, cardLayoutStyles.actionError]}>{actionError}</Text>
                ) : null}
                <View style={[styles.cardActionsOverlay, cardLayoutStyles.cardActionsOverlay]} pointerEvents="box-none">
                  <LinearGradient
                    colors={['transparent', 'rgba(10, 10, 10, 0.22)', 'rgba(10, 10, 10, 0.48)']}
                    locations={[0, 0.55, 1]}
                    style={styles.cardActionsFade}
                    pointerEvents="none"
                  />
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
        hideGenotype
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
    backgroundColor: COLORS.background,
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
    fontFamily: 'Satoshi-Bold',
    flex: 1,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.chipSolid,
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
    color: COLORS.text,
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
    overflow: 'hidden',
  },
  deckCardSlot: {
    width: '100%',
    position: 'relative',
    overflow: 'visible',
  },
  cardActionsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: DISCOVERY_CARD_ACTIONS_OVERLAY,
    justifyContent: 'center',
    zIndex: 40,
  },
  cardActionsFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -6,
    height: DISCOVERY_CARD_ACTIONS_OVERLAY + 20,
  },
  cardActionsRow: {
    zIndex: 2,
  },
  cardStackContainer: {
    position: 'relative',
    width: '100%',
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
    borderRadius: DISCOVERY_CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardBody: {
    width: '100%',
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
    color: '#0A0A0A',
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
    ...MIRROR_RED_TEXT,
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
    backgroundColor: COLORS.chipSolid,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoInitials: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 40,
    color: 'rgba(255, 255, 255, 0.75)',
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
    fontFamily: 'Satoshi-Bold',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.linen,
    letterSpacing: -0.4,
    flexShrink: 1,
    minWidth: 0,
    textShadowColor: 'rgba(10, 10, 10, 0.45)',
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
    backgroundColor: COLORS.chipSolid,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
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
    backgroundColor: COLORS.chipSolid,
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
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
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
    backgroundColor: 'rgba(10, 10, 10, 0.3)',
  },
  cardDragTintNope: {
    backgroundColor: COLORS.chipSolid,
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
    borderColor: COLORS.logoRedBright,
    transform: [{ rotate: '-15deg' }],
  },
  stampNope: {
    right: 24,
    borderColor: '#9A8B7E',
    transform: [{ rotate: '15deg' }],
  },
  stampLikeText: {
    fontSize: 32,
    fontWeight: '900',
    ...MIRROR_RED_TEXT,
  },
  stampNopeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#9A8B7E',
  },
  superLikeBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
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
    ...MIRROR_RED_TEXT,
  },
  passBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
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
    left: 16,
    right: 16,
    zIndex: 41,
    color: '#A32D2D',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '90%',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingLogo: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
  },
  loadingText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: LOGO_GOLD,
  },

  seenAllWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  seenAllBtnRim: {
    width: '100%',
  },
  seenAllSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 24,
    borderRadius: RADIUS.xl - 1.5,
  },
  seenAllPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 24,
    borderRadius: RADIUS.xl - 1.5,
  },
  seenAllBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: COLORS.text,
  },
  seenAllPrimaryText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: COLORS.white,
  },
});
