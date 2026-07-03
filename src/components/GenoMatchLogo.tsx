import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { resolveLogoSource, type GenoLogoSurface } from '../brand/logoAssets';
import GenoMatchLogoVector from './GenoMatchLogoVector';

export type GenoMatchLogoRender = 'photo' | 'vector';

type GenoMatchLogoProps = {
  size?: number;
  /** photo = 3D raster (onboarding hero); vector = transparent mark (default) */
  render?: GenoMatchLogoRender;
  /** photo = 3D raster (onboarding hero); vector = transparent mark (default) */
  surface?: GenoLogoSurface;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export default function GenoMatchLogo({
  size = 80,
  render = 'vector',
  surface = 'light',
  style,
  accessibilityLabel = 'GenoMatch',
}: GenoMatchLogoProps) {
  if (render === 'vector') {
    return (
      <View
        style={[styles.wrap, { width: size, height: size }, style]}
        accessibilityLabel={accessibilityLabel}
      >
        <GenoMatchLogoVector size={size} />
      </View>
    );
  }

  const source = resolveLogoSource(surface);

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
