import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GenoPremiumChrome, GenoBondHalo } from '../../brand/graphics';
import GenoMatchLogo from '../GenoMatchLogo';
import { COLORS, TYPOGRAPHY } from '../../theme';

type Props = {
  bootstrapping?: boolean;
  onFinish: () => void;
};

export default function GenoSplashScreen({ bootstrapping, onFinish }: Props) {
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0.88)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    const splashIn = Animated.parallel([
      Animated.timing(splashScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const floatingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -8,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 8,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 0.94,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    splashIn.start();
    floatingLoop.start();
    pulseLoop.start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 550,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(splashScale, {
          toValue: 1.05,
          duration: 550,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, 2600);

    return () => {
      clearTimeout(timeout);
      floatingLoop.stop();
      pulseLoop.stop();
    };
  }, [logoFloat, logoPulse, onFinish, splashOpacity, splashScale]);

  return (
    <View style={styles.root}>
      <GenoPremiumChrome variant="forest" />
      <Animated.View
        style={[
          styles.layer,
          { opacity: splashOpacity, transform: [{ scale: splashScale }] },
        ]}
      >
        <View style={styles.haloWrap}>
          <GenoBondHalo size={200} opacity={0.45} animated />
          <Animated.View
            style={[
              styles.logoOrb,
              { transform: [{ translateY: logoFloat }, { scale: logoPulse }] },
            ]}
          >
            <GenoMatchLogo size={140} />
          </Animated.View>
        </View>

        <Text style={styles.wordmark}>GenoMatch</Text>
        <Text style={styles.tagline}>Connecting hearts. Aligning genes.</Text>

        {bootstrapping ? (
          <ActivityIndicator style={styles.spinner} size="small" color={COLORS.gold} />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.splash,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  haloWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoOrb: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 40,
    color: COLORS.linen,
    letterSpacing: -1,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    marginTop: 10,
    color: COLORS.sage,
    fontSize: 16,
    textAlign: 'center',
  },
  spinner: { marginTop: 24 },
});
