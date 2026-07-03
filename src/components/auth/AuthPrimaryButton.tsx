import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { GenoMirrorRedFill } from '../../brand/graphics';
import { COLORS, TYPOGRAPHY } from '../../theme';

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
        style={[ (loading || disabled) && styles.btnDisabled]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        disabled={loading || disabled}
      >
        <GenoMirrorRedFill style={styles.btn}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.white} size="small" />
              <Text style={styles.text}>{loadingLabel}</Text>
            </View>
          ) : (
            <Text style={styles.text}>{label}</Text>
          )}
        </GenoMirrorRedFill>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
  },
  btn: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    ...TYPOGRAPHY.cta,
    fontSize: 17,
    letterSpacing: 0.1,
  },
});
