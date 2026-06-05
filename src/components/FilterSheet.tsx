import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoBondMark } from '../brand';
import { COLORS } from '../theme';
import {
  DEFAULT_DISCOVERY_FILTERS,
  applyDiscoveryFilters,
  countActiveDiscoveryFilters,
  hasActiveDiscoveryFilters,
  normalizeDiscoveryFilters,
  type DiscoveryFilters,
} from './FilterSheet.logic';
import type { DiscoveryProfile } from '../types/database';

export type { DiscoveryFilters };
export {
  DEFAULT_DISCOVERY_FILTERS,
  applyDiscoveryFilters,
  countActiveDiscoveryFilters,
  hasActiveDiscoveryFilters,
  normalizeDiscoveryFilters,
};

const RELATIONSHIP_OPTIONS: {
  id: DiscoveryFilters['relationshipGoal'];
  label: string;
}[] = [
  { id: 'any', label: 'Any' },
  { id: 'marriage', label: 'Marriage' },
  { id: 'serious', label: 'Serious' },
  { id: 'casual', label: 'Casual' },
  { id: 'friendship', label: 'Friendship' },
];

type FilterSheetProps = {
  visible: boolean;
  filters: DiscoveryFilters;
  previewProfiles?: DiscoveryProfile[];
  onClose: () => void;
  onApply: (filters: DiscoveryFilters) => void;
};

export default function FilterSheet({
  visible,
  filters,
  previewProfiles = [],
  onClose,
  onApply,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<DiscoveryFilters>(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const previewCount = useMemo(
    () => applyDiscoveryFilters(previewProfiles, draft).length,
    [draft, previewProfiles]
  );

  const activeCount = countActiveDiscoveryFilters(draft);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <LinearGradient
            colors={['rgba(212, 168, 67, 0.35)', 'rgba(61, 122, 82, 0.2)']}
            style={styles.sheetBorder}
          >
            <View style={styles.sheetInner}>
              <View style={styles.handle} />
              <View style={styles.headerRow}>
                <GenoBondMark size={28} opacity={0.9} />
                <View style={styles.headerCopy}>
                  <Text style={styles.sheetKicker}>DISCOVER</Text>
                  <Text style={styles.sheetTitle}>Refine your stack</Text>
                </View>
                {activeCount > 0 ? (
                  <View style={styles.countPill}>
                    <Text style={styles.countText}>{activeCount}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.previewBar}>
                <Ionicons name="people-outline" size={18} color={COLORS.forest} />
                <Text style={styles.previewText}>
                  {previewCount} profile{previewCount === 1 ? '' : 's'} match these filters
                </Text>
              </View>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionLabel}>Genotype compatibility</Text>
                <View style={styles.toggleRow}>
                  {(['all', 'high'] as const).map((mode) => (
                    <Pressable
                      key={mode}
                      style={[
                        styles.toggleChip,
                        draft.compatibilityMode === mode && styles.toggleChipActive,
                      ]}
                      onPress={() => setDraft((d) => ({ ...d, compatibilityMode: mode }))}
                    >
                      <Text
                        style={[
                          styles.toggleChipText,
                          draft.compatibilityMode === mode && styles.toggleChipTextActive,
                        ]}
                      >
                        {mode === 'all' ? 'Show all' : 'High only (75%+)'}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.verifyRow}>
                  <View style={styles.verifyCopy}>
                    <Text style={styles.sectionLabel}>Verified members only</Text>
                    <Text style={styles.verifyHint}>
                      Show profiles that confirmed their genotype
                    </Text>
                  </View>
                  <Switch
                    value={draft.verifiedOnly}
                    onValueChange={(verifiedOnly) => setDraft((d) => ({ ...d, verifiedOnly }))}
                    trackColor={{ false: COLORS.border, true: COLORS.sage }}
                    thumbColor={draft.verifiedOnly ? COLORS.gold : COLORS.white}
                  />
                </View>

                <Text style={styles.sectionLabel}>City</Text>
                <TextInput
                  style={styles.textInput}
                  value={draft.city}
                  onChangeText={(city) => setDraft((d) => ({ ...d, city }))}
                  placeholder="e.g. Lagos, Abuja"
                  placeholderTextColor={COLORS.textSubtle}
                  autoCapitalize="words"
                />

                <Text style={styles.sectionLabel}>Age range</Text>
                <View style={styles.ageRow}>
                  <TextInput
                    style={[styles.textInput, styles.ageInput]}
                    value={draft.minAge}
                    onChangeText={(minAge) =>
                      setDraft((d) => ({ ...d, minAge: minAge.replace(/[^0-9]/g, '') }))
                    }
                    placeholder="Min"
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
                    placeholder="Max"
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
                style={({ pressed }) => [styles.applyWrap, pressed && styles.pressed]}
                onPress={() => {
                  onApply(normalizeDiscoveryFilters(draft));
                  onClose();
                }}
              >
                <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.applyBtn}>
                  <Text style={styles.applyBtnText}>Apply filters</Text>
                </LinearGradient>
              </Pressable>
              <Pressable style={styles.resetBtn} onPress={() => onApply(DEFAULT_DISCOVERY_FILTERS)}>
                <Text style={styles.resetBtnText}>Reset all</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 40, 24, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
  },
  sheetBorder: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 2,
  },
  sheetInner: {
    backgroundColor: COLORS.linen,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(13, 40, 24, 0.15)',
    marginTop: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerCopy: { flex: 1, gap: 2 },
  sheetKicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.gold,
  },
  sheetTitle: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 22,
    color: COLORS.forestDeep,
    letterSpacing: -0.3,
  },
  countPill: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 8,
  },
  previewText: {
    flex: 1,
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: COLORS.forest,
  },
  scroll: { maxHeight: 380 },
  scrollContent: { paddingBottom: 8 },
  sectionLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.sage,
    marginTop: 12,
    marginBottom: 8,
  },
  toggleRow: { gap: 8 },
  toggleChip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  toggleChipActive: {
    borderColor: 'rgba(212, 168, 67, 0.55)',
    backgroundColor: 'rgba(212, 168, 67, 0.15)',
  },
  toggleChipText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.textMuted,
  },
  toggleChipTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forestDeep,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 8,
  },
  verifyCopy: { flex: 1, paddingRight: 12 },
  verifyHint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.textSubtle,
    marginTop: -4,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(13, 40, 24, 0.12)',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ageInput: { flex: 1 },
  ageDash: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: COLORS.textSubtle,
  },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  goalChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
  },
  goalChipText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: COLORS.textMuted,
  },
  goalChipTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forestDeep,
  },
  applyWrap: { marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  applyBtn: { paddingVertical: 15, alignItems: 'center' },
  applyBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  resetBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 8 },
  resetBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: COLORS.forest,
  },
  pressed: { opacity: 0.92 },
});
