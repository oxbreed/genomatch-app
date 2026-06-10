import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LifestyleBadges from '../LifestyleBadges';
import PresenceBadge from '../PresenceBadge';
import { COLORS, RELATIONSHIP_GOAL_LABELS } from '../../data/mockData';
import type { PresenceState } from '../../types/database';
import { PROFILE, PROFILE_TYPE } from './profileTokens';

type Props = {
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
          {bio || 'Add a bio in Profile Studio to tell matches your story.'}
        </Text>
      </SectionBlock>

      <SectionBlock label="Interests" showDivider>
        {interests.length > 0 ? (
          <View style={styles.chipRow}>
            {interests.map((interest) => (
              <View key={interest} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))}
          </View>
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
  divider: {
    marginTop: 16,
    height: 1,
    backgroundColor: COLORS.border,
  },
  blockLabel: {
    ...PROFILE_TYPE.blockLabel,
    color: COLORS.sage,
  },
  bioText: {
    ...PROFILE_TYPE.body,
    color: COLORS.forestDeep,
  },
  placeholder: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
    fontFamily: PROFILE_TYPE.body.fontFamily,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(143, 175, 149, 0.45)',
  },
  chipText: {
    ...PROFILE_TYPE.chip,
    color: COLORS.forestDeep,
  },
  emptyHint: {
    ...PROFILE_TYPE.bodyMedium,
    color: COLORS.textMuted,
  },
  goalPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.22)',
  },
  goalText: {
    ...PROFILE_TYPE.goal,
    color: COLORS.forestDeep,
  },
});
