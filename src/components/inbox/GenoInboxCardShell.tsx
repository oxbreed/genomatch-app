import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GenoCardFrame } from '../../brand/graphics';
import { INBOX } from './inboxTokens';

type Props = {
  onPressBody?: () => void;
  onPressAvatar?: () => void;
  avatar: ReactNode;
  body: ReactNode;
  actions: ReactNode;
};

/** Premium gradient-framed row — identical shell for Matches & Messages */
export default function GenoInboxCardShell({
  onPressBody,
  onPressAvatar,
  avatar,
  body,
  actions,
}: Props) {
  const avatarNode = onPressAvatar ? (
    <Pressable
      style={({ pressed }) => [styles.avatarCol, pressed && styles.pressed]}
      onPress={onPressAvatar}
    >
      {avatar}
    </Pressable>
  ) : (
    <View style={styles.avatarCol}>{avatar}</View>
  );

  const main = (
    <>
      {avatarNode}
      <View style={styles.bodyCol}>{body}</View>
    </>
  );

  return (
    <GenoCardFrame style={styles.cardFrame}>
      <View style={styles.row}>
        {onPressBody ? (
          <Pressable
            style={({ pressed }) => [styles.main, pressed && styles.pressed]}
            onPress={onPressBody}
          >
            {main}
          </Pressable>
        ) : (
          <View style={styles.main}>{main}</View>
        )}
        <View style={styles.actionsCol}>{actions}</View>
      </View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  cardFrame: {
    marginHorizontal: INBOX.cardMarginH,
    marginBottom: INBOX.cardMarginB,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: INBOX.cardPaddingV,
    paddingLeft: INBOX.cardPaddingH,
    paddingRight: 8,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: INBOX.cardGap,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.9,
  },
  avatarCol: {
    flexShrink: 0,
  },
  bodyCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  actionsCol: {
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    paddingLeft: 4,
  },
});
