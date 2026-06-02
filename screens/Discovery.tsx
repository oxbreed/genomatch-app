import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ProfileAvatar from '../src/components/ProfileAvatar';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY, getMockDiscoveryProfiles } from '../src/data/mockData';
import { fetchDiscoveryProfiles } from '../src/lib/profiles';
import { recordLike, recordPass } from '../src/lib/likes';
import type { DiscoveryProfile } from '../src/types/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.22;
const PHOTO_HEIGHT = 220;

function MatchPill({ percent }: { percent: number }) {
  return (
    <View style={styles.matchPill}>
      <Text style={styles.matchPillText}>{percent}%</Text>
    </View>
  );
}

function ProfileCard({ profile }: { profile: DiscoveryProfile }) {
  return (
    <View style={styles.cardBody}>
      <View style={styles.photoArea}>
        <ProfileAvatar
          name={profile.name}
          gradient={profile.gradient}
          avatarUrl={profile.avatarUrl}
          width="100%"
          height={PHOTO_HEIGHT}
          borderRadius={0}
          initialsPosition="top"
          initialsOpacity={0.15}
        />
        <MatchPill percent={profile.compatibility} />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.78)']}
          style={styles.photoGradient}
          pointerEvents="none"
        />
        <View style={styles.photoOverlay} pointerEvents="none">
          <View style={styles.photoNameRow}>
            <Text style={styles.photoName}>
              {profile.name}
              {profile.age != null ? `, ${profile.age}` : ''}
            </Text>
            <GenotypeBadge genotype={profile.genotype} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.cardScroll}
        contentContainerStyle={styles.cardScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cityRow}>
          <Ionicons name="location-outline" size={15} color={COLORS.sage} />
          <Text style={styles.city}>{profile.city}</Text>
        </View>

        <Text style={styles.bio} numberOfLines={3}>
          {profile.bio}
        </Text>

        <View style={styles.interestRow}>
          {profile.interests.map((interest) => (
            <View key={interest} style={styles.interestChip}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function Discovery() {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [index, setIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedName, setMatchedName] = useState('');

  const [actionError, setActionError] = useState('');
  const [usingMockFallback, setUsingMockFallback] = useState(false);

  const loadProfiles = useCallback(async () => {
    setLoadError('');
    setLoading(true);
    try {
      const { profiles: rows } = await fetchDiscoveryProfiles();
      if (rows.length > 0) {
        setProfiles(rows);
        setUsingMockFallback(false);
      } else {
        setProfiles(getMockDiscoveryProfiles());
        setUsingMockFallback(true);
      }
      setIndex(0);
    } catch {
      setProfiles(getMockDiscoveryProfiles());
      setUsingMockFallback(true);
      setIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const position = useRef(new Animated.ValueXY()).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const matchOpacity = useRef(new Animated.Value(0)).current;
  const matchScale = useRef(new Animated.Value(0.85)).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;

  const profile = profiles[index];
  const isEmpty = !loading && !loadError && profiles.length === 0;
  const seenAll = !loading && !loadError && profiles.length > 0 && index >= profiles.length;

  const resetCardAnimation = useCallback(() => {
    position.setValue({ x: 0, y: 0 });
    cardOpacity.setValue(1);
    cardScale.setValue(1);
    nextCardScale.setValue(0.95);
  }, [cardOpacity, cardScale, nextCardScale, position]);

  const advanceProfile = useCallback(() => {
    setIndex((prev) => prev + 1);
    resetCardAnimation();
  }, [resetCardAnimation]);

  const showMatchOverlay = useCallback(
    (name: string) => {
      setMatchedName(name);
      setShowMatch(true);
      matchOpacity.setValue(0);
      matchScale.setValue(0.85);

      Animated.parallel([
        Animated.timing(matchOpacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(matchScale, {
          toValue: 1,
          friction: 7,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.timing(matchOpacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }).start(() => {
          setShowMatch(false);
          advanceProfile();
        });
      }, 2200);
    },
    [advanceProfile, matchOpacity, matchScale]
  );

  const animateSwipe = useCallback(
    (direction: 'left' | 'right', onDone: () => void) => {
      const toX = direction === 'right' ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;

      Animated.parallel([
        Animated.timing(position, {
          toValue: { x: toX, y: direction === 'right' ? -30 : 30 },
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.92,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(nextCardScale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start(() => onDone());
    },
    [cardOpacity, cardScale, nextCardScale, position]
  );

  const processSwipe = useCallback(
    async (direction: 'like' | 'pass') => {
      if (seenAll || showMatch || !profile || loading) return;

      setActionError('');
      const firstName = profile.name.split(' ')[0];

      const afterSwipe = async () => {
        if (profile.isMock) {
          if (direction === 'like') {
            showMatchOverlay(firstName);
          } else {
            advanceProfile();
          }
          return;
        }

        if (direction === 'like') {
          try {
            const { isMutualMatch } = await recordLike(profile.id);
            if (isMutualMatch) {
              showMatchOverlay(firstName);
            } else {
              advanceProfile();
            }
          } catch (err) {
            setActionError(
              err instanceof Error ? err.message : 'Could not save your like'
            );
            advanceProfile();
          }
        } else {
          try {
            await recordPass(profile.id);
          } catch (err) {
            setActionError(
              err instanceof Error ? err.message : 'Could not save your pass'
            );
          }
          advanceProfile();
        }
      };

      animateSwipe(direction === 'like' ? 'right' : 'left', () => {
        afterSwipe();
      });
    },
    [advanceProfile, animateSwipe, loading, profile, seenAll, showMatch, showMatchOverlay]
  );

  const handlePass = useCallback(() => {
    processSwipe('pass');
  }, [processSwipe]);

  const handleLike = useCallback(() => {
    processSwipe('like');
  }, [processSwipe]);

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
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>
          {usingMockFallback
            ? 'Preview profiles — real matches appear as members join'
            : 'Genotype-aware matches near you'}
        </Text>
      </View>

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
            <View style={styles.emptyIconWrap}>
              <Ionicons name="people-outline" size={28} color={COLORS.forest} />
            </View>
            <Text style={styles.emptyTitle}>No profiles to show</Text>
            <Text style={styles.emptyBody}>Check back soon for new people nearby.</Text>
          </View>
        ) : seenAll ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="checkmark-circle-outline" size={28} color={COLORS.forest} />
            </View>
            <Text style={styles.emptyTitle}>You&apos;ve seen everyone nearby.</Text>
            <Text style={styles.emptyBody}>Check back tomorrow.</Text>
          </View>
        ) : (
          <>
            {index + 1 < profiles.length && (
              <Animated.View
                style={[
                  styles.card,
                  styles.cardBehind,
                  { transform: [{ scale: nextCardScale }] },
                ]}
              >
                <ProfileCard profile={profiles[index + 1]} />
              </Animated.View>
            )}

            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.card,
                {
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
              <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>
                <Text style={styles.stampLikeText}>LIKE</Text>
              </Animated.View>
              <Animated.View style={[styles.stamp, styles.stampPass, { opacity: passOpacity }]}>
                <Text style={styles.stampPassText}>PASS</Text>
              </Animated.View>
              <ProfileCard profile={profile} />
            </Animated.View>
          </>
        )}
      </View>

      {!seenAll && !isEmpty && !loading && !loadError && (
        <View style={styles.actions}>
          {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
          <Pressable
            style={({ pressed }) => [styles.passBtn, pressed && styles.btnPressed]}
            onPress={handlePass}
            disabled={showMatch}
          >
            <Ionicons name="close" size={30} color={COLORS.textSubtle} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.likeBtn, pressed && styles.btnPressed]}
            onPress={handleLike}
            disabled={showMatch}
          >
            <Ionicons name="heart" size={30} color={COLORS.ivory} />
          </Pressable>
        </View>
      )}

      {showMatch && (
        <Animated.View
          style={[
            styles.matchOverlay,
            {
              opacity: matchOpacity,
              transform: [{ scale: matchScale }],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.matchSparkRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.matchSpark, i % 2 === 0 && styles.matchSparkAlt]} />
            ))}
          </View>
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchedName} liked each other
            </Text>
            <View style={styles.matchIconWrap}>
              <Ionicons name="heart" size={40} color={COLORS.forest} />
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerTitle: {
    ...TYPOGRAPHY.display,
  },
  headerSubtitle: {
    marginTop: 4,
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.cardElevated,
    overflow: 'hidden',
  },
  cardBody: {
    flex: 1,
  },
  photoArea: {
    width: '100%',
    height: PHOTO_HEIGHT,
    position: 'relative',
  },
  photoGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    zIndex: 2,
  },
  photoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 14,
    zIndex: 3,
  },
  photoNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  matchPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    zIndex: 4,
  },
  matchPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.forest,
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    opacity: 0.92,
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: 'rgba(7, 77, 46, 0.6)',
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
    color: COLORS.ivory,
    fontWeight: '800',
    fontSize: 15,
  },
  actionError: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    color: '#A32D2D',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '90%',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  city: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '400',
    lineHeight: 22.5,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22.5,
    color: COLORS.textMuted,
    fontWeight: '400',
    marginBottom: 16,
  },
  interestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
  },
  interestText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.forest,
  },
  stamp: {
    position: 'absolute',
    top: 24,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  stampLike: {
    left: 24,
    borderColor: COLORS.forest,
    transform: [{ rotate: '-12deg' }],
  },
  stampPass: {
    right: 24,
    borderColor: COLORS.textSubtle,
    transform: [{ rotate: '12deg' }],
  },
  stampLikeText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.forest,
    letterSpacing: 2,
  },
  stampPassText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textSubtle,
    letterSpacing: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
    paddingBottom: 8,
    paddingTop: 8,
  },
  passBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  likeBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.forest,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.button,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
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
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headingSm,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyBody: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
  },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 77, 46, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    zIndex: 100,
  },
  matchSparkRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  matchSpark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  matchSparkAlt: {
    backgroundColor: COLORS.sage,
    marginTop: 6,
  },
  matchCard: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.cardElevated,
  },
  matchTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.forest,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  matchIconWrap: {
    marginTop: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.ivory,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
