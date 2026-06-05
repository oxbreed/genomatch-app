import { StyleSheet, Text, View } from 'react-native';
import {
  GenoInboxAvatar,
  GenoInboxCardShell,
  GenoInboxIconButton,
  INBOX,
} from '../inbox';
import { COLORS } from '../../theme';
import type { ConversationPreview } from '../../types/database';
import VerifiedBadge from '../VerifiedBadge';
import { formatMessageTime } from '../../lib/messages';

type Props = {
  item: ConversationPreview;
  onOpenProfile: () => void;
  onOpenChat: () => void;
};

export default function ConversationListCard({ item, onOpenProfile, onOpenChat }: Props) {
  const { profile } = item;
  const timeLabel = item.lastMessageAt ? formatMessageTime(item.lastMessageAt) : 'New';

  return (
    <GenoInboxCardShell
      onPressBody={onOpenChat}
      onPressAvatar={onOpenProfile}
      avatar={
        <GenoInboxAvatar
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          photoUrl={profile.photos[0]}
          gradient={profile.gradient}
          showUnread={item.unread}
        />
      }
      body={
        <>
          <View style={styles.topRow}>
            <Text style={[styles.name, item.unread && styles.nameUnread]} numberOfLines={1}>
              {profile.name}
            </Text>
            {profile.genotypeVerified ? <VerifiedBadge compact /> : null}
            <Text style={styles.time}>{timeLabel}</Text>
          </View>
          <Text
            style={[styles.preview, item.unread && styles.previewUnread]}
            numberOfLines={1}
          >
            {item.lastMessage ?? 'Say hello — start your bond'}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {profile.compatibility}% genotype bond
          </Text>
        </>
      }
      actions={
        <GenoInboxIconButton
          icon="chatbubble-ellipses"
          variant="gold"
          onPress={onOpenChat}
          accessibilityLabel={`Open chat with ${profile.name}`}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: INBOX.nameSize,
    color: COLORS.forestDeep,
    letterSpacing: -0.2,
  },
  nameUnread: {
    color: COLORS.forestDeep,
  },
  time: {
    fontFamily: 'Satoshi-Medium',
    fontSize: INBOX.metaSize,
    color: COLORS.textSubtle,
    flexShrink: 0,
  },
  preview: {
    fontFamily: 'Satoshi-Medium',
    fontSize: INBOX.metaSize,
    lineHeight: 14,
    color: COLORS.sage,
  },
  previewUnread: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forest,
  },
  meta: {
    fontFamily: 'Satoshi-Medium',
    fontSize: INBOX.badgeSize,
    color: COLORS.textSubtle,
  },
});
