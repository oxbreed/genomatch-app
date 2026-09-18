import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { CREAM, LOGO_GOLD, LOGO_GOLD_BRIGHT, LOGO_GOLD_DEEP } from '../../theme';

type Props = {
  size?: number;
};

/** Metallic gold shield with specular highlight */
export default function GenoOnboardingTrustShield({ size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Trusted">
      <Defs>
        <LinearGradient id="shieldGold" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={LOGO_GOLD_BRIGHT} />
          <Stop offset="0.45" stopColor={LOGO_GOLD} />
          <Stop offset="1" stopColor={LOGO_GOLD_DEEP} />
        </LinearGradient>
        <LinearGradient id="shieldSpec" x1="6" y1="4" x2="16" y2="14" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="rgba(255,255,255,0.55)" />
          <Stop offset="1" stopColor="rgba(255,255,255,0)" />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 2.2 4.8 5.8v5.6c0 4.7 3.05 9.1 7.2 10.2 4.15-1.1 7.2-5.5 7.2-10.2V5.8L12 2.2z"
        fill="url(#shieldGold)"
      />
      <Path
        d="M12 2.2 4.8 5.8v5.6c0 4.7 3.05 9.1 7.2 10.2 4.15-1.1 7.2-5.5 7.2-10.2V5.8L12 2.2z"
        fill="url(#shieldSpec)"
        opacity={0.35}
      />
      <Path
        d="M10.2 12.1 8.9 10.8 7.6 12.1l2.6 2.6 6.2-6.2-1.3-1.3-4.9 4.9z"
        fill={CREAM}
      />
    </Svg>
  );
}
