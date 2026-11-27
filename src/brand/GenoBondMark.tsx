import { Image } from 'react-native';
import { GENOMATCH_LOGO_MARK_SMALL } from './logoAssets';

type Props = {
  size?: number;
  opacity?: number;
};

/** The bond mark used as a corner lockup and watermark. */
export function GenoBondMark({ size = 48, opacity = 1 }: Props) {
  return (
    <Image
      source={GENOMATCH_LOGO_MARK_SMALL}
      style={{ width: size, height: size, opacity }}
      resizeMode="contain"
      accessibilityLabel="GenoMatch"
      accessibilityIgnoresInvertColors
    />
  );
}
