import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GenoInboxAvatar,
  GenoInboxCardShell,
  GenoInboxIconButton,
  INBOX,
} from '../inbox';
import { FONT_FAMILY, COLORS } from '../../theme';
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
            {isFresh ? (
              <View style={styles.newPill}>
                <Text style={styles.newPillText}>Say hi</Text>
              </View>
            ) : null}
            {profile.genotypeVerified ? <VerifiedBadge compact /> : null}
            <LinearGradient
              colors={
                compatHigh
                  ? ['rgba(212, 168, 67, 0.35)', 'rgba(212, 168, 67, 0.12)']
                  : ['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.35)']
              }
              style={styles.compatPill}
            >
              <Text style={[styles.pct, compatHigh && styles.pctHigh]}>
                {profile.compatibility}%
              </Text>
            </LinearGradient>
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
    color: COLORS.forestDeep,
    letterSpacing: -0.3,
  },
  nameUnread: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forestDeep,
  },
  newPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  newPillText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.forestDeep,
  },
  compatPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  pct: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: INBOX.pctSize,
    color: COLORS.sage,
  },
  pctHigh: {
    color: COLORS.forestDeep,
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
    color: COLORS.forest,
  },
});
