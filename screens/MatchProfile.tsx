import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ProfileAvatar from '../src/components/ProfileAvatar';
import { COLORS, RELATIONSHIP_GOAL_LABELS } from '../src/data/mockData';
import type { MatchWithProfile } from '../src/types/database';

type MatchProfileProps = {
  match: MatchWithProfile;
  onBack: () => void;
  onSendMessage: () => void;
};

function CompatibilityRing({ percent }: { percent: number }) {
  const ringColor = percent >= 90 ? COLORS.gold : COLORS.sage;

  return (
    <View style={styles.ringWrap}>
      <View style={styles.ringOuter} />
      <View
        style={[
          styles.ringAccent,
          {
            borderTopColor: ringColor,
            borderRightColor: percent > 50 ? ringColor : 'transparent',
            borderBottomColor: percent > 75 ? ringColor : 'transparent',
            borderLeftColor: percent > 25 ? 'rgba(168, 213, 186, 0.7)' : 'transparent',
          },
        ]}
      />
      <View style={styles.ringInner}>
        <Text style={styles.ringPercent}>{percent}%</Text>
        <Text style={styles.ringLabel}>Compatible</Text>
      </View>
    </View>
  );
}

export default function MatchProfile({ match, onBack, onSendMessage }: MatchProfileProps) {
  const { profile } = match;
  const goalKey = profile.relationshipGoal ?? '';
  const goalLabel =
    RELATIONSHIP_GOAL_LABELS[goalKey] ?? (goalKey || 'Not specified');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onCtaPressIn = () => {
    Animated.spring(ctaScale, {
      toValue: 0.97,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  const onCtaPressOut = () => {
    Animated.spring(ctaScale, {
      toValue: 1,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Match Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <ProfileAvatar
              name={profile.name}
              gradient={profile.gradient}
              avatarUrl={profile.avatarUrl}
              size={112}
            />
            <CompatibilityRing percent={profile.compatibility} />
          </View>

          <Text style={styles.displayName}>
            {profile.name}
            {profile.age != null ? `, ${profile.age}` : ''}
          </Text>

          <View style={styles.heroMeta}>
            <GenotypeBadge genotype={profile.genotype} />
            <View style={styles.cityRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.sage} />
              <Text style={styles.city}>{profile.city}</Text>
            </View>
          </View>

          <View style={styles.matchBadge}>
            <Ionicons name="heart" size={12} color={COLORS.forest} />
            <Text style={styles.matchBadgeText}>Mutual Match</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.bio}>
            {profile.bio || 'No bio yet — say hello and start a conversation!'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Interests</Text>
          {profile.interests.length > 0 ? (
            <View style={styles.chipRow}>
              {profile.interests.map((interest) => (
                <View key={interest} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyHint}>No interests listed yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Relationship goal</Text>
          <View style={styles.goalCard}>
            <Text style={styles.goalText}>{goalLabel}</Text>
          </View>
        </View>
      </Animated.ScrollView>

      <View style={styles.footer}>
        <Animated.View style={[styles.footerInner, { transform: [{ scale: ctaScale }] }]}>
          <Pressable
            style={styles.messageBtn}
            onPressIn={onCtaPressIn}
            onPressOut={onCtaPressOut}
            onPress={onSendMessage}
          >
            <Text style={styles.messageBtnText}>Send Message</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
  },
  backText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.forest,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 72,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
    shadowColor: COLORS.forest,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  ringWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(168, 213, 186, 0.35)',
  },
  ringAccent: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
  },
  ringInner: {
    alignItems: 'center',
  },
  ringPercent: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.5,
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(7, 77, 46, 0.55)',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  displayName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.forest,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  city: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: COLORS.textMuted,
  },
  matchBadge: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 224, 130, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(201, 135, 43, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: 0.2,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.sage,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  bio: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(7, 77, 46, 0.78)',
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.forest,
  },
  emptyHint: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(7, 77, 46, 0.5)',
  },
  goalCard: {
    backgroundColor: 'rgba(255, 224, 130, 0.35)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 135, 43, 0.25)',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.forest,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: COLORS.ivory,
    borderTopWidth: 1,
    borderTopColor: 'rgba(7, 77, 46, 0.08)',
  },
  footerInner: {
    width: '100%',
  },
  messageBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.forest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.forest,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  messageBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ivory,
    letterSpacing: 0.2,
  },
});
