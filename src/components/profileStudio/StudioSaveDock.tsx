import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GenoGlassSurface,
  GenoMirrorBrandCtaFill,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
} from '../../brand/graphics';
import * as Haptics from 'expo-haptics';
import { FONT_FAMILY, COLORS, LOGO_GOLD, RADIUS, TYPOGRAPHY } from '../../theme';
import { GENO_TAB_BAR_HEIGHT } from '../navigation/tabBarLayout';

export type StudioSaveState = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  saveState: StudioSaveState;
  onDone: () => void;
  busy: boolean;
};

function statusCopy(saveState: StudioSaveState): { text: string; live: boolean } {
  switch (saveState) {
    case 'saving':
      return { text: 'Saving changes…', live: true };
    case 'saved':
      return { text: 'All changes saved', live: true };
    case 'error':
      return { text: 'Could not save — check connection', live: false };
    default:
      return { text: 'Changes save automatically', live: false };
  }
}

export default function StudioSaveDock({ saveState, onDone, busy }: Props) {
  const status = statusCopy(saveState);

  const handleDone = () => {
    if (busy) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDone();
  };

  return (
    <View style={styles.dock}>
      <LinearGradient
        colors={['rgba(10, 10, 10, 0)', 'rgba(10, 10, 10, 0.96)', COLORS.background]}
        style={styles.fade}
        pointerEvents="none"
      />

      <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.xl} style={styles.panelRim}>
        <GenoGlassSurface
          variant="dark"
          borderRadius={RADIUS.xl - 1.5}
          showBorder={false}
          showSheen
          shadow="none"
          intensity={36}
          contentStyle={styles.panel}
        >
          <View style={styles.statusRow}>
            {saveState === 'saving' ? (
              <ActivityIndicator size="small" color={LOGO_GOLD} />
            ) : (
              <View style={[styles.statusDot, status.live && styles.statusDotLive]} />
            )}
            <Text style={styles.statusText}>{status.text}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [pressed && styles.pressed, busy && styles.busy]}
            onPress={handleDone}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Done editing profile"
          >
            <GenoMirrorRimFrame kind="red" borderRadius={RADIUS.md} style={styles.doneRim}>
              {busy ? (
                <View style={styles.done}>
                  <ActivityIndicator color={COLORS.white} size="small" />
                </View>
              ) : (
                <GenoMirrorBrandCtaFill style={styles.done}>
                  <Text style={styles.doneText}>Done</Text>
                  <GenoMirrorMetallicIcon name="checkmark" size={18} tone="chrome" />
                </GenoMirrorBrandCtaFill>
              )}
            </GenoMirrorRimFrame>
          </Pressable>
        </GenoGlassSurface>
      </GenoMirrorRimFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: GENO_TAB_BAR_HEIGHT,
    zIndex: 20,
  },
  fade: {
    height: 20,
    width: '100%',
  },
  panelRim: {
    marginHorizontal: 16,
    alignSelf: 'stretch',
    width: 'auto',
  },
  panel: {
    padding: 12,
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.textSubtle,
  },
  statusDotLive: {
    backgroundColor: LOGO_GOLD,
  },
  statusText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  doneRim: {
    alignSelf: 'stretch',
    width: '100%',
  },
  busy: {
    opacity: 0.85,
  },
  done: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: RADIUS.md - 1.5,
  },
  doneText: {
    ...TYPOGRAPHY.cta,
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.9,
  },
});
