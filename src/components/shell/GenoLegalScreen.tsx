import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GenoPremiumChrome, GenoCardFrame } from '../../brand/graphics';
import { GenoGlassIconButton } from '../inbox';
import { FONT_FAMILY, COLORS } from '../../theme';

type Section = { title: string; body: string };

type Props = {
  title: string;
  subtitle: string;
  sections: Section[];
  onBack: () => void;
};

export default function GenoLegalScreen({ title, subtitle, sections, onBack }: Props) {
  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="linen" />
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <GenoGlassIconButton onPress={onBack} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </GenoGlassIconButton>
        <View style={styles.heading}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <GenoCardFrame key={section.title} glass={false} style={styles.sectionFrame}>
            <View style={styles.sectionInner}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          </GenoCardFrame>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  topBar: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 2,
    gap: 14,
  },
  heading: {
    gap: 6,
    paddingRight: 8,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.label,
  },
  scroll: { paddingTop: 8, paddingBottom: 40 },
  sectionFrame: { marginTop: 4 },
  sectionInner: { paddingHorizontal: 18, paddingVertical: 18 },
  sectionTitle: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.ink,
    marginBottom: 8,
  },
  sectionBody: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(11, 12, 14, 0.88)',
  },
});
