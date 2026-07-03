import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { BRAND_BLACK } from '../../theme';

/** Deep charcoal onboarding field — single gradient (Expo Go safe) */
export default function GenoPremiumOnboardingBackdrop() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient
        colors={[BRAND_BLACK, '#101216', BRAND_BLACK]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.base}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND_BLACK,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
  },
});
