import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
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
      <View style={styles.viewWrap}>
        <View style={[styles.viewHero, { height }, SHADOWS.cardElevated]}>
          {children}
          <LinearGradient
            colors={['transparent', 'rgba(13, 40, 24, 0.28)']}
            style={styles.viewVignette}
            pointerEvents="none"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={INBOX.colors.borderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        <View style={[styles.hero, { height }]}>
          {children}
          <LinearGradient
            colors={['rgba(212, 168, 67, 0.45)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topAccent}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', 'rgba(13, 40, 24, 0.35)']}
            style={styles.bottomVignette}
            pointerEvents="none"
          />
          <View style={styles.frameTL} pointerEvents="none">
            <FrameCorner />
          </View>
          <View style={styles.frameTR} pointerEvents="none">
            <FrameCorner flip="tr" />
          </View>
          <View style={styles.studioTag} pointerEvents="none">
            <View style={styles.studioTagBg}>
              <Text style={styles.studioTagText}>Live preview</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
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
    marginTop: 2,
    marginBottom: 10,
  },
  viewHero: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(22, 53, 34, 0.82)',
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
  border: {
    borderRadius: RADIUS.xl,
    padding: 1.5,
    ...SHADOWS.cardElevated,
  },
  hero: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: RADIUS.xl - 1.5,
    backgroundColor: 'rgba(22, 53, 34, 0.82)',
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
  studioTag: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 4,
  },
  studioTagBg: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(13, 40, 24, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  studioTagText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: COLORS.linen,
  },
});
