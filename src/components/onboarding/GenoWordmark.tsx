import { StyleSheet, Text, View } from 'react-native';
import GenoMatchLogoVector from '../GenoMatchLogoVector';
import { LOGO_GOLD, LOGO_RED, TYPOGRAPHY } from '../../theme';

/** Header lockup — vector mark + wordmark (no raster / ribbonLogo imports) */
export default function GenoWordmark() {
  return (
    <View style={styles.row}>
      <GenoMatchLogoVector size={22} />
      <Text style={styles.word}>
        <Text style={styles.red}>Geno</Text>
        <Text style={styles.gold}>Match</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  word: {
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  red: {
    color: LOGO_RED,
  },
  gold: {
    color: LOGO_GOLD,
  },
});
