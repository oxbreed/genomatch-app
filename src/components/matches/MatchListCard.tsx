import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GenoInboxAvatar,
  GenoInboxCardShell,
  GenoInboxIconButton,
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
              <View style={styles.newPill}>
                <Text style={styles.newPillText}>New</Text>
              </View>
            ) : null}
            <View style={styles.genotypePill}>
              <Text style={styles.genotypeText}>{profile.genotype}</Text>
            </View>
            {profile.genotypeVerified ? <VerifiedBadge compact /> : null}
            <PresenceBadge
              presenceState={profile.presenceState}
              isNewMember={profile.isNewMember}
              compact
            />
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
            variant="danger"
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
    color: COLORS.forestDeep,
    letterSpacing: -0.3,
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
  genotypePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.14)',
  },
  genotypeText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: INBOX.badgeSize,
    letterSpacing: 0.4,
    color: COLORS.forestDeep,
  },
  compatPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 'auto',
  },
  pct: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: INBOX.pctSize,
    color: COLORS.sage,
  },
  pctHigh: {
    color: COLORS.forestDeep,
  },
  summary: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: INBOX.metaSize + 1,
    lineHeight: 16,
    color: COLORS.textSubtle,
  },
});
