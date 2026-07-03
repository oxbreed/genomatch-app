import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';

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
    backgroundColor: COLORS.blush,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.text,
  },
});
