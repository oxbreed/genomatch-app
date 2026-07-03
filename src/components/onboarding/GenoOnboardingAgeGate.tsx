import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BRAND_BLACK, COLORS, LOGO_GOLD, TYPOGRAPHY, creamAlpha } from '../../theme';
import GenoOnboardingTrustShield from './GenoOnboardingTrustShield';

type Props = {
  confirmed: boolean;
  onToggle: () => void;
  showHelper?: boolean;
};

/** Age gate — flat panel (no mirror chrome; Expo Go safe) */
export default function GenoOnboardingAgeGate({ confirmed, onToggle, showHelper }: Props) {
  const onPress = () => {
    void Haptics.selectionAsync();
    onToggle();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.panel}>
        <Pressable
          onPress={onPress}
          style={styles.row}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmed }}
        >
          <View style={[styles.box, confirmed && styles.boxOn]}>
            {confirmed ? <Ionicons name="checkmark" size={12} color={LOGO_GOLD} /> : null}
          </View>
          <Text style={styles.label}>I confirm I am 18 or older</Text>
          <GenoOnboardingTrustShield size={20} />
        </Pressable>
      </View>

      {showHelper && !confirmed ? (
        <Text style={styles.helper}>Confirm your age to continue.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 6,
  },
  panel: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: creamAlpha(0.12),
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: creamAlpha(0.35),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_BLACK,
  },
  boxOn: {
    borderColor: LOGO_GOLD,
    backgroundColor: 'rgba(200, 16, 46, 0.35)',
  },
  label: {
    ...TYPOGRAPHY.bodyStrong,
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  helper: {
    ...TYPOGRAPHY.helper,
    textAlign: 'center',
    color: LOGO_GOLD,
    fontSize: 12,
  },
});
