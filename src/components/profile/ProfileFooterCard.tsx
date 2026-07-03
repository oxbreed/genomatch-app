import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GenoMirrorMetallicIcon, GenoMirrorRimFrame, GenoMirrorSteelFill } from '../../brand/graphics';
import { GENOMATCH_ABOUT_LINE, GENOMATCH_PARENT_LINE } from '../../constants/company';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  signingOut: boolean;
  onAbout: () => void;
  onCommunity: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
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
        <GenoMirrorMetallicIcon name="chevron-forward" size={16} tone="steel" />
      ) : null}
    </Pressable>
  );
}

export default function ProfileFooterCard({
  signingOut,
  onAbout,
  onCommunity,
  onPrivacy,
  onTerms,
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
      <FooterLink label="Terms of Service" onPress={onTerms} />
      <View style={styles.divider} />
      <FooterLink label="Delete Account" onPress={onDeleteAccount} destructive />
      <View style={styles.divider} />
      <Text style={styles.aboutLine}>{GENOMATCH_ABOUT_LINE}</Text>
      <Text style={styles.parentLine}>{GENOMATCH_PARENT_LINE}</Text>
      <Pressable
        style={({ pressed }) => [
          pressed && styles.linkPressed,
          signingOut && styles.signOutDisabled,
        ]}
        onPress={onSignOut}
        disabled={signingOut}
      >
        <GenoMirrorRimFrame kind="steel" borderRadius={RADIUS.md} style={styles.signOutRim}>
          <GenoMirrorSteelFill style={styles.signOutInner}>
            <GenoMirrorMetallicIcon name="log-out-outline" size={18} tone="steel" />
            <Text style={styles.signOutText}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Text>
          </GenoMirrorSteelFill>
        </GenoMirrorRimFrame>
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
    color: COLORS.text,
  },
  linkDestructive: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  signOutRim: {
    marginTop: 4,
    marginBottom: 8,
    alignSelf: 'stretch',
    width: '100%',
  },
  signOutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.md - 1.5,
  },
  signOutDisabled: { opacity: 0.6 },
  signOutText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.text,
  },
});
