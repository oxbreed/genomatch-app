import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { GenoCardFrame } from '../../brand/graphics';
import { COLORS } from '../../theme';
import { PROFILE } from '../profile/profileTokens';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Stat = {
  value: number;
  label: string;
  icon: IonName;
};

type Props = {
  matches: number;
  likesReceived: number;
  profileViews: number;
};

export default function ProfileStatGems({ matches, likesReceived, profileViews }: Props) {
  const stats: Stat[] = [
    { value: matches, label: 'Matches', icon: 'heart' },
    { value: likesReceived, label: 'Likes', icon: 'sparkles-outline' },
    { value: profileViews, label: 'Views', icon: 'eye-outline' },
  ];

  return (
    <GenoCardFrame showWatermark={false}>
      <View style={styles.row}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={styles.gemWrap}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.gem}>
              <Ionicons name={stat.icon} size={15} color={COLORS.sage} />
              <Text style={styles.value}>{stat.value}</Text>
              <Text style={styles.label}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: PROFILE.cardPadding,
  },
  gemWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  gem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  value: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 24,
    color: COLORS.forestDeep,
    letterSpacing: -0.5,
  },
  label: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    letterSpacing: 0.2,
    color: COLORS.sage,
    textAlign: 'center',
  },
});
