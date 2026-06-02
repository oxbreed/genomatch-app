import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StatusBar } from 'expo-status-bar';
import GenoMatchLogo from '../src/components/GenoMatchLogo';
import { COLORS } from '../src/theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

const SLIDES: { icon: IonName; title: string; body: string }[] = [
  {
    icon: 'git-network-outline',
    title: 'Science-Led Compatibility',
    body: 'Genotype-aware matching designed for modern West African love stories.',
  },
  {
    icon: 'heart-outline',
    title: 'Emotionally Intelligent Profiles',
    body: 'Every profile blends emotional style, communication rhythm, and long-term intent.',
  },
  {
    icon: 'sparkles-outline',
    title: 'Premium Journey to Forever',
    body: 'Guided prompts and shared milestones help you build chemistry with clarity.',
  },
];

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.logoWrap}>
        <GenoMatchLogo size={72} />
      </View>
      <View style={styles.iconCard}>
        <Ionicons name={slide.icon} size={36} color={COLORS.gold} />
      </View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>
      <Pressable
        style={styles.cta}
        onPress={() => (isLast ? onFinish() : setIndex((i) => i + 1))}
      >
        <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Continue'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forest,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoWrap: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  iconCard: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.ivory,
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: 'rgba(250, 250, 247, 0.78)',
    marginBottom: 32,
  },
  cta: {
    marginTop: 'auto',
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.forest,
  },
});
