import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenoGlassSurface } from '../../brand/graphics';
import { GENOMATCH_ABOUT_LINE, GENOMATCH_PARENT_LINE } from '../../constants/company';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  signingOut: boolean;
  onAbout: () => void;
  onCommunity: () => void;
  onPrivacy: () => void;
  onDeleteAccount: () => void;
  onSignOut: () => void;
};

function FooterLink({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
      onPress={onPress}
    >
      <Text style={[styles.linkText, destructive && styles.linkDestructive]}>{label}</Text>
      {!destructive ? (
        <Ionicons name="chevron-forward" size={16} color={COLORS.sage} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileFooterCard({
  signingOut,
  onAbout,
  onCommunity,
  onPrivacy,
  onDeleteAccount,
  onSignOut,
}: Props) {
  return (
    <View style={styles.inner}>
      <FooterLink label="About" onPress={onAbout} />
      <View style={styles.divider} />
      <FooterLink label="Community Guidelines" onPress={onCommunity} />
      <View style={styles.divider} />
      <FooterLink label="Privacy Policy" onPress={onPrivacy} />
      <View style={styles.divider} />
      <FooterLink label="Delete Account" onPress={onDeleteAccount} destructive />
      <View style={styles.divider} />
      <Text style={styles.aboutLine}>{GENOMATCH_ABOUT_LINE}</Text>
      <Text style={styles.parentLine}>{GENOMATCH_PARENT_LINE}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.signOutWrap,
          pressed && styles.linkPressed,
          signingOut && styles.signOutDisabled,
        ]}
        onPress={onSignOut}
        disabled={signingOut}
      >
        <GenoGlassSurface
          variant="light"
          borderRadius={RADIUS.md}
          shadow="glass"
          intensity={48}
          style={styles.signOutGlass}
          contentStyle={styles.signOutInner}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.forestDeep} />
          <Text style={styles.signOutText}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Text>
        </GenoGlassSurface>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingVertical: 4,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  linkPressed: { opacity: 0.82 },
  linkText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 15,
    color: COLORS.forestDeep,
  },
  linkDestructive: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  aboutLine: {
    marginTop: 8,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.textMuted,
  },
  parentLine: {
    marginBottom: 12,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.textSubtle,
  },
  signOutWrap: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  signOutGlass: {
    overflow: 'hidden',
  },
  signOutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: RADIUS.md,
  },
  signOutDisabled: { opacity: 0.6 },
  signOutText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.forestDeep,
  },
});
