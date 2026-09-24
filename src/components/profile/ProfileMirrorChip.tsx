import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { GenoMirrorGoldFill, GenoMirrorRimFrame } from '../../brand/graphics';
import { COLORS, GLASS, TYPOGRAPHY } from '../../theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  pill?: boolean;
};

/** Mirror-gloss selectable chip — steel idle, gold selected */
export default function ProfileMirrorChip({
  label,
  selected,
  onPress,
  style,
  pill = false,
}: Props) {
  const radius = pill ? 999 : 12;

  return (
    <Pressable onPress={onPress} style={style}>
      <GenoMirrorRimFrame kind={selected ? 'gold' : 'steel'} borderRadius={radius}>
        {selected ? (
          <GenoMirrorGoldFill style={[styles.fill, pill && styles.fillPill]}>
            <Text style={styles.textActive}>{label}</Text>
          </GenoMirrorGoldFill>
        ) : (
          <Text style={[styles.text, styles.fill, pill && styles.fillPill]}>{label}</Text>
        )}
      </GenoMirrorRimFrame>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10.5,
    backgroundColor: GLASS.insetFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    ...TYPOGRAPHY.chip,
    color: COLORS.ink,
    textAlign: 'center',
  },
  textActive: {
    ...TYPOGRAPHY.chip,
    color: COLORS.ink,
    textAlign: 'center',
  },
});
