import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { COLORS } from '../theme';

type GenoMatchLogoProps = {
  size?: number;
};

/** Vertical infinity of two hearts — glossy red crown, metallic gold base. */
const TOP =
  'M 50 50 C 50 50, 27 39, 20 26 C 14 12, 28 6, 38 9 C 46 12, 50 24, 50 32 C 50 24, 54 12, 62 9 C 72 6, 86 12, 80 26 C 73 39, 50 50, 50 50';
const BOTTOM =
  'M 50 50 C 50 50, 27 61, 20 74 C 14 88, 28 94, 38 91 C 46 88, 50 76, 50 68 C 50 76, 54 88, 62 91 C 72 94, 86 88, 80 74 C 73 61, 50 50, 50 50';

export default function GenoMatchLogo({ size = 80 }: GenoMatchLogoProps) {
  const gid = `gm-${Math.round(size)}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id={`${gid}-red`} x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor={COLORS.glossyRedHot} />
          <Stop offset="45%" stopColor={COLORS.glossyRed} />
          <Stop offset="100%" stopColor={COLORS.glossyRedDeep} />
        </LinearGradient>
        <LinearGradient id={`${gid}-gold`} x1="30%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%" stopColor={COLORS.goldBright} />
          <Stop offset="55%" stopColor={COLORS.gold} />
          <Stop offset="100%" stopColor={COLORS.goldDeep} />
        </LinearGradient>
        <LinearGradient id={`${gid}-sheen`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.7} />
          <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <Circle cx={50} cy={32} r={22} fill={COLORS.glossyRed} opacity={0.18} />
      <Circle cx={50} cy={70} r={20} fill={COLORS.gold} opacity={0.14} />

      <Path
        d={TOP}
        stroke={`url(#${gid}-red)`}
        strokeWidth={13}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d={BOTTOM}
        stroke={`url(#${gid}-gold)`}
        strokeWidth={13}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d={TOP}
        stroke={`url(#${gid}-sheen)`}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        opacity={0.55}
      />
      <Path
        d={BOTTOM}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        opacity={0.4}
      />

      <Circle cx={50} cy={50} r={7} fill={COLORS.ink} />
      <Circle cx={50} cy={50} r={4.2} fill={COLORS.goldBright} />
    </Svg>
  );
}
