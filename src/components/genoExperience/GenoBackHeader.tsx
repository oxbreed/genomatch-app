import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';

type Props = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
};

export default function GenoBackHeader({ title, onBack, right }: Props) {
  return (
    <View style={styles.header}>
      <Pressable
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={20} color={COLORS.forest} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right ?? <View style={styles.spacer} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(237, 243, 238, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.3)',
  },
  backText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forest,
  },
  title: {
    flex: 1,
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 17,
    letterSpacing: -0.3,
    color: COLORS.forestDeep,
    textAlign: 'center',
  },
  right: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  spacer: {
    width: 44,
  },
  pressed: {
    opacity: 0.88,
  },
});
