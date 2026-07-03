import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { GenotypeOption } from '../components/auth/GenotypePicker';
import { BRAND_RED_SOFT, COLORS, LOGO_RED } from '../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

export const AUTH_GENOTYPE_OPTIONS: GenotypeOption[] = [
  {
    id: 'AA',
    icon: 'heart' as IonName,
    name: 'AA — no sickle cell trait',
    accent: LOGO_RED,
  },
  {
    id: 'AS',
    icon: 'star-half' as IonName,
    name: 'AS — sickle cell carrier',
    accent: COLORS.gold,
  },
  {
    id: 'SS',
    icon: 'medical' as IonName,
    name: 'SS — sickle cell disease',
    accent: COLORS.error,
  },
  {
    id: 'AC',
    icon: 'water' as IonName,
    name: 'AC — hemoglobin C carrier',
    accent: BRAND_RED_SOFT,
  },
];
