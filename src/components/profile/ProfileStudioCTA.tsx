import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GenoCardFrame, GenoMirrorMetallicIcon, GenoMirrorRimFrame, GenoMirrorSteelFill } from '../../brand/graphics';
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
      <GenoCardFrame mirror showWatermark={false} style={styles.frame}>
        <View style={styles.inner}>
          <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.sm}>
            <GenoMirrorSteelFill style={styles.icon}>
              <GenoMirrorMetallicIcon name="sparkles" size={18} tone="gold" />
            </GenoMirrorSteelFill>
          </GenoMirrorRimFrame>
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
          <GenoMirrorMetallicIcon name="chevron-forward" size={18} tone="steel" />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...PROFILE_TYPE.ctaTitle,
    color: COLORS.text,
  },
  sub: {
    ...PROFILE_TYPE.ctaSub,
    color: COLORS.textSubtle,
  },
  pressed: { opacity: 0.92 },
});
