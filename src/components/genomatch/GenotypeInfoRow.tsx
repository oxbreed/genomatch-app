import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_FAMILY, COLORS } from '../../theme';
import type { Genotype } from '../../types/database';

type Props = {
  viewerGenotype: Genotype | null;
  candidateGenotype: Genotype;
  onLearnMore?: () => void;
};

/**
 * Shows the two self-reported genotype letters. No health interpretation.
 */
export default function GenotypeInfoRow({
  viewerGenotype,
  candidateGenotype,
  onLearnMore,
}: Props) {
  const pairing = `${viewerGenotype ?? '—'} × ${candidateGenotype}`;

  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.label}>Genotype</Text>
        <Text style={styles.pairing}>{pairing}</Text>
        <Text style={styles.note}>Self-reported. Not a health result.</Text>
      </View>
      {onLearnMore ? (
        <Pressable
          onPress={onLearnMore}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="More about this genotype"
          style={styles.linkWrap}
        >
          <Ionicons name="information-circle-outline" size={15} color={COLORS.textMuted} />
          <Text style={styles.link}>Details</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  textCol: {
    flexShrink: 1,
  },
  label: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
  pairing: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    color: COLORS.text,
    marginTop: 1,
  },
  note: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.text,
    marginTop: 4,
  },
  linkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  link: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});
