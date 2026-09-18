import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  GENOMATCH_RIBBON_ANIMATED,
  GENOMATCH_RIBBON_POSTER,
} from '../../brand/ribbonLogo';

type Props = {
  width: number;
  height: number;
  /** static = PNG only (splash / Expo Go). animated = GIF loop */
  variant?: 'static' | 'animated';
  style?: StyleProp<ViewStyle>;
};

/**
 * Onboarding ribbon mark.
 * Splash uses `static` poster — animated GIF + onboarding MaskedViews OOM Expo Go.
 */
export default function GenoRibbonLogoAnimated({
  width,
  height,
  variant = 'animated',
  style,
}: Props) {
  const w = Math.round(width);
  const h = Math.round(height);
  const media = { width: w, height: h };
  const source = variant === 'static' ? GENOMATCH_RIBBON_POSTER : GENOMATCH_RIBBON_ANIMATED;

  return (
    <View
      style={[styles.stage, media, style]}
      collapsable={false}
      accessibilityLabel="GenoMatch logo"
      accessibilityRole="image"
    >
      <Image
        source={source}
        style={media}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    overflow: 'visible',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
