import { StyleSheet, Text, View } from 'react-native';

const BADGE_BG = '#EDF3EE';
const BADGE_TEXT = '#0D2818';
const BADGE_BORDER = 'rgba(13, 40, 24, 0.12)';

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
