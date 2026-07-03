import { StyleSheet, Text, View } from 'react-native';
import { GenoMirrorGoldFill, GenoMirrorRimFrame } from '../../brand/graphics';
import ProfileAvatar from '../ProfileAvatar';
import { PresenceDot } from '../PresenceBadge';
import { FONT_FAMILY, COLORS } from '../../theme';
import { getInitials } from '../../data/mockData';
import type { PresenceState } from '../../types/database';
import { INBOX } from './inboxTokens';

function brandGradient(name: string): [string, string] {
  const pairs: [string, string][] = [
    [COLORS.forest, COLORS.forestDeep],
    [COLORS.brandRedDeep, COLORS.forestDeep],
    [COLORS.brandCharcoal, COLORS.forestDeep],
  ];
  return pairs[name.charCodeAt(0) % pairs.length]!;
}

type Props = {
  name: string;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  gradient?: [string, string];
  showUnread?: boolean;
  presenceState?: PresenceState;
};

export default function GenoInboxAvatar({
  name,
  avatarUrl,
  photoUrl,
  gradient,
  showUnread,
  presenceState,
}: Props) {
  const url = avatarUrl?.trim() || photoUrl?.trim();
  const size = INBOX.avatarSize;

  return (
    <View style={styles.wrap}>
      <GenoMirrorRimFrame kind="gold" borderRadius={(size + 4) / 2} padding={2}>
        <View style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}>
          {url ? (
            <ProfileAvatar
              name={name}
              gradient={gradient ?? brandGradient(name)}
              avatarUrl={url}
              size={size}
              noPhotoBackground={COLORS.forestDeep}
              noPhotoInitialColor={COLORS.linen}
            />
          ) : (
            <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
              <Text style={styles.initials}>{getInitials(name)}</Text>
            </View>
          )}
        </View>
      </GenoMirrorRimFrame>
      {presenceState && presenceState !== 'offline' ? (
        <View style={styles.presence}>
          <PresenceDot presenceState={presenceState} size={14} />
        </View>
      ) : null}
      {showUnread ? (
        <GenoMirrorRimFrame kind="red" borderRadius={7} padding={1} style={styles.unread}>
          <GenoMirrorGoldFill style={styles.unreadFill}>
            <View style={styles.unreadDot} />
          </GenoMirrorGoldFill>
        </GenoMirrorRimFrame>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  inner: {
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceElevated,
  },
  fallback: {
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 17,
    color: COLORS.text,
  },
  presence: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  unread: {
    position: 'absolute',
    top: -1,
    right: -1,
  },
  unreadFill: {
    width: 14,
    height: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text,
  },
});
