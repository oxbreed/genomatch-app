import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoLogoCeremony } from '../../brand/graphics';
import { COLORS } from '../../theme';

type Props = {
  doneCount: number;
  totalCount: number;
};

export default function StudioBanner({ doneCount, totalCount }: Props) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['#1A3D28', '#0D2818', '#142E22']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.pattern} pointerEvents="none">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.patternDot, { left: 24 + i * 52, top: 12 + (i % 2) * 28 }]}
            />
          ))}
        </View>

        <View style={styles.logoSlot}>
          <GenoLogoCeremony variant="studio" tone="light" />
        </View>

        <View style={styles.copy}>
          <Text style={styles.kicker}>GENOMATCH STUDIO</Text>
          <Text style={styles.title}>Craft your presence</Text>
          <Text style={styles.sub}>
            Draft only you see · {doneCount} of {totalCount} essentials complete
          </Text>
          <View style={styles.dots}>
            {Array.from({ length: totalCount }).map((_, i) => (
              <View key={i} style={[styles.dot, i < doneCount && styles.dotLit]} />
            ))}
          </View>
        </View>

        <Ionicons
          name="chevron-down-outline"
          size={18}
          color="rgba(245, 239, 230, 0.45)"
          style={styles.chevron}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
  },
  patternDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
  },
  logoSlot: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 2.2,
    color: COLORS.gold,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 20,
    color: COLORS.linen,
    letterSpacing: -0.3,
  },
  sub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(245, 239, 230, 0.72)',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 239, 230, 0.2)',
  },
  dotLit: {
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  chevron: {
    position: 'absolute',
    right: 14,
    bottom: 12,
  },
});
