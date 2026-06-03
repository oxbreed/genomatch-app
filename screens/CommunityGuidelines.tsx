import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/theme';

type CommunityGuidelinesProps = {
  onBack: () => void;
};

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Our Community',
    body:
      'GenoMatch is built on respect, honesty, and intentionality. Every member helps create a space where people can connect with clarity and care.',
  },
  {
    title: 'Be Honest',
    body:
      'Use real photos, share an accurate genotype, and be clear about your intentions. Authentic profiles build trust and better matches.',
  },
  {
    title: 'Be Respectful',
    body:
      'Harassment, hate speech, and discriminatory language are not tolerated. Treat others the way you would want to be treated in conversation and on dates.',
  },
  {
    title: 'Stay Safe',
    body:
      'Never share financial information with other members. When you meet in person, choose a public place and tell someone you trust where you are going.',
  },
  {
    title: 'Genotype Integrity',
    body:
      'Do not misrepresent your genotype. This information affects real families and health decisions. Self-declared verification is a trust signal, not a medical test.',
  },
  {
    title: 'Reporting',
    body:
      'Use the report button on profiles and in chats when you see a violation. Our team reviews reports within 24 hours.',
  },
  {
    title: 'Consequences',
    body:
      'Violations may result in a warning, temporary suspension, or a permanent ban depending on severity and repeat behavior.',
  },
  {
    title: 'Contact',
    body: 'Questions about these guidelines? Email hello@genomatch.app',
  },
];

export default function CommunityGuidelines({ onBack }: CommunityGuidelinesProps) {
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
        <Text style={styles.headerTitle}>Community Guidelines</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
