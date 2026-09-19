import { StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import { COLORS, TYPOGRAPHY, type MirrorIconTone } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

const ICON_TONE: Partial<Record<IonName, MirrorIconTone>> = {
  'resize-outline': 'chrome',
  'sparkles-outline': 'gold',
  'wine-outline': 'chrome',
  'cloud-outline': 'steel',
  'school-outline': 'gold',
};

type Row = {
  icon: IonName;
  label: string;
};

type Props = {
  rows: Row[];
};

export default function DiscoverDetailRows({ rows }: Props) {
  return (
    <View style={styles.list}>
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        const tone = ICON_TONE[row.icon] ?? 'gold';
        return (
          <View key={`${row.icon}-${row.label}`} style={[styles.row, !isLast && styles.rowBorder]}>
            <GenoMirrorRimFrame kind="steel" borderRadius={20} padding={1}>
              <GenoMirrorSteelFill style={styles.iconRing}>
                <GenoMirrorMetallicIcon name={row.icon} size={17} tone={tone} />
              </GenoMirrorSteelFill>
            </GenoMirrorRimFrame>
            <Text style={styles.label}>{row.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconRing: {
    width: 40,
    height: 40,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    ...TYPOGRAPHY.bodyStrong,
    color: COLORS.text,
  },
});
