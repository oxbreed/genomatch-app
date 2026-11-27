import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { RIBBON_POSTER } from '../../brand/ribbonPoster';
import {
  ONBOARDING_CONTENT_WIDTH,
  ONBOARDING_SLOT_LOGO_HEIGHT,
  ONBOARDING_SLOT_LOGO_WIDTH,
  ONBOARDING_VISUAL_HEIGHT,
} from './onboardingLayout';

type Props = {
  style?: StyleProp<ViewStyle>;
};

/** Slide-one hero — crisp transparent ribbon */
export default function GenoOnboardingHeroCluster({ style }: Props) {
  return (
    <View style={[styles.slot, style]} accessibilityLabel="GenoMatch logo">
      <Image
        source={RIBBON_POSTER}
        style={{
          width: ONBOARDING_SLOT_LOGO_WIDTH,
          height: ONBOARDING_SLOT_LOGO_HEIGHT,
        }}
        contentFit="contain"
        transition={0}
        cachePolicy="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: ONBOARDING_VISUAL_HEIGHT,
    width: ONBOARDING_CONTENT_WIDTH,
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
