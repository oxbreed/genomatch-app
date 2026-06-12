import { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { GenoPremiumChrome, GenoCardFrame, GenoGlassSurface } from '../src/brand/graphics';
import { GenoBackHeader } from '../src/components/genoExperience';
import { GenoGlassIconButton } from '../src/components/inbox';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ProfileAvatar from '../src/components/ProfileAvatar';
import FamilyPlanningCard from '../src/components/FamilyPlanningCard';
import LifestyleBadges from '../src/components/LifestyleBadges';
import PresenceBadge from '../src/components/PresenceBadge';
import { ProfileViewSections } from '../src/components/profile';
import { ProfileVitalityRing } from '../src/components/profileStudio';
import ReportBlockSheet from '../src/components/ReportBlockSheet';
import LocationLine from '../src/components/LocationLine';
import { FONT_FAMILY, COLORS, MOTION, RADIUS, SHADOWS } from '../src/theme';
import { getCurrentProfile } from '../src/lib/profiles';
import type { Genotype, MatchWithProfile } from '../src/types/database';

type MatchProfileProps = {
  match: MatchWithProfile;
  onBack: () => void;
  onSendMessage: () => void;
};

export default function MatchProfile({ match, onBack, onSendMessage }: MatchProfileProps) {
  const { profile } = match;
  const [showModerationSheet, setShowModerationSheet] = useState(false);
  const [viewerGenotype, setViewerGenotype] = useState<Genotype | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    void getCurrentProfile().then((row) => setViewerGenotype(row?.genotype ?? null));
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: MOTION.sheetOpenMs,
        easing: MOTION.easing.sheetOut,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: MOTION.sheetOpenMs + 40,
        easing: MOTION.easing.sheetOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onCtaPressIn = () => {
    Animated.spring(ctaScale, {
      toValue: 0.97,
      ...MOTION.springSnappy,
    }).start();
  };

  const onCtaPressOut = () => {
    Animated.spring(ctaScale, {
      toValue: 1,
      ...MOTION.springSnappy,
    }).start();
  };

  const handleSend = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSendMessage();
  };

  const menuBtn = (
    <GenoGlassIconButton
      onPress={() => setShowModerationSheet(true)}
      accessibilityLabel="Report or block"
      size={40}
    >
      <Ionicons name="ellipsis-vertical" size={18} color={COLORS.forestDeep} />
    </GenoGlassIconButton>
  );

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="discover" />
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
              <LocationLine city={profile.city} distanceBand={profile.distanceBand} />
            </View>

            {(profile.presenceState !== 'offline' || profile.isNewMember) ? (
              <View style={styles.presenceRow}>
                <PresenceBadge
                  presenceState={profile.presenceState}
                  isNewMember={profile.isNewMember}
                />
              </View>
            ) : null}

            <View style={styles.lifestyleRow}>
              <LifestyleBadges
                drinkingStatus={profile.drinkingStatus}
                smokingStatus={profile.smokingStatus}
                educationStatus={profile.educationStatus}
                heightCm={profile.heightCm}
                religion={profile.religion}
              />
            </View>

            <View style={styles.matchBadge}>
              <Ionicons name="heart" size={12} color={COLORS.forestDeep} />
              <Text style={styles.matchBadgeText}>Mutual match</Text>
            </View>
          </View>
        </GenoCardFrame>

        <GenoCardFrame style={styles.familyFrame}>
          <View style={styles.familyInner}>
            <FamilyPlanningCard
              viewerGenotype={viewerGenotype}
              candidateGenotype={profile.genotype}
            />
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
          colors={['rgba(245, 239, 230, 0)', 'rgba(245, 239, 230, 0.95)', COLORS.linen]}
          style={styles.footerFade}
          pointerEvents="none"
        />
        <GenoGlassSurface
          variant="linen"
          borderRadius={24}
          shadow="glassElevated"
          showTopRule
          style={styles.footerGlass}
          contentStyle={styles.footerGlassInner}
        >
          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
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
        </GenoGlassSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.linen,
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
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.sage,
  },
  displayName: {
    fontFamily: FONT_FAMILY.gothamBold,
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
  presenceRow: {
    marginTop: 10,
  },
  lifestyleRow: {
    marginTop: 10,
    paddingHorizontal: 8,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  city: {
    fontFamily: FONT_FAMILY.gothamMedium,
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
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.forestDeep,
  },
  familyFrame: {
    marginTop: 2,
  },
  familyInner: {
    padding: 16,
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
    top: -32,
    height: 32,
  },
  footerGlass: {
    overflow: 'hidden',
  },
  footerGlassInner: {
    padding: 12,
  },
  messageBtnWrap: {
    borderRadius: RADIUS.pill,
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
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    color: COLORS.linen,
    letterSpacing: 0.1,
  },
});
