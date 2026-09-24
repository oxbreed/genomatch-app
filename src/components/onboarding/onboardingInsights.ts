import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type OnboardingInsight = {
  id: string;
  icon: IonName;
  accent: 'gold' | 'metallicSilver' | 'mint';
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
    kicker: 'DATING, 18+',
    title: 'Meet people on purpose',
    body:
      'Profiles can include a genotype you typed in yourself. GenoMatch does not turn that into a health result.',
    stat: '18+',
    statLabel: 'Adults only',
  },
  {
    id: 'profiles',
    icon: 'heart-outline',
    accent: 'metallicSilver',
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
