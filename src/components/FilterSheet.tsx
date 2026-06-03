import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS } from '../theme';

export type DiscoveryFilters = {
  compatibilityMode: 'all' | 'high';
  city: string;
  minAge: string;
  maxAge: string;
  relationshipGoal: 'any' | 'marriage' | 'serious' | 'casual';
};

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
  compatibilityMode: 'all',
  city: '',
  minAge: '',
  maxAge: '',
  relationshipGoal: 'any',
};

export function hasActiveDiscoveryFilters(filters: DiscoveryFilters): boolean {
  return (
    filters.compatibilityMode === 'high' ||
    filters.city.trim().length > 0 ||
    filters.minAge.trim().length > 0 ||
    filters.maxAge.trim().length > 0 ||
    filters.relationshipGoal !== 'any'
  );
}

const RELATIONSHIP_OPTIONS: {
  id: DiscoveryFilters['relationshipGoal'];
  label: string;
}[] = [
  { id: 'any', label: 'Any' },
  { id: 'marriage', label: 'Marriage' },
  { id: 'serious', label: 'Serious' },
  { id: 'casual', label: 'Casual' },
];

type FilterSheetProps = {
  visible: boolean;
  filters: DiscoveryFilters;
  onClose: () => void;
  onApply: (filters: DiscoveryFilters) => void;
};

function clampAge(value: string): string {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return '';
  return String(Math.min(65, Math.max(18, n)));
}

function normalizeFilters(draft: DiscoveryFilters): DiscoveryFilters {
  let minAge = draft.minAge.trim() ? clampAge(draft.minAge.trim()) : '';
  let maxAge = draft.maxAge.trim() ? clampAge(draft.maxAge.trim()) : '';

  if (minAge && maxAge && parseInt(minAge, 10) > parseInt(maxAge, 10)) {
    [minAge, maxAge] = [maxAge, minAge];
  }

  return {
    compatibilityMode: draft.compatibilityMode,
    city: draft.city.trim(),
    minAge,
    maxAge,
    relationshipGoal: draft.relationshipGoal,
  };
}

export default function FilterSheet({
  visible,
  filters,
  onClose,
  onApply,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<DiscoveryFilters>(filters);

  useEffect(() => {
    if (visible) {
      setDraft(filters);
    }
  }, [visible, filters]);

  const handleClose = () => {
    onClose();
  };

  const handleApply = () => {
    onApply(normalizeFilters(draft));
    onClose();
  };

  const handleReset = () => {
    onApply(DEFAULT_DISCOVERY_FILTERS);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Filters</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>Genotype compatibility</Text>
            <View style={styles.toggleRow}>
              <Pressable
                style={[
                  styles.toggleChip,
                  draft.compatibilityMode === 'all' && styles.toggleChipActive,
                ]}
                onPress={() => setDraft((d) => ({ ...d, compatibilityMode: 'all' }))}
              >
                <Text
                  style={[
                    styles.toggleChipText,
                    draft.compatibilityMode === 'all' && styles.toggleChipTextActive,
                  ]}
                >
                  Show all
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleChip,
                  draft.compatibilityMode === 'high' && styles.toggleChipActive,
                ]}
                onPress={() => setDraft((d) => ({ ...d, compatibilityMode: 'high' }))}
              >
                <Text
                  style={[
                    styles.toggleChipText,
                    draft.compatibilityMode === 'high' && styles.toggleChipTextActive,
                  ]}
                >
                  High compatibility only (75%+)
                </Text>
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>City</Text>
            <TextInput
              style={styles.textInput}
              value={draft.city}
              onChangeText={(city) => setDraft((d) => ({ ...d, city }))}
              placeholder="Filter by city name"
              placeholderTextColor={COLORS.textSubtle}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Text style={styles.sectionLabel}>Age range</Text>
            <View style={styles.ageRow}>
              <TextInput
                style={[styles.textInput, styles.ageInput]}
                value={draft.minAge}
                onChangeText={(minAge) =>
                  setDraft((d) => ({ ...d, minAge: minAge.replace(/[^0-9]/g, '') }))
                }
                placeholder="Min (18)"
                placeholderTextColor={COLORS.textSubtle}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.ageDash}>–</Text>
              <TextInput
                style={[styles.textInput, styles.ageInput]}
                value={draft.maxAge}
                onChangeText={(maxAge) =>
                  setDraft((d) => ({ ...d, maxAge: maxAge.replace(/[^0-9]/g, '') }))
                }
                placeholder="Max (65)"
                placeholderTextColor={COLORS.textSubtle}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <Text style={styles.sectionLabel}>Relationship goal</Text>
            <View style={styles.goalRow}>
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.goalChip,
                    draft.relationshipGoal === opt.id && styles.goalChipActive,
                  ]}
                  onPress={() => setDraft((d) => ({ ...d, relationshipGoal: opt.id }))}
                >
                  <Text
                    style={[
                      styles.goalChipText,
                      draft.relationshipGoal === opt.id && styles.goalChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Pressable
            style={({ pressed }) => [styles.applyBtn, pressed && styles.applyBtnPressed]}
            onPress={handleApply}
          >
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </Pressable>
          <Pressable style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 40, 24, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.linen,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(13, 40, 24, 0.2)',
    marginTop: 10,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.sage,
    marginTop: 14,
    marginBottom: 8,
  },
  toggleRow: {
    gap: 8,
  },
  toggleChip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  toggleChipActive: {
    borderColor: COLORS.forest,
    backgroundColor: 'rgba(143, 175, 149, 0.35)',
  },
  toggleChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  toggleChipTextActive: {
    color: COLORS.forest,
    fontWeight: '700',
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(13, 40, 24, 0.12)',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.forest,
    fontWeight: '500',
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ageInput: {
    flex: 1,
  },
  ageDash: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSubtle,
  },
  goalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  goalChipActive: {
    borderColor: COLORS.forest,
    backgroundColor: COLORS.gold,
  },
  goalChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  goalChipTextActive: {
    color: COLORS.forest,
    fontWeight: '700',
  },
  applyBtn: {
    marginTop: 16,
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyBtnPressed: {
    opacity: 0.9,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.forest,
  },
  resetBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.forest,
  },
});
