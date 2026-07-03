import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  GenoGlassSurface,
  GenoMirrorGoldFill,
  GenoMirrorRimFrame,
} from '../../brand/graphics';
import GenoInboxAvatar from './GenoInboxAvatar';
import { isRecentMatch } from '../matches/MatchListCard';
import { FONT_FAMILY, COLORS, LOGO_GOLD, RADIUS } from '../../theme';
import type { MatchWithProfile } from '../../types/database';

type Props = {
  matches: MatchWithProfile[];
  onOpenMatch: (match: MatchWithProfile) => void;
};

export default function GenoInboxMatchStrip({ matches, onOpenMatch }: Props) {
  if (matches.length === 0) return null;

  return (
    <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.lg} style={styles.wrap}>
      <GenoGlassSurface
        variant="dark"
        borderRadius={RADIUS.lg - 1.5}
        showBorder={false}
        showSheen
        showTopRule
        shadow="none"
        intensity={32}
        contentStyle={styles.inner}
      >
        <Text style={styles.label}>New matches</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {matches.map((item) => {
            const isNew = isRecentMatch(item.matchedAt);
            return (
              <Pressable
                key={item.matchId}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                onPress={() => onOpenMatch(item)}
                accessibilityLabel={`Open ${item.profile.name}`}
              >
                <GenoInboxAvatar
                  name={item.profile.name}
                  avatarUrl={item.profile.avatarUrl}
                  photoUrl={item.profile.photos[0]}
                  gradient={item.profile.gradient}
                  presenceState={item.profile.presenceState}
                />
                <Text style={styles.name} numberOfLines={1}>
                  {item.profile.name.split(' ')[0]}
                </Text>
                {isNew ? (
                  <GenoMirrorRimFrame kind="gold" borderRadius={6} padding={1} style={styles.newDot}>
                    <GenoMirrorGoldFill style={styles.newDotFill}>
                      <View style={styles.newDotInner} />
                    </GenoMirrorGoldFill>
                  </GenoMirrorRimFrame>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </GenoGlassSurface>
    </GenoMirrorRimFrame>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    alignSelf: 'stretch',
    width: 'auto',
  },
  inner: {
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10,
  },
  label: {
    paddingHorizontal: 14,
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: LOGO_GOLD,
  },
  scroll: {
    paddingHorizontal: 10,
    gap: 14,
  },
  chip: {
    width: 68,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  chipPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  name: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
    maxWidth: 68,
  },
  newDot: {
    position: 'absolute',
    top: 0,
    right: 6,
  },
  newDotFill: {
    width: 12,
    height: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  newDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.text,
  },
});
