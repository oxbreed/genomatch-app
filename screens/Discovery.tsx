import { useCallback, useRef, useState } from 'react';
import {
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
import GenotypeBadge from '../src/components/GenotypeBadge';
import {
  COLORS,
  MOCK_MATCHES,
  MockProfile,
  getInitials,
} from '../src/data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.22;

const MOCK_PROFILES = MOCK_MATCHES;

function ScoreRing({ percent }: { percent: number }) {
  const ringColor = percent >= 90 ? COLORS.gold : COLORS.sage;
  const accentStrength = percent >= 75 ? 1 : 0.65;

  return (
    <View style={styles.scoreRingWrap}>
      <View
        style={[
          styles.scoreRingOuter,
          {
            borderColor: `rgba(168, 213, 186, 0.45)`,
          },
        ]}
      />
      <View
        style={[
          styles.scoreRingAccent,
          {
            borderTopColor: ringColor,
            borderRightColor: percent > 50 ? ringColor : 'transparent',
            borderBottomColor: percent > 75 ? ringColor : 'transparent',
            borderLeftColor: percent > 25 ? `rgba(168, 213, 186, ${accentStrength})` : 'transparent',
          },
        ]}
      />
      <View style={styles.scoreRingInner}>
        <Text style={styles.scorePercent}>{percent}%</Text>
        <Text style={styles.scoreLabel}>Match</Text>
      </View>
    </View>
  );
}

function ProfileCard({ profile }: { profile: MockProfile }) {
  return (
    <ScrollView
      style={styles.cardScroll}
      contentContainerStyle={styles.cardScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: profile.gradient[0],
            },
          ]}
        >
          <View
            style={[
              styles.avatarInner,
              { backgroundColor: profile.gradient[1] },
            ]}
          >
            <Text style={styles.avatarInitials}>{getInitials(profile.name)}</Text>
          </View>
        </View>
        <ScoreRing percent={profile.compatibility} />
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.name}>
          {profile.name}, {profile.age}
        </Text>
        <GenotypeBadge genotype={profile.genotype} />
      </View>

      <Text style={styles.city}>📍 {profile.city}</Text>

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
  );
}

export default function Discovery() {
  const [index, setIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedName, setMatchedName] = useState('');

  const position = useRef(new Animated.ValueXY()).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const matchOpacity = useRef(new Animated.Value(0)).current;
  const matchScale = useRef(new Animated.Value(0.85)).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;

  const profile = MOCK_PROFILES[index];
  const isEmpty = index >= MOCK_PROFILES.length;

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

  const handlePass = useCallback(() => {
    if (isEmpty || showMatch) return;
    animateSwipe('left', advanceProfile);
  }, [advanceProfile, animateSwipe, isEmpty, showMatch]);

  const handleLike = useCallback(() => {
    if (isEmpty || showMatch || !profile) return;
    const name = profile.name.split(' ')[0];
    animateSwipe('right', () => showMatchOverlay(name));
  }, [animateSwipe, isEmpty, profile, showMatch, showMatchOverlay]);

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
        <Text style={styles.headerSubtitle}>Genotype-aware matches near you</Text>
      </View>

      <View style={styles.deckArea}>
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>You've seen everyone nearby.</Text>
            <Text style={styles.emptyBody}>Check back tomorrow.</Text>
          </View>
        ) : (
          <>
            {index + 1 < MOCK_PROFILES.length && (
              <Animated.View
                style={[
                  styles.card,
                  styles.cardBehind,
                  { transform: [{ scale: nextCardScale }] },
                ]}
              >
                <ProfileCard profile={MOCK_PROFILES[index + 1]} />
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

      {!isEmpty && (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.passBtn, pressed && styles.btnPressed]}
            onPress={handlePass}
            disabled={showMatch}
          >
            <Text style={styles.passIcon}>✕</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.likeBtn, pressed && styles.btnPressed]}
            onPress={handleLike}
            disabled={showMatch}
          >
            <Text style={styles.likeIcon}>❤️</Text>
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
          <Text style={styles.confetti}>🎉 ✨ 🎊 ✨ 🎉</Text>
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchedName} liked each other
            </Text>
            <Text style={styles.matchEmoji}>💚</Text>
          </View>
          <Text style={styles.confettiBottom}>🎊 🎉 ✨ 🎉 🎊</Text>
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
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(7, 77, 46, 0.6)',
    fontWeight: '500',
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
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
    shadowColor: COLORS.forest,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    overflow: 'hidden',
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    opacity: 0.92,
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    padding: 22,
    paddingBottom: 28,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  scoreRingWrap: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingOuter: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 38,
    borderWidth: 5,
  },
  scoreRingAccent: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 38,
    borderWidth: 5,
  },
  scoreRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercent: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.forest,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(7, 77, 46, 0.55)',
    letterSpacing: 0.5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.4,
  },
  city: {
    fontSize: 15,
    color: 'rgba(7, 77, 46, 0.65)',
    fontWeight: '600',
    marginBottom: 14,
  },
  bio: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(7, 77, 46, 0.78)',
    fontWeight: '500',
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
    borderColor: '#2E7D32',
    transform: [{ rotate: '-12deg' }],
  },
  stampPass: {
    right: 24,
    borderColor: '#9CA3AF',
    transform: [{ rotate: '12deg' }],
  },
  stampLikeText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2E7D32',
    letterSpacing: 2,
  },
  stampPassText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#9CA3AF',
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
    backgroundColor: '#E8E8E4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.1)',
  },
  likeBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  passIcon: {
    fontSize: 28,
    color: '#6B7280',
    fontWeight: '700',
  },
  likeIcon: {
    fontSize: 30,
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
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
    marginBottom: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.forest,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 16,
    color: 'rgba(7, 77, 46, 0.6)',
    fontWeight: '500',
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
  confetti: {
    fontSize: 28,
    marginBottom: 20,
    letterSpacing: 4,
  },
  confettiBottom: {
    fontSize: 28,
    marginTop: 20,
    letterSpacing: 4,
  },
  matchCard: {
    backgroundColor: COLORS.gold,
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  matchTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.forest,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(7, 77, 46, 0.75)',
    textAlign: 'center',
  },
  matchEmoji: {
    fontSize: 48,
    marginTop: 16,
  },
});
