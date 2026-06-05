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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GenoBondMark, GenoSignaturePattern } from '../../brand';
import ProfileAvatar from '../ProfileAvatar';
import { COLORS } from '../../theme';
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
        color: i % 3 === 0 ? COLORS.gold : i % 3 === 1 ? COLORS.sage : COLORS.linen,
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
          colors={['#061810', 'rgba(13, 40, 24, 0.96)', '#0D2818']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.ambientTop} pointerEvents="none">
          <LinearGradient
            colors={['rgba(212, 168, 67, 0.22)', 'transparent']}
            style={styles.ambientGlow}
          />
        </View>

        <View style={styles.patternWrap} pointerEvents="none">
          <GenoSignaturePattern width={SCREEN_WIDTH} height={220} opacity={0.28} />
        </View>

        <View style={styles.patternWrapBottom} pointerEvents="none">
          <GenoSignaturePattern width={SCREEN_WIDTH * 0.85} height={160} opacity={0.18} />
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
          <LinearGradient
            colors={['rgba(212, 168, 67, 0.65)', 'rgba(61, 122, 82, 0.4)', 'rgba(212, 168, 67, 0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <View style={styles.cardInner}>
              <LinearGradient
                colors={['#1F4A32', '#153D28', '#0D2818']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardPattern} pointerEvents="none">
                  <GenoSignaturePattern width={300} height={140} opacity={0.22} />
                </View>

                <View style={styles.crownRow}>
                  <View style={styles.crownLine} />
                  <Ionicons name="heart" size={14} color={COLORS.gold} />
                  <Text style={styles.crownKicker}>MUTUAL MATCH</Text>
                  <Ionicons name="heart" size={14} color={COLORS.gold} />
                  <View style={styles.crownLine} />
                </View>

                <Animated.View style={{ opacity: titleShine }}>
                  <Text style={styles.title}>{"It's a Match!"}</Text>
                </Animated.View>

                <View style={styles.shimmerTrack} pointerEvents="none">
                  <Animated.View
                    style={[styles.shimmerBar, { transform: [{ translateX: shimmerX }] }]}
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(212, 168, 67, 0.55)', 'transparent']}
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
                  A mutual like — start a conversation or keep exploring your stack.
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
                      <View style={styles.avatarHalo}>
                        <View style={styles.youRing}>
                          <Ionicons name="person" size={30} color={COLORS.linen} />
                        </View>
                      </View>
                      <Text style={styles.avatarLabel}>You</Text>
                    </Animated.View>

                    <Animated.View style={[styles.bondCenter, { transform: [{ scale: bondPulse }] }]}>
                      <LinearGradient
                        colors={['rgba(212, 168, 67, 0.35)', 'rgba(13, 40, 24, 0.2)']}
                        style={styles.bondGlow}
                      >
                        <GenoBondMark size={56} opacity={1} />
                      </LinearGradient>
                    </Animated.View>

                    <Animated.View
                      style={[styles.avatarSlot, { transform: [{ translateX: rightAvatarX }] }]}
                    >
                      <View style={styles.avatarHalo}>
                        {profile ? (
                          <ProfileAvatar
                            name={profile.name}
                            gradient={profile.gradient}
                            avatarUrl={profile.avatarUrl ?? profile.photos[0]}
                            size={68}
                            noPhotoBackground={COLORS.forestDeep}
                            noPhotoInitialColor={COLORS.linen}
                          />
                        ) : (
                          <View style={styles.youRing}>
                            <Text style={styles.initials}>{firstName.slice(0, 2).toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.avatarLabel} numberOfLines={1}>
                        {firstName}
                      </Text>
                    </Animated.View>
                  </View>
                </View>

                {profile ? (
                  <View style={styles.compatRow}>
                    <View style={styles.compatRing}>
                      <Text style={styles.compatPercent}>{profile.compatibility}%</Text>
                    </View>
                    <View style={styles.compatCopy}>
                      <Text style={styles.compatTitle}>Genotype compatibility</Text>
                      <Text style={styles.compatSub}>Aligned for a safer connection</Text>
                    </View>
                  </View>
                ) : null}

                <Pressable
                  style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onContinue();
                  }}
                >
                  <LinearGradient
                    colors={[COLORS.gold, '#E8C56A', '#C49A3A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaGradient}
                  >
                    <Text style={styles.ctaText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.forestDeep} />
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.skipBtn, pressed && styles.skipBtnPressed]}
                  onPress={onContinue}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={COLORS.gold} />
                  <Text style={styles.skipText}>Send a message</Text>
                </Pressable>
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
  patternWrapBottom: {
    position: 'absolute',
    bottom: '8%',
    alignSelf: 'center',
    opacity: 0.5,
  },
  cardOuter: {
    width: '100%',
    maxWidth: 360,
    zIndex: 2,
  },
  cardBorder: {
    borderRadius: 30,
    padding: 2,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 20,
  },
  cardInner: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  cardGradient: {
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 24,
    alignItems: 'center',
  },
  cardPattern: {
    position: 'absolute',
    top: -16,
    right: -28,
  },
  crownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    width: '100%',
  },
  crownLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 168, 67, 0.35)',
  },
  crownKicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 2.8,
    color: COLORS.gold,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 40,
    letterSpacing: -1,
    color: COLORS.linen,
    textAlign: 'center',
    marginBottom: 6,
  },
  shimmerTrack: {
    width: '100%',
    height: 2,
    overflow: 'hidden',
    marginBottom: 14,
    borderRadius: 1,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
  },
  shimmerBar: {
    width: 120,
    height: 2,
  },
  subtitleMatch: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.linen,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  subtitleHint: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(245, 239, 230, 0.62)',
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  nameHighlight: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.gold,
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
    borderColor: 'rgba(212, 168, 67, 0.25)',
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
    backgroundColor: COLORS.gold,
  },
  orbitDotAlt: {
    top: undefined,
    bottom: -4,
    backgroundColor: COLORS.sage,
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
  avatarHalo: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(212, 168, 67, 0.5)',
    backgroundColor: 'rgba(13, 40, 24, 0.6)',
  },
  youRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.forest,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 24,
    color: COLORS.gold,
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
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.4)',
  },
  avatarLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: COLORS.sage,
    maxWidth: 88,
    textAlign: 'center',
  },
  compatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 168, 67, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.28)',
    marginBottom: 20,
  },
  compatRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 40, 24, 0.5)',
  },
  compatPercent: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 15,
    color: COLORS.gold,
  },
  compatCopy: {
    flex: 1,
    gap: 2,
  },
  compatTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: COLORS.linen,
  },
  compatSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: 'rgba(245, 239, 230, 0.6)',
  },
  cta: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
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
  },
  ctaText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 17,
    color: COLORS.forestDeep,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  skipBtnPressed: {
    opacity: 0.75,
  },
  skipText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: 'rgba(245, 239, 230, 0.55)',
  },
});
