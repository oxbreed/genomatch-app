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
import { GenoBondMark } from '../brand';
import {
  GenoGlassBackdrop,
  GenoGlassSurface,
  GenoMirrorBrandCtaFill,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../brand/graphics';
import { GenoInboxCountBadge } from './inbox';
import ProfileMirrorChip from './profile/ProfileMirrorChip';
import {
  FONT_FAMILY,
  COLORS,
  GLASS,
  LOGO_GOLD,
  RADIUS,
  goldAlpha,
} from '../theme';
import { DISTANCE_BAND_FILTER_OPTIONS } from '../lib/distanceBands';
import { toggleDiscoveryInterest } from '../lib/discoveryInterest';
import DiscoveryInterestPicker from './setup/DiscoveryInterestPicker';
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
  const [interestError, setInterestError] = useState('');

  useEffect(() => {
    if (visible) {
      setDraft(filters);
      setInterestError('');
    }
  }, [visible, filters]);

  const previewCount = useMemo(
    () => applyDiscoveryFilters(previewProfiles, draft).length,
    [draft, previewProfiles]
  );

  const activeCount = countActiveDiscoveryFilters(draft);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <GenoGlassBackdrop />
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <GenoMirrorRimFrame kind="gold" borderRadius={30} style={styles.sheetRim}>
            <GenoGlassSurface
              variant="dark"
              borderRadius={28.5}
              shadow="glassElevated"
              showBorder={false}
              showSheen
              showTopRule
              intensity={58}
              style={styles.sheetGlass}
              contentStyle={styles.sheetInner}
            >
              <View style={styles.handle} />

              <GenoMirrorRimFrame kind="steel" borderRadius={18} style={styles.headerRim}>
                <GenoGlassSurface
                  variant="dark"
                  borderRadius={16.5}
                  showBorder={false}
                  showSheen
                  shadow="none"
                  intensity={36}
                  contentStyle={styles.headerRow}
                >
                  <GenoMirrorRimFrame kind="gold" borderRadius={18} padding={1.5}>
                    <GenoMirrorSteelFill style={styles.headerMark}>
                      <GenoBondMark size={24} opacity={0.92} />
                    </GenoMirrorSteelFill>
                  </GenoMirrorRimFrame>
                  <View style={styles.headerCopy}>
                    <Text style={styles.sheetKicker}>DISCOVER</Text>
                    <Text style={styles.sheetTitle}>Refine Discover</Text>
                  </View>
                  {activeCount > 0 ? <GenoInboxCountBadge count={activeCount} /> : null}
                </GenoGlassSurface>
              </GenoMirrorRimFrame>

              <GenoMirrorRimFrame kind="steel" borderRadius={14} style={styles.previewRim}>
                <GenoMirrorSteelFill style={styles.previewBar}>
                  <GenoMirrorMetallicIcon name="people-outline" size={18} tone="steel" />
                  <Text style={styles.previewText}>
                    {previewCount} profile{previewCount === 1 ? '' : 's'} match these filters
                  </Text>
                </GenoMirrorSteelFill>
              </GenoMirrorRimFrame>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionLabel}>Genotype compatibility</Text>
                <View style={styles.chipRow}>
                  {(['all', 'high'] as const).map((mode) => (
                    <ProfileMirrorChip
                      key={mode}
                      label={mode === 'all' ? 'Show all' : 'High only (75%+)'}
                      selected={draft.compatibilityMode === mode}
                      onPress={() => setDraft((d) => ({ ...d, compatibilityMode: mode }))}
                      pill
                      style={styles.chipFlex}
                    />
                  ))}
                </View>

                <GenoMirrorRimFrame kind="steel" borderRadius={14} style={styles.verifyRim}>
                  <GenoGlassSurface
                    variant="dark"
                    borderRadius={12.5}
                    showBorder={false}
                    showSheen
                    shadow="none"
                    intensity={28}
                    contentStyle={styles.verifyRow}
                  >
                    <View style={styles.verifyCopy}>
                      <Text style={styles.sectionLabelInline}>Verified members only</Text>
                      <Text style={styles.verifyHint}>
                        Only show members who verified their genotype in the app.
                      </Text>
                    </View>
                    <Switch
                      value={draft.verifiedOnly}
                      onValueChange={(verifiedOnly) => setDraft((d) => ({ ...d, verifiedOnly }))}
                      trackColor={{ false: 'rgba(255,255,255,0.12)', true: 'rgba(212,175,55,0.45)' }}
                      thumbColor={draft.verifiedOnly ? LOGO_GOLD : COLORS.textMuted}
                    />
                  </GenoGlassSurface>
                </GenoMirrorRimFrame>

                <Text style={styles.sectionLabel}>Show me</Text>
                <Text style={styles.distanceHint}>
                  Who you want to see in Discover. Women and Men can be combined; Everyone is open to all.
                </Text>
                <DiscoveryInterestPicker
                  compact
                  selected={draft.interestedIn}
                  onToggle={(option) => {
                    setInterestError('');
                    setDraft((d) => ({
                      ...d,
                      interestedIn: toggleDiscoveryInterest(d.interestedIn, option),
                    }));
                  }}
                />
                {interestError ? <Text style={styles.interestError}>{interestError}</Text> : null}

                <Text style={styles.sectionLabel}>City</Text>
                <GenoMirrorRimFrame kind="steel" borderRadius={14} style={styles.inputRim}>
                  <View style={styles.inputShell}>
                    <TextInput
                      style={styles.textInput}
                      value={draft.city}
                      onChangeText={(city) => setDraft((d) => ({ ...d, city }))}
                      placeholder="e.g. Lagos, Abuja"
                      placeholderTextColor={goldAlpha(0.35)}
                      autoCapitalize="words"
                    />
                  </View>
                </GenoMirrorRimFrame>

                <Text style={styles.sectionLabel}>Distance</Text>
                <Text style={styles.distanceHint}>
                  Approximate distance from city centers. We never show your exact location.
                </Text>
                <View style={styles.chipRow}>
                  <ProfileMirrorChip
                    label="Any"
                    selected={draft.distanceBand === 'any'}
                    onPress={() => setDraft((d) => ({ ...d, distanceBand: 'any' }))}
                    pill
                  />
                  {DISTANCE_BAND_FILTER_OPTIONS.map((opt) => (
                    <ProfileMirrorChip
                      key={opt.id}
                      label={opt.label}
                      selected={draft.distanceBand === opt.id}
                      onPress={() => setDraft((d) => ({ ...d, distanceBand: opt.id }))}
                      pill
                    />
                  ))}
                </View>

                <Text style={styles.sectionLabel}>Age range</Text>
                <View style={styles.ageRow}>
                  <GenoMirrorRimFrame kind="steel" borderRadius={14} style={styles.ageInputRim}>
                    <View style={styles.inputShell}>
                      <TextInput
                        style={styles.textInput}
                        value={draft.minAge}
                        onChangeText={(minAge) =>
                          setDraft((d) => ({ ...d, minAge: minAge.replace(/[^0-9]/g, '') }))
                        }
                        placeholder="Min"
                        placeholderTextColor={goldAlpha(0.35)}
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                    </View>
                  </GenoMirrorRimFrame>
                  <Text style={styles.ageDash}>–</Text>
                  <GenoMirrorRimFrame kind="steel" borderRadius={14} style={styles.ageInputRim}>
                    <View style={styles.inputShell}>
                      <TextInput
                        style={styles.textInput}
                        value={draft.maxAge}
                        onChangeText={(maxAge) =>
                          setDraft((d) => ({ ...d, maxAge: maxAge.replace(/[^0-9]/g, '') }))
                        }
                        placeholder="Max"
                        placeholderTextColor={goldAlpha(0.35)}
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                    </View>
                  </GenoMirrorRimFrame>
                </View>

                <Text style={styles.sectionLabel}>Relationship goal</Text>
                <View style={styles.chipRow}>
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <ProfileMirrorChip
                      key={opt.id}
                      label={opt.label}
                      selected={draft.relationshipGoal === opt.id}
                      onPress={() => setDraft((d) => ({ ...d, relationshipGoal: opt.id }))}
                      pill
                    />
                  ))}
                </View>
              </ScrollView>

              <Pressable
                style={({ pressed }) => [pressed && styles.pressed]}
                onPress={() => {
                  if (draft.interestedIn.length === 0) {
                    setInterestError('Select at least one option.');
                    return;
                  }
                  setInterestError('');
                  onApply(normalizeDiscoveryFilters(draft));
                  onClose();
                }}
              >
                <GenoMirrorRimFrame kind="red" borderRadius={RADIUS.pill} style={styles.applyRim}>
                  <GenoMirrorBrandCtaFill style={styles.applyBtn}>
                    <Text style={styles.applyBtnText}>Apply filters</Text>
                  </GenoMirrorBrandCtaFill>
                </GenoMirrorRimFrame>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
                onPress={() =>
                  onApply({
                    ...DEFAULT_DISCOVERY_FILTERS,
                    interestedIn: draft.interestedIn,
                  })
                }
              >
                <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.pill}>
                  <GenoMirrorSteelFill style={styles.resetInner}>
                    <Text style={styles.resetBtnText}>Reset all</Text>
                  </GenoMirrorSteelFill>
                </GenoMirrorRimFrame>
              </Pressable>
            </GenoGlassSurface>
          </GenoMirrorRimFrame>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '90%',
  },
  sheetRim: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  sheetGlass: {
    overflow: 'hidden',
  },
  sheetInner: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: 10,
    marginBottom: 14,
  },
  headerRim: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerMark: {
    width: 40,
    height: 40,
    borderRadius: 18.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, gap: 2 },
  sheetKicker: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: 10,
    letterSpacing: 2,
    color: LOGO_GOLD,
  },
  sheetTitle: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: 22,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  previewRim: {
    marginBottom: 10,
  },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12.5,
  },
  previewText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    color: COLORS.text,
  },
  scroll: { maxHeight: 380 },
  scrollContent: { paddingBottom: 8 },
  distanceHint: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: -4,
    marginBottom: 8,
  },
  interestError: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.error,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: LOGO_GOLD,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionLabelInline: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: LOGO_GOLD,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipFlex: {
    flex: 1,
    minWidth: '45%',
  },
  verifyRim: {
    marginTop: 8,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  verifyCopy: { flex: 1, paddingRight: 12 },
  verifyHint: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  inputRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  inputShell: {
    backgroundColor: GLASS.insetFill,
    borderRadius: 12.5,
    overflow: 'hidden',
  },
  textInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
    color: COLORS.text,
  },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ageInputRim: { flex: 1 },
  ageDash: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 18,
    color: COLORS.textMuted,
  },
  applyRim: {
    marginTop: 16,
    alignSelf: 'stretch',
    width: '100%',
  },
  applyBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: RADIUS.pill - 1.5,
  },
  applyBtnText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    color: COLORS.white,
  },
  resetBtn: {
    marginTop: 12,
    alignSelf: 'stretch',
    width: '100%',
  },
  resetInner: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: RADIUS.pill - 1.5,
  },
  resetBtnText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.text,
  },
  pressed: { opacity: 0.92 },
});
