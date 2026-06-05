import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../../brand';
import { COLORS } from '../../theme';
import { INBOX } from './inboxTokens';

type Props = {
  title: string;
  subtitle: string;
  right?: ReactNode;
};

export default function GenoInboxHeader({ title, subtitle, right }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.markWrap}>
          <GenoBondMark size={INBOX.markSize} opacity={0.92} />
          <LinearGradient
            colors={[COLORS.gold, 'transparent']}
            style={styles.markGlow}
            pointerEvents="none"
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>GENOMATCH</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {right}
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
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
    paddingBottom: 12,
    zIndex: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  markWrap: {
    width: INBOX.markSize + 2,
    height: INBOX.markSize + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  markGlow: {
    position: 'absolute',
    width: INBOX.markSize + 2,
    height: INBOX.markSize + 2,
    borderRadius: (INBOX.markSize + 2) / 2,
    opacity: 0.35,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontFamily: 'Satoshi-Bold',
    fontSize: INBOX.headerKickerSize,
    letterSpacing: 2.2,
    color: COLORS.gold,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: INBOX.headerTitleSize,
    letterSpacing: -0.4,
    color: COLORS.forestDeep,
  },
  subtitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: INBOX.headerSubtitleSize,
    lineHeight: 18,
    color: COLORS.sage,
    marginTop: 2,
  },
  rule: {
    marginTop: 12,
    height: 1,
    width: '100%',
  },
});
