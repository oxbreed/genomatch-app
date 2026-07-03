import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import {
  GenoCardFrame,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../brand/graphics';
import { getFamilyPlanningInsight, type FamilyPlanningTier } from '../lib/compatibility';
import {
  COLORS,
  CREAM,
  FONT_FAMILY,
  LOGO_GOLD,
  LOGO_RED,
  TYPOGRAPHY,
  creamAlpha,
  goldAlpha,
  redAlpha,
} from '../theme';
import type { Genotype } from '../types/database';

type Props = {
  viewerGenotype: Genotype | null;
  candidateGenotype: Genotype;
  compact?: boolean;
  dark?: boolean;
  locked?: boolean;
  mirror?: boolean;
};

type IonName = ComponentProps<typeof Ionicons>['name'];

function MirrorIconRing({ name, tone = 'gold' }: { name: IonName; tone?: 'gold' | 'steel' | 'chrome' }) {
  return (
    <GenoMirrorRimFrame kind="gold" borderRadius={22} padding={1.5}>
      <GenoMirrorSteelFill style={styles.mirrorIconRing}>
        <GenoMirrorMetallicIcon name={name} size={18} tone={tone} />
      </GenoMirrorSteelFill>
    </GenoMirrorRimFrame>
  );
}

function MirrorShell({ children }: { children: ReactNode }) {
  return (
    <GenoCardFrame mirror showWatermark={false} style={styles.mirrorFrame}>
      <View style={styles.mirrorInner}>{children}</View>
    </GenoCardFrame>
  );
}

const TIER_META: Record<
  FamilyPlanningTier,
  { accent: string; border: string; fill: string; badge: string }
> = {
  favourable: {
    accent: LOGO_GOLD,
    border: goldAlpha(0.42),
    fill: goldAlpha(0.1),
    badge: 'Favourable',
  },
  low_risk: {
    accent: '#7CB87E',
    border: 'rgba(124, 184, 126, 0.35)',
    fill: 'rgba(124, 184, 126, 0.1)',
    badge: 'Low risk',
  },
  awareness: {
    accent: LOGO_GOLD,
    border: goldAlpha(0.38),
    fill: goldAlpha(0.08),
    badge: 'Talk to a clinician',
  },
  counselling: {
    accent: LOGO_RED,
    border: redAlpha(0.4),
    fill: redAlpha(0.12),
    badge: 'Counselling advised',
  },
};

function InfoRow({
  label,
  value,
  valueAccent,
  mirror,
}: {
  label: string;
  value: string;
  valueAccent?: string;
  mirror?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, mirror && styles.mirrorKicker]}>{label}</Text>
      <Text style={[styles.infoValue, mirror && styles.mirrorInfoValue, valueAccent ? { color: valueAccent } : null]}>
        {value}
      </Text>
    </View>
  );
}

export default function FamilyPlanningCard({
  viewerGenotype,
  candidateGenotype,
  compact,
  dark = true,
  locked = false,
  mirror = false,
}: Props) {
  const textPrimary = dark ? CREAM : COLORS.text;
  const textSecondary = dark ? creamAlpha(0.72) : COLORS.textMuted;
  const lockedBorder = goldAlpha(0.38);
  const lockedFill = 'rgba(255, 255, 255, 0.06)';

  if (locked) {
    if (compact) {
      return (
        <View style={[styles.compact, { backgroundColor: lockedFill, borderColor: lockedBorder }]}>
          <Ionicons name="lock-closed-outline" size={14} color={LOGO_GOLD} />
          <Text style={[styles.compactTitle, { color: textPrimary }]} numberOfLines={1}>
            Family planning — unlocks after you match
          </Text>
        </View>
      );
    }

    const lockedBody = (
      <>
        <View style={styles.header}>
          {mirror ? (
            <MirrorIconRing name="lock-closed" tone="chrome" />
          ) : (
            <View style={[styles.iconRing, { borderColor: goldAlpha(0.45), backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <Ionicons name="lock-closed" size={18} color={LOGO_GOLD} />
            </View>
          )}
          <View style={styles.headerCopy}>
            <Text style={[styles.kicker, mirror && styles.mirrorKicker]}>Family planning notes</Text>
            <Text style={[styles.title, { color: textPrimary }]}>Unlocks when you both match</Text>
          </View>
        </View>

        <Text style={[styles.body, { color: textSecondary }]}>
          These notes are based on your genotype pairing. They stay private until you and this person like each
          other — so guidance is only shared when there is mutual interest.
        </Text>

        <View style={styles.bulletBlock}>
          <Text style={[styles.bulletHeading, mirror && { color: COLORS.text }]}>When unlocked, you will see:</Text>
          <Text style={[styles.bullet, { color: textSecondary }]}>• Your combined genotype (e.g. AS × AA)</Text>
          <Text style={[styles.bullet, { color: textSecondary }]}>• Plain-language risk for children</Text>
          <Text style={[styles.bullet, { color: textSecondary }]}>• Recommended next steps</Text>
        </View>
      </>
    );

    if (mirror) {
      return <MirrorShell>{lockedBody}</MirrorShell>;
    }

    return (
      <View style={[styles.card, styles.lockedCard, { borderColor: lockedBorder, backgroundColor: lockedFill }]}>
        <LinearGradient
          colors={['rgba(212,175,55,0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {lockedBody}
      </View>
    );
  }

  const insight = getFamilyPlanningInsight(viewerGenotype, candidateGenotype);
  const tier = TIER_META[insight.tier];

  if (compact) {
    return (
      <View style={[styles.compact, { backgroundColor: tier.fill, borderColor: tier.border }]}>
        <Ionicons name={insight.icon} size={14} color={tier.accent} />
        <Text style={[styles.compactTitle, { color: textPrimary }]} numberOfLines={2}>
          {insight.riskLabel}
        </Text>
      </View>
    );
  }

  const unlockedBody = (
    <>
      <View style={styles.header}>
        {mirror ? (
          <MirrorIconRing name={insight.icon} tone="gold" />
        ) : (
          <View style={[styles.iconRing, { borderColor: tier.border, backgroundColor: 'rgba(255,255,255,0.06)' }]}>
            <Ionicons name={insight.icon} size={18} color={tier.accent} />
          </View>
        )}
        <View style={styles.headerCopy}>
          <Text style={[styles.kicker, mirror && styles.mirrorKicker]}>Family planning notes</Text>
          <Text style={[styles.title, { color: textPrimary }]}>{insight.title}</Text>
        </View>
        {mirror ? (
          <GenoMirrorRimFrame kind="steel" borderRadius={999}>
            <GenoMirrorSteelFill style={styles.mirrorTierBadge}>
              <Text style={[styles.tierBadgeText, { color: tier.accent }]}>{tier.badge}</Text>
            </GenoMirrorSteelFill>
          </GenoMirrorRimFrame>
        ) : (
          <View style={[styles.tierBadge, { borderColor: tier.border, backgroundColor: 'rgba(0,0,0,0.25)' }]}>
            <Text style={[styles.tierBadgeText, { color: tier.accent }]}>{tier.badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoBlock}>
        <InfoRow label="Genotype pairing" value={insight.pairLabel} mirror={mirror} />
        <InfoRow label="Risk for children" value={insight.riskLabel} valueAccent={tier.accent} mirror={mirror} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, mirror && styles.mirrorKicker]}>What this means</Text>
        <Text style={[styles.body, { color: textPrimary }]}>{insight.summary}</Text>
        <Text style={[styles.bodyMuted, { color: textSecondary }]}>{insight.detail}</Text>
      </View>

      {mirror ? (
        <GenoMirrorRimFrame kind="steel" borderRadius={14}>
          <GenoMirrorSteelFill style={styles.mirrorNextStep}>
            <Text style={[styles.sectionLabel, styles.mirrorKicker]}>Recommended next step</Text>
            <Text style={[styles.nextStep, { color: textPrimary }]}>{insight.nextStep}</Text>
          </GenoMirrorSteelFill>
        </GenoMirrorRimFrame>
      ) : (
        <View style={[styles.nextStepBox, { borderColor: tier.border }]}>
          <Text style={styles.sectionLabel}>Recommended next step</Text>
          <Text style={[styles.nextStep, { color: textPrimary }]}>{insight.nextStep}</Text>
        </View>
      )}

      <Text style={styles.disclaimer}>
        Educational information only — not medical advice. Always confirm with a qualified healthcare provider.
      </Text>
    </>
  );

  if (mirror) {
    return <MirrorShell>{unlockedBody}</MirrorShell>;
  }

  return (
    <View style={[styles.card, { backgroundColor: tier.fill, borderColor: tier.border }]}>
      {unlockedBody}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  lockedCard: {
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  kicker: {
    ...TYPOGRAPHY.sectionLabelGold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  title: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tierBadgeText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  infoBlock: {
    gap: 10,
    paddingTop: 2,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    ...TYPOGRAPHY.sectionLabelGold,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 15,
    lineHeight: 22,
    color: CREAM,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    ...TYPOGRAPHY.sectionLabelGold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  body: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 23,
  },
  bodyMuted: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 21,
  },
  nextStepBox: {
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  nextStep: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 14,
    lineHeight: 21,
  },
  disclaimer: {
    ...TYPOGRAPHY.disclaimer,
    marginTop: 2,
  },
  bulletBlock: {
    gap: 6,
    marginTop: 2,
  },
  bulletHeading: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 13,
    color: creamAlpha(0.85),
  },
  bullet: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 2,
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
    color: CREAM,
  },
  mirrorFrame: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  mirrorInner: {
    padding: 18,
    gap: 14,
  },
  mirrorIconRing: {
    width: 44,
    height: 44,
    borderRadius: 20.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mirrorKicker: {
    color: LOGO_GOLD,
    fontFamily: FONT_FAMILY.marketingExtrabold,
  },
  mirrorInfoValue: {
    color: COLORS.text,
  },
  mirrorTierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  mirrorNextStep: {
    gap: 8,
    padding: 14,
    borderRadius: 12.5,
  },
});
