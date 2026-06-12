import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoGlassSurface } from '../../brand/graphics';
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
        <GenoGlassSurface
          variant="tabBar"
          borderRadius={size / 2}
          shadow="glassFloat"
          showTopRule={false}
          intensity={70}
          style={{ width: size, height: size, overflow: 'hidden' }}
          contentStyle={styles.glassInner}
        >
          <LinearGradient colors={INBOX.colors.goldBtn} style={styles.goldFill}>
            <Ionicons name={icon} size={17} color={COLORS.forestDeep} />
          </LinearGradient>
        </GenoGlassSurface>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <GenoGlassSurface
        variant="light"
        borderRadius={size / 2}
        shadow="glass"
        showTopRule={false}
        intensity={58}
        style={{ width: size, height: size, overflow: 'hidden' }}
        contentStyle={[
          styles.glassInner,
          variant === 'danger' && styles.dangerInner,
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={variant === 'danger' ? COLORS.error : COLORS.sage}
        />
      </GenoGlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: INBOX.iconBtnSize / 2,
  },
  glassInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldFill: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerInner: {
    backgroundColor: 'rgba(163, 45, 45, 0.06)',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
