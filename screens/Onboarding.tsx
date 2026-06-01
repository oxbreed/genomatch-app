import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🧬',
    title: 'Match on What Matters',
    subtitle: 'Genotype compatibility',
    body: 'The world\'s first dating app that considers your genotype — AA, AS, SS, AC — so you can make informed choices about your future together.',
  },
  {
    emoji: '💚',
    title: 'Your Emotional DNA',
    subtitle: '6-dimension compatibility',
    body: 'Answer 8 intelligent questions. Our AI scores your emotional expression, love language, conflict style, and more for deeper matches.',
  },
  {
    emoji: '🌟',
    title: 'Love Built to Last',
    subtitle: '7-day compatibility journeys',
    body: 'After matching, couples receive daily psychologist-designed questions to build real intimacy before meeting in person.',
  },
];

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      onFinish();
    }
  };

  const slide = SLIDES[current];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <TouchableOpacity style={styles.skip} onPress={onFinish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === current && styles.dotActive]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={next}>
        <Text style={styles.buttonText}>
          {current < SLIDES.length - 1 ? 'Continue' : 'Get Started'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B7A6E',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  skip: {
    alignSelf: 'flex-end',
    paddingTop: 60,
    paddingBottom: 16,
    minHeight: 48,
    justifyContent: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 44,
  },
  subtitle: {
    fontSize: 13,
    color: '#C9872B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 42,
  },
  body: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#C9872B',
  },
  button: {
    backgroundColor: '#C9872B',
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});