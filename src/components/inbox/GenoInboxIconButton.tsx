import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';
import { INBOX } from './inboxTokens';

type Variant = 'gold' | 'danger' | 'muted';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: Variant;
  accessibilityLabel: string;
};

export default function GenoInboxIconButton({
  icon,
  onPress,
  variant = 'gold',
  accessibilityLabel,
}: Props) {
  const size = INBOX.iconBtnSize;

  if (variant === 'gold') {
    return (
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
      >
        <LinearGradient colors={INBOX.colors.goldBtn} style={[styles.gradient, { width: size, height: size }]}>
          <Ionicons name={icon} size={17} color={COLORS.forestDeep} />
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        styles.plain,
        variant === 'danger' && styles.danger,
        { width: size, height: size },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons
        name={icon}
        size={17}
        color={variant === 'danger' ? COLORS.error : COLORS.sage}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: INBOX.iconBtnSize / 2,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: INBOX.iconBtnSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(237, 243, 238, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(61, 122, 82, 0.12)',
  },
  danger: {
    backgroundColor: 'rgba(163, 45, 45, 0.08)',
    borderColor: 'rgba(163, 45, 45, 0.18)',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
