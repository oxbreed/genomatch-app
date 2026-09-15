import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_FAMILY, COLORS } from '../../theme';
import type { Genotype } from '../../types/database';

const GENOTYPE_EDUCATION_URL = 'https://www.cdc.gov/sickle-cell/about/';

type Props = {
  viewerGenotype: Genotype | null;
  candidateGenotype: Genotype;
  onLearnMore?: () => void;
};

/**
 * Plain, informational genotype pairing display.
 *
 * Deliberately NOT promotional: no percentage, no score, no tier language, no
 * gradient/card container. It never shares a container with MatchProfileCard.
 * It shows the raw pairing plus a static link to genotype education.
 */
export default function GenotypeInfoRow({
  viewerGenotype,
  candidateGenotype,
  onLearnMore,
}: Props) {
  const pairing = `${viewerGenotype ?? '—'} × ${candidateGenotype}`;

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
      return;
    }
    void Linking.openURL(GENOTYPE_EDUCATION_URL).catch(() => {
      /* no-op: education link is best-effort */
    });
  };

  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.label}>Genotype</Text>
        <Text style={styles.pairing}>{pairing}</Text>
      </View>
      <Pressable
        onPress={handleLearnMore}
        hitSlop={8}
        accessibilityRole="link"
        accessibilityLabel="Learn about genotypes"
        style={styles.linkWrap}
      >
        <Ionicons name="information-circle-outline" size={15} color={COLORS.textMuted} />
        <Text style={styles.link}>Learn about genotypes</Text>
      </Pressable>
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
