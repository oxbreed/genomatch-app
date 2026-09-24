import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { GenotypeOption } from '../components/auth/GenotypePicker';
import { BRAND_RED_SOFT, COLORS, LOGO_RED } from '../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

export const AUTH_GENOTYPE_OPTIONS: GenotypeOption[] = [
  {
    id: 'AA',
    icon: 'heart' as IonName,
    name: 'AA',
    accent: LOGO_RED,
  },
  {
    id: 'AS',
    icon: 'ellipse-outline' as IonName,
    name: 'AS',
    accent: COLORS.gold,
  },
  {
    id: 'SS',
    icon: 'ellipse-outline' as IonName,
    name: 'SS',
    accent: COLORS.error,
  },
  {
    id: 'AC',
    icon: 'water' as IonName,
    name: 'AC',
    accent: BRAND_RED_SOFT,
  },
  {
    id: 'SC',
    icon: 'ellipse-outline' as IonName,
    name: 'SC',
    accent: COLORS.error,
  },
];
