import { ViewStyle } from 'react-native';
import { COLORS } from './colors';

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: COLORS.forest,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  } satisfies ViewStyle,
  cardElevated: {
    shadowColor: COLORS.forest,
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  } satisfies ViewStyle,
  button: {
    shadowColor: COLORS.forest,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  } satisfies ViewStyle,
  glass: {
    shadowColor: COLORS.forestDeep,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  } satisfies ViewStyle,
  glassElevated: {
    shadowColor: '#0B1F13',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  } satisfies ViewStyle,
  glassFloat: {
    shadowColor: COLORS.gold,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  } satisfies ViewStyle,
} as const;
