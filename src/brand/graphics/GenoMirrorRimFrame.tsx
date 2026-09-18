import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MIRROR_ACTION,
  mirrorActionShadow,
  type MirrorActionKind,
} from '../../theme/mirrorActions';

type Props = {
  kind: MirrorActionKind;
  borderRadius: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Metallic mirror rim — wraps chips, pills, and panels with gloss border */
export default function GenoMirrorRimFrame({
  kind,
  borderRadius,
  padding = 1.5,
  style,
  innerStyle,
  children,
}: Props) {
  const spec = MIRROR_ACTION[kind];
  const innerRadius = Math.max(0, borderRadius - padding);

  return (
    <LinearGradient
      colors={[...spec.rim]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.rim,
        mirrorActionShadow(kind),
        { borderRadius, padding },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          { borderRadius: innerRadius },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  rim: {
    alignSelf: 'flex-start',
  },
  inner: {
    overflow: 'hidden',
  },
});
