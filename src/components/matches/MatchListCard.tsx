import { StyleSheet, Text, View } from 'react-native';
import {
  GenoInboxAvatar,
  GenoInboxCardShell,
  GenoInboxIconButton,
  GenoInboxMirrorPill,
  INBOX,
} from '../inbox';
import { FONT_FAMILY, COLORS } from '../../theme';
import type { MatchWithProfile } from '../../types/database';
import type { Genotype } from '../../types/database';
import VerifiedBadge from '../VerifiedBadge';
import PresenceBadge from '../PresenceBadge';
import { formatLocationLine } from '../../lib/distanceBands';
import { getGenotypeRiskShort } from '../../lib/compatibility';

const NEW_MATCH_MS = 72 * 60 * 60 * 1000;

export function isRecentMatch(matchedAt: string): boolean {
  return Date.now() - new Date(matchedAt).getTime() < NEW_MATCH_MS;
}

type Props = {
  item: MatchWithProfile;
  viewerGenotype: Genotype | null;
  onOpenProfile: () => void;
  onStartChat: () => void;
  onUnmatch: () => void;
};

export default function MatchListCard({
  item,
  viewerGenotype,
  onOpenProfile,
  onStartChat,
  onUnmatch,
}: Props) {
  const { profile } = item;
  const riskShort = getGenotypeRiskShort(viewerGenotype, profile.genotype);
  const compatHigh = profile.compatibility >= 80;
  const isNew = isRecentMatch(item.matchedAt);

  return (
    <GenoInboxCardShell
      onPressBody={onOpenProfile}
      avatar={
        <GenoInboxAvatar
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          photoUrl={profile.photos[0]}
          gradient={profile.gradient}
          presenceState={profile.presenceState}
        />
      }
      body={
        <>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.name}
            </Text>
            {isNew ? (
              <GenoInboxMirrorPill label="New" kind="gold" />
            ) : null}
            <GenoInboxMirrorPill label={profile.genotype} kind="steel" />
            {profile.genotypeVerified ? <VerifiedBadge compact /> : null}
            <PresenceBadge
              presenceState={profile.presenceState}
              isNewMember={profile.isNewMember}
              compact
            />
            <GenoInboxMirrorPill
              label={`${profile.compatibility}%`}
              kind={compatHigh ? 'gold' : 'steel'}
              style={styles.compatPill}
              textStyle={compatHigh ? styles.pctHigh : styles.pct}
            />
          </View>
          <Text style={styles.summary} numberOfLines={1}>
            {riskShort}
            {profile.city
              ? ` · ${formatLocationLine(profile.city, profile.distanceBand)}`
              : ''}
          </Text>
        </>
      }
      actions={
        <>
          <GenoInboxIconButton
            icon="chatbubble"
            variant="gold"
            onPress={onStartChat}
            accessibilityLabel={`Chat with ${profile.name}`}
          />
          <GenoInboxIconButton
            icon="heart-dislike-outline"
            variant="unmatch"
            onPress={onUnmatch}
            accessibilityLabel={`Unmatch ${profile.name}`}
          />
        </>
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
  compatPill: {
    marginLeft: 'auto',
  },
  pct: {
    fontSize: INBOX.pctSize,
    color: COLORS.textMuted,
  },
  pctHigh: {
    fontSize: INBOX.pctSize,
    color: COLORS.text,
  },
  summary: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: INBOX.metaSize + 1,
    lineHeight: 16,
    color: COLORS.textSubtle,
  },
});
