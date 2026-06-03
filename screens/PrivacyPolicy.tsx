import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/theme';

type PrivacyPolicyProps = {
  onBack: () => void;
};

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Introduction',
    body:
      'GenoMatch Ltd (RC No. 9236521) collects and processes your personal data to provide genotype-aware matchmaking services. This policy explains what we collect, how we use it, and your rights.',
  },
  {
    title: 'Data We Collect',
    body:
      'We collect information you provide when using GenoMatch, including your name, email address, genotype, profile photos, messages with matches, and location (city only). We also collect technical data needed to operate the app securely.',
  },
  {
    title: 'How We Use Your Data',
    body:
      'Your data powers our matching algorithm, displays your profile to compatible members, and enables communication between mutual matches. We use your information only to deliver and improve the GenoMatch experience.',
  },
  {
    title: 'Genotype Data',
    body:
      'Genotype information is treated as sensitive health-related data. It is never sold to third parties and is used solely for compatibility scoring and safety-aware matching within GenoMatch.',
  },
  {
    title: 'Data Sharing',
    body:
      'We do not sell your personal data. We share data only with service providers essential to operating the app: Supabase (secure storage and authentication) and Cloudinary (profile photo hosting).',
  },
  {
    title: 'Your Rights',
    body:
      'You may request access to, correction of, or deletion of your personal data at any time. To exercise these rights, contact us at hello@genomatch.app and we will respond within a reasonable timeframe.',
  },
  {
    title: 'Data Retention',
    body:
      'Data for active accounts is retained while your account remains open. When you request account deletion, we delete or anonymise your personal data in line with applicable law, subject to limited retention where required for legal or security purposes.',
  },
  {
    title: 'Contact',
    body:
      'hello@genomatch.app · genomatch.app · GenoMatch Ltd, United Kingdom',
  },
];

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={onBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.forest} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: June 2026</Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 213, 186, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    opacity: 0.85,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.forest,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  updated: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.forest,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22.5,
    color: COLORS.textMuted,
  },
});
