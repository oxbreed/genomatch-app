import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoGlassSurface } from '../../brand/graphics';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  message: string;
  onRetry: () => void;
};

export default function GenoInboxRetryPanel({ message, onRetry }: Props) {
  return (
    <GenoGlassSurface
      variant="light"
      borderRadius={RADIUS.lg}
      shadow="glassFloat"
      showTopRule
      style={styles.panel}
      contentStyle={styles.content}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-offline-outline" size={22} color={COLORS.forest} />
      </View>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        style={({ pressed }) => [styles.retryWrap, pressed && styles.pressed]}
        onPress={onRetry}
      >
        <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </LinearGradient>
      </Pressable>
    </GenoGlassSurface>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  content: {
    padding: 22,
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  message: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.forestDeep,
    textAlign: 'center',
  },
  retryWrap: {
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    marginTop: 4,
  },
  retry: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.forestDeep,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
