import { StyleSheet, Text, View } from 'react-native';
import {
  GenoInboxAvatar,
  GenoInboxCardShell,
  GenoInboxIconButton,
  GenoInboxMirrorPill,
  INBOX,
} from '../inbox';
import { FONT_FAMILY, COLORS, LOGO_GOLD } from '../../theme';
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
  const compatHigh = profile.compatibility >= 80;
  const isFresh = !item.lastMessage;

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
          presenceState={profile.presenceState}
        />
      }
      body={
        <>
          <View style={styles.topRow}>
            <Text style={[styles.name, item.unread && styles.nameUnread]} numberOfLines={1}>
              {profile.name}
            </Text>
            {isFresh ? <GenoInboxMirrorPill label="Say hi" kind="gold" /> : null}
            {profile.genotypeVerified ? <VerifiedBadge compact /> : null}
            <GenoInboxMirrorPill
              label={`${profile.compatibility}%`}
              kind={compatHigh ? 'gold' : 'steel'}
              textStyle={compatHigh ? styles.pctHigh : styles.pct}
            />
            <Text style={styles.time}>{timeLabel}</Text>
          </View>
          <Text
            style={[styles.preview, item.unread && styles.previewUnread]}
            numberOfLines={1}
          >
            {item.lastMessage ?? 'Start the conversation — your bond is waiting'}
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
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    flexShrink: 1,
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: INBOX.nameSize + 1,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  nameUnread: {
    color: LOGO_GOLD,
  },
  pct: {
    fontSize: INBOX.pctSize,
    color: COLORS.textMuted,
  },
  pctHigh: {
    fontSize: INBOX.pctSize,
    color: COLORS.text,
  },
  time: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: INBOX.metaSize,
    color: COLORS.textSubtle,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  preview: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: INBOX.metaSize + 1,
    lineHeight: 16,
    color: COLORS.textSubtle,
  },
  previewUnread: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: LOGO_GOLD,
  },
});
