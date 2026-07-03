import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  GenoHelixField,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import { Ionicons } from '@expo/vector-icons';
import {
  EDUCATION_OPTIONS,
  HABIT_OPTIONS,
  HEIGHT_PRESETS_CM,
  RELIGION_OPTIONS,
  formatHeightCm,
} from '../../lib/profileDetails';
import { FONT_FAMILY, COLORS, GLASS, TYPOGRAPHY } from '../../theme';
import { PROFILE_TYPE } from './profileTokens';
import ProfileMirrorChip from './ProfileMirrorChip';

type Props = {
  heightCm: number | null;
  religion: string;
  drinkingStatus: string;
  smokingStatus: string;
  educationStatus: string;
  onSelectHeight: (cm: number | null) => void;
  onSelectReligion: (id: string) => void;
  onSelectDrinking: (id: string) => void;
  onSelectSmoking: (id: string) => void;
  onSelectEducation: (id: string) => void;
};

function MirrorFieldIcon({ name }: { name: keyof typeof Ionicons.glyphMap }) {
  return (
    <GenoMirrorRimFrame kind="gold" borderRadius={18} padding={1.5}>
      <GenoMirrorSteelFill style={styles.iconRing}>
        <GenoMirrorMetallicIcon name={name} size={16} tone="gold" />
      </GenoMirrorSteelFill>
    </GenoMirrorRimFrame>
  );
}

function HabitSection({
  icon,
  label,
  hint,
  value,
  onSelect,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <View style={[styles.fieldHeader, styles.fieldHeaderSpaced]}>
        <MirrorFieldIcon name={icon} />
        <View style={styles.fieldCopy}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      </View>
      <View style={styles.religionGrid}>
        {HABIT_OPTIONS.map((opt) => (
          <ProfileMirrorChip
            key={opt.id}
            label={opt.label}
            selected={value === opt.id}
            onPress={() => onSelect(value === opt.id ? '' : opt.id)}
            style={styles.religionCell}
          />
        ))}
      </View>
    </>
  );
}

export default function ProfileDetailsFields({
  heightCm,
  religion,
  drinkingStatus,
  smokingStatus,
  educationStatus,
  onSelectHeight,
  onSelectReligion,
  onSelectDrinking,
  onSelectSmoking,
  onSelectEducation,
}: Props) {
  const [customFocused, setCustomFocused] = useState(false);
  const heightLabel = formatHeightCm(heightCm);

  return (
    <View style={styles.wrap}>
      <View style={styles.pattern} pointerEvents="none">
        <GenoHelixField width={140} height={56} opacity={0.1} />
      </View>

      <View style={styles.fieldHeader}>
        <MirrorFieldIcon name="resize-outline" />
        <View style={styles.fieldCopy}>
          <Text style={styles.label}>Height</Text>
          <Text style={styles.hint}>Shown on your profile and Discover card.</Text>
        </View>
        {heightLabel ? (
          <GenoMirrorRimFrame kind="gold" borderRadius={20}>
            <Text style={styles.valuePillText}>{heightLabel}</Text>
          </GenoMirrorRimFrame>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.heightScroll}
      >
        {HEIGHT_PRESETS_CM.map((cm) => {
          const active = heightCm === cm;
          const label = formatHeightCm(cm)?.split(' · ')[0] ?? `${cm} cm`;
          return (
            <ProfileMirrorChip
              key={cm}
              label={label}
              selected={active}
              onPress={() => onSelectHeight(active ? null : cm)}
            />
          );
        })}
      </ScrollView>

      <View style={styles.customRow}>
        <GenoMirrorRimFrame
          kind={customFocused ? 'gold' : 'steel'}
          borderRadius={12}
          style={styles.customInputRim}
        >
          <TextInput
            style={styles.customInput}
            value={heightCm != null ? String(heightCm) : ''}
            onChangeText={(t) => {
              const digits = t.replace(/[^0-9]/g, '');
              if (!digits) {
                onSelectHeight(null);
                return;
              }
              const n = parseInt(digits, 10);
              if (!Number.isNaN(n)) onSelectHeight(Math.min(230, n));
            }}
            placeholder="Custom cm"
            placeholderTextColor={COLORS.textSubtle}
            keyboardType="number-pad"
            maxLength={3}
            onFocus={() => setCustomFocused(true)}
            onBlur={() => setCustomFocused(false)}
          />
        </GenoMirrorRimFrame>
        <Text style={styles.customHint}>120–230 cm</Text>
      </View>

      <View style={[styles.fieldHeader, styles.fieldHeaderSpaced]}>
        <MirrorFieldIcon name="sparkles-outline" />
        <View style={styles.fieldCopy}>
          <Text style={styles.label}>Religion</Text>
          <Text style={styles.hint}>Optional — helps align values on Discover</Text>
        </View>
      </View>

      <View style={styles.religionGrid}>
        {RELIGION_OPTIONS.map((opt) => (
          <ProfileMirrorChip
            key={opt.id}
            label={opt.label}
            selected={religion === opt.id}
            onPress={() => onSelectReligion(religion === opt.id ? '' : opt.id)}
            style={styles.religionCell}
          />
        ))}
      </View>

      <HabitSection
        icon="wine-outline"
        label="Drinking"
        hint="Optional — shown on your profile"
        value={drinkingStatus}
        onSelect={onSelectDrinking}
      />

      <HabitSection
        icon="cloud-outline"
        label="Smoking"
        hint="Optional — shown on your profile"
        value={smokingStatus}
        onSelect={onSelectSmoking}
      />

      <View style={[styles.fieldHeader, styles.fieldHeaderSpaced]}>
        <MirrorFieldIcon name="school-outline" />
        <View style={styles.fieldCopy}>
          <Text style={styles.label}>Education</Text>
          <Text style={styles.hint}>Optional — helps matches know your background</Text>
        </View>
      </View>

      <View style={styles.religionGrid}>
        {EDUCATION_OPTIONS.map((opt) => (
          <ProfileMirrorChip
            key={opt.id}
            label={opt.label}
            selected={educationStatus === opt.id}
            onPress={() => onSelectEducation(educationStatus === opt.id ? '' : opt.id)}
            style={styles.religionCell}
          />
        ))}
      </View>
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
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  fieldHeaderSpaced: {
    marginTop: 18,
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
    color: COLORS.text,
  },
  hint: {
    ...PROFILE_TYPE.sectionHint,
    color: COLORS.textMuted,
  },
  valuePillText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    color: COLORS.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: GLASS.insetFill,
    borderRadius: 18.5,
  },
  heightScroll: {
    gap: 8,
    paddingRight: 8,
    paddingBottom: 4,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  customInputRim: {
    flex: 1,
  },
  customInput: {
    height: 48,
    borderRadius: 10.5,
    backgroundColor: GLASS.insetFill,
    paddingHorizontal: 14,
    ...TYPOGRAPHY.bodyStrong,
    fontSize: 15,
    color: COLORS.text,
  },
  customHint: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  religionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  religionCell: {
    width: '48%',
    flexGrow: 1,
  },
});
