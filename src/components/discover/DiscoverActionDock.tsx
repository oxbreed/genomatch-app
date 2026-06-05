import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

type SuperLikeProps = {
  onPress: () => void;
  disabled?: boolean;
};

function SuperLikeButton({ onPress, disabled }: SuperLikeProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.superLikeBtn,
        pressed && !disabled && styles.btnPressed,
        disabled && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel="Super like"
    >
      <LinearGradient colors={[COLORS.white, COLORS.mint]} style={styles.superLikeGradient}>
        <Ionicons name="star" size={22} color={COLORS.gold} />
      </LinearGradient>
    </Pressable>
  );
}

type Props = {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  likePulseScale: Animated.Value;
  disabled?: boolean;
  errorText?: string;
};

export default function DiscoverActionDock({
  onPass,
  onLike,
  onSuperLike,
  likePulseScale,
  disabled,
  errorText,
}: Props) {
  return (
    <View style={styles.dock}>
      {errorText ? <Animated.Text style={styles.error}>{errorText}</Animated.Text> : null}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.passBtn, pressed && styles.btnPressed]}
          onPress={onPass}
          disabled={disabled}
        >
          <Ionicons name="close" size={24} color={COLORS.sage} />
        </Pressable>

        <SuperLikeButton onPress={onSuperLike} disabled={disabled} />

        <Animated.View style={{ transform: [{ scale: likePulseScale }] }}>
          <Pressable
            style={({ pressed }) => [styles.likeBtnOuter, pressed && styles.btnPressed]}
            onPress={onLike}
            disabled={disabled}
          >
            <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.likeBtnGradient}>
              <Ionicons name="heart" size={26} color={COLORS.forestDeep} />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'center',
  },
  error: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: '90%',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  passBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  superLikeBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.55)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  superLikeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtnOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 168, 67, 0.45)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
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
