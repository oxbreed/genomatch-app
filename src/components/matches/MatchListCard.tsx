import { StyleSheet, Text, View } from 'react-native';
import {
  GenoInboxAvatar,
  GenoInboxCardShell,
  GenoInboxIconButton,
  INBOX,
} from '../inbox';
import { COLORS } from '../../theme';
import type { MatchWithProfile } from '../../types/database';
import type { Genotype } from '../../types/database';
import VerifiedBadge from '../VerifiedBadge';
import { getGenotypeRiskShort } from '../../lib/compatibility';

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

  return (
    <GenoInboxCardShell
      onPressBody={onOpenProfile}
      avatar={
        <GenoInboxAvatar
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          photoUrl={profile.photos[0]}
          gradient={profile.gradient}
        />
      }
      body={
        <>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.name}
            </Text>
                <View style={styles.genotypePill}>
                  <Text style={styles.genotypeText}>{profile.genotype}</Text>
                </View>
                {profile.genotypeVerified ? <VerifiedBadge compact /> : null}
            <Text style={[styles.pct, compatHigh && styles.pctHigh]}>
              {profile.compatibility}%
            </Text>
          </View>
          <Text style={styles.summary} numberOfLines={1}>
            {riskShort}
            {profile.city ? ` · ${profile.city}` : ''}
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
  },
  name: {
    flexShrink: 1,
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: INBOX.nameSize,
    color: COLORS.forestDeep,
    letterSpacing: -0.2,
  },
  genotypePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.12)',
  },
  genotypeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: INBOX.badgeSize,
    letterSpacing: 0.4,
    color: COLORS.forestDeep,
  },
  pct: {
    fontFamily: 'Satoshi-Bold',
    fontSize: INBOX.pctSize,
    color: COLORS.sage,
    flexShrink: 0,
  },
  pctHigh: {
    color: COLORS.gold,
  },
  summary: {
    fontFamily: 'Satoshi-Medium',
    fontSize: INBOX.metaSize,
    lineHeight: 14,
    color: COLORS.textSubtle,
  },
});
