import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_FAMILY, COLORS } from '../theme';
import type { PresenceState } from '../types/database';

type Props = {
  presenceState: PresenceState;
  isNewMember?: boolean;
  compact?: boolean;
  dark?: boolean;
};

const PRESENCE_CONFIG: Record<
  Exclude<PresenceState, 'offline'>,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; border: string }
> = {
  online: {
    label: 'Online',
    icon: 'radio-button-on',
    color: '#2E8B57',
    bg: 'rgba(46, 139, 87, 0.18)',
    border: 'rgba(46, 139, 87, 0.35)',
  },
  recently_online: {
    label: 'Recently online',
    icon: 'time-outline',
    color: COLORS.sage,
    bg: 'rgba(143, 175, 149, 0.18)',
    border: 'rgba(143, 175, 149, 0.35)',
  },
};

export function PresenceDot({
  presenceState,
  size = 12,
}: {
  presenceState: PresenceState;
  size?: number;
}) {
  if (presenceState === 'offline') return null;

  const color = presenceState === 'online' ? '#3DDC84' : COLORS.sage;

  return (
    <View
      style={[
        styles.dotRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.dotInner,
          {
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export function NewMemberBadge({ compact, dark }: { compact?: boolean; dark?: boolean }) {
  if (compact) {
    return (
      <View style={[styles.newCompact, dark && styles.newCompactDark]}>
        <Ionicons name="sparkles" size={10} color={dark ? COLORS.gold : COLORS.forestDeep} />
      </View>
    );
  }

  return (
    <View style={[styles.newBadge, dark && styles.newBadgeDark]}>
      <Ionicons name="sparkles" size={11} color={dark ? COLORS.gold : COLORS.forestDeep} />
      <Text style={[styles.newText, dark && styles.newTextDark]}>New</Text>
    </View>
  );
}

export default function PresenceBadge({
  presenceState,
  isNewMember = false,
  compact,
  dark,
}: Props) {
  const showPresence = presenceState !== 'offline';
  if (!showPresence && !isNewMember) return null;

  return (
    <View style={styles.row}>
      {showPresence ? (
        compact ? (
          <PresenceDot presenceState={presenceState} size={10} />
        ) : (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: PRESENCE_CONFIG[presenceState].bg,
                borderColor: PRESENCE_CONFIG[presenceState].border,
              },
              dark && styles.badgeDark,
            ]}
          >
            {presenceState === 'online' ? (
              <View style={styles.onlineDot} />
            ) : (
              <Ionicons
                name={PRESENCE_CONFIG[presenceState].icon}
                size={11}
                color={dark ? COLORS.linen : PRESENCE_CONFIG[presenceState].color}
              />
            )}
            <Text
              style={[
                styles.text,
                { color: dark ? COLORS.linen : PRESENCE_CONFIG[presenceState].color },
              ]}
            >
              {PRESENCE_CONFIG[presenceState].label}
            </Text>
          </View>
        )
      ) : null}
      {isNewMember ? <NewMemberBadge compact={compact} dark={dark} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  text: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3DDC84',
  },
  dotRing: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  dotInner: {},
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.4)',
  },
  newBadgeDark: {
    backgroundColor: 'rgba(212, 168, 67, 0.28)',
    borderColor: 'rgba(212, 168, 67, 0.5)',
  },
  newText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 0.3,
    color: COLORS.forestDeep,
  },
  newTextDark: {
    color: COLORS.gold,
  },
  newCompact: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  newCompactDark: {
    backgroundColor: 'rgba(212, 168, 67, 0.28)',
    borderColor: 'rgba(212, 168, 67, 0.45)',
  },
});
