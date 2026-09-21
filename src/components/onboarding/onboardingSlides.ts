import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type GenoOnboardingSlide = {
  icon: IonName;
  kicker: string;
  title: string;
  body: string;
  highlights: readonly [string, string];
};

export const GENO_ONBOARDING_SLIDES: GenoOnboardingSlide[] = [
  {
    icon: 'git-network-outline',
    kicker: 'Science-led matching',
    title: 'Compatibility you can trust',
    body: 'Genotype-aware pairing helps you meet with clarity — before chemistry takes over.',
    highlights: ['Risk insights you can understand', 'Built for Nigeria & West Africa'],
  },
  {
    icon: 'heart-half-outline',
    kicker: 'Rich profiles',
    title: 'More than a photo',
    body: 'See bios, interests, and relationship goals so every match feels intentional.',
    highlights: ['Story-driven profiles', 'Compatibility at a glance'],
  },
  {
    icon: 'sparkles-outline',
    kicker: 'Get started',
    title: 'Create your profile',
    body: 'Confirm your age, set up your profile, and start connecting with confidence.',
    highlights: ['Guided from match to message', 'Private & verification-ready'],
  },
];
