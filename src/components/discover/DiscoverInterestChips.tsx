import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ProfileMirrorChip from '../profile/ProfileMirrorChip';

type Props = {
  interests: string[];
  /** Read-only display vs tap-to-highlight */
  selectable?: boolean;
};

export default function DiscoverInterestChips({ interests, selectable = false }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (interest: string) => {
    if (!selectable) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(interest)) next.delete(interest);
      else next.add(interest);
      return next;
    });
  };

  return (
    <View style={styles.row}>
      {interests.map((interest) => {
        const on = selectable && selected.has(interest);
        return (
          <ProfileMirrorChip
            key={interest}
            label={interest}
            selected={on}
            onPress={() => toggle(interest)}
            pill
            style={styles.chip}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexGrow: 0,
  },
});
