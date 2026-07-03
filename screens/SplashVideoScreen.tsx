import { useEffect, useRef } from 'react';
// import { Animated, Easing, StyleSheet, View } from 'react-native';
import { View } from 'react-native';
// import { useEventListener } from 'expo';
// import { useVideoPlayer, VideoView } from 'expo-video';

type Props = {
  onComplete: () => void;
};

const SPLASH_FALLBACK_MS = 6200;
// const FADE_OUT_MS = 300;

export default function SplashVideoScreen({ onComplete }: Props) {
  // const opacity = useRef(new Animated.Value(1)).current;
  const didFinishRef = useRef(false);

  // const player = useVideoPlayer(require('../assets/videos/genomatch-splash-dark.mp4'), (instance) => {
  //   instance.loop = false;
  //   instance.muted = true;
  //   instance.play();
  // });

  // const finish = () => {
  //   if (didFinishRef.current) return;
  //   didFinishRef.current = true;
  //   Animated.timing(opacity, {
  //     toValue: 0,
  //     duration: FADE_OUT_MS,
  //     easing: Easing.out(Easing.cubic),
  //     useNativeDriver: true,
  //   }).start(() => {
  //     onComplete();
  //   });
  // };

  // useEventListener(player, 'playToEnd', finish);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (didFinishRef.current) return;
      didFinishRef.current = true;
      onComplete();
    }, SPLASH_FALLBACK_MS);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return <View style={{ flex: 1, backgroundColor: '#0B0C0E' }} />;

  // return (
  //   <Animated.View style={[styles.root, { opacity }]}>
  //     <View style={styles.videoWrap}>
  //       <VideoView style={styles.video} player={player} contentFit="contain" nativeControls={false} />
  //     </View>
  //   </Animated.View>
  // );
}

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//     backgroundColor: '#0B0C0E',
//   },
//   videoWrap: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   video: {
//     width: '100%',
//     height: '100%',
//   },
// });
