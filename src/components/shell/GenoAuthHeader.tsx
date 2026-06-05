import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoBondMark } from '../../brand';
import { COLORS } from '../../theme';

type Props = {
  kicker?: string;
  title: string;
  subtitle: string;
  onBack?: () => void;
  backLabel?: string;
  light?: boolean;
};

export default function GenoAuthHeader({
  kicker = 'GENOMATCH',
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  light = true,
}: Props) {
  const titleColor = light ? COLORS.linen : COLORS.forestDeep;
  const subColor = light ? 'rgba(245, 239, 230, 0.78)' : COLORS.sage;

  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Ionicons
            name="chevron-back"
            size={20}
            color={light ? COLORS.linen : COLORS.forest}
          />
          <Text style={[styles.backText, { color: titleColor }]}>{backLabel}</Text>
        </Pressable>
      ) : null}

      <View style={styles.row}>
        <View style={styles.markWrap}>
          <GenoBondMark size={40} opacity={0.95} />
          <LinearGradient
            colors={[COLORS.gold, 'transparent']}
            style={styles.markGlow}
            pointerEvents="none"
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text>
        </View>
      </View>

      <LinearGradient
        colors={['transparent', COLORS.gold, 'rgba(61, 122, 82, 0.35)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.rule}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 2,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  markWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.4,
  },
  copy: { flex: 1, gap: 4 },
  kicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 2.4,
    color: COLORS.gold,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  rule: {
    marginTop: 14,
    height: 1,
    width: '100%',
  },
});
