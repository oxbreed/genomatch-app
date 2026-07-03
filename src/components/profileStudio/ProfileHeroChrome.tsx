import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { GenoMirrorRimFrame } from '../../brand/graphics';
import { INBOX } from '../inbox/inboxTokens';
import { COLORS, RADIUS, SHADOWS } from '../../theme';

type Props = {
  studio?: boolean;
  height: number;
  children: React.ReactNode;
};

export default function ProfileHeroChrome({ studio, height, children }: Props) {
  if (!studio) {
    return (
      <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.xl} style={styles.viewWrap}>
        <View style={[styles.viewHero, { height }, SHADOWS.cardElevated]}>
          {children}
          <LinearGradient
            colors={['transparent', 'rgba(10, 10, 10, 0.32)']}
            style={styles.viewVignette}
            pointerEvents="none"
          />
        </View>
      </GenoMirrorRimFrame>
    );
  }

  return (
    <View style={styles.wrap}>
      <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.xl}>
        <View style={[styles.hero, { height }]}>
          {children}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.45)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topAccent}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', 'rgba(10, 10, 10, 0.35)']}
            style={styles.bottomVignette}
            pointerEvents="none"
          />
          <View style={styles.frameTL} pointerEvents="none">
            <FrameCorner />
          </View>
          <View style={styles.frameTR} pointerEvents="none">
            <FrameCorner flip="tr" />
          </View>
        </View>
      </GenoMirrorRimFrame>
    </View>
  );
}

function FrameCorner({ flip }: { flip?: 'tr' }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 32 32" transform={flip === 'tr' ? 'scale(-1, 1)' : undefined}>
      <Path
        d="M4 12 V4 H12 M20 4 H28 V12"
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
  viewWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  viewHero: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: RADIUS.xl - 1.5,
    backgroundColor: 'rgba(26, 20, 18, 0.82)',
  },
  viewVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    zIndex: 2,
  },
  wrap: {
    marginHorizontal: INBOX.cardMarginH,
    marginTop: 4,
    marginBottom: 6,
  },
  hero: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: RADIUS.xl - 1.5,
    backgroundColor: 'rgba(26, 20, 18, 0.82)',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 4,
  },
  bottomVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    zIndex: 2,
  },
  frameTL: { position: 'absolute', top: 12, left: 12, zIndex: 4 },
  frameTR: { position: 'absolute', top: 12, right: 12, zIndex: 4 },
});
