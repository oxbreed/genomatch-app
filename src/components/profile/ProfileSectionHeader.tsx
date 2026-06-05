import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';
import { PROFILE } from './profileTokens';

type Props = {
  kicker?: string;
  title: string;
  hint?: string;
};

/** Section titles — same hierarchy as Matches / Messages list cards */
export default function ProfileSectionHeader({ kicker, title, hint }: Props) {
  return (
    <View style={styles.wrap}>
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
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
    letterSpacing: -0.2,
    color: COLORS.forestDeep,
  },
  hint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: PROFILE.metaSize,
    lineHeight: 16,
    color: COLORS.sage,
  },
});
