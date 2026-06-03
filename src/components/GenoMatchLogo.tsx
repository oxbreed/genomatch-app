import Svg, { Circle, Path } from 'react-native-svg';

const FOREST_DEEP = '#0D2818';
const GOLD = '#D4A843';
const SAGE = '#8FAF95';

type GenoMatchLogoProps = {
  size?: number;
};

/**
 * Infinity mark — top heart points up, bottom heart points down, meeting at (50, 50).
 */
export default function GenoMatchLogo({ size = 80 }: GenoMatchLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Top heart — sage, tip at centre */}
      <Path
        d="M 50 50 C 50 50, 31.67 41.67, 26.67 31.67 C 21.67 21.67, 26.67 15, 35 15 C 43.33 15, 50 25, 50 31.67"
        stroke={SAGE}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 50 31.67 C 50 25, 56.67 15, 65 15 C 73.33 15, 78.33 21.67, 73.33 31.67 C 68.33 41.67, 50 50, 50 50"
        stroke={SAGE}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />

      {/* Bottom heart — gold, tip at centre */}
      <Path
        d="M 50 50 C 50 50, 31.67 58.33, 26.67 68.33 C 21.67 78.33, 26.67 85, 35 85 C 43.33 85, 50 75, 50 68.33"
        stroke={GOLD}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 50 68.33 C 50 75, 56.67 85, 65 85 C 73.33 85, 78.33 78.33, 73.33 68.33 C 68.33 58.33, 50 50, 50 50"
        stroke={GOLD}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />

      {/* Centre meeting point */}
      <Circle
        cx={50}
        cy={50}
        r={11}
        fill="none"
        stroke={GOLD}
        strokeWidth={0.8}
        opacity={0.2}
      />
      <Circle
        cx={50}
        cy={50}
        r={7}
        fill={FOREST_DEEP}
        stroke={GOLD}
        strokeWidth={2}
      />
      <Circle cx={50} cy={50} r={3} fill={GOLD} />
    </Svg>
  );
}
