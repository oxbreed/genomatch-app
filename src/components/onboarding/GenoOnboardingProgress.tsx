import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LOGO_GOLD, TYPOGRAPHY, creamAlpha } from '../../theme';

type Props = {
  total: number;
  current: number;
  onSelect: (index: number) => void;
};

/** Step label + dots — static (Expo Go safe) */
export default function GenoOnboardingProgress({ total, current, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.stepLabel}>
        Step {current + 1} of {total}
      </Text>
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
              hitSlop={12}
            >
              <View style={[styles.pill, active ? styles.pillActive : styles.pillIdle]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  stepLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    letterSpacing: 0.6,
    color: creamAlpha(0.5),
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pill: {
    height: 4,
    borderRadius: 2,
  },
  pillIdle: {
    width: 8,
    backgroundColor: creamAlpha(0.18),
  },
  pillActive: {
    width: 24,
    backgroundColor: LOGO_GOLD,
  },
});
