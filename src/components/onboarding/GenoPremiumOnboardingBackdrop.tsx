import { StyleSheet, View } from 'react-native';
import { BRAND_BLACK } from '../../theme';

/** Solid canvas — gradients removed for Expo Go memory stability */
export default function GenoPremiumOnboardingBackdrop() {
  return <View style={styles.wrap} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BRAND_BLACK,
  },
});
