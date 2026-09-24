import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { RIBBON_POSTER } from '../../brand/ribbonPoster';

type Props = {
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Ribbon mark — crisp transparent PNG.
 *
 * The animated WebP variant was removed from the bundle. Metro resolves
 * `require()` statically wherever it appears, so even a lazy require inside
 * this component shipped all 4.5MB of assets/onboarding-ribbon-logo.webp in
 * the app download. Nothing rendered it. If the animation is wanted later,
 * require the file here and re-check `expo export` output for the size cost.
 */
export default function GenoRibbonLogoAnimated({ width, height, style }: Props) {
  const w = Math.round(width);
  const h = Math.round(height);
  const media = { width: w, height: h };

  return (
    <View
      style={[styles.stage, media, style]}
      collapsable={false}
      accessibilityLabel="GenoMatch logo"
      accessibilityRole="image"
    >
      <Image
        source={RIBBON_POSTER}
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
