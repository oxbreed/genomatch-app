import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../theme';

const BADGE_BG = COLORS.mint;
const BADGE_TEXT = COLORS.forestDeep;
const BADGE_BORDER = 'rgba(22, 53, 34, 0.12)';

export default function GenotypeBadge({ genotype }: { genotype: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{genotype}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: BADGE_BG,
    borderColor: BADGE_BORDER,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: BADGE_TEXT,
  },
});
