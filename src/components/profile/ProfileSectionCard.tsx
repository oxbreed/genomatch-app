import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GenoCardFrame } from '../../brand/graphics';
import ProfileSectionHeader from './ProfileSectionHeader';
import { PROFILE } from './profileTokens';

type Props = {
  label?: string;
  kicker?: string;
  hint?: string;
  children: ReactNode;
  editing?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ProfileSectionCard({
  label,
  kicker,
  hint,
  children,
  editing,
  style,
}: Props) {
  return (
    <GenoCardFrame mirror showWatermark={false} style={[styles.wrap, style]}>
      <View style={styles.inner}>
        {label ? (
          <ProfileSectionHeader kicker={kicker} title={label} hint={hint} />
        ) : null}
        {children}
      </View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: PROFILE.cardGap,
  },
  inner: {
    padding: PROFILE.cardPadding,
    paddingTop: PROFILE.cardPadding + 2,
  },
});
