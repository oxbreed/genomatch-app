import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../GenoSignaturePattern';
import { GENO_VISUAL } from './genoVisualTokens';
import { COLORS } from '../../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  showWatermark?: boolean;
};

/** Signature gradient card frame — lists, panels, modals */
export default function GenoCardFrame({ children, style, showWatermark = true }: Props) {
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
              <GenoBondMark size={40} opacity={0.05} />
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
    marginBottom: 10,
  },
  border: {
    borderRadius: 16,
    padding: 1.5,
    shadowColor: COLORS.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inner: {
    backgroundColor: COLORS.white,
    borderRadius: 14.5,
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: 8,
    bottom: 2,
    zIndex: 0,
  },
});
