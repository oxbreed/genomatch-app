import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  GenoCardFrame,
  GenoMirrorBrandCtaFill,
  GenoMirrorMetallicIcon,
  GenoMirrorRimFrame,
  GenoMirrorSteelFill,
} from '../../brand/graphics';
import { FONT_FAMILY, COLORS, LOGO_GOLD } from '../../theme';
import { PROFILE, PROFILE_TYPE } from '../profile/profileTokens';

export type SelfieIdentityStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

type Props = {
  genotypeVerified: boolean;
  identityStatus: SelfieIdentityStatus;
  genotype: string;
  rejectionReason?: string | null;
  onSelfieVerify: () => void;
  onGenotypeVerify: () => void;
};

function VerifyCta({
  icon,
  label,
  onPress,
}: {
  icon: 'camera' | 'finger-print';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={onPress}>
      <GenoMirrorRimFrame kind="red" borderRadius={12}>
        <GenoMirrorBrandCtaFill style={styles.verifyGradient}>
          <GenoMirrorMetallicIcon name={icon} size={16} tone="chrome" />
          <Text style={styles.verifyText}>{label}</Text>
        </GenoMirrorBrandCtaFill>
      </GenoMirrorRimFrame>
    </Pressable>
  );
}

function StatusIcon({
  name,
  tone,
}: {
  name: 'shield-checkmark' | 'time-outline' | 'checkmark-circle' | 'alert-circle-outline' | 'camera-outline';
  tone: 'gold' | 'steel' | 'chrome';
}) {
  return (
    <GenoMirrorRimFrame kind="gold" borderRadius={22} padding={1.5}>
      <GenoMirrorSteelFill style={styles.iconBubble}>
        <GenoMirrorMetallicIcon name={name} size={22} tone={tone} />
      </GenoMirrorSteelFill>
    </GenoMirrorRimFrame>
  );
}

/** Trust strip — selfie review first, then genotype self-verify. */
export default function ProfileIdentityRibbon({
  genotypeVerified,
  identityStatus,
  genotype,
  rejectionReason,
  onSelfieVerify,
  onGenotypeVerify,
}: Props) {
  if (genotypeVerified) {
    return (
      <GenoCardFrame mirror showWatermark={false} style={styles.frame}>
        <View style={styles.verifiedInner}>
          <StatusIcon name="shield-checkmark" tone="chrome" />
          <View style={styles.copy}>
            <Text style={styles.title}>Verified member</Text>
            <Text style={styles.sub}>
              {genotype} genotype confirmed — matches see you as authentic.
            </Text>
          </View>
        </View>
      </GenoCardFrame>
    );
  }

  if (identityStatus === 'pending') {
    return (
      <GenoCardFrame mirror showWatermark={false} style={styles.frame}>
        <View style={[styles.accentBar, styles.accentPending]} />
        <View style={styles.unverifiedInner}>
          <StatusIcon name="time-outline" tone="chrome" />
          <View style={styles.copy}>
            <Text style={styles.kicker}>SELFIE REVIEW</Text>
            <Text style={styles.title}>Verification in progress</Text>
            <Text style={styles.sub}>
              We received your selfie and will review it shortly. You can complete genotype
              verification once your identity is approved.
            </Text>
          </View>
        </View>
      </GenoCardFrame>
    );
  }

  if (identityStatus === 'verified') {
    return (
      <GenoCardFrame mirror showWatermark={false} style={styles.frame}>
        <View style={[styles.accentBar, styles.accentVerified]} />
        <View style={styles.unverifiedInner}>
          <StatusIcon name="checkmark-circle" tone="chrome" />
          <View style={styles.copy}>
            <Text style={styles.kicker}>IDENTITY APPROVED</Text>
            <Text style={styles.title}>Confirm your genotype</Text>
            <Text style={styles.sub}>
              Your selfie was approved. Complete the final step to show a verified badge on your
              profile.
            </Text>
            <VerifyCta icon="finger-print" label="Verify genotype" onPress={onGenotypeVerify} />
          </View>
        </View>
      </GenoCardFrame>
    );
  }

  const isRejected = identityStatus === 'rejected';

  return (
    <GenoCardFrame mirror showWatermark={false} style={styles.frame}>
      <View style={[styles.accentBar, isRejected ? styles.accentRejected : styles.accentPending]} />
      <View style={styles.unverifiedInner}>
        <StatusIcon
          name={isRejected ? 'alert-circle-outline' : 'camera-outline'}
          tone={isRejected ? 'chrome' : 'gold'}
        />
        <View style={styles.copy}>
          <Text style={styles.kicker}>STEP 1 · SELFIE</Text>
          <Text style={styles.title}>
            {isRejected ? 'Selfie not approved' : 'Verify with a live selfie'}
          </Text>
          <Text style={styles.sub}>
            {isRejected
              ? rejectionReason?.trim() ||
                'Please submit a new live selfie with your face clearly visible.'
              : 'Take a quick front-camera selfie so our team can confirm you match your profile photos.'}
          </Text>
          <VerifyCta
            icon="camera"
            label={isRejected ? 'Retake selfie' : 'Take selfie'}
            onPress={onSelfieVerify}
          />
        </View>
      </View>
    </GenoCardFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    marginBottom: PROFILE.cardGap,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: LOGO_GOLD,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    zIndex: 1,
  },
  accentPending: {
    backgroundColor: LOGO_GOLD,
  },
  accentVerified: {
    backgroundColor: LOGO_GOLD,
  },
  accentRejected: {
    backgroundColor: COLORS.error,
  },
  verifiedInner: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: PROFILE.cardPadding,
    alignItems: 'center',
  },
  unverifiedInner: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    alignItems: 'flex-start',
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 20.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 4 },
  kicker: {
    ...PROFILE_TYPE.sectionKicker,
    letterSpacing: 1.6,
    color: LOGO_GOLD,
  },
  title: {
    ...PROFILE_TYPE.ribbonTitle,
    color: COLORS.text,
  },
  sub: {
    ...PROFILE_TYPE.ribbonSub,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  verifyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10.5,
  },
  verifyText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.white,
  },
  pressed: { opacity: 0.9 },
});
