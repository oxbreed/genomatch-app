import { StyleSheet, Text, View } from 'react-native';
import { LOGO_GOLD, LOGO_RED, TYPOGRAPHY } from '../../theme';

/** Geno + Match wordmark — flat color (Expo Go safe, no MaskedView) */
export default function GenoWordmark() {
  return (
    <View style={styles.row}>
      <Text style={[styles.word, styles.red]}>Geno</Text>
      <Text style={[styles.word, styles.gold]}>Match</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  word: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  red: {
    color: LOGO_RED,
  },
  gold: {
    color: LOGO_GOLD,
  },
});
