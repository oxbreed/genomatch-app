import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONT_FAMILY, COLORS } from '../../theme';
import { formatMessageTime } from '../../lib/messages';
import type { ChatMessage } from '../../lib/messages';
import { Ionicons } from '@expo/vector-icons';

type ChatMessageBubbleProps = {
  item: ChatMessage;
  prevCreatedAt: string | null;
  showRead: boolean;
};

function ChatMessageBubble({ item, prevCreatedAt, showRead }: ChatMessageBubbleProps) {
  const showTime =
    !prevCreatedAt ||
    new Date(item.createdAt).getTime() - new Date(prevCreatedAt).getTime() > 5 * 60 * 1000;

  return (
    <View>
      {showTime ? (
        <Text style={styles.timeDivider}>{formatMessageTime(item.createdAt)}</Text>
      ) : null}
      <View
        style={[
          styles.bubbleRow,
          item.isMine ? styles.bubbleRowSent : styles.bubbleRowReceived,
        ]}
      >
        <View
          style={[
            styles.bubble,
            item.isMine ? styles.bubbleSent : styles.bubbleReceived,
          ]}
        >
          <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextSent]}>
            {item.body}
          </Text>
        </View>
        {showRead ? (
          <View style={styles.readReceipt}>
            <Ionicons name="checkmark-done" size={14} color={COLORS.textSubtle} />
            <Text style={styles.readReceiptText}>Read</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default memo(ChatMessageBubble);

const styles = StyleSheet.create({
  timeDivider: {
    fontFamily: FONT_FAMILY.gothamMedium,
    alignSelf: 'center',
    fontSize: 11,
    letterSpacing: 0.3,
    color: COLORS.textSubtle,
    marginVertical: 10,
  },
  bubbleRow: {
    marginBottom: 8,
    maxWidth: '82%',
  },
  bubbleRowSent: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleRowReceived: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleSent: {
    backgroundColor: COLORS.forest,
    borderBottomRightRadius: 6,
  },
  bubbleReceived: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.18)',
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.forest,
  },
  bubbleTextSent: {
    color: COLORS.linen,
  },
  readReceipt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
    marginRight: 2,
  },
  readReceiptText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    color: COLORS.textSubtle,
  },
});
