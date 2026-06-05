import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

type Stats = {
  matches: number;
  likesReceived: number;
  profileViews: number;
};

export default function ProfileStatsStrip({ matches, likesReceived, profileViews }: Stats) {
  return (
    <LinearGradient
      colors={[COLORS.forestDeep, COLORS.forest]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <Stat value={matches} label="Matches" />
      <View style={styles.divider} />
      <Stat value={likesReceived} label="Likes" />
      <View style={styles.divider} />
      <Stat value={profileViews} label="Views" />
    </LinearGradient>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 26,
    color: COLORS.gold,
  },
  label: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(245, 240, 230, 0.75)',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(245, 240, 230, 0.2)',
  },
});
