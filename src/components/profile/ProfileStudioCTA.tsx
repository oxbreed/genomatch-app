import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenoCardFrame } from '../../brand/graphics';
import { COLORS, RADIUS } from '../../theme';
import { PROFILE, PROFILE_TYPE } from './profileTokens';

type Props = {
  percent: number;
  onPress: () => void;
};

export default function ProfileStudioCTA({ percent, onPress }: Props) {
  const needsWork = percent < 100;

  return (
    <Pressable
      style={({ pressed }) => [pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open profile studio"
    >
      <GenoCardFrame showWatermark={false} style={styles.frame}>
        <View style={styles.inner}>
          <View style={styles.icon}>
            <Ionicons name="color-wand-outline" size={18} color={COLORS.forestDeep} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>
              {needsWork ? 'Complete your profile' : 'Edit your profile'}
            </Text>
            <Text style={styles.sub}>
              {needsWork
                ? `${percent}% done — open Studio for photos, bio & intent`
                : 'Refine how matches see you on Discover'}
            </Text>
          </View>
          <View style={styles.chevron}>
            <Ionicons name="chevron-forward" size={18} color={COLORS.sage} />
          </View>
        </View>
      </GenoCardFrame>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    marginBottom: PROFILE.cardGap,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: PROFILE.cardPadding,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...PROFILE_TYPE.ctaTitle,
    color: COLORS.forestDeep,
  },
  sub: {
    ...PROFILE_TYPE.ctaSub,
    color: COLORS.textSubtle,
  },
  chevron: {
    width: 28,
    alignItems: 'flex-end',
  },
  pressed: { opacity: 0.92 },
});
