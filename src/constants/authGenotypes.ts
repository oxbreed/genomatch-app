import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { GenotypeOption } from '../components/auth/GenotypePicker';
import { COLORS } from '../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

export const AUTH_GENOTYPE_OPTIONS: GenotypeOption[] = [
  { id: 'AA', icon: 'ellipse-outline' as IonName, name: 'Hemoglobin AA', accent: COLORS.metallicSilver },
  { id: 'AS', icon: 'ellipse-outline' as IonName, name: 'Sickle cell trait', accent: COLORS.metallicSilver },
  { id: 'SS', icon: 'ellipse-outline' as IonName, name: 'Sickle cell disease', accent: COLORS.metallicSilver },
  { id: 'AC', icon: 'ellipse-outline' as IonName, name: 'Hemoglobin AC', accent: COLORS.metallicSilver },
  { id: 'SC', icon: 'ellipse-outline' as IonName, name: 'Hemoglobin SC', accent: COLORS.metallicSilver },
];
