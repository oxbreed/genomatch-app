import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GenoMatchLogo from '../GenoMatchLogo';
import { getCompatibilityHeadline } from '../../lib/compatibility';
import { FONT_FAMILY, COLORS } from '../../theme';

type Props = {
  percent: number;
  yourTraits?: string[];
  theirTraits?: string[];
  onViewReport?: () => void;
  ctaLabel?: string;
};

export default function CompatibilityProfileCard({
  percent,
  yourTraits = [],
  theirTraits = [],
  onViewReport,
  ctaLabel = 'View Full Report',
}: Props) {
  const headline = getCompatibilityHeadline(percent);
  const yours = yourTraits.filter(Boolean).slice(0, 2);
  const theirs = theirTraits.filter(Boolean).slice(0, 2);

  return (
    <View style={styles.root}>
      <Text style={styles.wordmark}>GenoMatch</Text>
      <GenoMatchLogo size={72} />
      <Text style={styles.kicker}>Compatibility profile</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.scoreLabel}>Compatibility Score</Text>
        <Text style={styles.headline}>{headline}</Text>
      </View>

      {yours.length > 0 || theirs.length > 0 ? (
        <View style={styles.traitRow}>
          <View style={styles.traitCard}>
            <Text style={styles.traitTitle}>Your Traits</Text>
            {yours.length ? (
              yours.map((t) => (
                <Text key={t} style={styles.traitLine}>
                  {t}
                </Text>
              ))
            ) : (
              <Text style={styles.traitLine}>Your profile</Text>
            )}
          </View>
          <LinearGradient
            colors={[COLORS.glossyRedDeep, COLORS.goldDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.traitCardGradient}
          >
            <Text style={styles.traitTitle}>Their Traits</Text>
            {theirs.length ? (
              theirs.map((t) => (
                <Text key={t} style={styles.traitLine}>
                  {t}
                </Text>
              ))
            ) : (
              <Text style={styles.traitLine}>Their profile</Text>
            )}
          </LinearGradient>
        </View>
      ) : null}

      {onViewReport ? (
        <Pressable
          style={({ pressed }) => [styles.ctaWrap, pressed && styles.pressed]}
          onPress={onViewReport}
        >
          <LinearGradient
            colors={[COLORS.glossyRed, COLORS.goldBright]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.ink,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  wordmark: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: 22,
    color: COLORS.white,
    letterSpacing: -0.4,
  },
  kicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: COLORS.gold,
    marginTop: 2,
  },
  scoreCard: {
    alignSelf: 'stretch',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    backgroundColor: 'rgba(20, 20, 22, 0.92)',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  percent: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: 44,
    lineHeight: 50,
    color: COLORS.gold,
    letterSpacing: -1,
  },
  scoreLabel: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
    color: COLORS.white,
    marginTop: 4,
  },
  headline: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    letterSpacing: 1.1,
    color: COLORS.glossyRed,
    marginTop: 8,
  },
  traitRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
  },
  traitCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    minHeight: 88,
  },
  traitCardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 88,
  },
  traitTitle: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 6,
  },
  traitLine: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 18,
  },
  ctaWrap: {
    alignSelf: 'stretch',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  cta: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  ctaText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    color: COLORS.white,
  },
  pressed: { opacity: 0.9 },
});
