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
    kicker: 'Genotype-aware matching',
    title: 'Compatibility you can trust',
    body: 'Thoughtful genotype pairing for intentional singles — so every match starts with clarity, not guesswork.',
    highlights: ['Genotype as profile context', 'Built for Nigeria & West Africa'],
  },
  {
    icon: 'heart-half-outline',
    kicker: 'Profiles that feel human',
    title: 'More than a photo',
    body: 'Bios, interests, goals, and emotional signals — profiles designed to feel real before the first message.',
    highlights: ['Rich profile storytelling', 'Compatibility at a glance'],
  },
  {
    icon: 'sparkles-outline',
    kicker: 'Premium journey to forever',
    title: 'Ready when you are',
    body: 'Create your profile, confirm your age, and step into a dating experience crafted for lasting connection.',
    highlights: ['Guided from match to message', 'Private & verification-ready'],
  },
];
