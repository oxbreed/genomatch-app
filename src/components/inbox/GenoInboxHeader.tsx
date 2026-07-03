import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../../brand';
import {
  GenoGlassSurface,
  GenoLogoCeremony,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import { FONT_FAMILY, COLORS, LOGO_GOLD, RADIUS, chromeAlpha, goldAlpha } from '../../theme';
import { INBOX } from './inboxTokens';

type Props = {
  title: string;
  subtitle: string;
  subtitleStyle?: StyleProp<TextStyle>;
  right?: ReactNode;
  ceremonyMark?: boolean;
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
        <GenoMirrorRimFrame kind="gold" borderRadius={20} padding={1.5} style={styles.markRim}>
          {ceremonyMark ? (
            <GenoMirrorSteelFill style={styles.markWrap}>
              <GenoLogoCeremony variant="mark" tone="dark" />
            </GenoMirrorSteelFill>
          ) : (
            <GenoMirrorSteelFill style={styles.markWrap}>
              <GenoBondMark size={INBOX.markSize} opacity={0.92} />
            </GenoMirrorSteelFill>
          )}
        </GenoMirrorRimFrame>
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
        colors={['transparent', chromeAlpha(0.35), LOGO_GOLD, goldAlpha(0.35), 'transparent']}
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
        <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.xl} style={styles.glassRim}>
          <GenoGlassSurface
            variant="dark"
            borderRadius={RADIUS.xl - 1.5}
            shadow="none"
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
        </GenoMirrorRimFrame>
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
  glassRim: {
    alignSelf: 'stretch',
    width: '100%',
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
  markRim: {
    marginTop: 4,
  },
  markWrap: {
    width: INBOX.markSize + 2,
    height: INBOX.markSize + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: (INBOX.markSize + 2) / 2,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontFamily: FONT_FAMILY.marketingExtrabold,
    fontSize: INBOX.headerKickerSize,
    letterSpacing: 2.4,
    color: LOGO_GOLD,
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
    color: COLORS.text,
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: INBOX.headerSubtitleSize,
    lineHeight: 18,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  rule: {
    marginTop: 14,
    height: 1,
    borderRadius: 1,
  },
});
