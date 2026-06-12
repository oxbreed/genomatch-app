import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  EDUCATION_LABELS,
  HABIT_LABELS,
  RELIGION_LABELS,
  formatHeightCm,
} from '../lib/profileDetails';
import { FONT_FAMILY, COLORS, GLASS } from '../theme';

type LifestyleItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

type Props = {
  drinkingStatus?: string | null;
  smokingStatus?: string | null;
  educationStatus?: string | null;
  heightCm?: number | null;
  religion?: string | null;
  compact?: boolean;
  dark?: boolean;
};

function buildItems(props: Props): LifestyleItem[] {
  const items: LifestyleItem[] = [];

  const height = formatHeightCm(props.heightCm);
  if (height) items.push({ icon: 'resize-outline', label: height });

  if (props.religion) {
    items.push({
      icon: 'sparkles-outline',
      label: RELIGION_LABELS[props.religion] ?? props.religion,
    });
  }

  if (props.drinkingStatus) {
    items.push({
      icon: 'wine-outline',
      label: HABIT_LABELS[props.drinkingStatus] ?? props.drinkingStatus,
    });
  }

  if (props.smokingStatus) {
    items.push({
      icon: 'cloud-outline',
      label: HABIT_LABELS[props.smokingStatus] ?? props.smokingStatus,
    });
  }

  if (props.educationStatus) {
    items.push({
      icon: 'school-outline',
      label: EDUCATION_LABELS[props.educationStatus] ?? props.educationStatus,
    });
  }

  return items;
}

export default function LifestyleBadges(props: Props) {
  const items = buildItems(props);
  if (items.length === 0) return null;

  const { compact, dark } = props;

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View
          key={`${item.icon}-${item.label}`}
          style={[styles.chip, compact && styles.chipCompact, dark && styles.chipDark]}
        >
          <Ionicons
            name={item.icon}
            size={compact ? 12 : 13}
            color={dark ? COLORS.gold : COLORS.forest}
          />
          <Text
            style={[styles.label, compact && styles.labelCompact, dark && styles.labelDark]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: GLASS.insetFill,
    borderWidth: 1,
    borderColor: GLASS.insetBorder,
  },
  chipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.forestDeep,
    maxWidth: 140,
  },
  labelCompact: {
    fontSize: 11,
  },
  labelDark: {
    color: COLORS.linen,
  },
});
