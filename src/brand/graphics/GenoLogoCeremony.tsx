import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import GenoMatchLogo from '../../components/GenoMatchLogo';
import { FONT_FAMILY, COLORS } from '../../theme';
import GenoBondHalo from './GenoBondHalo';

export type GenoLogoCeremonySize = 'splash' | 'auth' | 'hero' | 'studio' | 'compact' | 'mark';

const PRESETS: Record<
  GenoLogoCeremonySize,
  { logo: number; halo: number; haloOpacity: number; float: number }
> = {
  splash: { logo: 140, halo: 200, haloOpacity: 0.45, float: 8 },
  auth: { logo: 72, halo: 104, haloOpacity: 0.5, float: 6 },
  hero: { logo: 88, halo: 128, haloOpacity: 0.55, float: 7 },
  studio: { logo: 44, halo: 64, haloOpacity: 0.65, float: 4 },
  compact: { logo: 36, halo: 52, haloOpacity: 0.5, float: 3 },
  mark: { logo: 28, halo: 44, haloOpacity: 0.55, float: 2 },
};

type Props = {
  /** Preset sizing — splash, auth, hero, studio, compact, mark */
  variant?: GenoLogoCeremonySize;
  /** Override logo SVG size */
  logoSize?: number;
  /** Override rotating halo diameter */
  haloSize?: number;
  showWordmark?: boolean;
  wordmark?: string;
  tagline?: string;
  /** Light text on dark backgrounds vs dark on light */
  tone?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
  /** Reduce motion for watermarks */
  subtle?: boolean;
};

/**
 * Signature GenoMatch logo moment — rotating bond halo, float & pulse.
 * Same motion language as splash / sign-in, reusable across profile & studio.
 */
export default function GenoLogoCeremony({
  variant = 'auth',
  logoSize,
  haloSize,
  showWordmark = false,
  wordmark = 'GenoMatch',
  tagline,
  tone = 'light',
  style,
  subtle = false,
}: Props) {
  const preset = PRESETS[variant];
  const logo = logoSize ?? preset.logo;
  const halo = haloSize ?? preset.halo;
  const floatRange = subtle ? preset.float * 0.5 : preset.float;

  const logoFloat = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(subtle ? 0.97 : 0.94)).current;

  useEffect(() => {
    const floatingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -floatRange,
          duration: subtle ? 1800 : 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: floatRange,
          duration: subtle ? 1800 : 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: subtle ? 1800 : 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: subtle ? 0.97 : 0.94,
          duration: subtle ? 1800 : 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatingLoop.start();
    pulseLoop.start();
    return () => {
      floatingLoop.stop();
      pulseLoop.stop();
    };
  }, [floatRange, logoFloat, logoPulse, subtle]);

  const textColor = tone === 'light' ? COLORS.linen : COLORS.forestDeep;
  const subColor = tone === 'light' ? COLORS.sage : COLORS.sage;

  return (
    <View style={[styles.wrap, { width: halo, height: halo }, style]}>
      <GenoBondHalo size={halo} opacity={preset.haloOpacity} animated />
      <Animated.View
        style={[
          styles.logoOrb,
          { transform: [{ translateY: logoFloat }, { scale: logoPulse }] },
        ]}
      >
        <GenoMatchLogo size={logo} />
      </Animated.View>
      {showWordmark ? (
        <View style={[styles.wordmarkBlock, { top: halo + 12 }]}>
          <Text style={[styles.wordmark, { color: textColor }]}>{wordmark}</Text>
          {tagline ? (
            <Text style={[styles.tagline, { color: subColor }]}>{tagline}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoOrb: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkBlock: {
    position: 'absolute',
    left: -80,
    right: -80,
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 28,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
