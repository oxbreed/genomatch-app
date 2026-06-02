import { TextStyle } from 'react-native';
import { COLORS } from './colors';

export const TYPOGRAPHY = {
  display: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: COLORS.forest,
  } satisfies TextStyle,
  heading: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: COLORS.forest,
  } satisfies TextStyle,
  headingSm: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: COLORS.forest,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22.5,
    color: COLORS.textMuted,
  } satisfies TextStyle,
  bodyStrong: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22.5,
    color: COLORS.forest,
  } satisfies TextStyle,
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: COLORS.sage,
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19.5,
    color: COLORS.textSubtle,
  } satisfies TextStyle,
} as const;
