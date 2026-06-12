import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenoGlassSurface } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  count: number;
};

export default function GenoInboxUnreadBanner({ count }: Props) {
  if (count <= 0) return null;

  return (
    <GenoGlassSurface
      variant="light"
      borderRadius={RADIUS.pill}
      shadow="glass"
      showTopRule
      style={styles.wrap}
      contentStyle={styles.inner}
    >
      <Ionicons name="chatbubble-ellipses" size={14} color={COLORS.forest} />
      <Text style={styles.text}>
        {count} unread {count === 1 ? 'conversation' : 'conversations'} — tap to jump in
      </Text>
    </GenoGlassSurface>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
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
    color: COLORS.forestDeep,
  },
});
