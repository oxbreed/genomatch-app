import { StyleSheet, View } from 'react-native';
import { COLORS } from '../theme';
import { GenoBondMark, GenoSignaturePattern } from './GenoSignaturePattern';
import type { EmptyStateType } from './emptyStateTypes';

type Props = {
  type: EmptyStateType;
  size?: number;
};

const SIZE = 148;

/** Branded empty-state illustration — infinity bond + contextual accent */
export default function GenoBrandScene({ type, size = SIZE }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={styles.ring} />
      <View style={styles.pattern}>
        <GenoSignaturePattern width={size} height={size * 0.7} opacity={0.35} />
      </View>
      <View style={styles.logo}>
        <GenoBondMark size={size * 0.42} />
      </View>
      <View style={[styles.accent, accentStyle(type)]} />
    </View>
  );
}

function accentStyle(type: EmptyStateType) {
  switch (type) {
    case 'no-matches':
      return { backgroundColor: COLORS.gold, top: 8, right: 12 };
    case 'no-messages':
      return { backgroundColor: COLORS.verified, bottom: 16, left: 10 };
    case 'seen-all':
      return { backgroundColor: COLORS.gold, top: 12, left: 14 };
    case 'no-results':
      return { backgroundColor: COLORS.sage, bottom: 10, right: 14 };
    default:
      return { backgroundColor: COLORS.verified, top: 10, right: 10 };
  }
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    backgroundColor: 'rgba(237, 243, 238, 0.65)',
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 999,
  },
  logo: {
    zIndex: 2,
  },
  accent: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 3,
  },
});
