import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import GenoMatchLogo from '../../components/GenoMatchLogo';
import { FONT_FAMILY, COLORS } from '../../theme';

export type GenoLogoCeremonySize = 'splash' | 'auth' | 'hero' | 'studio' | 'compact' | 'mark';

const PRESETS: Record<GenoLogoCeremonySize, { logo: number; float: number }> = {
  splash: { logo: 160, float: 6 },
  auth: { logo: 88, float: 5 },
  hero: { logo: 100, float: 5 },
  studio: { logo: 48, float: 3 },
  compact: { logo: 40, float: 2 },
  mark: { logo: 32, float: 2 },
};

type Props = {
  variant?: GenoLogoCeremonySize;
  logoSize?: number;
  showWordmark?: boolean;
  wordmark?: string;
  tagline?: string;
  /** light = logo on dark backdrop; dark = logo on light backdrop */
  tone?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
  subtle?: boolean;
};

/** Logo presentation — gentle float; transparent vector mark */
export default function GenoLogoCeremony({
  variant = 'auth',
  logoSize,
  showWordmark = false,
  wordmark = 'GenoMatch',
  tagline,
  tone = 'dark',
  style,
  subtle = false,
}: Props) {
  const preset = PRESETS[variant];
  const logo = logoSize ?? preset.logo;
  const floatRange = subtle ? preset.float * 0.5 : preset.float;

  const logoFloat = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(subtle ? 0.98 : 0.96)).current;

  useEffect(() => {
    const floatingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -floatRange,
          duration: subtle ? 2200 : 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: floatRange,
          duration: subtle ? 2200 : 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: subtle ? 2200 : 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: subtle ? 0.98 : 0.96,
          duration: subtle ? 2200 : 1800,
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

  const textColor = tone === 'light' ? COLORS.textOnDark : COLORS.text;
  const subColor = tone === 'light' ? 'rgba(247, 245, 242, 0.72)' : COLORS.textMuted;

  return (
    <View style={[styles.wrap, style]}>
      <Animated.View
        style={{
          transform: [{ translateY: logoFloat }, { scale: logoPulse }],
        }}
      >
        <GenoMatchLogo size={logo} render="vector" />
      </Animated.View>
      {showWordmark ? (
        <View style={styles.wordmarkBlock}>
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
  },
  wordmarkBlock: {
    marginTop: 16,
    alignItems: 'center',
    paddingHorizontal: 12,
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
