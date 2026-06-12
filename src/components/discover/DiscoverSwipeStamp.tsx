import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../../brand';
import { FONT_FAMILY, COLORS } from '../../theme';

type Props = {
  side: 'bond' | 'pass';
  opacity: Animated.AnimatedInterpolation<number> | Animated.Value;
};

/** GenoMatch swipe feedback — BOND / PASS, not generic dating-app stamps */
export default function DiscoverSwipeStamp({ side, opacity }: Props) {
  const isBond = side === 'bond';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.stamp,
        isBond ? styles.stampBond : styles.stampPass,
        { opacity },
      ]}
    >
      <LinearGradient
        colors={
          isBond
            ? ['rgba(212, 168, 67, 0.42)', 'rgba(212, 168, 67, 0.1)']
            : ['rgba(143, 175, 149, 0.38)', 'rgba(143, 175, 149, 0.08)']
        }
        style={styles.stampFill}
      >
        {isBond ? <GenoBondMark size={18} opacity={0.95} /> : null}
        <Text style={[styles.stampText, isBond ? styles.stampTextBond : styles.stampTextPass]}>
          {isBond ? 'BOND' : 'PASS'}
        </Text>
        <View style={[styles.stampRule, isBond ? styles.stampRuleBond : styles.stampRulePass]} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    position: 'absolute',
    top: 44,
    zIndex: 12,
    borderRadius: 14,
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  stampBond: {
    left: 18,
    borderColor: COLORS.gold,
    transform: [{ rotate: '-12deg' }],
  },
  stampPass: {
    right: 18,
    borderColor: COLORS.sage,
    transform: [{ rotate: '12deg' }],
  },
  stampFill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 5,
  },
  stampText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 30,
    letterSpacing: 2.5,
  },
  stampTextBond: {
    color: COLORS.gold,
  },
  stampTextPass: {
    color: COLORS.sage,
  },
  stampRule: {
    height: 2,
    width: 44,
    borderRadius: 1,
  },
  stampRuleBond: {
    backgroundColor: COLORS.gold,
  },
  stampRulePass: {
    backgroundColor: COLORS.sage,
  },
});
