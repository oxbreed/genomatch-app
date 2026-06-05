import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GenoInboxHeader } from '../inbox';

type Props = {
  subtitle: string;
  right?: ReactNode;
};

/** Discover tab header — same language as Matches / Messages */
export default function GenoDiscoverHeader({ subtitle, right }: Props) {
  return (
    <View style={styles.wrap}>
      <GenoInboxHeader title="Discover" subtitle={subtitle} right={right} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 4,
  },
});
