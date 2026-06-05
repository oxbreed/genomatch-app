import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../GenoSignaturePattern';
import { GENO_VISUAL } from './genoVisualTokens';
import { COLORS, RADIUS, SHADOWS } from '../../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  showWatermark?: boolean;
};

/** Signature gradient card frame — lists, panels, modals */
export default function GenoCardFrame({ children, style, showWatermark = false }: Props) {
  return (
    <View style={[styles.outer, style]}>
      <LinearGradient
        colors={GENO_VISUAL.chrome.cardBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        <View style={styles.inner}>
          {showWatermark ? (
            <View style={styles.watermark} pointerEvents="none">
              <GenoBondMark size={36} opacity={0.04} />
            </View>
          ) : null}
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  border: {
    borderRadius: RADIUS.lg,
    padding: 1,
    ...SHADOWS.card,
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  inner: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg - 1,
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: 10,
    bottom: 4,
    zIndex: 0,
  },
});
