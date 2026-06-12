import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { GenoPremiumChrome, GenoGlassSurface } from '../../brand/graphics';
import GenoMatchLogo from '../GenoMatchLogo';
import { GenoBondMark } from '../../brand';
import { FONT_FAMILY, COLORS, RADIUS, SHADOWS } from '../../theme';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  topRight?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  showBrand?: boolean;
  statusBarStyle?: 'light' | 'dark';
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Unified premium canvas for splash-adjacent flows: onboarding, register, profile setup.
 * Linen backdrop + readable forest typography (fixes low-contrast ivory-on-linen bugs).
 */
export default function GenoJourneyShell({
  children,
  footer,
  topRight,
  onBack,
  backLabel = 'Back',
  showBrand = true,
  statusBarStyle = 'dark',
  contentStyle,
}: Props) {
  return (
    <View style={styles.root}>
      <GenoPremiumChrome variant="linen" />
      <StatusBar style={statusBarStyle} />

      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          {onBack ? (
            <GenoGlassSurface
              variant="light"
              borderRadius={RADIUS.pill}
              shadow="glass"
              intensity={40}
              style={styles.backBtn}
              contentStyle={styles.backBtnInner}
            >
              <Pressable
                style={({ pressed }) => [styles.backPress, pressed && styles.pressed]}
                onPress={onBack}
                hitSlop={8}
              >
                <Text style={styles.backText}>{backLabel}</Text>
              </Pressable>
            </GenoGlassSurface>
          ) : showBrand ? (
            <View style={styles.brandRow}>
              <GenoMatchLogo size={34} />
              <GenoBondMark size={22} opacity={0.88} />
            </View>
          ) : (
            <View />
          )}
        </View>
        {topRight ? <View style={styles.topRight}>{topRight}</View> : null}
      </View>

      <View style={[styles.content, contentStyle]}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

type JourneyCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GenoJourneyCard({ children, style }: JourneyCardProps) {
  return (
    <View style={[styles.cardOuter, style]}>
      <LinearGradient
        colors={['rgba(212, 168, 67, 0.48)', 'rgba(61, 122, 82, 0.3)', 'rgba(212, 168, 67, 0.42)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBorder}
      >
        <GenoGlassSurface
          variant="dark"
          borderRadius={RADIUS.xl - 1.5}
          shadow="glassElevated"
          showTopRule
          showBorder={false}
          style={styles.cardGlass}
          contentStyle={styles.cardInner}
        >
          {children}
        </GenoGlassSurface>
      </LinearGradient>
    </View>
  );
}

type JourneyHeroProps = {
  kicker?: string;
  title: string;
  subtitle?: string;
};

export function GenoJourneyHero({ kicker, title, subtitle }: JourneyHeroProps) {
  return (
    <View style={styles.hero}>
      {kicker ? (
        <View style={styles.kickerPill}>
          <Text style={styles.kickerText}>{kicker}</Text>
        </View>
      ) : null}
      <Text style={styles.heroTitle}>{title}</Text>
      {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

type JourneyFooterProps = {
  step: number;
  total: number;
  helper?: string;
  ctaLabel: string;
  onPress: () => void;
  ctaNode?: ReactNode;
};

export function GenoJourneyFooter({
  step,
  total,
  helper,
  ctaLabel,
  onPress,
  ctaNode,
}: JourneyFooterProps) {
  return (
    <View style={styles.footerInner}>
      <View style={styles.dots}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[styles.dot, index === step && styles.dotActive]}
          />
        ))}
      </View>

      {ctaNode ?? (
        <Pressable
          style={({ pressed }) => [styles.ctaWrap, pressed && styles.pressed]}
          onPress={onPress}
        >
          <LinearGradient
            colors={[COLORS.gold, '#C49A38']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </LinearGradient>
        </Pressable>
      )}

      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
    zIndex: 2,
  },
  topLeft: {
    minHeight: 40,
    justifyContent: 'center',
  },
  topRight: {
    minHeight: 40,
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    overflow: 'hidden',
    borderRadius: RADIUS.pill,
  },
  backBtnInner: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backPress: {},
  backText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.forestDeep,
  },
  pressed: { opacity: 0.88 },
  content: {
    flex: 1,
    zIndex: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    zIndex: 2,
  },
  footerInner: {
    gap: 14,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(13, 40, 24, 0.14)',
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.gold,
  },
  ctaWrap: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  cta: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 17,
    color: COLORS.forestDeep,
  },
  helper: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.sage,
    textAlign: 'center',
  },
  cardOuter: {
    ...SHADOWS.cardElevated,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.14,
  },
  cardBorder: {
    borderRadius: RADIUS.xl,
    padding: 1.5,
  },
  cardGlass: {
    overflow: 'hidden',
  },
  cardInner: {
    padding: 24,
  },
  hero: {
    paddingBottom: 12,
    gap: 8,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(212, 168, 67, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  kickerText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: COLORS.gold,
  },
  heroTitle: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: COLORS.forestDeep,
  },
  heroSubtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.sage,
    maxWidth: '96%',
  },
});
