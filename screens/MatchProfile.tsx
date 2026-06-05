import { useEffect, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GenoPremiumChrome, GenoCardFrame } from '../src/brand/graphics';
import { GenoBackHeader } from '../src/components/genoExperience';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ProfileAvatar from '../src/components/ProfileAvatar';
import { ProfileViewSections } from '../src/components/profile';
import { ProfileVitalityRing } from '../src/components/profileStudio';
import ReportBlockSheet from '../src/components/ReportBlockSheet';
import { COLORS, RADIUS, SHADOWS } from '../src/theme';
import type { MatchWithProfile } from '../src/types/database';

type MatchProfileProps = {
  match: MatchWithProfile;
  onBack: () => void;
  onSendMessage: () => void;
};

export default function MatchProfile({ match, onBack, onSendMessage }: MatchProfileProps) {
  const { profile } = match;
  const [showModerationSheet, setShowModerationSheet] = useState(false);

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

  const handleSend = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSendMessage();
  };

  const menuBtn = (
    <Pressable
      style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
      onPress={() => setShowModerationSheet(true)}
      accessibilityLabel="Report or block"
    >
      <Ionicons name="ellipsis-vertical" size={20} color={COLORS.forest} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="linen" />
      <StatusBar style="dark" />

      <GenoBackHeader title="Match profile" onBack={onBack} right={menuBtn} />

      <ReportBlockSheet
        visible={showModerationSheet}
        onClose={() => setShowModerationSheet(false)}
        targetUserId={profile.id}
        targetName={profile.name}
        onBlocked={onBack}
      />

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <GenoCardFrame style={styles.heroFrame}>
          <View style={styles.heroInner}>
            <View style={styles.heroTop}>
              <ProfileAvatar
                name={profile.name}
                gradient={profile.gradient}
                avatarUrl={profile.avatarUrl}
                size={108}
              />
              <View style={styles.ringCol}>
                <ProfileVitalityRing percent={profile.compatibility} size={88} />
                <Text style={styles.ringLabel}>Compatible</Text>
              </View>
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
              <Ionicons name="heart" size={12} color={COLORS.forestDeep} />
              <Text style={styles.matchBadgeText}>Mutual match</Text>
            </View>
          </View>
        </GenoCardFrame>

        <GenoCardFrame style={styles.sectionsFrame}>
          <View style={styles.sectionsInner}>
            <ProfileViewSections
              bio={profile.bio}
              interests={profile.interests}
              relationshipGoal={profile.relationshipGoal ?? ''}
            />
          </View>
        </GenoCardFrame>
      </Animated.ScrollView>

      <View style={styles.footer}>
        <LinearGradient
          colors={['rgba(245, 239, 230, 0)', 'rgba(245, 239, 230, 0.96)', COLORS.linen]}
          style={styles.footerFade}
          pointerEvents="none"
        />
        <Animated.View style={[styles.footerInner, { transform: [{ scale: ctaScale }] }]}>
          <Pressable
            style={({ pressed }) => [styles.messageBtnWrap, pressed && styles.messageBtnPressed]}
            onPressIn={onCtaPressIn}
            onPressOut={onCtaPressOut}
            onPress={handleSend}
          >
            <LinearGradient
              colors={[COLORS.forest, COLORS.forestDeep]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.messageBtn}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.linen} />
              <Text style={styles.messageBtnText}>Send message</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.28)',
  },
  menuBtnPressed: {
    opacity: 0.88,
  },
  scroll: {
    paddingBottom: 120,
  },
  heroFrame: {
    marginTop: 4,
  },
  heroInner: {
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 14,
  },
  ringCol: {
    alignItems: 'center',
    gap: 4,
  },
  ringLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.sage,
  },
  displayName: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 26,
    color: COLORS.forestDeep,
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
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
  },
  matchBadge: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(212, 168, 67, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.forestDeep,
  },
  sectionsFrame: {
    marginTop: 2,
  },
  sectionsInner: {
    padding: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  footerFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -28,
    height: 28,
  },
  footerInner: {
    width: '100%',
  },
  messageBtnWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  messageBtnPressed: {
    opacity: 0.92,
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    paddingHorizontal: 20,
  },
  messageBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: COLORS.linen,
    letterSpacing: 0.1,
  },
});
