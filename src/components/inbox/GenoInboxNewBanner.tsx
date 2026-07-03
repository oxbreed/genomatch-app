import { StyleSheet, Text } from 'react-native';
import { GenoGlassSurface, GenoMirrorMetallicIcon, GenoMirrorRimFrame } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  count: number;
};

export default function GenoInboxNewBanner({ count }: Props) {
  if (count <= 0) return null;

  return (
    <GenoMirrorRimFrame kind="gold" borderRadius={RADIUS.pill} style={styles.wrap}>
      <GenoGlassSurface
        variant="dark"
        borderRadius={RADIUS.pill - 1.5}
        showBorder={false}
        showSheen
        shadow="none"
        intensity={28}
        contentStyle={styles.inner}
      >
        <GenoMirrorMetallicIcon name="sparkles" size={14} tone="gold" />
        <Text style={styles.text}>
          {count} new {count === 1 ? 'match' : 'matches'} — say hi while the bond is fresh
        </Text>
      </GenoGlassSurface>
    </GenoMirrorRimFrame>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    alignSelf: 'stretch',
    width: 'auto',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.text,
  },
});
