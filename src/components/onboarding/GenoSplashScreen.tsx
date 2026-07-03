import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { BRAND_BLACK, LOGO_GOLD, MOTION } from '../../theme';
import {
  ONBOARDING_LOGO_HEIGHT,
  ONBOARDING_LOGO_WIDTH,
} from './onboardingLayout';
import GenoPremiumOnboardingBackdrop from './GenoPremiumOnboardingBackdrop';

/** Splash poster only — do not import ribbonLogo.ts (pulls animated GIF into cold start) */
const SPLASH_LOGO = require('../../../assets/genomatch-ribbon-logo.png');

const MIN_DISPLAY_MS = 1100;
const HARD_CAP_MS = 2800;
const FADE_OUT_MS = 220;

type Props = {
  bootstrapping?: boolean;
  onFinish: () => void;
};

/** Cold open — static logo, quick fade handoff */
export default function GenoSplashScreen({ bootstrapping, onFinish }: Props) {
  const finished = useRef(false);
  const onFinishRef = useRef(onFinish);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const done = () => {
      if (finished.current) return;
      finished.current = true;
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: MOTION.easing.out,
        useNativeDriver: true,
      }).start(({ finished: animDone }) => {
        if (animDone) onFinishRef.current();
      });
    };

    const minTimer = setTimeout(done, MIN_DISPLAY_MS);
    const capTimer = setTimeout(done, HARD_CAP_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(capTimer);
    };
  }, [opacity]);

  return (
    <View style={styles.root}>
      <GenoPremiumOnboardingBackdrop />

      <Animated.View style={[styles.layer, { opacity }]}>
        <Image
          source={SPLASH_LOGO}
          style={{
            width: ONBOARDING_LOGO_WIDTH,
            height: ONBOARDING_LOGO_HEIGHT,
          }}
          resizeMode="contain"
          accessibilityLabel="GenoMatch logo"
          accessibilityIgnoresInvertColors
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
