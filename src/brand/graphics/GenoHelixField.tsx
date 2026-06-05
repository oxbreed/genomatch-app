import Svg, { Circle, Line, Path } from 'react-native-svg';
import { COLORS } from '../../theme';
import { GENO_VISUAL } from './genoVisualTokens';

type Props = {
  width: number;
  height: number;
  opacity?: number;
};

/**
 * GenoMatch signature helix field — dual strands, base-pair rungs, bond nodes.
 * Richer than GenoSignaturePattern; use for hero / empty / chrome layers.
 */
export default function GenoHelixField({ width, height, opacity = 1 }: Props) {
  const scale = width / 400;
  const nodeYs = [0.34, 0.5, 0.66];
  const nodeXs = [0.18, 0.32, 0.46, 0.6, 0.74, 0.88];

  return (
    <Svg width={width} height={height} viewBox="0 0 400 320" opacity={opacity}>
      <Path
        d="M24 160 C64 48, 104 272, 144 160 S224 48, 264 160 S344 272, 384 160"
        stroke={GENO_VISUAL.helix.goldStroke}
        strokeWidth={1.4 * scale}
        fill="none"
        strokeOpacity={0.42}
      />
      <Path
        d="M24 160 C64 272, 104 48, 144 160 S224 272, 264 48 S344 48, 384 160"
        stroke={GENO_VISUAL.helix.forestStroke}
        strokeWidth={1.4 * scale}
        fill="none"
        strokeOpacity={0.3}
      />
      {nodeXs.map((nx, i) =>
        nodeYs.map((ny, j) => {
          const cx = nx * 400;
          const cy = ny * 320;
          const isGold = (i + j) % 2 === 0;
          if (j === 1 && i % 2 === 1) return null;
          return (
            <Line
              key={`${nx}-${ny}`}
              x1={cx - 8}
              y1={cy}
              x2={cx + 8}
              y2={cy}
              stroke={isGold ? COLORS.gold : COLORS.verified}
              strokeWidth={0.8}
              strokeOpacity={0.25}
            />
          );
        })
      )}
      {[80, 144, 208, 272, 336].map((cx, i) => (
        <Circle
          key={cx}
          cx={cx}
          cy={i % 2 === 0 ? 98 : 222}
          r={4}
          fill={i % 2 === 0 ? COLORS.gold : COLORS.verified}
          fillOpacity={0.5}
        />
      ))}
      <Circle cx={200} cy={160} r={6} fill={COLORS.forestDeep} fillOpacity={0.15} />
      <Circle cx={200} cy={160} r={2.5} fill={COLORS.gold} fillOpacity={0.55} />
    </Svg>
  );
}
