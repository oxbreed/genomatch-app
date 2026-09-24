import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, FONT_FAMILY, goldAlpha } from '../../theme';

type Props = {
  onContinue: () => void;
  onSendMessage?: () => void;
  /** When there is no message handler, still show the control and dismiss. */
  messageFallback?: 'continue' | 'hide';
};

export default function MatchCardActions({
  onContinue,
  onSendMessage,
  messageFallback = 'hide',
}: Props) {
  const showMessage = Boolean(onSendMessage) || messageFallback === 'continue';

  return (
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue"
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onContinue();
        }}
        style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={[COLORS.glossyRedDeep, COLORS.glossyRed, COLORS.glossyRed]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.primary}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.sheen}
            pointerEvents="none"
          />
          <Text style={styles.primaryLabel}>Continue</Text>
          <View style={styles.arrowBadge}>
            <Ionicons name="arrow-forward" size={16} color={COLORS.ink} />
          </View>
        </LinearGradient>
      </Pressable>

      {showMessage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send a message"
          onPress={() => {
            void Haptics.selectionAsync();
            if (onSendMessage) {
              onSendMessage();
              return;
            }
            onContinue();
          }}
          style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
        >
          <View style={styles.secondary}>
            <View style={styles.chatBadge}>
              <Ionicons name="chatbubble-ellipses" size={15} color={COLORS.goldBright} />
            </View>
            <Text style={styles.secondaryLabel}>Send a message</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
    alignSelf: 'stretch',
    gap: 10,
  },
  hit: {
    width: '100%',
    borderRadius: 28,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  primary: {
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 56,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.goldBright,
    shadowColor: COLORS.glossyRed,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 22,
  },
  primaryLabel: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 17,
    letterSpacing: 0.3,
    color: COLORS.cream,
  },
  arrowBadge: {
    position: 'absolute',
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 56,
    backgroundColor: 'rgba(11, 12, 14, 0.72)',
    borderWidth: 1.5,
    borderColor: goldAlpha(0.85),
  },
  chatBadge: {
    position: 'absolute',
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: goldAlpha(0.16),
    borderWidth: 1,
    borderColor: goldAlpha(0.55),
  },
  secondaryLabel: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    letterSpacing: 0.15,
    color: COLORS.cream,
  },
});
