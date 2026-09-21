import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LOGO_GOLD, LOGO_RED, TYPOGRAPHY } from '../../theme';

type Props = {
  style?: StyleProp<ViewStyle>;
};

/** Brand promise — two-line serif, hero only */
export default function GenoOnboardingTagline({ style }: Props) {
  return (
    <View style={[styles.block, style]}>
      <Text style={styles.line}>Hearts aligned.</Text>
      <Text style={styles.accent}>Genes matched.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: 2,
  },
  line: {
    ...TYPOGRAPHY.serifHeadline,
    fontSize: 24,
    lineHeight: 30,
    color: LOGO_GOLD,
    textAlign: 'center',
  },
  accent: {
    ...TYPOGRAPHY.serifAccent,
    fontSize: 19,
    lineHeight: 24,
    color: LOGO_RED,
    textAlign: 'center',
  },
});
