import Svg, { Circle, Path } from 'react-native-svg';
import { BRAND_BLACK, LOGO_GOLD, LOGO_RED } from '../theme/colors';

type Props = {
  size?: number;
};

/** Vector infinity mark — logo red above, logo gold below */
export default function GenoMatchLogoVector({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M 50 50 C 50 50, 31.67 41.67, 26.67 31.67 C 21.67 21.67, 26.67 15, 35 15 C 43.33 15, 50 25, 50 31.67"
        stroke={LOGO_RED}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 50 31.67 C 50 25, 56.67 15, 65 15 C 73.33 15, 78.33 21.67, 73.33 31.67 C 68.33 41.67, 50 50, 50 50"
        stroke={LOGO_RED}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 50 50 C 50 50, 31.67 58.33, 26.67 68.33 C 21.67 78.33, 26.67 85, 35 85 C 43.33 85, 50 75, 50 68.33"
        stroke={LOGO_GOLD}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 50 68.33 C 50 75, 56.67 85, 65 85 C 73.33 85, 78.33 78.33, 73.33 68.33 C 68.33 58.33, 50 50, 50 50"
        stroke={LOGO_GOLD}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={50} cy={50} r={11} fill="none" stroke={LOGO_GOLD} strokeWidth={0.8} opacity={0.45} />
      <Circle cx={50} cy={50} r={7} fill={BRAND_BLACK} stroke={LOGO_GOLD} strokeWidth={1.5} />
      <Circle cx={50} cy={50} r={3} fill={LOGO_RED} />
    </Svg>
  );
}
