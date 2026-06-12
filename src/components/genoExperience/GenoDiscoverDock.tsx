import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GenoGlassSurface } from '../../brand/graphics';
import { FONT_FAMILY, COLORS } from '../../theme';
import { GENO_TAB_BAR_HEIGHT } from '../navigation/tabBarLayout';

type Props = {
  children: ReactNode;
  error?: string | null;
};

/** Pedestal for Discover pass / super-like / like controls — floats above tab bar */
export default function GenoDiscoverDock({ children, error }: Props) {
  return (
    <View style={styles.wrap}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <GenoGlassSurface
        variant="tabBar"
        borderRadius={999}
        shadow="glassFloat"
        showTopRule={false}
        showSheen
        style={styles.actionsGlass}
        contentStyle={styles.actions}
      >
        {children}
      </GenoGlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginTop: 6,
    marginBottom: GENO_TAB_BAR_HEIGHT + 6,
    alignItems: 'center',
    zIndex: 20,
  },
  error: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: '90%',
  },
  actionsGlass: {
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  actions: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
