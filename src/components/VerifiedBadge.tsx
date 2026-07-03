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

/** Trust signal — genotype self-verified member */
export default function VerifiedBadge({ compact, label = 'Verified' }: Props) {
  if (compact) {
    return (
      <GenoMirrorRimFrame kind="gold" borderRadius={9} padding={1}>
        <GenoMirrorSteelFill style={styles.compact}>
          <GenoMirrorMetallicIcon name="shield-checkmark" size={11} tone="chrome" />
        </GenoMirrorSteelFill>
      </GenoMirrorRimFrame>
    );
  }

  return (
    <GenoMirrorRimFrame kind="gold" borderRadius={999} padding={1}>
      <GenoMirrorGoldFill style={styles.badge}>
        <GenoMirrorMetallicIcon name="shield-checkmark" size={12} tone="chrome" />
        <Text style={styles.text}>{label}</Text>
      </GenoMirrorGoldFill>
    </GenoMirrorRimFrame>
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
