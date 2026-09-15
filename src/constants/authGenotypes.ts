import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { GenotypeOption } from '../components/auth/GenotypePicker';
import { COLORS } from '../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

export const AUTH_GENOTYPE_OPTIONS: GenotypeOption[] = [
  { id: 'AA', icon: 'ellipse-outline' as IonName, name: 'Hemoglobin AA', accent: COLORS.sage },
  { id: 'AS', icon: 'ellipse-outline' as IonName, name: 'Sickle cell trait', accent: COLORS.sage },
  { id: 'SS', icon: 'ellipse-outline' as IonName, name: 'Sickle cell disease', accent: COLORS.sage },
  { id: 'AC', icon: 'ellipse-outline' as IonName, name: 'Hemoglobin AC', accent: COLORS.sage },
];
