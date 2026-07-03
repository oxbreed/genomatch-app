import { Pressable, StyleSheet, View } from 'react-native';
import { LOGO_GOLD, creamAlpha } from '../../theme';

type Props = {
  total: number;
  current: number;
  onSelect: (index: number) => void;
};

/** Step progress — index-driven (stable, no scroll coupling) */
export default function GenoOnboardingProgress({ total, current, onSelect }: Props) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {Array.from({ length: total }, (_, index) => {
        const active = index === current;
        return (
          <Pressable
            key={index}
            onPress={() => onSelect(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Step ${index + 1} of ${total}`}
            hitSlop={8}
            style={[styles.pill, active ? styles.pillActive : styles.pillIdle]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 10,
  },
  pill: {
    height: 8,
    borderRadius: 4,
  },
  pillIdle: {
    width: 8,
    backgroundColor: creamAlpha(0.2),
  },
  pillActive: {
    width: 34,
    backgroundColor: LOGO_GOLD,
  },
});
