import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GenoGlassIconButton from '../inbox/GenoGlassIconButton';
import { FONT_FAMILY, COLORS } from '../../theme';

type Props = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
};

export default function GenoBackHeader({ title, onBack, right }: Props) {
  return (
    <View style={styles.header}>
      <GenoGlassIconButton onPress={onBack} accessibilityLabel="Go back" size={40}>
        <Ionicons name="chevron-back" size={20} color={COLORS.forestDeep} />
      </GenoGlassIconButton>
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
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 17,
    letterSpacing: -0.3,
    color: COLORS.forestDeep,
    textAlign: 'center',
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  spacer: {
    width: 40,
  },
});
