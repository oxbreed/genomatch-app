import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

type Props = {
  compact?: boolean;
  label?: string;
};

/** Trust signal — genotype self-verified member */
export default function VerifiedBadge({ compact, label = 'Verified' }: Props) {
  if (compact) {
    return (
      <View style={styles.compact}>
        <Ionicons name="shield-checkmark" size={11} color={COLORS.forestDeep} />
      </View>
    );
  }

  return (
    <View style={styles.badge}>
      <Ionicons name="shield-checkmark" size={12} color={COLORS.forestDeep} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(61, 122, 82, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.25)',
  },
  text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 0.3,
    color: COLORS.forestDeep,
  },
  compact: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(61, 122, 82, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.2)',
  },
});
