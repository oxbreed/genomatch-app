import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFamilyPlanningInsight, type FamilyPlanningTier } from '../lib/compatibility';
import { FONT_FAMILY, COLORS } from '../theme';
import type { Genotype } from '../types/database';

type Props = {
  viewerGenotype: Genotype | null;
  candidateGenotype: Genotype;
  compact?: boolean;
  dark?: boolean;
};

const TIER_STYLE: Record<
  FamilyPlanningTier,
  { accent: string; bg: string; border: string; darkBg: string; darkBorder: string }
> = {
  favourable: {
    accent: COLORS.verified,
    bg: 'rgba(61, 122, 82, 0.1)',
    border: 'rgba(61, 122, 82, 0.28)',
    darkBg: 'rgba(61, 122, 82, 0.22)',
    darkBorder: 'rgba(61, 122, 82, 0.4)',
  },
  low_risk: {
    accent: COLORS.forest,
    bg: 'rgba(237, 243, 238, 0.95)',
    border: 'rgba(143, 175, 149, 0.45)',
    darkBg: 'rgba(255, 255, 255, 0.1)',
    darkBorder: 'rgba(255, 255, 255, 0.2)',
  },
  awareness: {
    accent: COLORS.gold,
    bg: 'rgba(212, 168, 67, 0.12)',
    border: 'rgba(212, 168, 67, 0.35)',
    darkBg: 'rgba(212, 168, 67, 0.18)',
    darkBorder: 'rgba(212, 168, 67, 0.45)',
  },
  counseling: {
    accent: '#B86B2E',
    bg: 'rgba(184, 107, 46, 0.1)',
    border: 'rgba(184, 107, 46, 0.3)',
    darkBg: 'rgba(184, 107, 46, 0.2)',
    darkBorder: 'rgba(184, 107, 46, 0.4)',
  },
};

export default function FamilyPlanningCard({
  viewerGenotype,
  candidateGenotype,
  compact,
  dark,
}: Props) {
  const insight = getFamilyPlanningInsight(viewerGenotype, candidateGenotype);
  const tier = TIER_STYLE[insight.tier];
  const textPrimary = dark ? COLORS.linen : COLORS.forestDeep;
  const textSecondary = dark ? 'rgba(245, 239, 230, 0.82)' : COLORS.sage;

  if (compact) {
    return (
      <View
        style={[
          styles.compact,
          {
            backgroundColor: dark ? tier.darkBg : tier.bg,
            borderColor: dark ? tier.darkBorder : tier.border,
          },
        ]}
      >
        <Ionicons name={insight.icon} size={14} color={dark ? COLORS.gold : tier.accent} />
        <Text style={[styles.compactTitle, { color: textPrimary }]} numberOfLines={1}>
          {insight.title}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dark ? tier.darkBg : tier.bg,
          borderColor: dark ? tier.darkBorder : tier.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconRing, { borderColor: tier.border, backgroundColor: dark ? 'rgba(255,255,255,0.08)' : COLORS.white }]}>
          <Ionicons name={insight.icon} size={18} color={tier.accent} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.kicker, { color: dark ? COLORS.gold : COLORS.sage }]}>
            FAMILY PLANNING
          </Text>
          <Text style={[styles.title, { color: textPrimary }]}>{insight.title}</Text>
          <Text style={[styles.pair, { color: textSecondary }]}>{insight.pairLabel}</Text>
        </View>
      </View>

      <Text style={[styles.summary, { color: textPrimary }]}>{insight.summary}</Text>
      <Text style={[styles.detail, { color: textSecondary }]}>{insight.detail}</Text>

      <Text style={[styles.disclaimer, { color: dark ? 'rgba(245,239,230,0.55)' : COLORS.textSubtle }]}>
        Educational guidance only — consult a healthcare provider for personal advice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  pair: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    marginTop: 2,
  },
  summary: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    lineHeight: 20,
  },
  detail: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 13,
    lineHeight: 19,
  },
  disclaimer: {
    fontFamily: FONT_FAMILY.gothamBook,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  compactTitle: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    flexShrink: 1,
  },
});
