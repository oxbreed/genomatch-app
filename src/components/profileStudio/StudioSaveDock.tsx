import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';
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
        colors={['rgba(245, 239, 230, 0)', 'rgba(245, 239, 230, 0.96)', COLORS.linen]}
        style={styles.fade}
        pointerEvents="none"
      />

      <View style={styles.panel}>
        <View style={styles.statusRow}>
          {saveState === 'saving' ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <View style={[styles.statusDot, status.live && styles.statusDotLive]} />
          )}
          <Text style={styles.statusText}>{status.text}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.doneWrap, pressed && styles.pressed, busy && styles.busy]}
          onPress={handleDone}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Done editing profile"
        >
          <LinearGradient
            colors={busy ? ['rgba(143, 175, 149, 0.5)', 'rgba(143, 175, 149, 0.35)'] : [COLORS.gold, '#C49A38']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.done}
          >
            {busy ? (
              <ActivityIndicator color={COLORS.forestDeep} size="small" />
            ) : (
              <>
                <Text style={styles.doneText}>Done</Text>
                <Ionicons name="checkmark" size={18} color={COLORS.forestDeep} />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
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
  panel: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(13, 40, 24, 0.08)',
    gap: 10,
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
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
    backgroundColor: 'rgba(143, 175, 149, 0.5)',
  },
  statusDotLive: {
    backgroundColor: COLORS.gold,
  },
  statusText: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.sage,
  },
  doneWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
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
  },
  doneText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.forestDeep,
  },
  pressed: {
    opacity: 0.9,
  },
});
