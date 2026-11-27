import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, FONT_FAMILY } from '../../theme';

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
        <View style={styles.primary}>
          <Text style={styles.primaryLabel}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.cream} />
        </View>
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
            <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.glossyRed} />
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
    marginTop: 4,
  },
  hit: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  primary: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: COLORS.glossyRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  primaryLabel: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 17,
    letterSpacing: 0.2,
    color: COLORS.cream,
  },
  secondary: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: COLORS.cream,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  secondaryLabel: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    letterSpacing: 0.1,
    color: COLORS.ink,
  },
});
