import MaskedView from '@react-native-masked-view/masked-view';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CREAM,
  LOGO_GOLD,
  LOGO_GOLD_BRIGHT,
  LOGO_GOLD_DEEP,
  LOGO_RED,
  LOGO_RED_HOT,
  LOGO_RED_DEEP,
} from '../../theme';
import { useMetallicShimmer } from './useMetallicShimmer';

export type GenoMetallicTone = 'gold' | 'red' | 'charcoal' | 'trust' | 'white';

type Props = {
  children: string;
  tone: GenoMetallicTone;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Row layout (e.g. sign-in line) */
  inline?: boolean;
};

const GRADIENTS: Record<GenoMetallicTone, readonly [string, string, string]> = {
  gold: [LOGO_GOLD_BRIGHT, LOGO_GOLD, LOGO_GOLD_DEEP],
  red: [LOGO_RED_HOT, LOGO_RED, LOGO_RED_DEEP],
  charcoal: ['#C8C2BA', CREAM, '#A8A29C'],
  trust: ['#B8B0A6', 'rgba(250, 248, 245, 0.85)', '#7A746E'],
  white: ['#FFFFFF', '#FFF9F2', '#F2EBE2'],
};

const GLOW: Partial<
  Record<GenoMetallicTone, { shadowColor: string; shadowOpacity: number; shadowRadius: number }>
> = {
  gold: { shadowColor: LOGO_GOLD, shadowOpacity: 0.38, shadowRadius: 10 },
  red: { shadowColor: LOGO_RED, shadowOpacity: 0.32, shadowRadius: 8 },
  trust: { shadowColor: LOGO_GOLD, shadowOpacity: 0.15, shadowRadius: 4 },
  white: { shadowColor: '#FFFFFF', shadowOpacity: 0.25, shadowRadius: 6 },
};

/** Gradient metallic lettering with soft bloom + shimmer pulse */
export default function GenoMetallicText({ children, tone, style, textStyle, inline }: Props) {
  const { pulseOpacity } = useMetallicShimmer();
  const glow = GLOW[tone];

  return (
    <View style={[styles.wrap, inline && styles.wrapInline, glow, style]}>
      <MaskedView
        maskElement={<Text style={[styles.maskText, textStyle]}>{children}</Text>}
      >
        <Animated.View style={{ opacity: pulseOpacity }}>
          <LinearGradient
            colors={[...GRADIENTS[tone]]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
          >
            <Text style={[styles.maskText, textStyle, styles.hidden]}>{children}</Text>
          </LinearGradient>
        </Animated.View>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 0 },
    ...(Platform.OS === 'android' ? { elevation: 0 } : null),
  },
  wrapInline: {
    alignSelf: 'auto',
  },
  maskText: {
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  hidden: {
    opacity: 0,
  },
});
