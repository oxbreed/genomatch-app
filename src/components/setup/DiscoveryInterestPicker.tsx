import { StyleSheet, View } from 'react-native';
import {
  DISCOVERY_INTEREST_OPTIONS,
  type DiscoveryInterest,
} from '../../lib/discoveryInterest';
import ProfileMirrorChip from '../profile/ProfileMirrorChip';

type Props = {
  selected: DiscoveryInterest[];
  onToggle: (option: DiscoveryInterest) => void;
  compact?: boolean;
};

export default function DiscoveryInterestPicker({ selected, onToggle, compact = false }: Props) {
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {DISCOVERY_INTEREST_OPTIONS.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <ProfileMirrorChip
            key={option.id}
            label={option.label}
            selected={isSelected}
            onPress={() => onToggle(option.id)}
            pill
            style={compact ? styles.chipCompact : styles.chip}
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
  rowCompact: {
    gap: 8,
  },
  chip: {
    minWidth: '47%',
    flexGrow: 1,
  },
  chipCompact: {
    minWidth: '45%',
    flexGrow: 1,
  },
});
