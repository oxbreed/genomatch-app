import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../theme';
import { GENO_VISUAL } from './genoVisualTokens';

type Props = {
  variant?: 'linen' | 'forest';
};

/** Gold ceremony line with micro bond sparks — top of every premium screen */
export default function GenoSparkCeremony({ variant = 'linen' }: Props) {
  const colors = variant === 'forest' ? GENO_VISUAL.chrome.topRuleForest : GENO_VISUAL.chrome.topRule;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
      <Svg width={120} height={8} style={styles.sparks}>
        {[12, 36, 60, 84, 108].map((cx, i) => (
          <Circle
            key={cx}
            cx={cx}
            cy={4}
            r={i === 2 ? 2.2 : 1.4}
            fill={i % 2 === 0 ? COLORS.gold : COLORS.verified}
            fillOpacity={0.7}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 4,
  },
  line: {
    ...StyleSheet.absoluteFillObject,
    height: 2,
  },
  sparks: {
    position: 'absolute',
    top: -2,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -60,
    opacity: 0.85,
  },
});
