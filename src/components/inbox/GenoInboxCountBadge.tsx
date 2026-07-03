import { StyleSheet, Text } from 'react-native';
import { GenoMirrorGoldFill, GenoMirrorRedFill, GenoMirrorRimFrame } from '../../brand/graphics';
import { FONT_FAMILY, COLORS } from '../../theme';
import { INBOX } from './inboxTokens';

type Props = {
  count: number;
  variant?: 'gold' | 'alert';
};

export default function GenoInboxCountBadge({ count, variant = 'gold' }: Props) {
  if (count <= 0) return null;

  if (variant === 'alert') {
    return (
      <GenoMirrorRimFrame kind="red" borderRadius={INBOX.countBadgeH / 2}>
        <GenoMirrorRedFill style={styles.badge}>
          <Text style={styles.textAlert}>{count}</Text>
        </GenoMirrorRedFill>
      </GenoMirrorRimFrame>
    );
  }

  return (
    <GenoMirrorRimFrame kind="gold" borderRadius={INBOX.countBadgeH / 2}>
      <GenoMirrorGoldFill style={styles.badge}>
        <Text style={styles.text}>{count}</Text>
      </GenoMirrorGoldFill>
    </GenoMirrorRimFrame>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: INBOX.countBadgeH,
    height: INBOX.countBadgeH,
    borderRadius: INBOX.countBadgeH / 2 - 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  text: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.text,
  },
  textAlert: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.white,
  },
});
