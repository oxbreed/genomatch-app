import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMetallicShimmer } from './useMetallicShimmer';

type Props = {
  style?: StyleProp<ViewStyle>;
};

/** Animated specular sweep for buttons and surfaces */
export default function GenoMetallicShimmerBand({ style }: Props) {
  const { shimmer } = useMetallicShimmer();

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['-120%', '220%'],
  });

  return (
    <Animated.View
      style={[styles.band, style, { transform: [{ translateX }, { rotate: '-14deg' }] }]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.22)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    top: '-20%',
    left: 0,
    width: '42%',
    height: '140%',
  },
});
