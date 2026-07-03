import { useEffect, useRef } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import {
  LOGO_GOLD,
  LOGO_GOLD_BRIGHT,
  LOGO_GOLD_DEEP,
  METALLIC_CHROME,
  METALLIC_GRAPHITE,
  METALLIC_SILVER,
  METALLIC_STEEL,
  chromeAlpha,
} from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];
export type MirrorIconTone = 'gold' | 'steel' | 'chrome';

/** Filled variants read better inside gradient masks at small sizes */
const SOLID_ICON_ALIASES: Partial<Record<IonName, IonName>> = {
  'options-outline': 'options',
  'chatbubble-outline': 'chatbubble',
  'log-out-outline': 'log-out',
  'return-up-back-outline': 'return-up-back',
  'alert-circle-outline': 'alert-circle',
  'camera-outline': 'camera',
  'cloud-offline-outline': 'cloud-offline',
  'chevron-back': 'chevron-back',
  'time-outline': 'time',
};

function resolveMirrorIconName(name: IonName): IonName {
  return SOLID_ICON_ALIASES[name] ?? name;
}

type Props = {
  name: IonName;
  size?: number;
  tone?: MirrorIconTone;
};

const GRADIENTS: Record<MirrorIconTone, readonly [string, string, string]> = {
  gold: [LOGO_GOLD_BRIGHT, LOGO_GOLD, LOGO_GOLD_DEEP],
  steel: [METALLIC_CHROME, METALLIC_SILVER, METALLIC_STEEL],
  chrome: ['#FFFFFF', METALLIC_CHROME, '#E8E6E2'],
};

const GLOW: Record<
  MirrorIconTone,
  { shadowColor: string; shadowOpacity: number; shadowRadius: number }
> = {
  gold: { shadowColor: LOGO_GOLD, shadowOpacity: 0.5, shadowRadius: 8 },
  steel: { shadowColor: METALLIC_SILVER, shadowOpacity: 0.4, shadowRadius: 6 },
  chrome: { shadowColor: '#FFFFFF', shadowOpacity: 0.45, shadowRadius: 6 },
};

function useMirrorPulse() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.06],
  });
}

/** Mirror-gloss Ionicons — gold or steel metallic gradient with chrome sheen */
export function GenoMirrorMetallicIcon({ name, size = 22, tone = 'gold' }: Props) {
  const pulseOpacity = useMirrorPulse();
  const glow = GLOW[tone];
  const resolvedName = resolveMirrorIconName(name);
  const maskSize = name.endsWith('-outline') ? Math.round(size * 1.08) : size;
  const box = { width: size, height: size };

  return (
    <View style={[styles.wrap, box, glow]}>
      <MaskedView
        style={box}
        maskElement={
          <View style={[styles.maskCenter, box]}>
            <Ionicons name={resolvedName} size={maskSize} color="#000" />
          </View>
        }
      >
        <Animated.View style={[box, { opacity: pulseOpacity }]}>
          <LinearGradient
            colors={[...GRADIENTS[tone]]}
            start={{ x: 0.12, y: 0 }}
            end={{ x: 0.88, y: 1 }}
            style={box}
          />
          <LinearGradient
            colors={[chromeAlpha(0.65), 'transparent', chromeAlpha(0.2)]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.75, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.sheen]}
            pointerEvents="none"
          />
        </Animated.View>
      </MaskedView>
    </View>
  );
}

/** Glossy metallic strike line (unmatch heart slash) */
export function GenoMirrorStrike({ length = 20 }: { length?: number }) {
  return (
    <View style={[styles.strikeWrap, { width: length, transform: [{ rotate: '-42deg' }] }]}>
      <LinearGradient
        colors={[METALLIC_CHROME, METALLIC_SILVER, METALLIC_STEEL, METALLIC_GRAPHITE]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.strikeBase}
      />
      <LinearGradient
        colors={['transparent', chromeAlpha(0.9), 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.strikeGloss}
        pointerEvents="none"
      />
    </View>
  );
}

/** Mirror gold heart with glossy gray strike beside it (not overlaid) */
export function GenoMirrorHeartDislike({ size = 17 }: { size?: number }) {
  return (
    <View style={[styles.heartDislikeRow, { height: size + 2 }]}>
      <GenoMirrorMetallicIcon name="heart" size={size} tone="gold" />
      <View style={styles.strikeStandalone}>
        <GenoMirrorStrike length={size * 0.92} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    ...(Platform.OS === 'android' ? { elevation: 0 } : null),
  },
  maskCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sheen: {
    opacity: 0.85,
  },
  heartDislikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  strikeStandalone: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  strikeWrap: {
    height: 2.5,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strikeBase: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
  },
  strikeGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    borderRadius: 1,
  },
});
