import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

type Props = {
  total: number;
  currentIndex: number;
  ctaLabel: string;
  helperText: string;
  ctaScale: Animated.Value;
  onDotPress: (index: number) => void;
  onCtaPressIn: () => void;
  onCtaPressOut: () => void;
  onContinue: () => void;
};

export default function OnboardingInsightsFooter({
  total,
  currentIndex,
  ctaLabel,
  helperText,
  ctaScale,
  onDotPress,
  onCtaPressIn,
  onCtaPressOut,
  onContinue,
}: Props) {
  return (
    <View style={styles.footer}>
      <View style={styles.progressRow}>
        {Array.from({ length: total }).map((_, index) => {
          const active = index === currentIndex;
          return (
            <Pressable
              key={`insight-dot-${index}`}
              onPress={() => onDotPress(index)}
              style={[styles.dot, active && styles.dotActive]}
              accessibilityLabel={`Insight ${index + 1} of ${total}`}
            />
          );
        })}
      </View>

      <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
        <Pressable
          style={styles.ctaOuter}
          onPressIn={onCtaPressIn}
          onPressOut={onCtaPressOut}
          onPress={onContinue}
        >
          <LinearGradient
            colors={[COLORS.gold, '#E8C56A', '#C49A3A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaLabel}>{ctaLabel}</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Text style={styles.helperText}>{helperText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 239, 230, 0.28)',
  },
  dotActive: {
    width: 32,
    backgroundColor: COLORS.gold,
  },
  ctaOuter: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaGradient: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  ctaLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 17,
    color: COLORS.forestDeep,
    letterSpacing: 0.2,
  },
  ctaArrow: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: COLORS.forestDeep,
  },
  helperText: {
    marginTop: 14,
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    textAlign: 'center',
    color: 'rgba(245, 239, 230, 0.58)',
  },
});
