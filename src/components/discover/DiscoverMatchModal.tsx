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
import * as Haptics from 'expo-haptics';
import MatchCardActions from './MatchCardActions';
import { GenoBondMark } from '../../brand';
import {
  GenoGlassBackdrop,
  GenoGlassSurface,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import ProfileAvatar from '../ProfileAvatar';
import VerifiedBadge from '../VerifiedBadge';
import { getPrimaryPhotoUri } from '../../lib/profilePhotos';
import {
  FONT_FAMILY,
  COLORS,
  LOGO_GOLD,
  RADIUS,
  TYPOGRAPHY,
  chromeAlpha,
  goldAlpha,
} from '../../theme';
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
      <GenoMirrorRimFrame kind="gold" borderRadius={999} padding={1.5}>
        <GenoMirrorSteelFill style={styles.photoRing}>
          <ProfileAvatar
            name={name}
            gradient={gradient}
            avatarUrl={uri}
            size={68}
            noPhotoBackground={COLORS.ink}
            noPhotoInitialColor={COLORS.linen}
          />
        </GenoMirrorSteelFill>
      </GenoMirrorRimFrame>
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
  const viewerGradient = viewer?.gradient ?? [COLORS.hero, COLORS.ink];

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
        <GenoGlassBackdrop />
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
          <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.xl} style={styles.cardRim}>
            <GenoGlassSurface
              variant="dark"
              borderRadius={RADIUS.xl - 1.5}
              shadow="glassElevated"
              showTopRule
              showSheen
              showBorder={false}
              intensity={52}
              style={styles.card}
              contentStyle={styles.cardFill}
            >
              <View style={styles.kickerRow}>
                <View style={styles.kickerLine} />
                <GenoMirrorMetallicIcon name="heart" size={12} tone="gold" />
                <Text style={styles.kicker}>Mutual match</Text>
                <GenoMirrorMetallicIcon name="heart" size={12} tone="gold" />
                <View style={styles.kickerLine} />
              </View>

              <LinearGradient
                colors={['transparent', chromeAlpha(0.35), LOGO_GOLD, goldAlpha(0.35), 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.rule}
                pointerEvents="none"
              />

              <Text style={styles.title}>{"It's a Match!"}</Text>
              <Text style={styles.subtitle}>
                You and <Text style={styles.name}>{firstName}</Text> liked each other.
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

                <GenoMirrorRimFrame kind="gold" borderRadius={30} padding={1.5} style={styles.bondRim}>
                  <GenoMirrorSteelFill style={styles.bondMark}>
                    <GenoBondMark size={44} opacity={0.95} />
                  </GenoMirrorSteelFill>
                </GenoMirrorRimFrame>

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
                    <GenoMirrorRimFrame kind="gold" borderRadius={999} padding={1.5}>
                      <GenoMirrorSteelFill style={styles.photoRing}>
                        <ProfileAvatar
                          name={matchName}
                          gradient={[COLORS.hero, COLORS.ink]}
                          avatarUrl={null}
                          size={68}
                        />
                      </GenoMirrorSteelFill>
                    </GenoMirrorRimFrame>
                  )}
                  <Text style={styles.avatarLabel} numberOfLines={1}>
                    {firstName}
                  </Text>
                </View>
              </View>

              {profile ? (
                <>
                  <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.pill} style={styles.compatRim}>
                    <GenoMirrorSteelFill style={styles.compatPill}>
                      <GenoMirrorMetallicIcon name="sparkles" size={14} tone="gold" />
                      <Text style={styles.compatText}>{profile.lifestyleMatch}% compatible</Text>
                      {profile.genotypeVerified ? (
                        <>
                          <View style={styles.compatDivider} />
                          <GenoMirrorMetallicIcon name="shield-checkmark" size={13} tone="chrome" />
                          <Text style={styles.verifiedText}>Verified</Text>
                        </>
                      ) : null}
                    </GenoMirrorSteelFill>
                  </GenoMirrorRimFrame>
                  <Text style={styles.compatDisclaimer} numberOfLines={3}>
                    Educational information only. Not medical advice.
                  </Text>
                </>
              ) : null}

              <MatchCardActions onContinue={onContinue} onSendMessage={onSendMessage} />
            </GenoGlassSurface>
          </GenoMirrorRimFrame>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  cardOuter: {
    width: '100%',
    maxWidth: 340,
    zIndex: 2,
  },
  cardRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  card: {
    overflow: 'hidden',
  },
  cardFill: {
    width: '100%',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'stretch',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },
  kickerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  kicker: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: LOGO_GOLD,
  },
  rule: {
    width: '100%',
    height: 1,
    borderRadius: 1,
    marginBottom: 18,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: COLORS.textOnDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textMutedOnDark,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  name: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: LOGO_GOLD,
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
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: LOGO_GOLD,
  },
  bondRim: {
    marginTop: 10,
  },
  bondMark: {
    width: 58,
    height: 58,
    borderRadius: 28.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.textMutedOnDark,
    textAlign: 'center',
    maxWidth: 88,
  },
  compatRim: {
    marginBottom: 8,
    alignSelf: 'stretch',
    width: '100%',
  },
  compatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.pill - 1.5,
    flexWrap: 'wrap',
  },
  compatDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 2,
  },
  compatText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 12,
    letterSpacing: 0.2,
    color: COLORS.textOnDark,
  },
  verifiedText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    color: COLORS.verified,
  },
  compatDisclaimer: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
    color: COLORS.textSubtleOnDark,
  },
});
