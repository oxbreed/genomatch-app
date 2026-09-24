import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import GenoMatchLogo from '../../components/GenoMatchLogo';
import { FONT_FAMILY, COLORS } from '../../theme';

export type GenoLogoCeremonySize = 'splash' | 'auth' | 'hero' | 'studio' | 'compact' | 'mark';

const PRESETS: Record<GenoLogoCeremonySize, { logo: number; float: number }> = {
  splash: { logo: 140, float: 8 },
  auth: { logo: 72, float: 6 },
  hero: { logo: 88, float: 7 },
  studio: { logo: 44, float: 4 },
  compact: { logo: 36, float: 3 },
  mark: { logo: 28, float: 2 },
};

type Props = {
  /** Preset sizing — splash, auth, hero, studio, compact, mark */
  variant?: GenoLogoCeremonySize;
  /** Override logo size */
  logoSize?: number;
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
 * The GenoMatch logo lockup. The mark carries the brand on its own, so there is
 * no ring of orbiting nodes behind it — that decoration competed with the ribbon
 * and read differently at every size it was used.
 */
export default function GenoLogoCeremony({
  variant = 'auth',
  logoSize,
  showWordmark = false,
  wordmark = 'GenoMatch',
  tagline,
  tone = 'light',
  style,
  subtle = false,
}: Props) {
  const preset = PRESETS[variant];
  const logo = logoSize ?? preset.logo;
  const floatRange = subtle ? preset.float * 0.5 : preset.float;

  const logoFloat = useRef(new Animated.Value(0)).current;

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
          toValue: 0,
          duration: subtle ? 1800 : 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatingLoop.start();
    return () => floatingLoop.stop();
  }, [floatRange, logoFloat]);

  const textColor = tone === 'light' ? COLORS.linen : COLORS.ink;
  const subColor = tone === 'light' ? COLORS.textMutedOnDark : COLORS.label;

  return (
    <View style={[styles.wrap, { width: logo, height: logo }, style]}>
      <Animated.View style={{ transform: [{ translateY: logoFloat }] }}>
        <GenoMatchLogo size={logo} />
      </Animated.View>
      {showWordmark ? (
        <View style={[styles.wordmarkBlock, { top: logo + 12 }]}>
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
