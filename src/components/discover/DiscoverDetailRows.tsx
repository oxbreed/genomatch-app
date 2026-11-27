import { StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

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
        return (
          <View key={`${row.icon}-${row.label}`} style={[styles.row, !isLast && styles.rowBorder]}>
            <View style={styles.iconRing}>
              <Ionicons name={row.icon} size={17} color={COLORS.goldDeep} />
            </View>
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
    borderBottomColor: 'rgba(11, 12, 14, 0.10)',
  },
  iconRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 154, 75, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201, 154, 75, 0.32)',
  },
  label: {
    flex: 1,
    ...TYPOGRAPHY.bodyStrong,
    color: COLORS.text,
  },
});
