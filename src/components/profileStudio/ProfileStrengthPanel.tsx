import { StyleSheet, Text, View } from 'react-native';
import { GenoCardFrame } from '../../brand/graphics';
import { COLORS } from '../../theme';
import { PROFILE } from '../profile/profileTokens';
import ProfileVitalityRing from './ProfileVitalityRing';

type Props = {
  percent: number;
  hint: string;
};

export default function ProfileStrengthPanel({ percent, hint }: Props) {
  return (
    <GenoCardFrame>
      <View style={styles.inner}>
        <ProfileVitalityRing percent={percent} size={84} />
        <View style={styles.copy}>
          <Text style={styles.kicker}>BOND PROFILE</Text>
          <Text style={styles.title}>{hint}</Text>
          <Text style={styles.sub}>
            Stronger profiles surface higher on Discover
          </Text>
        </View>
      </View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.gold,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: PROFILE.sectionTitleSize,
    color: COLORS.forestDeep,
    letterSpacing: -0.2,
  },
  sub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: PROFILE.metaSize,
    lineHeight: 16,
    color: COLORS.sage,
  },
});
