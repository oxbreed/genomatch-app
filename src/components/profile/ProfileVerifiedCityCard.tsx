import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenoGlassSurface } from '../../brand/graphics';
import { GENOMATCH_COMPANY } from '../../constants/company';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  city: string;
  canUpdate: boolean;
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
  nextEligibleAt,
  updating = false,
  onUpdate,
}: Props) {
  const nextDate = formatNextEligible(nextEligibleAt);

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
        <Ionicons name="location" size={18} color={COLORS.forest} />
        <Text style={styles.title}>Verified location</Text>
      </View>
      <Text style={styles.body}>
        Your city is locked to protect matches from misleading location changes. You are shown as{' '}
        <Text style={styles.bold}>{city || 'your city'}</Text>.
      </Text>
      {canUpdate ? (
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color={COLORS.forestDeep} />
          ) : (
            <>
              <Ionicons name="locate" size={16} color={COLORS.forestDeep} />
              <Text style={styles.buttonText}>Update my city (GPS)</Text>
            </>
          )}
        </Pressable>
      ) : (
        <Text style={styles.hint}>
          {nextDate
            ? `You can update your city again on ${nextDate}.`
            : 'City updates use GPS and are limited to once every 12 months.'}
        </Text>
      )}
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
    color: COLORS.forestDeep,
  },
  body: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.sage,
  },
  bold: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forestDeep,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: 'rgba(143, 175, 149, 0.35)',
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.forestDeep,
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
