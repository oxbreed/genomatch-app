import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

type Props = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  children?: React.ReactNode;
};

/** Remote photo with linen→image crossfade — avoids harsh pop-in on discover cards. */
export default function GenoRemotePhoto({
  uri,
  style,
  imageStyle,
  resizeMode = 'cover',
  children,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    opacity.setValue(0);
    setLoaded(false);
  }, [uri, opacity]);

  const revealImage = () => {
    if (loaded) return;
    setLoaded(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 340,
      easing: MOTION.easing.out,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.wrap, style]}>
      {!loaded ? (
        <LinearGradient
          colors={[COLORS.forestDeep, COLORS.forest, '#2A5A3E']}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      <Animated.Image
        source={{ uri }}
        style={[StyleSheet.absoluteFillObject, imageStyle, { opacity }]}
        resizeMode={resizeMode}
        onLoad={revealImage}
        onLoadEnd={revealImage}
        onError={() => setLoaded(false)}
        accessibilityIgnoresInvertColors
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: COLORS.forestDeep,
  },
});
