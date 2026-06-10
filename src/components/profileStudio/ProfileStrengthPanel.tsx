import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoCardFrame } from '../../brand/graphics';
import { COLORS } from '../../theme';
import { PROFILE, PROFILE_TYPE } from '../profile/profileTokens';
import ProfileVitalityRing from './ProfileVitalityRing';

type Props = {
  percent: number;
  hint: string;
};

export default function ProfileStrengthPanel({ percent, hint }: Props) {
  return (
    <GenoCardFrame showWatermark={false} style={styles.frame}>
      <View style={styles.inner}>
        <ProfileVitalityRing percent={percent} size={68} />
        <View style={styles.copy}>
          <Text style={styles.kicker}>Profile strength</Text>
          <Text style={styles.title}>{hint}</Text>
          <View style={styles.barTrack}>
            <LinearGradient
              colors={[COLORS.gold, COLORS.verified]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.barFill, { width: `${percent}%` }]}
            />
          </View>
        </View>
      </View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    marginBottom: PROFILE.cardGap,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    paddingHorizontal: PROFILE.cardPadding,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  kicker: {
    ...PROFILE_TYPE.sectionKicker,
    color: COLORS.sage,
  },
  title: {
    ...PROFILE_TYPE.sectionTitle,
    color: COLORS.forestDeep,
  },
  barTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(13, 40, 24, 0.06)',
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 3,
  },
});
