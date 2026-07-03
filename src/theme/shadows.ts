import { ViewStyle } from 'react-native';
import { METALLIC_GRAPHITE } from './colors';

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: METALLIC_GRAPHITE,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  } satisfies ViewStyle,
  cardElevated: {
    shadowColor: METALLIC_GRAPHITE,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  } satisfies ViewStyle,
  button: {
    shadowColor: METALLIC_GRAPHITE,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  } satisfies ViewStyle,
  glass: {
    shadowColor: METALLIC_GRAPHITE,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  } satisfies ViewStyle,
  glassElevated: {
    shadowColor: METALLIC_GRAPHITE,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  } satisfies ViewStyle,
  glassFloat: {
    shadowColor: METALLIC_GRAPHITE,
    shadowOpacity: 0.26,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  } satisfies ViewStyle,
} as const;
