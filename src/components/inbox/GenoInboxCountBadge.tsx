import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';
import { INBOX } from './inboxTokens';

type Props = {
  count: number;
  variant?: 'gold' | 'alert';
};

export default function GenoInboxCountBadge({ count, variant = 'gold' }: Props) {
  if (count <= 0) return null;

  const colors =
    variant === 'alert'
      ? ([COLORS.error, '#E85A4F'] as [string, string])
      : INBOX.colors.goldBtn;

  return (
    <LinearGradient colors={colors} style={styles.badge}>
      <Text style={styles.text}>{count}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: INBOX.countBadgeH,
    height: INBOX.countBadgeH,
    borderRadius: INBOX.countBadgeH / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  text: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forestDeep,
  },
});
