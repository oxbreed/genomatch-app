import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GenoBondMark, GenoSignaturePattern } from '../../brand';
import { FONT_FAMILY, COLORS, RADIUS, SHADOWS } from '../../theme';

type Props = {
  reviewedCount: number;
  onBrowseAgain?: () => void;
  onAdjustFilters?: () => void;
};

export default function DiscoverSeenAllState({
  reviewedCount,
  onBrowseAgain,
  onAdjustFilters,
}: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const markPulse = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(markPulse, {
          toValue: 1.06,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(markPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(ringOpacity, {
          toValue: 0.85,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0.35,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    ring.start();

    return () => {
      pulse.stop();
      ring.stop();
    };
  }, [fade, markPulse, ringOpacity, slide]);

  const countLabel = reviewedCount === 1 ? '1 profile' : `${reviewedCount} profiles`;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: fade,
          transform: [{ translateY: slide }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(212, 168, 67, 0.4)', 'rgba(61, 122, 82, 0.25)', 'rgba(212, 168, 67, 0.35)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBorder}
      >
        <View style={styles.card}>
          <LinearGradient
            colors={[COLORS.white, COLORS.mint, 'rgba(237, 243, 238, 0.95)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.pattern} pointerEvents="none">
              <GenoSignaturePattern width={280} height={120} opacity={0.2} />
            </View>

            <View style={styles.hero}>
              <Animated.View style={[styles.outerRing, { opacity: ringOpacity }]} />
              <Animated.View style={[styles.markWrap, { transform: [{ scale: markPulse }] }]}>
                <LinearGradient
                  colors={['rgba(237, 243, 238, 0.95)', COLORS.white]}
                  style={styles.markCircle}
                >
                  <GenoBondMark size={52} opacity={0.95} />
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color={COLORS.forestDeep} />
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>

            <View style={styles.statusPill}>
              <Ionicons name="checkmark-done" size={14} color={COLORS.forestDeep} />
              <Text style={styles.statusText}>Stack complete</Text>
            </View>

            <Text style={styles.title}>{"You've seen everyone nearby"}</Text>
            <Text style={styles.subtitle}>
              You reviewed {countLabel} in this stack. Fresh genotype-aware profiles arrive as new
              members join — check back tomorrow.
            </Text>

            <View style={styles.tomorrowCard}>
              <View style={styles.tomorrowIcon}>
                <Ionicons name="time-outline" size={20} color={COLORS.gold} />
              </View>
              <View style={styles.tomorrowCopy}>
                <Text style={styles.tomorrowLabel}>Next wave</Text>
                <Text style={styles.tomorrowValue}>Usually within 24 hours</Text>
              </View>
            </View>

            {onBrowseAgain ? (
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onBrowseAgain();
                }}
              >
                <LinearGradient
                  colors={[COLORS.forest, COLORS.forestDeep]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.primaryGradient}
                >
                  <Ionicons name="refresh" size={18} color={COLORS.linen} />
                  <Text style={styles.primaryText}>Browse stack again</Text>
                </LinearGradient>
              </Pressable>
            ) : null}

            {onAdjustFilters ? (
              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onAdjustFilters();
                }}
              >
                <Ionicons name="options-outline" size={18} color={COLORS.forest} />
                <Text style={styles.secondaryText}>Refine filters</Text>
              </Pressable>
            ) : null}
          </LinearGradient>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  cardBorder: {
    borderRadius: RADIUS.xl,
    padding: 2,
    ...SHADOWS.cardElevated,
  },
  card: {
    borderRadius: RADIUS.xl - 2,
    overflow: 'hidden',
  },
  cardGradient: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    alignItems: 'center',
  },
  pattern: {
    position: 'absolute',
    top: -8,
    right: -20,
  },
  hero: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  outerRing: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: 'rgba(212, 168, 67, 0.45)',
  },
  markWrap: {
    zIndex: 2,
  },
  markCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(61, 122, 82, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.2)',
    marginBottom: 14,
  },
  statusText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.forestDeep,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 26,
    letterSpacing: -0.5,
    color: COLORS.forestDeep,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.sage,
    textAlign: 'center',
    marginBottom: 18,
    maxWidth: 300,
  },
  tomorrowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  tomorrowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 168, 67, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tomorrowCopy: {
    flex: 1,
    gap: 2,
  },
  tomorrowLabel: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.sage,
  },
  tomorrowValue: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    color: COLORS.forestDeep,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: 10,
    ...SHADOWS.button,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  primaryText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    color: COLORS.linen,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  secondaryText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    color: COLORS.forest,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
