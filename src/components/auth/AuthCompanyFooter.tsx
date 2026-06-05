import { StyleSheet, Text, View } from 'react-native';
import { GENOMATCH_COMPANY } from '../../constants/company';
import { COLORS } from '../../theme';

export default function AuthCompanyFooter() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.line}>
        {GENOMATCH_COMPANY.legalName} ({GENOMATCH_COMPANY.registration}) ·{' '}
        {GENOMATCH_COMPANY.jurisdiction}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13, 40, 24, 0.08)',
  },
  line: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.textMuted,
  },
});
