import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { LOGO_GOLD, creamAlpha } from '../../theme';
import { ONBOARDING_VISUAL_HEIGHT } from './onboardingLayout';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  name: IonName;
};

/** Icon in the fixed visual slot */
export default function GenoOnboardingSlideIcon({ name }: Props) {
  return (
    <View style={styles.slot}>
      <View style={styles.disc}>
        <Ionicons name={name} size={32} color={LOGO_GOLD} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: ONBOARDING_VISUAL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disc: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: creamAlpha(0.14),
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
