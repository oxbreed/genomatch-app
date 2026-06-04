import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

type Props = {
  children: ReactNode;
  error?: string | null;
};

/** Pedestal for Discover pass / super-like / like controls */
export default function GenoDiscoverDock({ children, error }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.glowOrb} pointerEvents="none" />
      <LinearGradient
        colors={['transparent', 'rgba(245, 239, 230, 0.85)', COLORS.linen]}
        style={styles.pedestal}
        pointerEvents="none"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    alignItems: 'center',
    zIndex: 20,
    paddingBottom: 8,
  },
  glowOrb: {
    position: 'absolute',
    bottom: 40,
    width: 280,
    height: 56,
    borderRadius: 140,
    backgroundColor: 'rgba(212, 168, 67, 0.14)',
  },
  pedestal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  error: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: '90%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
});
