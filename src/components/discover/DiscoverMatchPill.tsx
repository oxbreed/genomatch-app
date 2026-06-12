import { StyleSheet, Text, View } from 'react-native';
import { discoverGlassType } from './discoverGlassType';

type Props = {
  percent: number;
};

/** Bond % as transparent glass type — no bar, pill, or container */
export default function DiscoverMatchPill({ percent }: Props) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={discoverGlassType.percent}>{percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 8,
  },
});
