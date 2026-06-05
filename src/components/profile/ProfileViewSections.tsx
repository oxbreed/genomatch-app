import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RELATIONSHIP_GOAL_LABELS } from '../../data/mockData';
import { PROFILE } from './profileTokens';

type Props = {
  bio: string;
  interests: string[];
  relationshipGoal: string;
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

export default function ProfileViewSections({ bio, interests, relationshipGoal }: Props) {
  const goalLabel =
    RELATIONSHIP_GOAL_LABELS[relationshipGoal] ?? (relationshipGoal || 'Not set');

  return (
    <View style={styles.wrap}>
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
    fontFamily: 'Satoshi-Bold',
    fontSize: PROFILE.sectionLabelSize,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.sage,
  },
  bioText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: PROFILE.bodySize,
    lineHeight: 24,
    color: COLORS.forestDeep,
  },
  placeholder: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
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
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  emptyHint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
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
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 16,
    color: COLORS.forestDeep,
    letterSpacing: -0.2,
  },
});
