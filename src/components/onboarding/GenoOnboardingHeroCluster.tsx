import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import GenoRibbonLogoAnimated from './GenoRibbonLogoAnimated';
import {
  ONBOARDING_CONTENT_WIDTH,
  ONBOARDING_LOGO_HEIGHT,
  ONBOARDING_LOGO_WIDTH,
} from './onboardingLayout';

type Props = {
  scale?: Animated.Value;
  style?: StyleProp<ViewStyle>;
};

/** Ribbon hero — transparent animated mark */
export default function GenoOnboardingHeroCluster({ scale, style }: Props) {
  const inner = (
    <GenoRibbonLogoAnimated
      width={ONBOARDING_LOGO_WIDTH}
      height={ONBOARDING_LOGO_HEIGHT}
    />
  );

  return (
    <View style={[styles.cluster, { width: ONBOARDING_CONTENT_WIDTH }, style]}>
      {scale ? (
        <Animated.View style={{ transform: [{ scale }] }}>{inner}</Animated.View>
      ) : (
        inner
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cluster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
