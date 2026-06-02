import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { COLORS } from '../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type AppIconProps = {
  name: IonName;
  size?: number;
  color?: string;
};

export default function AppIcon({ name, size = 22, color = COLORS.forest }: AppIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
