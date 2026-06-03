import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { COLORS, FOREST, FOREST_DEEP, GOLD, LINEN, SAGE } from '../theme';

const ILLUS_SIZE = 136;

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
      <Path
        d="M60 94 C60 94 28 72 28 48 C28 36 38 26 50 26 C56 26 60 30 60 36 C60 30 64 26 70 26 C82 26 92 36 92 48 C92 72 60 94 60 94 Z"
        fill={GOLD}
        stroke={FOREST}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M24 78 L32 70 L40 76 L52 62 L64 74 L76 58 L88 68 L96 60"
        stroke={SAGE}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={24} cy={78} r={3} fill={FOREST} opacity={0.35} />
      <Circle cx={96} cy={60} r={3} fill={FOREST} opacity={0.35} />
    </Svg>
  );
}

function SeenAllIllustration() {
  return (
    <Svg width={ILLUS_SIZE} height={ILLUS_SIZE} viewBox="0 0 120 120" fill="none">
      <Circle cx={60} cy={56} r={34} fill={LINEN} stroke={SAGE} strokeWidth={3} />
      <Circle cx={60} cy={56} r={34} fill={SAGE} opacity={0.2} />
      <Path
        d="M44 56 L54 66 L78 42"
        stroke={FOREST}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={28} cy={32} r={4} fill={GOLD} />
      <Circle cx={92} cy={28} r={3} fill={GOLD} opacity={0.7} />
      <Circle cx={96} cy={72} r={3.5} fill={SAGE} />
      <Circle cx={22} cy={78} r={2.5} fill={SAGE} opacity={0.8} />
      <Path d="M30 24 L32 28 L36 28 L33 31 L34 35 L30 33 L26 35 L27 31 L24 28 L28 28 Z" fill={GOLD} opacity={0.85} />
      <Path d="M88 88 L89.5 91 L93 91 L90.5 93 L91 96 L88 94.5 L85 96 L85.5 93 L83 91 L86.5 91 Z" fill={GOLD} opacity={0.7} />
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
      <Rect
        x={18}
        y={36}
        width={52}
        height={36}
        rx={12}
        fill={SAGE}
        opacity={0.55}
        stroke={FOREST}
        strokeWidth={2}
      />
      <Path d="M28 72 L38 64 L28 64 Z" fill={SAGE} opacity={0.55} />
      <Rect
        x={50}
        y={48}
        width={52}
        height={36}
        rx={12}
        fill={GOLD}
        stroke={FOREST}
        strokeWidth={2}
      />
      <Path d="M60 84 L70 76 L60 76 Z" fill={GOLD} />
      <Line x1={62} y1={60} x2={88} y2={60} stroke={FOREST} strokeWidth={2.5} strokeLinecap="round" opacity={0.35} />
      <Line x1={62} y1={70} x2={80} y2={70} stroke={FOREST} strokeWidth={2.5} strokeLinecap="round" opacity={0.25} />
      <Circle cx={38} cy={54} r={3} fill={FOREST} opacity={0.2} />
      <Circle cx={46} cy={54} r={3} fill={FOREST} opacity={0.2} />
      <Circle cx={54} cy={54} r={3} fill={FOREST} opacity={0.2} />
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

export default function EmptyState({
  type,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const Illustration = ILLUSTRATIONS[type];

  return (
    <View style={styles.wrap}>
      <View style={styles.illusWrap}>
        <Illustration />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={onAction}
        >
          <Text style={styles.ctaText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  illusWrap: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.forest,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: COLORS.sage,
    textAlign: 'center',
    maxWidth: 280,
  },
  cta: {
    marginTop: 20,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    minWidth: 160,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.forest,
  },
});
