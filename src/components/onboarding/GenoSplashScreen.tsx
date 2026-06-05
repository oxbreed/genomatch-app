import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import { GenoPremiumChrome, GenoLogoCeremony } from '../../brand/graphics';
import { COLORS } from '../../theme';

type Props = {
  bootstrapping?: boolean;
  onFinish: () => void;
};

export default function GenoSplashScreen({ bootstrapping, onFinish }: Props) {
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    const splashIn = Animated.timing(splashScale, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    splashIn.start();

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

    return () => clearTimeout(timeout);
  }, [onFinish, splashOpacity, splashScale]);

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
