import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../theme';

type Props = {
  studio?: boolean;
  height: number;
  children: React.ReactNode;
};

export default function ProfileHeroChrome({ studio, height, children }: Props) {
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!studio) return;
    const loop = Animated.loop(
      Animated.timing(scan, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [scan, studio]);

  const scanY = scan.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 360],
  });

  return (
    <View style={[styles.hero, { height }]}>
      {children}
      <LinearGradient
        colors={['rgba(212, 168, 67, 0.5)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topAccent}
        pointerEvents="none"
      />
      <View style={styles.frameTL} pointerEvents="none">
        <FrameCorner />
      </View>
      <View style={styles.frameTR} pointerEvents="none">
        <FrameCorner flip />
      </View>
      {studio ? (
        <>
          <Animated.View
            style={[styles.scanLine, { transform: [{ translateY: scanY }] }]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={['transparent', 'rgba(212, 168, 67, 0.35)', 'transparent']}
              style={styles.scanGradient}
            />
          </Animated.View>
          <View style={styles.studioTag} pointerEvents="none">
            <Text style={styles.studioTagText}>STUDIO PREVIEW</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

function FrameCorner({ flip }: { flip?: boolean }) {
  return (
    <Svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      transform={flip ? 'scale(-1, 1)' : undefined}
    >
      <Path
        d="M4 14 V4 H14 M22 4 H32 V14"
        stroke={COLORS.gold}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeOpacity={0.85}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 4,
  },
  frameTL: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 4,
  },
  frameTR: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 48,
    zIndex: 3,
  },
  scanGradient: {
    flex: 1,
  },
  studioTag: {
    position: 'absolute',
    top: 48,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 4,
  },
  studioTagText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    letterSpacing: 3,
    color: 'rgba(212, 168, 67, 0.9)',
    backgroundColor: 'rgba(13, 40, 24, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
