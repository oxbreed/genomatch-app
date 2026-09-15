import { StyleSheet, Text, View } from 'react-native';
import {
  GenoMirrorGoldFill,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../brand/graphics';
import { FONT_FAMILY, COLORS } from '../theme';

type Props = {
  compact?: boolean;
  label?: string;
};

/**
 * Trust signal for a member who has declared their genotype is accurate.
 *
 * This is a self-declaration, not a lab result and not an identity check, so
 * the label and the accessibility text must both say so. Anything that reads
 * as clinical or identity verification is a claim GenoMatch cannot support.
 */
export default function VerifiedBadge({ compact, label = 'Self-declared' }: Props) {
  const a11yLabel = 'Genotype self-declared by this member. Not a lab test.';

  if (compact) {
    return (
      <View accessible accessibilityRole="image" accessibilityLabel={a11yLabel}>
        <GenoMirrorRimFrame kind="gold" borderRadius={9} padding={1}>
          <GenoMirrorSteelFill style={styles.compact}>
            <GenoMirrorMetallicIcon name="shield-checkmark" size={11} tone="chrome" />
          </GenoMirrorSteelFill>
        </GenoMirrorRimFrame>
      </View>
    );
  }

  return (
    <View accessible accessibilityLabel={a11yLabel}>
      <GenoMirrorRimFrame kind="gold" borderRadius={999} padding={1}>
        <GenoMirrorGoldFill style={styles.badge}>
          <GenoMirrorMetallicIcon name="shield-checkmark" size={12} tone="chrome" />
          <Text style={styles.text}>{label}</Text>
        </GenoMirrorGoldFill>
      </GenoMirrorRimFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  text: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 0.3,
    color: COLORS.text,
  },
  compact: {
    width: 18,
    height: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
