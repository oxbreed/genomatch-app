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
import { GenoBondMark } from '../src/brand';
import { GenoPremiumChrome, GenoCardFrame, GenoGlassSurface } from '../src/brand/graphics';
import { GenoBackHeader } from '../src/components/genoExperience';
import { GenoGlassIconButton } from '../src/components/inbox';
import GenotypeBadge from '../src/components/GenotypeBadge';
import ProfileAvatar from '../src/components/ProfileAvatar';
import FamilyPlanningCard from '../src/components/FamilyPlanningCard';
import LifestyleBadges from '../src/components/LifestyleBadges';
import PresenceBadge from '../src/components/PresenceBadge';
import { ProfileViewSections } from '../src/components/profile';
import DiscoverPremiumSection from '../src/components/discover/DiscoverPremiumSection';
import { premiumCard } from '../src/components/discover/discoverPremium';
import GenoCompatRing from '../src/components/genomatch/GenoCompatRing';
import ReportBlockSheet from '../src/components/ReportBlockSheet';
import LocationLine from '../src/components/LocationLine';
import { getGenotypeRiskShort } from '../src/lib/compatibility';
import { COLORS, LOGO_GOLD, LOGO_RED, MOTION, RADIUS, SHADOWS, TYPOGRAPHY, goldAlpha, redAlpha } from '../src/theme';
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
      <Ionicons name="ellipsis-vertical" size={18} color={COLORS.text} />
    </GenoGlassIconButton>
  );

  const riskShort = getGenotypeRiskShort(viewerGenotype, profile.genotype);

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="discover" />
      <StatusBar style="light" />

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
          <View style={[premiumCard, styles.heroInner]}>
            <View style={styles.heroTop}>
              <View style={styles.avatarWrap}>
                <ProfileAvatar
                  name={profile.name}
                  gradient={profile.gradient}
                  avatarUrl={profile.avatarUrl}
                  size={112}
                />
                {(profile.presenceState !== 'offline' || profile.isNewMember) ? (
                  <View style={styles.badgeOverlay}>
                    <PresenceBadge
                      presenceState={profile.presenceState}
                      isNewMember={profile.isNewMember}
                    />
                  </View>
                ) : null}
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

            <View style={styles.matchBadge}>
              <LinearGradient
                colors={[redAlpha(0.14), goldAlpha(0.1)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.matchBadgeGrad}
              >
                <Ionicons name="heart" size={12} color={LOGO_RED} />
                <Text style={styles.matchBadgeText}>Mutual match</Text>
              </LinearGradient>
            </View>

            <View style={styles.lifestyleRow}>
              <LifestyleBadges
                drinkingStatus={profile.drinkingStatus}
                smokingStatus={profile.smokingStatus}
                educationStatus={profile.educationStatus}
                heightCm={profile.heightCm}
                religion={profile.religion}
              />
            </View>
          </View>
        </GenoCardFrame>

        <View style={styles.harmonyWrap}>
          <DiscoverPremiumSection title="Compatibility score" accent serif>
            <View style={styles.harmonyBody}>
              <GenoBondMark size={20} opacity={0.85} />
              <GenoCompatRing percent={profile.compatibility} size={100} glow />
              <Text style={styles.harmonyLine}>
                {profile.compatibility}% compatible · {riskShort}
              </Text>
              <Text style={styles.harmonyDisclaimer}>
                Educational information only. Not medical advice.
              </Text>
            </View>
          </DiscoverPremiumSection>
        </View>

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
          colors={['rgba(10, 10, 10, 0)', 'rgba(10, 10, 10, 0.96)', COLORS.background]}
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
                colors={[LOGO_RED, '#A30C24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.messageBtn}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.22)', 'transparent']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.45 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.white} />
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
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingBottom: 120,
    paddingHorizontal: 4,
  },
  heroFrame: {
    marginTop: 4,
  },
  heroInner: {
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  heroTop: {
    marginBottom: 14,
  },
  avatarWrap: {
    position: 'relative',
    alignItems: 'center',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
  },
  displayName: {
    ...TYPOGRAPHY.displayName,
    textAlign: 'center',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  matchBadge: {
    marginTop: 14,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  matchBadgeGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  matchBadgeText: {
    ...TYPOGRAPHY.sectionLabel,
    fontSize: 11,
    letterSpacing: 1,
  },
  lifestyleRow: {
    marginTop: 14,
    paddingHorizontal: 4,
  },
  harmonyWrap: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  harmonyBody: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  harmonyLine: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 16,
    textAlign: 'center',
  },
  harmonyDisclaimer: {
    ...TYPOGRAPHY.disclaimer,
    textAlign: 'center',
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
    shadowColor: LOGO_RED,
    shadowOpacity: 0.28,
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
    ...TYPOGRAPHY.cta,
    letterSpacing: 0.1,
  },
});
