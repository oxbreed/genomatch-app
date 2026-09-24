import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoPremiumChrome } from '../src/brand/graphics';
import GenoFormCard from '../src/components/shell/GenoFormCard';
import DiscoveryInterestPicker from '../src/components/setup/DiscoveryInterestPicker';
import {
  orderDiscoveryInterests,
  toggleDiscoveryInterest,
  type DiscoveryInterest,
} from '../src/lib/discoveryInterest';
import { saveInterestedIn } from '../src/lib/profiles';
import { COLORS, GLASS, RADIUS, SHADOWS } from '../src/theme';

type Props = {
  onComplete: () => void;
};

export default function InterestedInGate({ onComplete }: Props) {
  const [interestedIn, setInterestedIn] = useState<DiscoveryInterest[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const ctaScale = useRef(new Animated.Value(1)).current;

  const handleToggle = (option: DiscoveryInterest) => {
    setInterestedIn((prev) => toggleDiscoveryInterest(prev, option));
  };

  const handleContinue = async () => {
    if (interestedIn.length === 0) {
      setError('Please select at least one option.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await saveInterestedIn(orderDiscoveryInterests(interestedIn));
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your preference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="ink" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar style="light" />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <GenoFormCard>
            <View style={styles.stepContent}>
              <Text style={styles.stepHeading}>Who are you interested in seeing?</Text>
              <Text style={styles.stepSubheading}>
                Choose who appears in Discover. You can change this anytime under Discover → Filters.
              </Text>

              <Text style={styles.label}>Show me</Text>
              <Text style={styles.hint}>Women and Men can be combined. Everyone is open to all.</Text>
              <DiscoveryInterestPicker selected={interestedIn} onToggle={handleToggle} />
            </View>
          </GenoFormCard>
        </ScrollView>

        <View style={styles.footer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Animated.View style={[styles.ctaWrap, { transform: [{ scale: ctaScale }] }]}>
            <Pressable
              style={[styles.ctaWrapInner, saving && styles.ctaBtnDisabled]}
              disabled={saving}
              onPressIn={() => {
                Animated.spring(ctaScale, {
                  toValue: 0.97,
                  friction: 8,
                  tension: 180,
                  useNativeDriver: true,
                }).start();
              }}
              onPressOut={() => {
                Animated.spring(ctaScale, {
                  toValue: 1,
                  friction: 8,
                  tension: 180,
                  useNativeDriver: true,
                }).start();
              }}
              onPress={() => void handleContinue()}
            >
              <LinearGradient
                colors={[COLORS.gold, COLORS.goldDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.ivory} />
                ) : (
                  <Text style={styles.ctaBtnText}>Continue</Text>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },
  stepContent: {
    gap: 12,
  },
  stepHeading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: COLORS.ink,
  },
  stepSubheading: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: COLORS.hero,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.ink,
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.hero,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: GLASS.insetBorder,
    backgroundColor: 'rgba(11, 12, 14, 0.92)',
  },
  error: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaWrap: {
    width: '100%',
  },
  ctaWrapInner: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  ctaBtnDisabled: {
    opacity: 0.7,
  },
  ctaBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ivory,
    letterSpacing: 0.2,
  },
});
