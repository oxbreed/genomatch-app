import { Image, StyleSheet, View } from 'react-native';
import { GENOMATCH_LOGO_MARK, GENOMATCH_LOGO_MARK_SMALL } from '../brand/logoAssets';

type GenoMatchLogoProps = {
  size?: number;
};

/** Threshold where the 192px export stops holding up and the master is needed. */
const SMALL_MARK_MAX = 64;

/** The GenoMatch mark: red heart crowning a gold heart, one continuous ribbon. */
export default function GenoMatchLogo({ size = 80 }: GenoMatchLogoProps) {
  const source = size <= SMALL_MARK_MAX ? GENOMATCH_LOGO_MARK_SMALL : GENOMATCH_LOGO_MARK;

  return (
    <View style={[styles.stage, { width: size, height: size }]} collapsable={false}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityLabel="GenoMatch"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
