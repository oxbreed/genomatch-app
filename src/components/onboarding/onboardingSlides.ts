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
    kicker: 'Dating, 18+',
    title: 'Meet people on purpose',
    body: 'Add a self-reported genotype to your profile if you want to. GenoMatch does not turn those letters into a health result.',
    highlights: ['You type it in yourself', 'Built for Nigeria & West Africa'],
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
