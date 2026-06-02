import { StyleSheet, Text, View } from 'react-native';
import { GENOTYPE_STYLES } from '../data/mockData';

export default function GenotypeBadge({ genotype }: { genotype: string }) {
  const style = GENOTYPE_STYLES[genotype] ?? GENOTYPE_STYLES.AA;

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.text, { color: style.text }]}>{genotype}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
