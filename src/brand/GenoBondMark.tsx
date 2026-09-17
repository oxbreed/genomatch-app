import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { COLORS } from '../theme';

const TOP =
  'M50 50 C50 50 32 42 27 32 C22 22 27 16 35 16 C43 16 50 26 50 32';
const TOP_R =
  'M50 32 C50 26 57 16 65 16 C73 16 78 22 73 32 C68 42 50 50 50 50';
const BOTTOM =
  'M50 50 C50 50 32 58 27 68 C22 78 27 84 35 84 C43 84 50 74 50 68';
const BOTTOM_R =
  'M50 68 C50 74 57 84 65 84 C73 84 78 78 73 68 C68 58 50 50 50 50';

/** Corner infinity bond — glossy red crown, gold base */
export function GenoBondMark({ size = 48, opacity = 1 }: { size?: number; opacity?: number }) {
  const gid = `bond-${Math.round(size)}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" opacity={opacity}>
      <Defs>
        <LinearGradient id={`${gid}-red`} x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor={COLORS.glossyRedHot} />
          <Stop offset="100%" stopColor={COLORS.glossyRedDeep} />
        </LinearGradient>
        <LinearGradient id={`${gid}-gold`} x1="20%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%" stopColor={COLORS.goldBright} />
          <Stop offset="100%" stopColor={COLORS.goldDeep} />
        </LinearGradient>
      </Defs>
      <Path d={TOP} stroke={`url(#${gid}-red)`} strokeWidth={8} fill="none" strokeLinecap="round" />
      <Path d={TOP_R} stroke={`url(#${gid}-red)`} strokeWidth={8} fill="none" strokeLinecap="round" />
      <Path d={BOTTOM} stroke={`url(#${gid}-gold)`} strokeWidth={8} fill="none" strokeLinecap="round" />
      <Path d={BOTTOM_R} stroke={`url(#${gid}-gold)`} strokeWidth={8} fill="none" strokeLinecap="round" />
      <Circle cx={50} cy={50} r={7} fill={COLORS.ink} />
      <Circle cx={50} cy={50} r={3.2} fill={COLORS.goldBright} />
    </Svg>
  );
}
