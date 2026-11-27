import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenoGlassSurface } from '../../brand/graphics';
import { GENOMATCH_COMPANY } from '../../constants/company';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  city: string;
  canUpdate: boolean;
  reason?: 'not_signed_in' | 'not_found' | 'not_verified' | 'cooldown';
  nextEligibleAt?: string | null;
  updating?: boolean;
  onUpdate: () => void;
};

function formatNextEligible(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProfileVerifiedCityCard({
  city,
  canUpdate,
  reason,
  nextEligibleAt,
  updating = false,
  onUpdate,
}: Props) {
  const nextDate = formatNextEligible(nextEligibleAt);

  // The button stays on screen when an update is not allowed, because a card
  // that silently drops its only control reads as broken. Tapping explains why.
  const blockedHint =
    reason === 'cooldown'
      ? nextDate
        ? `You changed your city in the last 12 months. Next update available ${nextDate}.`
        : 'You changed your city in the last 12 months.'
      : reason === 'not_verified'
        ? 'GPS city updates open up once your genotype is verified.'
        : 'City updates use GPS and are limited to once every 12 months.';

  return (
    <GenoGlassSurface
      variant="light"
      borderRadius={RADIUS.lg}
      shadow="glass"
      showTopRule
      style={styles.wrap}
      contentStyle={styles.inner}
    >
      <View style={styles.header}>
        <Ionicons name="location" size={18} color={COLORS.hero} />
        <Text style={styles.title}>Verified location</Text>
      </View>
      <Text style={styles.body}>
        Your city is locked to protect matches from misleading location changes. You are shown as{' '}
        <Text style={styles.bold}>{city || 'your city'}</Text>.
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canUpdate && styles.buttonLocked,
          pressed && styles.buttonPressed,
        ]}
        onPress={onUpdate}
        disabled={updating}
        accessibilityRole="button"
        accessibilityLabel="Update my city using GPS"
        accessibilityState={{ disabled: !canUpdate, busy: updating }}
      >
        {updating ? (
          <ActivityIndicator color={COLORS.ink} />
        ) : (
          <>
            <Ionicons name={canUpdate ? 'locate' : 'lock-closed'} size={16} color={COLORS.ink} />
            <Text style={styles.buttonText}>Update my city (GPS)</Text>
          </>
        )}
      </Pressable>
      {!canUpdate ? <Text style={styles.hint}>{blockedHint}</Text> : null}
      <Text style={styles.support}>
        Moved recently and location is off? Contact {GENOMATCH_COMPANY.contactEmail} for help.
      </Text>
    </GenoGlassSurface>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  inner: {
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  body: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.label,
  },
  bold: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.ink,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gold,
    borderWidth: 1,
    borderColor: 'rgba(150, 101, 31, 0.45)',
  },
  buttonLocked: {
    backgroundColor: 'rgba(201, 154, 75, 0.28)',
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  hint: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSubtle,
  },
  support: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSubtle,
  },
});
