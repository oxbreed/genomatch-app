import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';
import { PROFILE } from './profileTokens';

type Props = {
  kicker?: string;
  title: string;
  hint?: string;
};

export default function ProfileSectionHeader({ kicker, title, hint }: Props) {
  return (
    <View style={styles.wrap}>
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
    gap: 3,
  },
  kicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: PROFILE.sectionLabelSize,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: COLORS.sage,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: PROFILE.sectionTitleSize,
    letterSpacing: -0.3,
    color: COLORS.forestDeep,
  },
  hint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: PROFILE.metaSize,
    lineHeight: 18,
    color: COLORS.textSubtle,
    marginTop: 1,
  },
  rule: {
    marginTop: 10,
    height: 1,
    backgroundColor: COLORS.border,
    borderRadius: 1,
  },
});
