import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../GenoSignaturePattern';
import GenoGlassSurface from './GenoGlassSurface';
import { GENO_VISUAL } from './genoVisualTokens';
import { RADIUS, SHADOWS } from '../../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  showWatermark?: boolean;
  /** Use translucent glass inner (default) or solid white */
  glass?: boolean;
};

/** Signature gradient card frame — lists, panels, modals */
export default function GenoCardFrame({ children, style, showWatermark = false, glass = true }: Props) {
  return (
    <View style={[styles.outer, style]}>
      <LinearGradient
        colors={GENO_VISUAL.chrome.cardBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        {glass ? (
          <GenoGlassSurface
            variant="light"
            borderRadius={RADIUS.lg - 1}
            shadow="none"
            showBorder={false}
            intensity={52}
            style={styles.glassInner}
          >
            {showWatermark ? (
              <View style={styles.watermark} pointerEvents="none">
                <GenoBondMark size={36} opacity={0.04} />
              </View>
            ) : null}
            {children}
          </GenoGlassSurface>
        ) : (
          <View style={styles.solidInner}>
            {showWatermark ? (
              <View style={styles.watermark} pointerEvents="none">
                <GenoBondMark size={36} opacity={0.04} />
              </View>
            ) : null}
            {children}
          </View>
        )}
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
    padding: 1.5,
    ...SHADOWS.glassFloat,
    shadowOpacity: 0.14,
  },
  glassInner: {
    overflow: 'hidden',
  },
  solidInner: {
    backgroundColor: '#FFFFFF',
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
