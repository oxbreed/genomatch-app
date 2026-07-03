import { StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { GenoCardFrame, GenoMirrorMetallicIcon } from '../../brand/graphics';
import { COLORS, LOGO_GOLD } from '../../theme';
import { PROFILE, PROFILE_TYPE } from '../profile/profileTokens';

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
    { value: likesReceived, label: 'Likes', icon: 'sparkles' },
    { value: profileViews, label: 'Views', icon: 'eye' },
  ];

  return (
    <GenoCardFrame mirror showWatermark={false}>
      <View style={styles.row}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={styles.gemWrap}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.gem}>
              <GenoMirrorMetallicIcon name={stat.icon} size={15} tone="gold" />
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
    paddingVertical: 20,
    paddingHorizontal: PROFILE.cardPadding,
  },
  gemWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 2,
  },
  gem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  value: {
    ...PROFILE_TYPE.statValue,
    color: COLORS.text,
  },
  label: {
    ...PROFILE_TYPE.statLabel,
    color: LOGO_GOLD,
    textAlign: 'center',
  },
});
