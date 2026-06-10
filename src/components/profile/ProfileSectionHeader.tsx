import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';
import { PROFILE_TYPE } from './profileTokens';

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
    marginBottom: 16,
    gap: 4,
  },
  kicker: {
    ...PROFILE_TYPE.sectionKicker,
    color: COLORS.gold,
  },
  title: {
    ...PROFILE_TYPE.sectionTitle,
    color: COLORS.forestDeep,
  },
  hint: {
    ...PROFILE_TYPE.sectionHint,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
  rule: {
    marginTop: 12,
    height: 1,
    backgroundColor: 'rgba(143, 175, 149, 0.35)',
    borderRadius: 1,
  },
});
