import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { BRAND_BLACK, LOGO_GOLD, MOTION } from '../../theme';
import {
  ONBOARDING_LOGO_HEIGHT,
  ONBOARDING_LOGO_WIDTH,
} from './onboardingLayout';
import { RIBBON_POSTER } from '../../brand/ribbonPoster';

const MIN_DISPLAY_MS = 1200;
const ABSOLUTE_CAP_MS = 12000;
const FADE_OUT_MS = 240;

type Props = {
  /** Keep the splash up (with spinner) until fonts/session are ready. */
  hold?: boolean;
  bootstrapping?: boolean;
  onFinish: () => void;
};

/** Cold open — crisp transparent ribbon (expo-image for sharper decode) */
export default function GenoSplashScreen({ hold = false, bootstrapping, onFinish }: Props) {
  const finished = useRef(false);
  const pendingExit = useRef(false);
  const beginExitRef = useRef<() => void>(() => {});
  const holdRef = useRef(hold);
  const onFinishRef = useRef(onFinish);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  holdRef.current = hold;

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 9,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  useEffect(() => {
    const beginExit = (force = false) => {
      if (finished.current) return;
      if (!force && holdRef.current) {
        pendingExit.current = true;
        return;
      }
      finished.current = true;
      pendingExit.current = false;
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: MOTION.easing.out,
        useNativeDriver: true,
      }).start(() => {
        onFinishRef.current();
      });
    };

    beginExitRef.current = () => beginExit(false);
    const minTimer = setTimeout(() => beginExit(false), MIN_DISPLAY_MS);
    const capTimer = setTimeout(() => beginExit(true), ABSOLUTE_CAP_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(capTimer);
    };
  }, [opacity]);

  useEffect(() => {
    if (!hold && pendingExit.current) {
      beginExitRef.current();
    }
  }, [hold]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.layer, { opacity, transform: [{ scale }] }]}>
        <Image
          source={RIBBON_POSTER}
          style={{
            width: ONBOARDING_LOGO_WIDTH,
            height: ONBOARDING_LOGO_HEIGHT,
          }}
          contentFit="contain"
          transition={0}
          cachePolicy="none"
          accessibilityLabel="GenoMatch logo"
        />

        {bootstrapping ? (
          <ActivityIndicator style={styles.spinner} size="small" color={LOGO_GOLD} />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BLACK,
  },
  layer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  spinner: {
    position: 'absolute',
    bottom: '14%',
  },
});
