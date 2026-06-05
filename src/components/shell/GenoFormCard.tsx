import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GenoCardFrame } from '../../brand/graphics';

type Props = {
  children: ReactNode;
  style?: object;
};

/** Premium form panel — same frame language as Matches / Messages cards */
export default function GenoFormCard({ children, style }: Props) {
  return (
    <GenoCardFrame style={[styles.wrap, style]}>
      <View style={styles.inner}>{children}</View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  inner: {
    padding: 20,
  },
});
