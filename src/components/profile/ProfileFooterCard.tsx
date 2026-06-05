import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GenoCardFrame } from '../../brand/graphics';
import { COLORS } from '../../theme';
import { PROFILE } from './profileTokens';

type Props = {
  signingOut: boolean;
  onCommunity: () => void;
  onPrivacy: () => void;
  onSignOut: () => void;
};

export default function ProfileFooterCard({
  signingOut,
  onCommunity,
  onPrivacy,
  onSignOut,
}: Props) {
  return (
    <GenoCardFrame>
      <View style={styles.inner}>
        <Pressable style={styles.link} onPress={onCommunity}>
          <Text style={styles.linkText}>Community Guidelines</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={onPrivacy}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Pressable>
        <Pressable
          style={[styles.signOut, signingOut && styles.signOutDisabled]}
          onPress={onSignOut}
          disabled={signingOut}
        >
          <Text style={styles.signOutText}>
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </Pressable>
      </View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  inner: { padding: 16, gap: 2 },
  link: { paddingVertical: 12 },
  linkText: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: PROFILE.sectionTitleSize,
    letterSpacing: -0.2,
    color: COLORS.forestDeep,
  },
  signOut: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(192, 57, 43, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 43, 0.2)',
    alignItems: 'center',
  },
  signOutDisabled: { opacity: 0.6 },
  signOutText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: COLORS.error,
  },
});
