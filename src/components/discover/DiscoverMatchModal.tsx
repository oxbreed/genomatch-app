import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GenoBondMark } from '../../brand';
import ProfileAvatar from '../ProfileAvatar';
import VerifiedBadge from '../VerifiedBadge';
import { getPrimaryPhotoUri } from '../../lib/profilePhotos';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import type { DiscoveryProfile } from '../../types/database';

type ViewerSnapshot = {
  name: string;
  avatarUrl?: string | null;
  photos?: string[];
  gradient: [string, string];
  genotypeVerified?: boolean;
};

type Props = {
  visible: boolean;
  matchName: string;
  profile?: DiscoveryProfile | null;
  viewer?: ViewerSnapshot | null;
  onContinue: () => void;
  onSendMessage?: () => void;
};

function MatchPhoto({
  name,
  avatarUrl,
  photos,
  gradient,
  verified,
}: {
  name: string;
  avatarUrl?: string | null;
  photos?: string[];
  gradient: [string, string];
  verified?: boolean;
}) {
  const uri = getPrimaryPhotoUri(avatarUrl, photos);

  return (
    <View style={styles.photoWrap}>
      <View style={styles.photoRing}>
        <ProfileAvatar
          name={name}
          gradient={gradient}
          avatarUrl={uri}
          size={72}
          noPhotoBackground={COLORS.forestDeep}
          noPhotoInitialColor={COLORS.linen}
        />
      </View>
      {verified ? (
        <View style={styles.verifiedDot}>
          <VerifiedBadge compact />
        </View>
      ) : null}
    </View>
  );
}

export default function DiscoverMatchModal({
  visible,
  matchName,
  profile,
  viewer,
  onContinue,
  onSendMessage,
}: Props) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.94)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const firstName = matchName.trim().split(/\s+/)[0] || matchName;
  const viewerFirstName = viewer?.name?.trim().split(/\s+/)[0] || 'You';
  const viewerGradient = viewer?.gradient ?? [COLORS.forest, COLORS.forestDeep];

  const matchPhotoUri = useMemo(
    () => (profile ? getPrimaryPhotoUri(profile.avatarUrl, profile.photos) : null),
    [profile]
  );

  useEffect(() => {
    if (!visible) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    backdrop.setValue(0);
    cardScale.setValue(0.94);
    cardOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, backdrop, cardOpacity, cardScale]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onContinue} accessibilityLabel="Dismiss" />

        <Animated.View
          style={[
            styles.cardOuter,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(212, 168, 67, 0.55)', 'rgba(61, 122, 82, 0.35)', 'rgba(212, 168, 67, 0.45)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <View style={styles.card}>
              <LinearGradient
                colors={['rgba(22, 53, 34, 0.82)', 'rgba(22, 53, 34, 0.82)']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.cardFill}
              >
                <View style={styles.kickerRow}>
                  <View style={styles.kickerLine} />
                  <Text style={styles.kicker}>Mutual match</Text>
                  <View style={styles.kickerLine} />
                </View>

                <Text style={styles.title}>{"It's a Match!"}</Text>
                <Text style={styles.subtitle}>
                  You and <Text style={styles.name}>{firstName}</Text> liked each other
                </Text>

                <View style={styles.bondRow}>
                  <View style={styles.avatarCol}>
                    <MatchPhoto
                      name={viewer?.name ?? 'You'}
                      avatarUrl={viewer?.avatarUrl}
                      photos={viewer?.photos}
                      gradient={viewerGradient}
                      verified={viewer?.genotypeVerified}
                    />
                    <Text style={styles.avatarLabel}>{viewerFirstName}</Text>
                  </View>

                  <View style={styles.bondMark}>
                    <GenoBondMark size={44} opacity={0.95} />
                  </View>

                  <View style={styles.avatarCol}>
                    {profile ? (
                      <MatchPhoto
                        name={profile.name}
                        avatarUrl={matchPhotoUri ?? profile.avatarUrl}
                        photos={profile.photos}
                        gradient={profile.gradient}
                        verified={profile.genotypeVerified}
                      />
                    ) : (
                      <View style={styles.photoRing}>
                        <ProfileAvatar
                          name={matchName}
                          gradient={[COLORS.forest, COLORS.forestDeep]}
                          avatarUrl={null}
                          size={72}
                        />
                      </View>
                    )}
                    <Text style={styles.avatarLabel} numberOfLines={1}>
                      {firstName}
                    </Text>
                  </View>
                </View>

                {profile ? (
                  <>
                    <View style={styles.compatPill}>
                      <Ionicons name="sparkles" size={14} color={COLORS.gold} />
                      <Text style={styles.compatText}>{profile.compatibility}% genotype match</Text>
                      {profile.genotypeVerified ? (
                        <>
                          <View style={styles.compatDivider} />
                          <Ionicons name="shield-checkmark" size={13} color={COLORS.verified} />
                          <Text style={styles.verifiedText}>Verified</Text>
                        </>
                      ) : null}
                    </View>
                    <Text style={styles.compatDisclaimer} numberOfLines={2}>
                      Informational only — not medical advice.
                    </Text>
                  </>
                ) : null}

                <Pressable
                  style={({ pressed }) => [styles.ctaWrap, pressed && styles.ctaPressed]}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onContinue();
                  }}
                >
                  <LinearGradient
                    colors={[COLORS.gold, '#C49A38']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.cta}
                  >
                    <Text style={styles.ctaText}>Continue</Text>
                  </LinearGradient>
                </Pressable>

                {onSendMessage ? (
                  <Pressable
                    style={({ pressed }) => [styles.secondaryBtn, pressed && styles.ctaPressed]}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      onSendMessage();
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={COLORS.gold} />
                    <Text style={styles.secondaryText}>Send a message</Text>
                  </Pressable>
                ) : null}
              </LinearGradient>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 40, 24, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  cardOuter: {
    width: '100%',
    maxWidth: 340,
    zIndex: 2,
  },
  cardBorder: {
    borderRadius: RADIUS.xl,
    padding: 1.5,
    ...SHADOWS.cardElevated,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.22,
  },
  card: {
    borderRadius: RADIUS.xl - 1.5,
    overflow: 'hidden',
  },
  cardFill: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  kickerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 168, 67, 0.35)',
  },
  kicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.gold,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 32,
    letterSpacing: -0.6,
    color: COLORS.linen,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(245, 239, 230, 0.82)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  name: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.gold,
  },
  bondRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },
  avatarCol: {
    alignItems: 'center',
    gap: 8,
    width: 88,
  },
  photoWrap: {
    position: 'relative',
  },
  photoRing: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(212, 168, 67, 0.55)',
    backgroundColor: 'rgba(13, 40, 24, 0.35)',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.linen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.forestDeep,
  },
  bondMark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  avatarLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.sage,
    textAlign: 'center',
    maxWidth: 88,
  },
  compatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.28)',
    marginBottom: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  compatDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(212, 168, 67, 0.35)',
    marginHorizontal: 2,
  },
  compatText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    letterSpacing: 0.2,
    color: COLORS.linen,
  },
  verifiedText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: COLORS.verified,
  },
  compatDisclaimer: {
    fontSize: 10,
    lineHeight: 13,
    color: COLORS.sage,
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.8,
    paddingHorizontal: 16,
  },
  ctaWrap: {
    width: '100%',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cta: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: COLORS.forestDeep,
    letterSpacing: 0.1,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
  },
  secondaryText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.gold,
  },
});
