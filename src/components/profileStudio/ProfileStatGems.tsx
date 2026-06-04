import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { COLORS } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Stat = {
  value: number;
  label: string;
  icon: IonName;
  accent: readonly [string, string];
};

type Props = {
  matches: number;
  likesReceived: number;
  profileViews: number;
};

export default function ProfileStatGems({ matches, likesReceived, profileViews }: Props) {
  const stats: Stat[] = [
    {
      value: matches,
      label: 'Matches',
      icon: 'heart',
      accent: ['rgba(212, 168, 67, 0.35)', 'rgba(212, 168, 67, 0.05)'],
    },
    {
      value: likesReceived,
      label: 'Likes',
      icon: 'sparkles',
      accent: ['rgba(61, 122, 82, 0.35)', 'rgba(61, 122, 82, 0.06)'],
    },
    {
      value: profileViews,
      label: 'Views',
      icon: 'eye-outline',
      accent: ['rgba(26, 61, 40, 0.25)', 'rgba(26, 61, 40, 0.05)'],
    },
  ];

  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <Pressable key={stat.label} style={({ pressed }) => [styles.gem, pressed && styles.gemPressed]}>
          <LinearGradient colors={stat.accent} style={styles.gemBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View style={styles.iconWrap}>
            <Ionicons name={stat.icon} size={16} color={COLORS.forest} />
          </View>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
  },
  gem: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(13, 40, 24, 0.08)',
  },
  gemPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  gemBg: {
    ...StyleSheet.absoluteFillObject,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(237, 243, 238, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 22,
    color: COLORS.forestDeep,
    letterSpacing: -0.5,
  },
  label: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: COLORS.sage,
    marginTop: 2,
    textAlign: 'center',
  },
});
