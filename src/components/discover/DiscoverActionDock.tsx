import type { ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoGlassSurface } from '../../brand/graphics';
import { COLORS, SHADOWS } from '../../theme';

type Props = {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  likePulseScale: Animated.Value;
  disabled?: boolean;
  variant?: 'overlay' | 'standalone' | 'glass';
  style?: StyleProp<ViewStyle>;
};

function GlassCircle({
  size,
  onPress,
  disabled,
  accessibilityLabel,
  children,
  borderRadius = size / 2,
}: {
  size: number;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  children: ReactNode;
  borderRadius?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [pressed && styles.btnPressed, disabled && styles.btnDisabled]}
    >
      <GenoGlassSurface
        variant="light"
        borderRadius={borderRadius}
        intensity={58}
        showSheen
        shadow="glassFloat"
        style={{ width: size, height: size }}
        contentStyle={styles.glassCircleContent}
      >
        {children}
      </GenoGlassSurface>
    </Pressable>
  );
}

export default function DiscoverActionDock({
  onPass,
  onLike,
  onSuperLike,
  likePulseScale,
  disabled,
  variant = 'overlay',
  style,
}: Props) {
  const overlay = variant === 'overlay';
  const glass = variant === 'glass';

  if (glass) {
    return (
      <View style={[styles.actions, styles.actionsGlass, style]}>
        <GlassCircle size={50} onPress={onPass} disabled={disabled} accessibilityLabel="Pass profile">
          <Ionicons name="close" size={24} color={COLORS.sage} />
        </GlassCircle>

        <GlassCircle
          size={44}
          onPress={onSuperLike}
          disabled={disabled}
          accessibilityLabel="Elevate bond"
        >
          <Ionicons name="sparkles" size={20} color={COLORS.gold} />
        </GlassCircle>

        <Animated.View style={{ transform: [{ scale: likePulseScale }] }}>
          <Pressable
            onPress={onLike}
            disabled={disabled}
            accessibilityLabel="Bond with profile"
            style={({ pressed }) => [pressed && styles.btnPressed, disabled && styles.btnDisabled]}
          >
            <View style={styles.likeGlassWrap}>
              <GenoGlassSurface
                variant="light"
                borderRadius={30}
                intensity={52}
                showSheen
                shadow="glassElevated"
                style={styles.likeGlassOuter}
                contentStyle={styles.likeGlassContent}
              >
                <LinearGradient
                  colors={[COLORS.gold, '#C49A3A']}
                  style={styles.likeGlassGradient}
                >
                  <Ionicons name="heart" size={26} color={COLORS.forestDeep} />
                </LinearGradient>
              </GenoGlassSurface>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.actions, overlay && styles.actionsOverlay, style]}>
      <Pressable
        style={({ pressed }) => [
          overlay ? styles.passBtnOverlay : styles.passBtn,
          pressed && styles.btnPressed,
          disabled && styles.btnDisabled,
        ]}
        onPress={onPass}
        disabled={disabled}
        accessibilityLabel="Pass"
      >
        <Ionicons name="close" size={overlay ? 30 : 26} color={COLORS.sage} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          overlay ? styles.superLikeBtnOverlay : styles.superLikeBtn,
          pressed && !disabled && styles.btnPressed,
          disabled && styles.btnDisabled,
        ]}
        onPress={onSuperLike}
        disabled={disabled}
        accessibilityLabel="Super like"
      >
        <LinearGradient
          colors={[COLORS.white, overlay ? COLORS.linen : COLORS.mint]}
          style={styles.superLikeGradient}
        >
          <Ionicons name="star" size={overlay ? 24 : 22} color={COLORS.gold} />
        </LinearGradient>
      </Pressable>

      <Animated.View style={{ transform: [{ scale: likePulseScale }] }}>
        <Pressable
          style={({ pressed }) => [
            overlay ? styles.likeBtnOverlay : styles.likeBtnOuter,
            pressed && styles.btnPressed,
            disabled && styles.btnDisabled,
          ]}
          onPress={onLike}
          disabled={disabled}
          accessibilityLabel="Like"
        >
          <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.likeBtnGradient}>
            <Ionicons name="heart" size={overlay ? 32 : 28} color={COLORS.forestDeep} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  actionsOverlay: {
    gap: 26,
    paddingHorizontal: 8,
  },
  actionsGlass: {
    gap: 20,
    paddingHorizontal: 6,
  },
  glassCircleContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeGlassWrap: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeGlassOuter: {
    width: 60,
    height: 60,
  },
  likeGlassContent: {
    flex: 1,
    padding: 2,
  },
  likeGlassGradient: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(143, 175, 149, 0.45)',
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  passBtnOverlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...SHADOWS.glassFloat,
    shadowOpacity: 0.18,
  },
  superLikeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.55)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  superLikeBtnOverlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.55)',
    ...SHADOWS.glassFloat,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.22,
  },
  superLikeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtnOuter: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 168, 67, 0.45)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  likeBtnOverlay: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    ...SHADOWS.glassElevated,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.32,
  },
  likeBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
