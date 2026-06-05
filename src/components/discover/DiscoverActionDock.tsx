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
      <LinearGradient
        colors={[COLORS.white, COLORS.mint]}
        style={styles.superLikeGradient}
      >
        <Ionicons name="star" size={26} color={COLORS.gold} />
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
      <LinearGradient
        colors={['transparent', 'rgba(237, 243, 238, 0.95)', COLORS.linen]}
        style={styles.dockFade}
        pointerEvents="none"
      />
      <View style={styles.dockInner}>
        {errorText ? <Animated.Text style={styles.error}>{errorText}</Animated.Text> : null}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.passBtn, pressed && styles.btnPressed]}
            onPress={onPass}
            disabled={disabled}
          >
            <Ionicons name="close" size={26} color={COLORS.sage} />
          </Pressable>

          <SuperLikeButton onPress={onSuperLike} disabled={disabled} />

          <Animated.View style={{ transform: [{ scale: likePulseScale }] }}>
            <Pressable
              style={({ pressed }) => [styles.likeBtnOuter, pressed && styles.btnPressed]}
              onPress={onLike}
              disabled={disabled}
            >
              <LinearGradient
                colors={[COLORS.gold, '#C49A3A']}
                style={styles.likeBtnGradient}
              >
                <Ionicons name="heart" size={30} color={COLORS.forestDeep} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    width: '100%',
    marginTop: 8,
  },
  dockFade: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 48,
  },
  dockInner: {
    paddingTop: 12,
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
    gap: 22,
  },
  passBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(143, 175, 149, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  superLikeBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  superLikeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtnOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(212, 168, 67, 0.5)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
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
