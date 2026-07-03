import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, Path, Rect, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import {
  GenoCardFrame,
  GenoGlassSurface,
  GenoMirrorBrandCtaFill,
  GenoMirrorRimFrame,
} from '../brand/graphics';
import {
  FONT_FAMILY,
  COLORS,
  FOREST,
  FOREST_DEEP,
  GOLD,
  LINEN,
  LOGO_GOLD,
  LOGO_GOLD_BRIGHT,
  LOGO_GOLD_DEEP,
  METALLIC_CHROME,
  METALLIC_SILVER,
  METALLIC_STEEL,
  RADIUS,
  SAGE,
} from '../theme';
import { INBOX } from './inbox/inboxTokens';

const ILLUS_SIZE = 128;

export type EmptyStateType =
  | 'no-profiles'
  | 'no-matches'
  | 'no-messages'
  | 'seen-all'
  | 'no-results';

type EmptyStateProps = {
  type: EmptyStateType;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  footer?: ReactNode;
};

function NoProfilesIllustration() {
  return (
    <Svg width={ILLUS_SIZE} height={ILLUS_SIZE} viewBox="0 0 120 120" fill="none">
      <Circle cx={44} cy={58} r={30} fill={SAGE} opacity={0.45} />
      <Circle cx={76} cy={58} r={30} fill={LINEN} stroke={FOREST} strokeWidth={2.5} opacity={0.9} />
      <Path
        d="M52 28 C58 38, 46 48, 54 58 C62 68, 50 78, 58 88 C66 98, 54 102, 60 102"
        stroke={SAGE}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Path
        d="M68 28 C62 38, 74 48, 66 58 C58 68, 70 78, 62 88 C54 98, 66 102, 60 102"
        stroke={SAGE}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Line x1={48} y1={42} x2={72} y2={42} stroke={FOREST} strokeWidth={1.8} opacity={0.25} strokeLinecap="round" />
      <Line x1={46} y1={58} x2={74} y2={58} stroke={FOREST} strokeWidth={1.8} opacity={0.25} strokeLinecap="round" />
      <Line x1={48} y1={74} x2={72} y2={74} stroke={FOREST} strokeWidth={1.8} opacity={0.25} strokeLinecap="round" />
      <Circle cx={60} cy={58} r={6} fill={GOLD} />
    </Svg>
  );
}

function NoMatchesIllustration() {
  return (
    <Svg width={ILLUS_SIZE} height={ILLUS_SIZE} viewBox="0 0 120 120" fill="none">
      <Defs>
        <SvgGradient id="mirrorGoldHeart" x1="38" y1="28" x2="38" y2="88" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={LOGO_GOLD_BRIGHT} />
          <Stop offset="0.45" stopColor={LOGO_GOLD} />
          <Stop offset="1" stopColor={LOGO_GOLD_DEEP} />
        </SvgGradient>
        <SvgGradient id="mirrorSteelStrike" x1="78" y1="32" x2="102" y2="88" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={METALLIC_CHROME} />
          <Stop offset="0.5" stopColor={METALLIC_SILVER} />
          <Stop offset="1" stopColor={METALLIC_STEEL} />
        </SvgGradient>
      </Defs>
      <Path
        d="M38 88 C38 88 14 70 14 50 C14 40 22 32 32 32 C37 32 40 35 40 40 C40 35 43 32 48 32 C58 32 66 40 66 50 C66 70 38 88 38 88 Z"
        fill="url(#mirrorGoldHeart)"
        stroke={LOGO_GOLD_DEEP}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path d="M22 36 L50 40 L48 44 L20 40 Z" fill={METALLIC_CHROME} opacity={0.35} />
      <Line
        x1={82}
        y1={34}
        x2={98}
        y2={86}
        stroke="url(#mirrorSteelStrike)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Line
        x1={82}
        y1={34}
        x2={98}
        y2={86}
        stroke={METALLIC_CHROME}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.45}
      />
    </Svg>
  );
}

function SeenAllIllustration() {
  return (
    <Svg width={ILLUS_SIZE} height={ILLUS_SIZE} viewBox="0 0 120 120" fill="none">
      <Defs>
        <SvgGradient id="mirrorGoldRing" x1="60" y1="22" x2="60" y2="90" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={LOGO_GOLD_BRIGHT} />
          <Stop offset="0.5" stopColor={LOGO_GOLD} />
          <Stop offset="1" stopColor={LOGO_GOLD_DEEP} />
        </SvgGradient>
        <SvgGradient id="mirrorChromeCheck" x1="44" y1="42" x2="78" y2="66" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.5" stopColor={METALLIC_CHROME} />
          <Stop offset="1" stopColor={METALLIC_STEEL} />
        </SvgGradient>
      </Defs>
      <Circle cx={60} cy={56} r={34} fill="url(#mirrorGoldRing)" opacity={0.22} />
      <Circle cx={60} cy={56} r={34} stroke={LOGO_GOLD} strokeWidth={2.5} opacity={0.85} />
      <Path
        d="M44 56 L54 66 L78 42"
        stroke="url(#mirrorChromeCheck)"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={28} cy={32} r={4} fill={LOGO_GOLD_BRIGHT} opacity={0.9} />
      <Circle cx={92} cy={28} r={3} fill={LOGO_GOLD} opacity={0.7} />
      <Circle cx={96} cy={72} r={3.5} fill={METALLIC_CHROME} opacity={0.8} />
      <Circle cx={22} cy={78} r={2.5} fill={METALLIC_SILVER} opacity={0.8} />
      <Path
        d="M30 24 L32 28 L36 28 L33 31 L34 35 L30 33 L26 35 L27 31 L24 28 L28 28 Z"
        fill={LOGO_GOLD_BRIGHT}
        opacity={0.85}
      />
      <Path
        d="M88 88 L89.5 91 L93 91 L90.5 93 L91 96 L88 94.5 L85 96 L85.5 93 L83 91 L86.5 91 Z"
        fill={LOGO_GOLD}
        opacity={0.7}
      />
    </Svg>
  );
}

function NoResultsIllustration() {
  return (
    <Svg width={ILLUS_SIZE} height={ILLUS_SIZE} viewBox="0 0 120 120" fill="none">
      <Circle cx={52} cy={52} r={28} fill={LINEN} stroke={FOREST_DEEP} strokeWidth={3} />
      <Circle cx={52} cy={52} r={22} fill={SAGE} opacity={0.25} />
      <Line x1={72} y1={72} x2={96} y2={96} stroke={FOREST} strokeWidth={4} strokeLinecap="round" />
      <Line x1={42} y1={42} x2={62} y2={62} stroke={FOREST} strokeWidth={3.5} strokeLinecap="round" />
      <Line x1={62} y1={42} x2={42} y2={62} stroke={FOREST} strokeWidth={3.5} strokeLinecap="round" />
      <Circle cx={96} cy={96} r={6} fill={GOLD} opacity={0.6} />
    </Svg>
  );
}

function NoMessagesIllustration() {
  return (
    <Svg width={ILLUS_SIZE} height={ILLUS_SIZE} viewBox="0 0 120 120" fill="none">
      <Defs>
        <SvgGradient id="mirrorSteelBubble" x1="14" y1="38" x2="52" y2="78" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={METALLIC_CHROME} />
          <Stop offset="0.55" stopColor={METALLIC_SILVER} />
          <Stop offset="1" stopColor={METALLIC_STEEL} />
        </SvgGradient>
        <SvgGradient id="mirrorGoldBubble" x1="58" y1="42" x2="106" y2="82" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={LOGO_GOLD_BRIGHT} />
          <Stop offset="0.5" stopColor={LOGO_GOLD} />
          <Stop offset="1" stopColor={LOGO_GOLD_DEEP} />
        </SvgGradient>
      </Defs>
      <Rect
        x={14}
        y={40}
        width={44}
        height={34}
        rx={11}
        fill="url(#mirrorSteelBubble)"
        stroke={METALLIC_STEEL}
        strokeWidth={2}
      />
      <Path d="M22 74 L32 66 L22 66 Z" fill="url(#mirrorSteelBubble)" stroke={METALLIC_STEEL} strokeWidth={1} />
      <Line x1={24} y1={54} x2={48} y2={54} stroke={METALLIC_CHROME} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
      <Line x1={24} y1={62} x2={40} y2={62} stroke={METALLIC_STEEL} strokeWidth={2.5} strokeLinecap="round" opacity={0.75} />
      <Rect
        x={58}
        y={36}
        width={48}
        height={34}
        rx={11}
        fill="url(#mirrorGoldBubble)"
        stroke={LOGO_GOLD_DEEP}
        strokeWidth={2}
      />
      <Path d="M62 40 L94 40 L92 44 L64 44 Z" fill={METALLIC_CHROME} opacity={0.4} />
      <Path d="M66 70 L76 62 L66 62 Z" fill="url(#mirrorGoldBubble)" />
      <Line x1={66} y1={50} x2={96} y2={50} stroke={METALLIC_CHROME} strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
      <Line x1={66} y1={58} x2={88} y2={58} stroke={LOGO_GOLD_BRIGHT} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
    </Svg>
  );
}

const ILLUSTRATIONS: Record<EmptyStateType, () => ReactElement> = {
  'no-profiles': NoProfilesIllustration,
  'no-matches': NoMatchesIllustration,
  'no-messages': NoMessagesIllustration,
  'seen-all': SeenAllIllustration,
  'no-results': NoResultsIllustration,
};

const TYPE_KICKER: Record<EmptyStateType, string> = {
  'no-profiles': 'DISCOVER',
  'no-matches': 'MATCHES',
  'no-messages': 'MESSAGES',
  'seen-all': 'DISCOVER',
  'no-results': 'FILTERS',
};

export default function EmptyState({
  type,
  title,
  subtitle,
  actionLabel,
  onAction,
  footer,
}: EmptyStateProps) {
  const Illustration = ILLUSTRATIONS[type];

  return (
    <View style={styles.wrap}>
      <GenoCardFrame mirror style={styles.cardFrame} showWatermark={false}>
        <GenoGlassSurface
          variant="dark"
          borderRadius={RADIUS.xl - 1}
          shadow="none"
          showTopRule
          showSheen
          intensity={36}
          style={styles.glassCard}
          contentStyle={styles.glassInner}
        >
          <Text style={styles.kicker}>{TYPE_KICKER[type]}</Text>
          <View style={styles.illusWrap}>
            <Illustration />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {actionLabel && onAction ? (
            <Pressable
              style={({ pressed }) => [styles.ctaWrap, pressed && styles.ctaPressed]}
              onPress={onAction}
            >
              <GenoMirrorRimFrame kind="red" borderRadius={RADIUS.md} style={styles.ctaRim}>
                <GenoMirrorBrandCtaFill horizontal style={styles.cta}>
                  <Text style={styles.ctaText}>{actionLabel}</Text>
                </GenoMirrorBrandCtaFill>
              </GenoMirrorRimFrame>
            </Pressable>
          ) : null}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </GenoGlassSurface>
      </GenoCardFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: INBOX.cardMarginH,
    paddingTop: 32,
    paddingBottom: 24,
  },
  cardFrame: {
    width: '100%',
    maxWidth: 320,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  glassCard: {
    overflow: 'hidden',
  },
  glassInner: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  kicker: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: LOGO_GOLD,
    marginBottom: 16,
  },
  illusWrap: {
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: ILLUS_SIZE,
    height: ILLUS_SIZE,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: INBOX.headerTitleSize,
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: INBOX.headerSubtitleSize + 1,
    lineHeight: 22,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  ctaWrap: {
    marginTop: 20,
    width: '100%',
  },
  ctaRim: {
    width: '100%',
  },
  cta: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: RADIUS.md - 1.5,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.1,
  },
  footer: {
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
});
