import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { LOGO_GOLD, creamAlpha } from '../../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  name: IonName;
  size?: 'md' | 'lg';
};

const SIZES = {
  md: { disc: 44, icon: 20 },
  lg: { disc: 56, icon: 26 },
} as const;

/** Slide motif — flat icon disc (no MaskedView; Expo Go safe) */
export default function GenoOnboardingSlideIcon({ name, size = 'lg' }: Props) {
  const spec = SIZES[size];

  return (
    <View
      style={[
        styles.disc,
        {
          width: spec.disc,
          height: spec.disc,
          borderRadius: spec.disc / 2,
        },
      ]}
    >
      <Ionicons name={name} size={spec.icon} color={LOGO_GOLD} />
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: creamAlpha(0.12),
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
