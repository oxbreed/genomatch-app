import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import { GenoPremiumChrome, GenoLogoCeremony } from '../../brand/graphics';
import { COLORS } from '../../theme';

const MIN_DISPLAY_MS = 2200;
const FADE_MS = 550;

type Props = {
  /** Still loading fonts or session — keep logo visible with spinner */
  bootstrapping?: boolean;
  /** When false, splash waits after min display before fading out */
  readyToExit?: boolean;
  onFinish: () => void;
};

export default function GenoSplashScreen({
  bootstrapping,
  readyToExit = true,
  onFinish,
}: Props) {
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0.88)).current;
  const [minDisplayElapsed, setMinDisplayElapsed] = useState(false);
  const exitStarted = useRef(false);

  useEffect(() => {
    Animated.timing(splashScale, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [splashScale]);

  useEffect(() => {
    const timer = setTimeout(() => setMinDisplayElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!minDisplayElapsed || !readyToExit || exitStarted.current) return;
    exitStarted.current = true;

    Animated.parallel([
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(splashScale, {
        toValue: 1.05,
        duration: FADE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, [minDisplayElapsed, onFinish, readyToExit, splashOpacity, splashScale]);

  return (
    <View style={styles.root}>
      <GenoPremiumChrome variant="forest" />
      <Animated.View
        style={[
          styles.layer,
          { opacity: splashOpacity, transform: [{ scale: splashScale }] },
        ]}
      >
        <GenoLogoCeremony
          variant="splash"
          showWordmark
          tagline="Connecting hearts. Aligning genes."
          tone="light"
          style={styles.ceremony}
        />

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
  ceremony: {
    marginBottom: 72,
  },
  spinner: { marginTop: -48 },
});
