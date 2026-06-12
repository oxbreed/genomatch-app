import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../../brand';
import { FONT_FAMILY, COLORS } from '../../theme';

type Props = {
  stepLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function ProfileSetupShell({ stepLabel, title, subtitle, children }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brandRow}>
        <GenoBondMark size={32} opacity={0.92} />
        <Text style={styles.kicker}>GENOMATCH · PROFILE SETUP</Text>
      </View>
      <Text style={styles.stepLabel}>{stepLabel}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <LinearGradient
        colors={['transparent', COLORS.gold, 'rgba(61, 122, 82, 0.35)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.rule}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  kicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: COLORS.gold,
  },
  stepLabel: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: COLORS.sage,
    marginTop: 4,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: COLORS.forestDeep,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.sage,
    marginBottom: 4,
  },
  rule: {
    height: 1,
    width: '100%',
    marginTop: 6,
    marginBottom: 8,
  },
});
