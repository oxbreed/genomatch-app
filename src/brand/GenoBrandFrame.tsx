import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { GenoBondMark, GenoSignaturePattern } from './GenoSignaturePattern';

type Props = {
  children: ReactNode;
  /** linen = main app; forest = auth / onboarding */
  variant?: 'linen' | 'forest';
  /** Show faint bond mark — signature watermark */
  watermark?: boolean;
};

/**
 * Classy GenoMatch screen chrome: linen/forest base, helix texture, gold top rule.
 * Identifiable but quiet — not the heavy animated mesh from earlier experiments.
 */
export default function GenoBrandFrame({
  children,
  variant = 'linen',
  watermark = false,
}: Props) {
  const isForest = variant === 'forest';
  const bg = isForest ? COLORS.forestDeep : COLORS.linen;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <View style={styles.patternTop} pointerEvents="none">
        <GenoSignaturePattern width={400} height={200} opacity={isForest ? 0.35 : 0.22} />
      </View>
      <View style={styles.patternBottom} pointerEvents="none">
        <GenoSignaturePattern width={360} height={180} opacity={isForest ? 0.2 : 0.14} />
      </View>

      <View
        style={[
          styles.orb,
          styles.orbGold,
          { opacity: isForest ? 0.12 : 0.08 },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.orb,
          styles.orbSage,
          { opacity: isForest ? 0.1 : 0.06 },
        ]}
        pointerEvents="none"
      />

      <LinearGradient
        colors={
          isForest
            ? [COLORS.gold, COLORS.verified, 'transparent']
            : [COLORS.gold, 'rgba(61, 122, 82, 0.55)', 'transparent']
        }
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.topRule}
        pointerEvents="none"
      />

      {watermark ? (
        <View style={styles.watermark} pointerEvents="none">
          <GenoBondMark size={36} opacity={isForest ? 0.2 : 0.12} />
        </View>
      ) : null}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  patternTop: {
    position: 'absolute',
    top: -20,
    right: -40,
    opacity: 1,
  },
  patternBottom: {
    position: 'absolute',
    bottom: 80,
    left: -50,
    transform: [{ rotate: '180deg' }],
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbGold: {
    width: 220,
    height: 220,
    top: -60,
    right: -80,
    backgroundColor: COLORS.gold,
  },
  orbSage: {
    width: 280,
    height: 280,
    bottom: 100,
    left: -120,
    backgroundColor: COLORS.verified,
  },
  topRule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 3,
  },
  watermark: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
});
