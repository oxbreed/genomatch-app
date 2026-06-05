import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

type Props = {
  side: 'like' | 'nope';
  opacity: Animated.AnimatedInterpolation<number>;
};

export default function DiscoverSwipeStamp({ side, opacity }: Props) {
  const isLike = side === 'like';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.stamp,
        isLike ? styles.stampLike : styles.stampNope,
        { opacity },
      ]}
    >
      <LinearGradient
        colors={
          isLike
            ? ['rgba(212, 168, 67, 0.35)', 'rgba(212, 168, 67, 0.08)']
            : ['rgba(143, 175, 149, 0.35)', 'rgba(143, 175, 149, 0.08)']
        }
        style={styles.stampFill}
      >
        <Text style={[styles.stampText, isLike ? styles.stampTextLike : styles.stampTextNope]}>
          {isLike ? 'LIKE' : 'PASS'}
        </Text>
        <View style={[styles.stampRule, isLike ? styles.stampRuleLike : styles.stampRuleNope]} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    position: 'absolute',
    top: 48,
    zIndex: 12,
    borderRadius: 12,
    borderWidth: 3,
    overflow: 'hidden',
  },
  stampLike: {
    left: 20,
    borderColor: COLORS.gold,
    transform: [{ rotate: '-14deg' }],
  },
  stampNope: {
    right: 20,
    borderColor: COLORS.sage,
    transform: [{ rotate: '14deg' }],
  },
  stampFill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
  },
  stampText: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 34,
    letterSpacing: 3,
  },
  stampTextLike: {
    color: COLORS.gold,
  },
  stampTextNope: {
    color: COLORS.sage,
  },
  stampRule: {
    height: 3,
    width: 48,
    borderRadius: 2,
  },
  stampRuleLike: {
    backgroundColor: COLORS.gold,
  },
  stampRuleNope: {
    backgroundColor: COLORS.sage,
  },
});
