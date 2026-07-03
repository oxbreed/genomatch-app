import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DiscoverInterestChips from '../discover/DiscoverInterestChips';
import LifestyleBadges from '../LifestyleBadges';
import PresenceBadge from '../PresenceBadge';
import { COLORS, RELATIONSHIP_GOAL_LABELS } from '../../data/mockData';
import { TYPOGRAPHY } from '../../theme';
import type { ProfilePronoun } from '../../lib/profilePronouns';
import type { PresenceState } from '../../types/database';
import { PROFILE, PROFILE_TYPE } from './profileTokens';

type Props = {
  pronouns?: ProfilePronoun | '';
  bio: string;
  interests: string[];
  relationshipGoal: string;
  presenceState?: PresenceState;
  isNewMember?: boolean;
  drinkingStatus?: string | null;
  smokingStatus?: string | null;
  educationStatus?: string | null;
  heightCm?: number | null;
  religion?: string | null;
};

function SectionBlock({
  label,
  children,
  showDivider,
}: {
  label: string;
  children: ReactNode;
  showDivider?: boolean;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      {children}
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

export default function ProfileViewSections({
  pronouns = '',
  bio,
  interests,
  relationshipGoal,
  presenceState,
  isNewMember,
  drinkingStatus,
  smokingStatus,
  educationStatus,
  heightCm,
  religion,
}: Props) {
  const goalLabel =
    RELATIONSHIP_GOAL_LABELS[relationshipGoal] ?? (relationshipGoal || 'Not set');
  const hasLifestyle = !!(drinkingStatus || smokingStatus || educationStatus || heightCm || religion);
  const showPresence =
    (presenceState && presenceState !== 'offline') || isNewMember;
  return (
    <View style={styles.wrap}>
      <SectionBlock label="Identity" showDivider>
        <View style={styles.identityRow}>
          <Text style={styles.identityLabel}>Pronouns</Text>
          <Text style={[styles.identityValue, !pronouns && styles.placeholder]}>
            {pronouns || 'Not set'}
          </Text>
        </View>
      </SectionBlock>

      {showPresence ? (
        <SectionBlock label="Status" showDivider>
          <PresenceBadge
            presenceState={presenceState ?? 'offline'}
            isNewMember={isNewMember}
          />
        </SectionBlock>
      ) : null}

      {hasLifestyle ? (
        <SectionBlock label="Lifestyle" showDivider>
          <LifestyleBadges
            drinkingStatus={drinkingStatus}
            smokingStatus={smokingStatus}
            educationStatus={educationStatus}
            heightCm={heightCm}
            religion={religion}
          />
        </SectionBlock>
      ) : null}

      <SectionBlock label="Bio" showDivider>
        <Text style={[styles.bioText, !bio && styles.placeholder]}>
          {bio || 'Add a bio to tell matches about yourself.'}
        </Text>
      </SectionBlock>

      <SectionBlock label="Interests" showDivider>
        {interests.length > 0 ? (
          <DiscoverInterestChips interests={interests} selectable />
        ) : (
          <Text style={styles.emptyHint}>No interests yet</Text>
        )}
      </SectionBlock>

      <SectionBlock label="Looking for">
        <View style={styles.goalPill}>
          <Text style={styles.goalText}>{goalLabel}</Text>
        </View>
      </SectionBlock>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: PROFILE.sectionGap },
  block: { gap: 8 },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
  },
  identityLabel: {
    ...PROFILE_TYPE.bodyMedium,
    color: COLORS.sage,
  },
  identityValue: {
    ...PROFILE_TYPE.body,
    color: COLORS.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    marginTop: 16,
    height: 1,
    backgroundColor: COLORS.border,
  },
  blockLabel: {
    ...TYPOGRAPHY.sectionLabelGold,
  },
  bioText: {
    ...TYPOGRAPHY.editorialBio,
    color: COLORS.text,
  },
  placeholder: {
    ...TYPOGRAPHY.editorialBio,
    color: COLORS.textMuted,
  },
  goalPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.chipFill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  emptyHint: {
    ...PROFILE_TYPE.bodyMedium,
    color: COLORS.textMuted,
  },
  goalText: {
    ...PROFILE_TYPE.goal,
    color: COLORS.text,
  },
});
