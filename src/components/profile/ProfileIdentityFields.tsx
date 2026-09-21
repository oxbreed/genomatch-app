import { StyleSheet, Text, View } from 'react-native';
import { GenoMirrorMetallicIcon, GenoMirrorRimFrame, GenoMirrorSteelFill } from '../../brand/graphics';
import { PROFILE_PRONOUNS, type ProfilePronoun } from '../../lib/profilePronouns';
import { COLORS } from '../../theme';
import { PROFILE_TYPE } from './profileTokens';
import ProfileMirrorChip from './ProfileMirrorChip';

type Props = {
  pronouns: ProfilePronoun | '';
  onSelectPronouns: (value: ProfilePronoun) => void;
};

export default function ProfileIdentityFields({ pronouns, onSelectPronouns }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.fieldHeader}>
        <GenoMirrorRimFrame kind="gold" borderRadius={18} padding={1.5}>
          <GenoMirrorSteelFill style={styles.iconRing}>
            <GenoMirrorMetallicIcon name="person" size={16} tone="gold" />
          </GenoMirrorSteelFill>
        </GenoMirrorRimFrame>
        <View style={styles.fieldCopy}>
          <Text style={styles.label}>Pronouns</Text>
          <Text style={styles.hint}>How you appear on your profile and to matches.</Text>
        </View>
      </View>

      <View style={styles.pronounGrid}>
        {PROFILE_PRONOUNS.map((option) => (
          <ProfileMirrorChip
            key={option}
            label={option}
            selected={pronouns === option}
            onPress={() => onSelectPronouns(option)}
            style={styles.pronounCell}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconRing: {
    width: 36,
    height: 36,
    borderRadius: 16.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldCopy: { flex: 1, gap: 2 },
  label: {
    ...PROFILE_TYPE.sectionTitle,
    color: COLORS.ink,
  },
  hint: {
    ...PROFILE_TYPE.sectionHint,
    color: COLORS.hero,
  },
  pronounGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pronounCell: {
    minWidth: '30%',
    flexGrow: 1,
  },
});
