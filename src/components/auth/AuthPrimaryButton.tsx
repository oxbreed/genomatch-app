import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_FAMILY, COLORS } from '../../theme';

type Props = {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  scale: Animated.Value;
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

export default function AuthPrimaryButton({
  label,
  loadingLabel = 'Please wait...',
  loading,
  disabled,
  scale,
  onPress,
  onPressIn,
  onPressOut,
}: Props) {
  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        style={[styles.btn, (loading || disabled) && styles.btnDisabled]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        disabled={loading || disabled}
      >
        <LinearGradient
          colors={[COLORS.gold, '#E8C56A', '#C49A3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.forestDeep} size="small" />
              <Text style={styles.text}>{loadingLabel}</Text>
            </View>
          ) : (
            <Text style={styles.text}>{label}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
  },
  btn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.72,
  },
  gradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 17,
    color: COLORS.forestDeep,
    letterSpacing: 0.2,
  },
});
