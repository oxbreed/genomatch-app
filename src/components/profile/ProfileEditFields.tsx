import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GenoHelixField, GenoMirrorRimFrame } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, GLASS, TYPOGRAPHY } from '../../theme';
import ProfileMirrorChip from './ProfileMirrorChip';

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
  const [bioFocused, setBioFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <View style={styles.pattern} pointerEvents="none">
        <GenoHelixField width={140} height={56} opacity={0.1} />
      </View>

      {!hideHint && (showBio || showInterests) ? (
        <Text style={styles.hint}>Help matches understand who you are.</Text>
      ) : null}

      {showBio ? (
        <>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Bio</Text>
            <Text style={[styles.counter, bio.length >= 450 && styles.counterWarn]}>
              {bio.length}/500
            </Text>
          </View>
          <GenoMirrorRimFrame kind={bioFocused ? 'gold' : 'steel'} borderRadius={14} style={styles.inputRim}>
            <View style={styles.bioShell}>
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={onChangeBio}
                multiline
                textAlignVertical="top"
                maxLength={500}
                placeholder="Tell matches about you, your interests, and what you are looking for."
                placeholderTextColor={COLORS.textSubtle}
                onFocus={() => setBioFocused(true)}
                onBlur={() => setBioFocused(false)}
              />
            </View>
          </GenoMirrorRimFrame>
        </>
      ) : null}

      {showInterests ? (
        <>
          <Text style={[styles.label, styles.labelSpaced]}>Interests</Text>
          <View style={styles.chipRow}>
            {INTEREST_PRESETS.map((item) => (
              <ProfileMirrorChip
                key={item}
                label={item}
                selected={interests.includes(item)}
                onPress={() => onToggleInterest(item)}
                pill
              />
            ))}
          </View>
        </>
      ) : null}

      {showGoals ? (
        <>
          <Text style={[styles.label, styles.labelSpaced]}>Relationship goal</Text>
          <View style={styles.goalRow}>
            {GOALS.map((g) => (
              <ProfileMirrorChip
                key={g.id}
                label={g.label}
                selected={relationshipGoal === g.id}
                onPress={() => onSelectGoal(g.id)}
                style={styles.goalChipWrap}
              />
            ))}
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
    ...TYPOGRAPHY.helper,
    marginBottom: 8,
  },
  label: {
    ...TYPOGRAPHY.sectionLabelGold,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  counter: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
  },
  counterWarn: {
    color: COLORS.brandRed,
    fontFamily: FONT_FAMILY.gothamBold,
  },
  labelSpaced: { marginTop: 14, marginBottom: 8 },
  inputRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  bioShell: {
    backgroundColor: GLASS.insetFill,
    borderRadius: 12.5,
    overflow: 'hidden',
  },
  bioInput: {
    minHeight: 100,
    padding: 14,
    ...TYPOGRAPHY.editorialBio,
    color: COLORS.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChipWrap: {
    minWidth: '46%',
    flexGrow: 1,
  },
});
