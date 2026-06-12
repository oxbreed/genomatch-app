import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenoGlassSurface } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  icon: 'lock-closed' | 'shield-checkmark' | 'eye-off';
  text: string;
};

export default function AuthTrustBanner({ icon, text }: Props) {
  return (
    <GenoGlassSurface
      variant="linen"
      borderRadius={RADIUS.md}
      shadow="glass"
      showTopRule
      intensity={48}
      style={styles.wrap}
      contentStyle={styles.box}
    >
      <View style={styles.icon}>
        <Ionicons name={icon} size={18} color={COLORS.verified} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </GenoGlassSurface>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    overflow: 'hidden',
  },
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  text: {
    flex: 1,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.forest,
  },
});
