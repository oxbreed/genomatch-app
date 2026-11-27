import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { GENOTYPE_VALUE_PROP } from '../../constants/healthDisclaimers';

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
    kicker: 'Genotype-aware dating',
    title: 'Find compatible matches',
    body: GENOTYPE_VALUE_PROP,
    highlights: ['Genotype from the first step', 'AA, AS, SS, AC, or SC'],
  },
  {
    icon: 'heart-half-outline',
    kicker: 'See it on every profile',
    title: 'Compatibility at a glance',
    body: 'Every Discover profile shows the genotype that member entered, alongside interests and relationship goals. You choose how you use that information.',
    highlights: ['Genotype badge on Discover', 'You enter it yourself'],
  },
  {
    icon: 'sparkles-outline',
    kicker: 'Get started',
    title: 'Share your genotype',
    body: 'Create your profile, add your genotype, and start meeting people. Confirm you are 18 or over to continue.',
    highlights: ['Genotype is required to join', 'Private & verification-ready'],
  },
];
