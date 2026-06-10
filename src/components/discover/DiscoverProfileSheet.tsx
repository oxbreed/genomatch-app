import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoCardFrame } from '../../brand/graphics';
import { GenoBondMark } from '../../brand';
import GenoCompatRing from '../genomatch/GenoCompatRing';
import ProfileAvatar from '../ProfileAvatar';
import VerifiedBadge from '../VerifiedBadge';
import GenotypeBadge from '../GenotypeBadge';
import LifestyleBadges from '../LifestyleBadges';
import PresenceBadge from '../PresenceBadge';
import { COLORS, RELATIONSHIP_GOAL_LABELS } from '../../data/mockData';
import { getGenotypeCompatibilityLine } from '../../lib/compatibility';
import type { DiscoveryProfile, Genotype } from '../../types/database';

type Props = {
  visible: boolean;
  profile: DiscoveryProfile | null;
  viewerGenotype: Genotype | null;
  backdropOpacity: Animated.Value;
  translateY: Animated.Value;
  onClose: () => void;
  onLike: () => void;
};

function formatGoal(goal?: string | null): string {
  if (!goal) return 'Not set';
  return RELATIONSHIP_GOAL_LABELS[goal] ?? goal;
}

export default function DiscoverProfileSheet({
  visible,
  profile,
  viewerGenotype,
  backdropOpacity,
  translateY,
  onClose,
  onLike,
}: Props) {
  if (!profile) return null;

  const compatLine = getGenotypeCompatibilityLine(viewerGenotype, profile.genotype);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdropPress} onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          <GenoBondMark size={22} opacity={0.45} />

          <GenoCardFrame style={styles.heroFrame}>
            <View style={styles.heroInner}>
              <ProfileAvatar
                name={profile.name}
                gradient={profile.gradient}
                avatarUrl={profile.photos[0] ?? profile.avatarUrl}
                size={88}
              />
              <GenoCompatRing percent={profile.compatibility} size={80} />
            </View>
            <Text style={styles.name}>
              {profile.name}
              {profile.age != null ? `, ${profile.age}` : ''}
            </Text>
            <View style={styles.metaRow}>
              <GenotypeBadge genotype={profile.genotype} />
              {profile.genotypeVerified ? <VerifiedBadge compact /> : null}
              <Text style={styles.city}>{profile.city}</Text>
            </View>
            {(profile.presenceState !== 'offline' || profile.isNewMember) ? (
              <PresenceBadge
                presenceState={profile.presenceState}
                isNewMember={profile.isNewMember}
              />
            ) : null}
            <Text style={styles.compatLine} numberOfLines={2}>
              {compatLine}
            </Text>
          </GenoCardFrame>

          <Text style={styles.bio}>
            {profile.bio || 'No bio yet — tap Like to start a bond.'}
          </Text>

          <LifestyleBadges
            drinkingStatus={profile.drinkingStatus}
            smokingStatus={profile.smokingStatus}
            educationStatus={profile.educationStatus}
            heightCm={profile.heightCm}
            religion={profile.religion}
          />

          {profile.interests.length > 0 ? (
            <View style={styles.chipRow}>
              {profile.interests.map((interest: string) => (
                <LinearGradient
                  key={interest}
                  colors={['rgba(237, 243, 238, 0.95)', 'rgba(212, 168, 67, 0.14)']}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>{interest}</Text>
                </LinearGradient>
              ))}
            </View>
          ) : null}

          <View style={styles.goalPill}>
            <Text style={styles.goalLabel}>Relationship goal</Text>
            <Text style={styles.goalValue}>{formatGoal(profile.relationshipGoal)}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.likeBtn, pressed && styles.likeBtnPressed]}
            onPress={onLike}
          >
            <LinearGradient colors={[COLORS.gold, '#C49A2E']} style={styles.likeGradient}>
              <Ionicons name="heart" size={20} color={COLORS.forestDeep} />
              <Text style={styles.likeText}>Like & connect</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.dismissBtn} onPress={onClose}>
            <Text style={styles.dismissText}>Keep browsing</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 40, 24, 0.55)',
  },
  sheet: {
    backgroundColor: COLORS.linen,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 12,
    maxHeight: '88%',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(13, 40, 24, 0.2)',
    marginBottom: 4,
  },
  heroFrame: {
    width: '100%',
  },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  name: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 24,
    color: COLORS.forestDeep,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
  },
  city: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.sage,
  },
  compatLine: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSubtle,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  bio: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.forestDeep,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.12)',
  },
  chipText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forest,
  },
  goalPill: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 168, 67, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  goalLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    color: COLORS.sage,
    textTransform: 'uppercase',
  },
  goalValue: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 16,
    color: COLORS.forestDeep,
    marginTop: 4,
  },
  likeBtn: {
    width: '100%',
    marginTop: 4,
  },
  likeBtnPressed: {
    opacity: 0.92,
  },
  likeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
  },
  likeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  dismissBtn: {
    paddingVertical: 8,
  },
  dismissText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.sage,
  },
});
