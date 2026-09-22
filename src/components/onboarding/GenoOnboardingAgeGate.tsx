import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, LOGO_GOLD, LOGO_RED, TYPOGRAPHY, creamAlpha } from '../../theme';

type Props = {
  confirmed: boolean;
  onToggle: () => void;
  showHelper?: boolean;
};

export default function GenoOnboardingAgeGate({ confirmed, onToggle, showHelper }: Props) {
  const onPress = () => {
    void Haptics.selectionAsync();
    onToggle();
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={[styles.row, confirmed && styles.rowOn]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: confirmed }}
      >
        <View style={[styles.box, confirmed && styles.boxOn]}>
          {confirmed ? <Ionicons name="checkmark" size={11} color={LOGO_GOLD} /> : null}
        </View>
        <Text style={styles.label}>I confirm I am 18 or older</Text>
      </Pressable>
      {showHelper && !confirmed ? (
        <Text style={styles.helper}>Please confirm to continue.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: creamAlpha(0.12),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  rowOn: {
    borderColor: 'rgba(201, 154, 75, 0.35)',
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: creamAlpha(0.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    borderColor: LOGO_GOLD,
    backgroundColor: 'rgba(198, 34, 34, 0.2)',
  },
  label: {
    ...TYPOGRAPHY.bodyStrong,
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  helper: {
    ...TYPOGRAPHY.helper,
    textAlign: 'center',
    color: LOGO_RED,
    fontSize: 12,
  },
});
