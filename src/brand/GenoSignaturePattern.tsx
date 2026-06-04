import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../theme';

type Props = {
  width: number;
  height: number;
  opacity?: number;
};

/** App-exclusive double-helix + bond nodes — GenoMatch signature motif */
export function GenoSignaturePattern({ width, height, opacity = 1 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 400 320" opacity={opacity}>
      <Path
        d="M40 160 C80 60, 120 260, 160 160 S240 60, 280 160 S360 260, 400 160"
        stroke={COLORS.gold}
        strokeWidth={1.2}
        fill="none"
        strokeOpacity={0.4}
      />
      <Path
        d="M40 160 C80 260, 120 60, 160 160 S240 260, 280 60, 320 160"
        stroke={COLORS.forest}
        strokeWidth={1.2}
        fill="none"
        strokeOpacity={0.28}
      />
      {[72, 136, 200, 264, 328].map((cx, i) => (
        <Circle
          key={cx}
          cx={cx}
          cy={i % 2 === 0 ? 108 : 212}
          r={3.5}
          fill={i % 2 === 0 ? COLORS.gold : COLORS.verified}
          fillOpacity={0.45}
        />
      ))}
    </Svg>
  );
}

/** Corner infinity bond — echoes GenoMatchLogo */
export function GenoBondMark({ size = 48, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" opacity={opacity}>
      <Path
        d="M50 50 C50 50 32 42 27 32 C22 22 27 16 35 16 C43 16 50 26 50 32"
        stroke={COLORS.sage}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M50 32 C50 26 57 16 65 16 C73 16 78 22 73 32 C68 42 50 50 50 50"
        stroke={COLORS.sage}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M50 50 C50 50 32 58 27 68 C22 78 27 84 35 84 C43 84 50 74 50 68"
        stroke={COLORS.gold}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M50 68 C50 74 57 84 65 84 C73 84 78 78 73 68 C68 58 50 50 50 50"
        stroke={COLORS.gold}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={50} cy={50} r={8} fill={COLORS.forestDeep} stroke={COLORS.gold} strokeWidth={1.5} />
      <Circle cx={50} cy={50} r={3} fill={COLORS.gold} />
    </Svg>
  );
}
