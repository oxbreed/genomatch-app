import type { ReactNode } from 'react';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  GenoMirrorGoldFill,
  GenoMirrorRedFill,
  GenoMirrorSteelFill,
} from './GenoMirrorRed';
import { GenoMirrorHeartDislike, GenoMirrorMetallicIcon } from './GenoMirrorMetallicIcon';
import {
  MIRROR_ACTION,
  mirrorActionShadow,
  type MirrorActionKind,
  type MirrorIconTone,
} from '../../theme/mirrorActions';
import { SHADOWS } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  size: number;
  kind: MirrorActionKind;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  icon?: IonName;
  iconSize?: number;
  iconTone?: MirrorIconTone;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

function MirrorFill({
  kind,
  borderRadius,
  children,
}: {
  kind: MirrorActionKind;
  borderRadius: number;
  children: ReactNode;
}) {
  const fillKind = MIRROR_ACTION[kind].fill;
  const fillStyle = [styles.fill, { borderRadius }];

  if (fillKind === 'gold') {
    return <GenoMirrorGoldFill style={fillStyle}>{children}</GenoMirrorGoldFill>;
  }
  if (fillKind === 'red') {
    return <GenoMirrorRedFill style={fillStyle}>{children}</GenoMirrorRedFill>;
  }
  return <GenoMirrorSteelFill style={fillStyle}>{children}</GenoMirrorSteelFill>;
}

/** Uniform mirror-gloss circular action — shared rim, fill, and icon tones */
export default function GenoMirrorActionButton({
  size,
  kind,
  onPress,
  disabled,
  accessibilityLabel,
  icon,
  iconSize,
  iconTone,
  style,
  children,
}: Props) {
  const spec = MIRROR_ACTION[kind];
  const rim = 3;
  const inner = size - rim * 2;
  const resolvedIconSize = iconSize ?? Math.round(size * 0.44);
  const resolvedIconTone = iconTone ?? spec.icon;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        { width: size, height: size },
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <LinearGradient
        colors={[...spec.rim]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.rim,
          mirrorActionShadow(kind),
          { width: size, height: size, borderRadius: size / 2, padding: rim },
        ]}
      >
        <View style={[styles.clip, { width: inner, height: inner, borderRadius: inner / 2 }]}>
          <MirrorFill kind={kind} borderRadius={inner / 2}>
            {children ??
              (kind === 'unmatch' ? (
                <GenoMirrorHeartDislike size={resolvedIconSize} />
              ) : icon ? (
                <GenoMirrorMetallicIcon
                  name={icon}
                  size={resolvedIconSize}
                  tone={resolvedIconTone}
                />
              ) : null)}
          </MirrorFill>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rim: {
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glassFloat,
  },
  clip: {
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
