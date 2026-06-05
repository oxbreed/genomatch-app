import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RELATIONSHIP_GOAL_LABELS } from '../../data/mockData';
import { PROFILE } from './profileTokens';

type Props = {
  bio: string;
  interests: string[];
  relationshipGoal: string;
};

export default function ProfileViewSections({ bio, interests, relationshipGoal }: Props) {
  const goalLabel =
    RELATIONSHIP_GOAL_LABELS[relationshipGoal] ?? (relationshipGoal || 'Not set');

  return (
    <View style={styles.wrap}>
      <Text style={styles.bioText}>
        {bio || 'Add a bio in Edit to tell matches your story.'}
      </Text>

      {interests.length > 0 ? (
        <View style={styles.chipRow}>
          {interests.map((interest) => (
            <LinearGradient
              key={interest}
              colors={['rgba(237, 243, 238, 0.95)', 'rgba(212, 168, 67, 0.12)']}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{interest}</Text>
            </LinearGradient>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyHint}>No interests yet — add them in Edit</Text>
      )}

      <LinearGradient
        colors={['rgba(212, 168, 67, 0.28)', 'rgba(61, 122, 82, 0.15)']}
        style={styles.goalPill}
      >
        <Text style={styles.goalText}>{goalLabel}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  bioText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: PROFILE.bodySize,
    lineHeight: 23,
    color: COLORS.forestDeep,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.15)',
  },
  chipText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forest,
  },
  emptyHint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.textMuted,
  },
  goalPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  goalText: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 18,
    color: COLORS.forestDeep,
  },
});
