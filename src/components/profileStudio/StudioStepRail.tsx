import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { FONT_FAMILY, COLORS } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type StudioStep = {
  id: string;
  label: string;
  icon: IonName;
};

type Props = {
  steps: StudioStep[];
  activeIndex: number;
  onSelect: (index: number) => void;
  completedSteps?: boolean[];
};

function StepPill({
  step,
  index,
  active,
  complete,
  onPress,
}: {
  step: StudioStep;
  index: number;
  active: boolean;
  complete?: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(active ? 1 : 0.96)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1.04 : 0.96,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [active, scale]);

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Animated.View style={[styles.pillOuter, { transform: [{ scale }] }]}>
        {active ? (
          <LinearGradient
            colors={['rgba(212, 168, 67, 0.55)', 'rgba(61, 122, 82, 0.35)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillGlow}
          />
        ) : null}
        <View style={[styles.pill, active && styles.pillActive, complete && !active && styles.pillComplete]}>
          <View style={[styles.stepBadge, active && styles.stepBadgeActive, complete && styles.stepBadgeComplete]}>
            {complete ? (
              <Ionicons name="checkmark" size={11} color={COLORS.forestDeep} />
            ) : (
              <Text style={[styles.stepBadgeText, active && styles.stepBadgeTextActive]}>
                {index + 1}
              </Text>
            )}
          </View>
          <Ionicons
            name={step.icon}
            size={15}
            color={active ? COLORS.forestDeep : COLORS.sage}
          />
          <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{step.label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function StudioStepRail({ steps, activeIndex, onSelect, completedSteps }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (steps.length <= 1) return;
    Animated.spring(progress, {
      toValue: activeIndex / (steps.length - 1),
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();
  }, [activeIndex, progress, steps.length]);

  const indicatorTranslateX =
    trackWidth > 0
      ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.max(0, trackWidth - 44)],
        })
      : 0;

  return (
    <View style={styles.wrap}>
      <View
        style={styles.trackWrap}
        onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <LinearGradient
          colors={['rgba(13, 40, 24, 0.06)', 'rgba(212, 168, 67, 0.2)', 'rgba(13, 40, 24, 0.06)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.track}
        />
        {trackWidth > 0 ? (
          <Animated.View
            style={[styles.trackIndicator, { transform: [{ translateX: indicatorTranslateX }] }]}
          />
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {steps.map((step, index) => (
          <StepPill
            key={step.id}
            step={step}
            index={index}
            active={activeIndex === index}
            complete={completedSteps?.[index]}
            onPress={() => onSelect(index)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    gap: 10,
  },
  trackWrap: {
    marginHorizontal: 16,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  trackIndicator: {
    position: 'absolute',
    top: -3,
    width: 44,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  pillOuter: {
    position: 'relative',
  },
  pillGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    transform: [{ scale: 1.08 }],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(13, 40, 24, 0.1)',
  },
  pillActive: {
    backgroundColor: COLORS.mint,
    borderColor: 'rgba(212, 168, 67, 0.55)',
  },
  pillComplete: {
    borderColor: 'rgba(61, 122, 82, 0.35)',
    backgroundColor: 'rgba(237, 243, 238, 0.85)',
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(13, 40, 24, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: COLORS.gold,
  },
  stepBadgeComplete: {
    backgroundColor: 'rgba(61, 122, 82, 0.25)',
  },
  stepBadgeText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    color: COLORS.sage,
  },
  stepBadgeTextActive: {
    color: COLORS.forestDeep,
  },
  pillLabel: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.sage,
  },
  pillLabelActive: {
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.forestDeep,
  },
});
