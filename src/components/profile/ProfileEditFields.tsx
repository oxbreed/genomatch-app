import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoHelixField } from '../../brand/graphics';
import { FONT_FAMILY, COLORS } from '../../theme';
import { PROFILE } from './profileTokens';

const INTEREST_PRESETS = [
  'Travel',
  'Music',
  'Movies',
  'Fitness',
  'Food',
  'Fashion',
  'Reading',
  'Art',
  'Tech',
  'Faith',
];

const GOALS: { id: string; label: string }[] = [
  { id: 'marriage', label: 'Marriage' },
  { id: 'serious', label: 'Serious' },
  { id: 'casual', label: 'Casual' },
  { id: 'friendship', label: 'Friendship' },
];

type Props = {
  bio: string;
  interests: string[];
  relationshipGoal: string;
  onChangeBio: (text: string) => void;
  onToggleInterest: (interest: string) => void;
  onSelectGoal: (goal: string) => void;
  showBio?: boolean;
  showInterests?: boolean;
  showGoals?: boolean;
  hideHint?: boolean;
};

export default function ProfileEditFields({
  bio,
  interests,
  relationshipGoal,
  onChangeBio,
  onToggleInterest,
  onSelectGoal,
  showBio = true,
  showInterests = true,
  showGoals = true,
  hideHint = false,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pattern} pointerEvents="none">
        <GenoHelixField width={140} height={56} opacity={0.1} />
      </View>

      {!hideHint && (showBio || showInterests) ? (
        <Text style={styles.hint}>Refine how matches see your bond profile</Text>
      ) : null}

      {showBio ? (
        <>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Bio</Text>
            <Text style={[styles.counter, bio.length >= 450 && styles.counterWarn]}>
              {bio.length}/500
            </Text>
          </View>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={onChangeBio}
            multiline
            textAlignVertical="top"
            maxLength={500}
            placeholder="Tell matches about you..."
            placeholderTextColor={COLORS.textSubtle}
          />
        </>
      ) : null}

      {showInterests ? (
        <>
          <Text style={[styles.label, styles.labelSpaced]}>Interests</Text>
          <View style={styles.chipRow}>
            {INTEREST_PRESETS.map((item) => {
              const active = interests.includes(item);
              return (
                <Pressable key={item} onPress={() => onToggleInterest(item)}>
                  {active ? (
                    <LinearGradient
                      colors={[COLORS.gold, '#C49A3A']}
                      style={styles.chipActive}
                    >
                      <Text style={styles.chipTextActive}>{item}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{item}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {showGoals ? (
        <>
          <Text style={[styles.label, styles.labelSpaced]}>Relationship goal</Text>
          <View style={styles.goalRow}>
            {GOALS.map((g) => {
              const selected = relationshipGoal === g.id;
              return (
                <Pressable key={g.id} onPress={() => onSelectGoal(g.id)}>
                  {selected ? (
                    <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.goalChipActive}>
                      <Text style={styles.goalTextActive}>{g.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.goalChip}>
                      <Text style={styles.goalText}>{g.label}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, overflow: 'hidden' },
  pattern: {
    position: 'absolute',
    right: -24,
    top: -8,
  },
  hint: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.sage,
    marginBottom: 8,
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: PROFILE.sectionTitleSize,
    letterSpacing: -0.2,
    color: COLORS.forestDeep,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  counter: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.sage,
  },
  counterWarn: {
    color: COLORS.gold,
    fontFamily: FONT_FAMILY.gothamBold,
  },
  labelSpaced: { marginTop: 14, marginBottom: 8 },
  bioInput: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    backgroundColor: COLORS.white,
    padding: 14,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: PROFILE.bodySize,
    lineHeight: 22,
    color: COLORS.forest,
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
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.forest,
  },
  chipTextActive: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  goalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  goalChipActive: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  goalText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  goalTextActive: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.forestDeep,
  },
});
