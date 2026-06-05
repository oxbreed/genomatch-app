import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GenoPremiumChrome, GenoCardFrame } from '../../brand/graphics';
import { GenoInboxHeader } from '../inbox';
import { COLORS } from '../../theme';

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
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.forestDeep} />
        </Pressable>
      </View>

      <GenoInboxHeader title={title} subtitle={subtitle} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <GenoCardFrame key={section.title} style={styles.sectionFrame}>
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
  container: { flex: 1, backgroundColor: COLORS.linen },
  topBar: {
    paddingTop: 52,
    paddingHorizontal: 12,
    zIndex: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.28)',
  },
  pressed: { opacity: 0.88 },
  scroll: { paddingBottom: 32 },
  sectionFrame: { marginTop: 4 },
  sectionInner: { padding: 16 },
  sectionTitle: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 17,
    color: COLORS.forestDeep,
    marginBottom: 8,
  },
  sectionBody: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.sage,
  },
});
