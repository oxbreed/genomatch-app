import { StyleSheet, Text, View } from 'react-native';
import {
  GENOMATCH_COMPANY,
  GENOMATCH_PARENT_LINE,
} from '../../constants/company';
import { FONT_FAMILY, COLORS } from '../../theme';

export default function AuthCompanyFooter() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.line}>
        {GENOMATCH_COMPANY.legalName} ({GENOMATCH_COMPANY.registration}) ·{' '}
        {GENOMATCH_COMPANY.jurisdiction}
      </Text>
      <Text style={styles.parentLine}>{GENOMATCH_PARENT_LINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13, 40, 24, 0.08)',
    gap: 6,
  },
  line: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.textMuted,
  },
  parentLine: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.textSubtle,
  },
});
