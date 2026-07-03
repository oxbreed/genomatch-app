import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {COLORS, TYPOGRAPHY} from '../../theme';

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  variant?: 'light' | 'forest';
};

export default function GenoScreenHeader({
  kicker = 'GENOMATCH',
  title,
  subtitle,
  rightAction,
  onRightPress,
  rightAccessibilityLabel,
  variant = 'light',
}: Props) {
  const isForest = variant === 'forest';

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={
          isForest
            ? ['rgba(10, 10, 10, 0.08)', 'transparent']
            : ['rgba(255, 255, 255, 0.12)', 'transparent']
        }
        style={styles.shimmer}
        pointerEvents="none"
      />
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[styles.kicker, isForest && styles.kickerForest]}>{kicker}</Text>
          <Text style={[styles.title, isForest && styles.titleForest]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, isForest && styles.subtitleForest]}>{subtitle}</Text>
          ) : null}
        </View>
        {rightAction ? (
          onRightPress ? (
            <Pressable
              onPress={onRightPress}
              accessibilityRole="button"
              accessibilityLabel={rightAccessibilityLabel}
              style={({ pressed }) => [styles.actionSlot, pressed && styles.actionPressed]}
            >
              {rightAction}
            </Pressable>
          ) : (
            <View style={styles.actionSlot}>{rightAction}</View>
          )
        ) : null}
      </View>
      <View style={styles.rule}>
        <LinearGradient
          colors={['transparent', COLORS.gold, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.ruleGradient}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 14,
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    height: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    ...TYPOGRAPHY.marketingKicker,
  },
  kickerForest: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  title: {
    ...TYPOGRAPHY.screenTitle,
    fontSize: 30,
    letterSpacing: -0.1,
  },
  titleForest: {
    color: COLORS.linen,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  subtitleForest: {
    color: 'rgba(245, 239, 230, 0.72)',
  },
  actionSlot: {
    marginTop: 8,
  },
  actionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  rule: {
    marginTop: 14,
    height: 1,
    overflow: 'hidden',
  },
  ruleGradient: {
    flex: 1,
    height: 1,
  },
});
