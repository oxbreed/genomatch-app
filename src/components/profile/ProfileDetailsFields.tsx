import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoHelixField } from '../../brand/graphics';
import { HEIGHT_PRESETS_CM, RELIGION_OPTIONS, formatHeightCm } from '../../lib/profileDetails';
import { COLORS } from '../../theme';
import { PROFILE } from './profileTokens';

type Props = {
  heightCm: number | null;
  religion: string;
  onSelectHeight: (cm: number | null) => void;
  onSelectReligion: (id: string) => void;
};

export default function ProfileDetailsFields({
  heightCm,
  religion,
  onSelectHeight,
  onSelectReligion,
}: Props) {
  const heightLabel = formatHeightCm(heightCm);

  return (
    <View style={styles.wrap}>
      <View style={styles.pattern} pointerEvents="none">
        <GenoHelixField width={140} height={56} opacity={0.1} />
      </View>

      <View style={styles.fieldHeader}>
        <View style={styles.iconRing}>
          <Ionicons name="resize-outline" size={16} color={COLORS.gold} />
        </View>
        <View style={styles.fieldCopy}>
          <Text style={styles.label}>Height</Text>
          <Text style={styles.hint}>Shown on your bond profile & Discover card</Text>
        </View>
        {heightLabel ? (
          <View style={styles.valuePill}>
            <Text style={styles.valuePillText}>{heightLabel}</Text>
          </View>
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
            <Pressable key={cm} onPress={() => onSelectHeight(active ? null : cm)}>
              {active ? (
                <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.heightChipActive}>
                  <Text style={styles.heightChipTextActive}>{label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.heightChip}>
                  <Text style={styles.heightChipText}>{label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.customRow}>
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
        />
        <Text style={styles.customHint}>120–230 cm</Text>
      </View>

      <View style={[styles.fieldHeader, styles.fieldHeaderSpaced]}>
        <View style={styles.iconRing}>
          <Ionicons name="sparkles-outline" size={16} color={COLORS.gold} />
        </View>
        <View style={styles.fieldCopy}>
          <Text style={styles.label}>Religion</Text>
          <Text style={styles.hint}>Optional — helps align values on Discover</Text>
        </View>
      </View>

      <View style={styles.religionGrid}>
        {RELIGION_OPTIONS.map((opt) => {
          const active = religion === opt.id;
          return (
            <Pressable
              key={opt.id}
              style={styles.religionCell}
              onPress={() => onSelectReligion(active ? '' : opt.id)}
            >
              {active ? (
                <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.religionChipActive}>
                  <Text style={styles.religionTextActive}>{opt.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.religionChip}>
                  <Text style={styles.religionText}>{opt.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
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
    borderRadius: 18,
    backgroundColor: 'rgba(212, 168, 67, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldCopy: { flex: 1, gap: 2 },
  label: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: PROFILE.sectionTitleSize,
    letterSpacing: -0.2,
    color: COLORS.forestDeep,
  },
  hint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.sage,
  },
  valuePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.28)',
  },
  valuePillText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: COLORS.forestDeep,
  },
  heightScroll: {
    gap: 8,
    paddingRight: 8,
    paddingBottom: 4,
  },
  heightChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  heightChipActive: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heightChipText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forest,
  },
  heightChipTextActive: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  customInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: COLORS.forest,
  },
  customHint: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.sage,
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
  religionChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  religionChipActive: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  religionText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  religionTextActive: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forestDeep,
    textAlign: 'center',
  },
});
