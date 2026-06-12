import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatLocationLine } from '../lib/distanceBands';
import type { DistanceBand } from '../lib/distanceBands';
import { FONT_FAMILY, COLORS } from '../theme';

type Props = {
  city: string;
  distanceBand?: DistanceBand | null;
  dark?: boolean;
  compact?: boolean;
};

export default function LocationLine({ city, distanceBand, dark = false, compact = false }: Props) {
  const text = formatLocationLine(city, distanceBand);

  return (
    <View style={styles.row}>
      <Ionicons
        name="location-outline"
        size={compact ? 13 : 14}
        color={dark ? COLORS.sage : COLORS.sage}
      />
      <Text
        style={[styles.text, dark && styles.textDark, compact && styles.textCompact]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  text: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    color: COLORS.forest,
    flexShrink: 1,
  },
  textDark: {
    color: COLORS.linen,
  },
  textCompact: {
    fontSize: 13,
  },
});
