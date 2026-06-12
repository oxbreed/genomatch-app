import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../../brand';
import { GenoGlassSurface, GenoLogoCeremony } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';
import { INBOX } from './inboxTokens';

type Props = {
  title: string;
  subtitle: string;
  subtitleStyle?: StyleProp<TextStyle>;
  right?: ReactNode;
  /** Rotating halo + logo mark — profile & studio screens */
  ceremonyMark?: boolean;
  /** Frosted glass pill header — premium list screens */
  glass?: boolean;
};

function HeaderContent({
  title,
  subtitle,
  subtitleStyle,
  right,
  ceremonyMark,
}: Omit<Props, 'glass'>) {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.markWrap}>
          {ceremonyMark ? (
            <GenoLogoCeremony variant="mark" tone="dark" style={styles.ceremony} />
          ) : (
            <>
              <GenoBondMark size={INBOX.markSize} opacity={0.92} />
              <LinearGradient
                colors={[COLORS.gold, 'transparent']}
                style={styles.markGlow}
                pointerEvents="none"
              />
            </>
          )}
        </View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>GENOMATCH</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {right}
          </View>
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        </View>
      </View>
      <LinearGradient
        colors={['transparent', COLORS.gold, 'rgba(61, 122, 82, 0.4)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.rule}
        pointerEvents="none"
      />
    </>
  );
}

export default function GenoInboxHeader({
  title,
  subtitle,
  subtitleStyle,
  right,
  ceremonyMark,
  glass = false,
}: Props) {
  if (glass) {
    return (
      <View style={styles.glassWrap}>
        <GenoGlassSurface
          variant="light"
          borderRadius={RADIUS.xl}
          shadow="glassFloat"
          showTopRule
          showSheen
          intensity={58}
          style={styles.glassCard}
          contentStyle={styles.glassInner}
        >
          <HeaderContent
            title={title}
            subtitle={subtitle}
            subtitleStyle={subtitleStyle}
            right={right}
            ceremonyMark={ceremonyMark}
          />
        </GenoGlassSurface>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <HeaderContent
        title={title}
        subtitle={subtitle}
        subtitleStyle={subtitleStyle}
        right={right}
        ceremonyMark={ceremonyMark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 14,
    zIndex: 2,
  },
  glassWrap: {
    paddingTop: 50,
    paddingHorizontal: 12,
    paddingBottom: 6,
    zIndex: 2,
  },
  glassCard: {
    overflow: 'hidden',
  },
  glassInner: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
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
  ceremony: {
    width: INBOX.markSize + 4,
    height: INBOX.markSize + 4,
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
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: INBOX.headerKickerSize,
    letterSpacing: 2.4,
    color: COLORS.gold,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamSemiBold,
    fontSize: INBOX.headerTitleSize,
    letterSpacing: -0.4,
    color: COLORS.forestDeep,
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: INBOX.headerSubtitleSize,
    lineHeight: 18,
    color: COLORS.sage,
    marginTop: 1,
  },
  rule: {
    marginTop: 14,
    height: 1,
    borderRadius: 1,
  },
});
