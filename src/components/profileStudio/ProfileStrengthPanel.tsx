import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <GenoCardFrame showWatermark={false}>
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
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: PROFILE.cardPadding,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  kicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: PROFILE.sectionLabelSize,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.sage,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: PROFILE.sectionTitleSize,
    color: COLORS.forestDeep,
    letterSpacing: -0.3,
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
