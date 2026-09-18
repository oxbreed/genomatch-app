import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, View } from 'react-native';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BRAND_BLACK, LOGO_GOLD } from '../src/theme';

type Props = {
  /** Still loading fonts or session — keep splash visible with spinner */
  bootstrapping?: boolean;
  /** When false, splash waits after the video (or fallback) before fading out */
  readyToExit?: boolean;
  onFinish: () => void;
};

const VIDEO_FALLBACK_MS = 6200;
const FADE_OUT_MS = 300;
const splashVideo = require('../assets/videos/genomatch-splash-dark.mp4');

export default function SplashVideoScreen({
  bootstrapping = false,
  readyToExit = true,
  onFinish,
}: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const exitStarted = useRef(false);
  const [videoComplete, setVideoComplete] = useState(false);

  const player = useVideoPlayer(splashVideo, (instance) => {
    instance.loop = false;
    instance.muted = true;
    instance.play();
  });

  const markVideoComplete = () => {
    setVideoComplete(true);
  };

  useEventListener(player, 'playToEnd', markVideoComplete);

  useEffect(() => {
    const timeout = setTimeout(markVideoComplete, VIDEO_FALLBACK_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!videoComplete || !readyToExit || exitStarted.current) return;
    exitStarted.current = true;
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, [onFinish, opacity, readyToExit, videoComplete]);

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      <View style={styles.videoWrap}>
        <VideoView
          style={styles.video}
          player={player}
          contentFit="contain"
          nativeControls={false}
        />
      </View>
      {bootstrapping ? (
        <ActivityIndicator style={styles.spinner} size="small" color={LOGO_GOLD} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BLACK,
  },
  videoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  spinner: {
    position: 'absolute',
    bottom: 72,
    alignSelf: 'center',
  },
});
