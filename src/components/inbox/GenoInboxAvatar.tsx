import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileAvatar from '../ProfileAvatar';
import { COLORS } from '../../theme';
import { getInitials } from '../../data/mockData';
import { INBOX } from './inboxTokens';

function brandGradient(name: string): [string, string] {
  const pairs: [string, string][] = [
    [COLORS.forest, COLORS.forestDeep],
    [COLORS.forestDeep, '#0A1F12'],
  ];
  return pairs[name.charCodeAt(0) % pairs.length]!;
}

type Props = {
  name: string;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  gradient?: [string, string];
  showUnread?: boolean;
};

export default function GenoInboxAvatar({
  name,
  avatarUrl,
  photoUrl,
  gradient,
  showUnread,
}: Props) {
  const url = avatarUrl?.trim() || photoUrl?.trim();
  const size = INBOX.avatarSize;

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={INBOX.colors.borderGradient}
        style={[styles.ring, { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 }]}
      >
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
      </LinearGradient>
      {showUnread ? (
        <LinearGradient colors={INBOX.colors.goldBtn} style={styles.unread}>
          <View style={styles.unreadDot} />
        </LinearGradient>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  ring: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    overflow: 'hidden',
    backgroundColor: COLORS.mint,
  },
  fallback: {
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 17,
    color: COLORS.gold,
  },
  unread: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.forestDeep,
  },
});
