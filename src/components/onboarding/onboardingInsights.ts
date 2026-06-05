import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type OnboardingInsight = {
  id: string;
  icon: IonName;
  accent: 'gold' | 'sage' | 'mint';
  kicker: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
};

/** Three world-class onboarding insights — import in App.tsx carousel */
export const ONBOARDING_INSIGHTS: OnboardingInsight[] = [
  {
    id: 'compatibility',
    icon: 'shield-checkmark-outline',
    accent: 'gold',
    kicker: 'GENOTYPE-AWARE MATCHING',
    title: 'Love with science on your side',
    body:
      'Discover people aligned with your genotype — built for intentional singles across West Africa and the diaspora.',
    stat: '75%+',
    statLabel: 'High-compat filter',
  },
  {
    id: 'profiles',
    icon: 'heart-outline',
    accent: 'sage',
    kicker: 'DEEPER SIGNALS',
    title: 'Profiles that feel human',
    body:
      'See compatibility, intent, and city context up front — so every swipe moves you closer to someone real.',
    stat: '3×',
    statLabel: 'Richer match context',
  },
  {
    id: 'journey',
    icon: 'sparkles-outline',
    accent: 'mint',
    kicker: 'PREMIUM JOURNEY',
    title: 'Designed to keep you coming back',
    body:
      'From first spark to first message, GenoMatch guides you with clarity — not chaos — so momentum never fades.',
    stat: '24h',
    statLabel: 'Fresh picks daily',
  },
];
