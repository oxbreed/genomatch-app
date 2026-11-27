import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { GENOTYPE_VALUE_PROP } from '../../constants/healthDisclaimers';

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

/** Three onboarding insights — kept in sync with GENO_ONBOARDING_SLIDES. */
export const ONBOARDING_INSIGHTS: OnboardingInsight[] = [
  {
    id: 'compatibility',
    icon: 'shield-checkmark-outline',
    accent: 'gold',
    kicker: 'GENOTYPE-AWARE DATING',
    title: 'Find compatible matches',
    body: GENOTYPE_VALUE_PROP,
    stat: '18+',
    statLabel: 'Adults only',
  },
  {
    id: 'profiles',
    icon: 'heart-outline',
    accent: 'metallicSilver',
    kicker: 'ON EVERY PROFILE',
    title: 'Compatibility at a glance',
    body:
      'Every Discover profile shows the genotype that member entered, alongside interests and relationship goals.',
    stat: 'AA–SC',
    statLabel: 'Genotypes you can share',
  },
  {
    id: 'journey',
    icon: 'sparkles-outline',
    accent: 'mint',
    kicker: 'GET STARTED',
    title: 'Share your genotype',
    body:
      'Create your profile, add your genotype, and start meeting people. Confirm you are 18 or over to continue.',
    stat: '1st',
    statLabel: 'Step after you join',
  },
];
