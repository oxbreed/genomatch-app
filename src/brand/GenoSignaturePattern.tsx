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
        stroke={COLORS.hero}
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

export { GenoBondMark } from './GenoBondMark';


