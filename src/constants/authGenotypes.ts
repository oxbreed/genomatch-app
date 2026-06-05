import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { GenotypeOption } from '../components/auth/GenotypePicker';
import { COLORS } from '../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

export const AUTH_GENOTYPE_OPTIONS: GenotypeOption[] = [
  { id: 'AA', icon: 'heart' as IonName, name: 'Double Healthy', accent: COLORS.forest },
  { id: 'AS', icon: 'star-half' as IonName, name: 'Carrier', accent: '#BA7517' },
  { id: 'SS', icon: 'medical' as IonName, name: 'Sickle Cell', accent: COLORS.error },
  { id: 'AC', icon: 'water' as IonName, name: 'AC Carrier', accent: '#185FA5' },
];
