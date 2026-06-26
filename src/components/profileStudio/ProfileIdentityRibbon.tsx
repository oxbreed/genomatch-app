import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoCardFrame } from '../../brand/graphics';
import { FONT_FAMILY, COLORS } from '../../theme';
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
      <GenoCardFrame showWatermark={false} style={styles.frame}>
        <View style={styles.verifiedInner}>
          <View style={styles.iconVerified}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.verified} />
          </View>
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
      <GenoCardFrame showWatermark={false} style={styles.frame}>
        <View style={[styles.accentBar, styles.accentPending]} />
        <View style={styles.unverifiedInner}>
          <View style={styles.iconPending}>
            <Ionicons name="time-outline" size={24} color={COLORS.gold} />
          </View>
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
      <GenoCardFrame showWatermark={false} style={styles.frame}>
        <View style={[styles.accentBar, styles.accentVerified]} />
        <View style={styles.unverifiedInner}>
          <View style={styles.iconVerified}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.verified} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.kicker}>IDENTITY APPROVED</Text>
            <Text style={styles.title}>Confirm your genotype</Text>
            <Text style={styles.sub}>
              Your selfie was approved. Complete the final step to show a verified badge on your
              profile.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.verifyBtn, pressed && styles.pressed]}
              onPress={onGenotypeVerify}
            >
              <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.verifyGradient}>
                <Ionicons name="finger-print" size={16} color={COLORS.forestDeep} />
                <Text style={styles.verifyText}>Verify genotype</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </GenoCardFrame>
    );
  }

  const isRejected = identityStatus === 'rejected';

  return (
    <GenoCardFrame showWatermark={false} style={styles.frame}>
      <View style={[styles.accentBar, isRejected ? styles.accentRejected : styles.accentPending]} />
      <View style={styles.unverifiedInner}>
        <View style={styles.iconPending}>
          <Ionicons
            name={isRejected ? 'alert-circle-outline' : 'camera-outline'}
            size={24}
            color={isRejected ? '#A32D2D' : COLORS.gold}
          />
        </View>
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
          <Pressable
            style={({ pressed }) => [styles.verifyBtn, pressed && styles.pressed]}
            onPress={onSelfieVerify}
          >
            <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.verifyGradient}>
              <Ionicons name="camera" size={16} color={COLORS.forestDeep} />
              <Text style={styles.verifyText}>
                {isRejected ? 'Retake selfie' : 'Take selfie'}
              </Text>
            </LinearGradient>
          </Pressable>
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
    backgroundColor: COLORS.verified,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    zIndex: 1,
  },
  accentPending: {
    backgroundColor: COLORS.gold,
  },
  accentVerified: {
    backgroundColor: COLORS.verified,
  },
  accentRejected: {
    backgroundColor: '#A32D2D',
  },
  verifiedInner: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: PROFILE.cardPadding,
    alignItems: 'center',
    backgroundColor: 'rgba(237, 243, 238, 0.35)',
  },
  unverifiedInner: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    alignItems: 'flex-start',
  },
  iconVerified: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(61, 122, 82, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPending: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 4 },
  kicker: {
    ...PROFILE_TYPE.sectionKicker,
    letterSpacing: 1.6,
    color: COLORS.gold,
  },
  title: {
    ...PROFILE_TYPE.ribbonTitle,
    color: COLORS.forestDeep,
  },
  sub: {
    ...PROFILE_TYPE.ribbonSub,
    color: COLORS.sage,
    marginTop: 2,
  },
  verifyBtn: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  verifyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  verifyText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  pressed: { opacity: 0.9 },
});
