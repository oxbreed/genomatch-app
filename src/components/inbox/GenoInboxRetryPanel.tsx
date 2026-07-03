import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  GenoGlassSurface,
  GenoMirrorBrandCtaFill,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  message: string;
  onRetry: () => void;
};

export default function GenoInboxRetryPanel({ message, onRetry }: Props) {
  return (
    <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.lg} style={styles.panelRim}>
      <GenoGlassSurface
        variant="dark"
        borderRadius={RADIUS.lg - 1.5}
        showBorder={false}
        showSheen
        shadow="none"
        intensity={32}
        contentStyle={styles.content}
      >
        <GenoMirrorRimFrame kind="gold" borderRadius={22} padding={1.5}>
          <GenoMirrorSteelFill style={styles.iconWrap}>
            <GenoMirrorMetallicIcon name="cloud-offline-outline" size={22} tone="steel" />
          </GenoMirrorSteelFill>
        </GenoMirrorRimFrame>
        <Text style={styles.message}>{message}</Text>
        <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={onRetry}>
          <GenoMirrorRimFrame kind="red" borderRadius={RADIUS.pill}>
            <GenoMirrorBrandCtaFill style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </GenoMirrorBrandCtaFill>
          </GenoMirrorRimFrame>
        </Pressable>
      </GenoGlassSurface>
    </GenoMirrorRimFrame>
  );
}

const styles = StyleSheet.create({
  panelRim: {
    marginHorizontal: 20,
    alignSelf: 'stretch',
    width: 'auto',
  },
  content: {
    padding: 22,
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 20.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    textAlign: 'center',
  },
  retry: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.pill - 1.5,
  },
  retryText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.white,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
