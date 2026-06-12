import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_FAMILY, COLORS } from '../theme';
import { GenoBondMark } from './GenoSignaturePattern';

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
};

/** Discover / Matches / Messages screen title block with signature mark */
export default function GenoBrandHeader({
  kicker = 'GENOMATCH',
  title,
  subtitle,
  right,
  style,
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <View style={styles.markCol}>
          <GenoBondMark size={40} opacity={0.95} />
          <LinearGradient
            colors={[COLORS.gold, 'transparent']}
            style={styles.markGlow}
            pointerEvents="none"
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      <LinearGradient
        colors={['transparent', COLORS.gold, 'rgba(61, 122, 82, 0.4)', 'transparent']}
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
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  markCol: {
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
    opacity: 0.35,
  },
  copy: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  kicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 2.4,
    color: COLORS.gold,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 28,
    letterSpacing: -0.5,
    color: COLORS.forestDeep,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.sage,
    marginTop: 2,
  },
  right: {
    paddingTop: 4,
  },
  rule: {
    marginTop: 14,
    height: 1,
    width: '100%',
  },
});
