import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import GenoMetallicText from './GenoMetallicText';
import { TYPOGRAPHY } from '../../theme';

type Props = {
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

/** Playfair serif taglines — metallic gold + red pairing */
export default function GenoOnboardingTagline({ style, compact }: Props) {
  return (
    <View style={[styles.block, style]}>
      <GenoMetallicText
        tone="gold"
        textStyle={[styles.hearts, compact && styles.heartsCompact]}
      >
        Connecting hearts.
      </GenoMetallicText>
      <GenoMetallicText
        tone="red"
        style={styles.genesWrap}
        textStyle={[styles.genes, compact && styles.genesCompact]}
      >
        Aligning genes
      </GenoMetallicText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: '100%',
    alignItems: 'center',
  },
  hearts: {
    ...TYPOGRAPHY.marketingTitle,
    fontSize: 28,
  },
  heartsCompact: {
    fontSize: 24,
    lineHeight: 30,
  },
  genesWrap: {
    marginTop: 4,
  },
  genes: {
    ...TYPOGRAPHY.marketingTitle,
  },
  genesCompact: {
    fontSize: 19,
    lineHeight: 24,
  },
});
