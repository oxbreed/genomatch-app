import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GenoGlassSurface,
  GenoMirrorBrandCtaFill,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import * as Haptics from 'expo-haptics';
import { GenoBondMark, GenoSignaturePattern } from '../../brand';
import ProfileAvatar from '../ProfileAvatar';
import {
  FONT_FAMILY,
  COLORS,
  LOGO_GOLD,
  RADIUS,
  METALLIC_CHROME,
  METALLIC_SILVER,
  METALLIC_STEEL,
  chromeAlpha,
  goldAlpha,
} from '../../theme';
import type { DiscoveryProfile } from '../../types/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONFETTI_COUNT = 14;

type Props = {
  visible: boolean;
  matchName: string;
  profile?: DiscoveryProfile | null;
  onContinue: () => void;
};

function ConfettiBurst({ progress }: { progress: Animated.Value }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
        angle: (i / CONFETTI_COUNT) * Math.PI * 2,
        dist: 72 + (i % 4) * 18,
        size: 5 + (i % 3) * 2,
        color:
          i % 3 === 0 ? LOGO_GOLD : i % 3 === 1 ? METALLIC_SILVER : METALLIC_CHROME,
      })),
    []
  );

  return (
    <View style={styles.confettiLayer} pointerEvents="none">
      {pieces.map((piece, index) => {
        const tx = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(piece.angle) * piece.dist],
        });
        const ty = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(piece.angle) * piece.dist],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.15, 0.7, 1],
          outputRange: [0, 1, 1, 0],
        });
        const scale = progress.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0.2, 1.2, 0.6],
        });

        return (
          <Animated.View
            key={`confetti-${index}`}
            style={[
              styles.confettiDot,
              {
                width: piece.size,
                height: piece.size,
                borderRadius: piece.size / 2,
                backgroundColor: piece.color,
                opacity,
                transform: [{ translateX: tx }, { translateY: ty }, { scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function DiscoverMatchCelebration({
  visible,
  matchName,
  profile,
  onContinue,
}: Props) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.82)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(36)).current;
  const bondPulse = useRef(new Animated.Value(1)).current;
  const ringSpin = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const confetti = useRef(new Animated.Value(0)).current;
  const leftAvatarX = useRef(new Animated.Value(-48)).current;
  const rightAvatarX = useRef(new Animated.Value(48)).current;
  const titleGlow = useRef(new Animated.Value(0)).current;

  const firstName = matchName.trim().split(/\s+/)[0] || matchName;

  useEffect(() => {
    if (!visible) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    backdrop.setValue(0);
    cardScale.setValue(0.82);
    cardOpacity.setValue(0);
    cardY.setValue(36);
    confetti.setValue(0);
    leftAvatarX.setValue(-48);
    rightAvatarX.setValue(48);
    shimmer.setValue(0);
    titleGlow.setValue(0);

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 72,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardY, {
        toValue: 0,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(confetti, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(leftAvatarX, {
        toValue: 0,
        friction: 7,
        tension: 90,
        delay: 120,
        useNativeDriver: true,
      }),
      Animated.spring(rightAvatarX, {
        toValue: 0,
        friction: 7,
        tension: 90,
        delay: 180,
        useNativeDriver: true,
      }),
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 800,
        delay: 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(titleGlow, {
        toValue: 1,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(bondPulse, {
          toValue: 1.14,
          duration: 820,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bondPulse, {
          toValue: 1,
          duration: 820,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const spin = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    return () => {
      pulse.stop();
      spin.stop();
    };
  }, [
    visible,
    backdrop,
    bondPulse,
    cardOpacity,
    cardScale,
    cardY,
    confetti,
    leftAvatarX,
    rightAvatarX,
    ringSpin,
    shimmer,
    titleGlow,
  ]);

  const ringRotate = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 0.4, SCREEN_WIDTH * 0.5],
  });

  const titleShine = titleGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <LinearGradient
          colors={['#0A0A0A', 'rgba(10, 10, 10, 0.96)', '#0A0A0A']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.ambientTop} pointerEvents="none">
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.18)', 'transparent']}
            style={styles.ambientGlow}
          />
        </View>

        <View style={styles.patternWrap} pointerEvents="none">
          <GenoSignaturePattern width={SCREEN_WIDTH} height={220} opacity={0.28} />
        </View>

        <Animated.View
          style={[
            styles.cardOuter,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }, { translateY: cardY }],
            },
          ]}
        >
          <GenoMirrorRimFrame kind="gold" borderRadius={30} style={styles.cardRim}>
            <GenoGlassSurface
              variant="dark"
              borderRadius={28.5}
              shadow="glassElevated"
              showTopRule
              showSheen
              showBorder={false}
              intensity={52}
              style={styles.cardInner}
              contentStyle={styles.cardFill}
            >
              <View style={styles.crownRow}>
                <View style={styles.crownLine} />
                <GenoMirrorMetallicIcon name="heart" size={12} tone="gold" />
                <Text style={styles.crownKicker}>MUTUAL MATCH</Text>
                <GenoMirrorMetallicIcon name="heart" size={12} tone="gold" />
                <View style={styles.crownLine} />
              </View>

              <LinearGradient
                colors={['transparent', chromeAlpha(0.35), LOGO_GOLD, goldAlpha(0.35), 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.rule}
                pointerEvents="none"
              />

              <Animated.View style={{ opacity: titleShine }}>
                <Text style={styles.title}>{"It's a Match!"}</Text>
              </Animated.View>

              <View style={styles.shimmerTrack} pointerEvents="none">
                <Animated.View
                  style={[styles.shimmerBar, { transform: [{ translateX: shimmerX }] }]}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.55)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
              </View>

              <Text style={styles.subtitleMatch}>
                You matched with{' '}
                <Text style={styles.nameHighlight}>{firstName}</Text>!
              </Text>
              <Text style={styles.subtitleHint}>
                You both liked each other. Start a conversation or keep browsing Discover.
              </Text>

              <View style={styles.avatarStage}>
                <ConfettiBurst progress={confetti} />

                <Animated.View
                  style={[styles.orbitRing, { transform: [{ rotate: ringRotate }] }]}
                  pointerEvents="none"
                >
                  <View style={styles.orbitDot} />
                  <View style={[styles.orbitDot, styles.orbitDotAlt]} />
                </Animated.View>

                <View style={styles.avatarRow}>
                  <Animated.View
                    style={[styles.avatarSlot, { transform: [{ translateX: leftAvatarX }] }]}
                  >
                    <GenoMirrorRimFrame kind="gold" borderRadius={999} padding={1.5}>
                      <GenoMirrorSteelFill style={styles.youRing}>
                        <GenoMirrorMetallicIcon name="person" size={28} tone="gold" />
                      </GenoMirrorSteelFill>
                    </GenoMirrorRimFrame>
                    <Text style={styles.avatarLabel}>You</Text>
                  </Animated.View>

                  <Animated.View style={[styles.bondCenter, { transform: [{ scale: bondPulse }] }]}>
                    <GenoMirrorRimFrame kind="gold" borderRadius={40} padding={1.5}>
                      <GenoMirrorSteelFill style={styles.bondGlow}>
                        <GenoBondMark size={56} opacity={1} />
                      </GenoMirrorSteelFill>
                    </GenoMirrorRimFrame>
                  </Animated.View>

                  <Animated.View
                    style={[styles.avatarSlot, { transform: [{ translateX: rightAvatarX }] }]}
                  >
                    <GenoMirrorRimFrame kind="gold" borderRadius={999} padding={1.5}>
                      <GenoMirrorSteelFill style={styles.youRing}>
                        {profile ? (
                          <ProfileAvatar
                            name={profile.name}
                            gradient={profile.gradient}
                            avatarUrl={profile.avatarUrl ?? profile.photos[0]}
                            size={64}
                            noPhotoBackground={COLORS.forestDeep}
                            noPhotoInitialColor={COLORS.linen}
                          />
                        ) : (
                          <Text style={styles.initials}>{firstName.slice(0, 2).toUpperCase()}</Text>
                        )}
                      </GenoMirrorSteelFill>
                    </GenoMirrorRimFrame>
                    <Text style={styles.avatarLabel} numberOfLines={1}>
                      {firstName}
                    </Text>
                  </Animated.View>
                </View>
              </View>

              {profile ? (
                <GenoMirrorRimFrame kind="steel" borderRadius={16} style={styles.compatRim}>
                  <GenoMirrorSteelFill style={styles.compatRow}>
                    <GenoMirrorRimFrame kind="gold" borderRadius={26} padding={1.5}>
                      <GenoMirrorSteelFill style={styles.compatRing}>
                        <Text style={styles.compatPercent}>{profile.compatibility}%</Text>
                      </GenoMirrorSteelFill>
                    </GenoMirrorRimFrame>
                    <View style={styles.compatCopy}>
                      <Text style={styles.compatTitle}>Genotype compatibility</Text>
                      <Text style={styles.compatSub}>Aligned for a safer connection</Text>
                    </View>
                  </GenoMirrorSteelFill>
                </GenoMirrorRimFrame>
              ) : null}

              <Pressable
                style={({ pressed }) => [pressed && styles.ctaPressed]}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onContinue();
                }}
              >
                <GenoMirrorRimFrame kind="red" borderRadius={RADIUS.pill} style={styles.ctaRim}>
                  <GenoMirrorBrandCtaFill style={styles.ctaGradient}>
                    <Text style={styles.ctaText}>Continue</Text>
                    <GenoMirrorMetallicIcon name="arrow-forward" size={20} tone="chrome" />
                  </GenoMirrorBrandCtaFill>
                </GenoMirrorRimFrame>
              </Pressable>

              <Pressable
                style={({ pressed }) => [pressed && styles.skipBtnPressed]}
                onPress={onContinue}
              >
                <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.pill} style={styles.skipRim}>
                  <GenoMirrorSteelFill style={styles.skipInner}>
                    <GenoMirrorMetallicIcon name="chatbubble-outline" size={16} tone="gold" />
                    <Text style={styles.skipText}>Send a message</Text>
                  </GenoMirrorSteelFill>
                </GenoMirrorRimFrame>
              </Pressable>
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
    paddingHorizontal: 24,
  },
  ambientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  ambientGlow: {
    flex: 1,
  },
  patternWrap: {
    position: 'absolute',
    top: '12%',
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.7,
  },
  cardOuter: {
    width: '100%',
    maxWidth: 360,
    zIndex: 2,
  },
  cardRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  cardInner: {
    overflow: 'hidden',
  },
  cardFill: {
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 24,
    alignItems: 'center',
  },
  crownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  crownLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  crownKicker: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: 10,
    letterSpacing: 2.8,
    color: LOGO_GOLD,
  },
  rule: {
    width: '100%',
    height: 1,
    borderRadius: 1,
    marginBottom: 14,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 40,
    letterSpacing: -1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  shimmerTrack: {
    width: '100%',
    height: 2,
    overflow: 'hidden',
    marginBottom: 14,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  shimmerBar: {
    width: 120,
    height: 2,
  },
  subtitleMatch: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  subtitleHint: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  nameHighlight: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: LOGO_GOLD,
  },
  avatarStage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    marginBottom: 20,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiDot: {
    position: 'absolute',
  },
  orbitRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDot: {
    position: 'absolute',
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LOGO_GOLD,
  },
  orbitDotAlt: {
    top: undefined,
    bottom: -4,
    backgroundColor: METALLIC_STEEL,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 2,
  },
  avatarSlot: {
    alignItems: 'center',
    gap: 10,
    width: 88,
  },
  youRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 24,
    color: LOGO_GOLD,
  },
  bondCenter: {
    marginTop: -6,
    zIndex: 3,
  },
  bondGlow: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 12,
    color: COLORS.textMuted,
    maxWidth: 88,
    textAlign: 'center',
  },
  compatRim: {
    width: '100%',
    marginBottom: 20,
  },
  compatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14.5,
  },
  compatRing: {
    width: 52,
    height: 52,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatPercent: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: LOGO_GOLD,
  },
  compatCopy: {
    flex: 1,
    gap: 2,
  },
  compatTitle: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.text,
  },
  compatSub: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  ctaRim: {
    width: '100%',
    marginBottom: 12,
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    borderRadius: RADIUS.pill - 1.5,
  },
  ctaText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 17,
    color: COLORS.white,
  },
  skipRim: {
    width: '100%',
  },
  skipBtnPressed: {
    opacity: 0.75,
  },
  skipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.pill - 1.5,
  },
  skipText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: COLORS.text,
  },
});
