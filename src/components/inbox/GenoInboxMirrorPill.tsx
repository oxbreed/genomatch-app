import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { GenoMirrorGoldFill, GenoMirrorRimFrame, GenoMirrorSteelFill } from '../../brand/graphics';
import { FONT_FAMILY, COLORS } from '../../theme';
import type { MirrorActionKind } from '../../theme/mirrorActions';

type Props = {
  label: string;
  kind?: MirrorActionKind;
  style?: StyleProp<ViewStyle>;
  textStyle?: object;
};

/** Compact mirror pill for inbox list rows */
export default function GenoInboxMirrorPill({
  label,
  kind = 'gold',
  style,
  textStyle,
}: Props) {
  return (
    <GenoMirrorRimFrame kind={kind} borderRadius={999} style={style}>
      {kind === 'gold' ? (
        <GenoMirrorGoldFill style={styles.fill}>
          <Text style={[styles.text, textStyle]}>{label}</Text>
        </GenoMirrorGoldFill>
      ) : (
        <GenoMirrorSteelFill style={styles.fill}>
          <Text style={[styles.text, textStyle]}>{label}</Text>
        </GenoMirrorSteelFill>
      )}
    </GenoMirrorRimFrame>
  );
}

const styles = StyleSheet.create({
  fill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 9,
    letterSpacing: 0.6,
    color: COLORS.text,
  },
});
