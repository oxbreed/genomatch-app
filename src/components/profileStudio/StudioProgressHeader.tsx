import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  activeStep: number;
  totalSteps: number;
  stepLabel: string;
  doneCount: number;
  essentialsTotal: number;
  hasChanges: boolean;
};

export default function StudioProgressHeader({
  activeStep,
  totalSteps,
  stepLabel,
  doneCount,
  essentialsTotal,
  hasChanges,
}: Props) {
  const progress = totalSteps > 1 ? activeStep / (totalSteps - 1) : 1;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.stepCopy}>
          <Text style={styles.kicker}>PROFILE STUDIO</Text>
          <Text style={styles.title}>
            Step {activeStep + 1} of {totalSteps} · {stepLabel}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {doneCount}/{essentialsTotal}
          </Text>
        </View>
      </View>

      <View style={styles.track}>
        <LinearGradient
          colors={['rgba(13, 40, 24, 0.08)', 'rgba(212, 168, 67, 0.25)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.trackFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <Text style={styles.sub}>
        {hasChanges
          ? 'Unpublished changes — publish when you are ready'
          : 'Only you see this draft until you publish'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(13, 40, 24, 0.08)',
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepCopy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: COLORS.gold,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    color: COLORS.forestDeep,
    letterSpacing: -0.2,
  },
  badge: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(212, 168, 67, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 12,
    color: '#8C6A00',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(13, 40, 24, 0.06)',
  },
  trackFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  sub: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.sage,
  },
});
