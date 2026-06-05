import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';

type Props = {
  icon: 'lock-closed' | 'shield-checkmark' | 'eye-off';
  text: string;
};

export default function AuthTrustBanner({ icon, text }: Props) {
  return (
    <View style={styles.box}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={18} color={COLORS.verified} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(61, 122, 82, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.forest,
  },
});
