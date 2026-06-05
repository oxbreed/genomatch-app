import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenoCardFrame } from '../../brand/graphics';
import { COLORS, RADIUS } from '../../theme';
import { PROFILE } from './profileTokens';

type Props = {
  signingOut: boolean;
  onCommunity: () => void;
  onPrivacy: () => void;
  onSignOut: () => void;
};

function FooterLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.link, pressed && styles.linkPressed]} onPress={onPress}>
      <Text style={styles.linkText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.sage} />
    </Pressable>
  );
}

export default function ProfileFooterCard({
  signingOut,
  onCommunity,
  onPrivacy,
  onSignOut,
}: Props) {
  return (
    <GenoCardFrame showWatermark={false}>
      <View style={styles.inner}>
        <FooterLink label="Community Guidelines" onPress={onCommunity} />
        <View style={styles.divider} />
        <FooterLink label="Privacy Policy" onPress={onPrivacy} />
        <View style={styles.divider} />
        <Pressable
          style={({ pressed }) => [
            styles.signOut,
            pressed && styles.linkPressed,
            signingOut && styles.signOutDisabled,
          ]}
          onPress={onSignOut}
          disabled={signingOut}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.forestDeep} />
          <Text style={styles.signOutText}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Text>
        </Pressable>
      </View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingVertical: 4,
    paddingHorizontal: PROFILE.cardPadding,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  linkPressed: { opacity: 0.82 },
  linkText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: COLORS.forestDeep,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutDisabled: { opacity: 0.6 },
  signOutText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: COLORS.forestDeep,
  },
});
