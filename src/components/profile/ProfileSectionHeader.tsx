import { StyleSheet, Text, View } from 'react-native';
import {COLORS, LOGO_GOLD} from '../../theme';
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
    color: LOGO_GOLD,
    letterSpacing: 1.4,
  },
  title: {
    ...PROFILE_TYPE.sectionTitle,
    color: COLORS.text,
  },
  hint: {
    ...PROFILE_TYPE.sectionHint,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
  rule: {
    marginTop: 12,
    height: 1,
    backgroundColor: COLORS.chipSolid,
    borderRadius: 1,
  },
});
