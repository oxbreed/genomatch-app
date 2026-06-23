import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  percent: number;
  essentialsDone: number;
  essentialsTotal: number;
};

export default function StudioCompletionStrip({
  percent,
  essentialsDone,
  essentialsTotal,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>Profile strength</Text>
        <Text style={styles.value}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={['rgba(61, 122, 82, 0.35)', COLORS.gold]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fill, { width: `${Math.min(100, Math.max(0, percent))}%` }]}
        />
      </View>
      <Text style={styles.hint}>
        {essentialsDone} of {essentialsTotal} essentials complete
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(13, 40, 24, 0.07)',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.forestDeep,
    letterSpacing: 0.2,
  },
  value: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.gold,
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(13, 40, 24, 0.06)',
  },
  fill: {
    height: 5,
    borderRadius: 3,
  },
  hint: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.sage,
  },
});
