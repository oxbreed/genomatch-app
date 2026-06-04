import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import GenoMeshBackdrop from '../profileStudio/GenoMeshBackdrop';
import { COLORS } from '../../theme';

type Props = {
  children: ReactNode;
  studio?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Full-screen linen canvas with animated GenoMatch mesh graphics */
export default function GenoScreenCanvas({ children, studio = false, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <GenoMeshBackdrop studio={studio} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.linen,
    position: 'relative',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
