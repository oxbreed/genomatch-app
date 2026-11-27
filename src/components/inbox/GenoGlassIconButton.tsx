import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { GenoGlassSurface } from '../../brand/graphics';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

/** Circular liquid-glass control — headers, inbox actions */
export default function GenoGlassIconButton({
  onPress,
  accessibilityLabel,
  size = 40,
  children,
  style,
  disabled,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [pressed && !disabled && styles.pressed, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      // The glass circle is drawn at 40pt for the layout; the touch area is
      // padded out to clear the 44pt minimum without changing how it looks.
      hitSlop={Math.max(0, Math.ceil((44 - size) / 2))}
    >
      <GenoGlassSurface
        variant="tabBar"
        borderRadius={size / 2}
        shadow="glass"
        showTopRule={false}
        intensity={64}
        style={{ width: size, height: size, overflow: 'hidden' }}
        contentStyle={styles.inner}
      >
        {children}
      </GenoGlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
