import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

type Props = {
  width?: number | `${number}%`;
  marginVertical?: number;
};

/** Gold–sage rule with centre bond dot — section break unique to GenoMatch */
export default function GenoBrandDivider({ width = '100%', marginVertical = 16 }: Props) {
  return (
    <View style={[styles.wrap, { width, marginVertical }]}>
      <LinearGradient
        colors={['transparent', COLORS.gold, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
      <View style={styles.dotOuter}>
        <View style={styles.dotInner} />
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(61, 122, 82, 0.5)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'center',
  },
  line: {
    flex: 1,
    height: 1,
  },
  dotOuter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
  },
});
