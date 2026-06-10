import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoCardFrame } from '../../brand/graphics';
import { COLORS } from '../../theme';
import { PROFILE, PROFILE_TYPE } from '../profile/profileTokens';

type Props = {
  verified: boolean;
  genotype: string;
  onVerify: () => void;
};

/** Trust & identity strip — encourages real, verified members */
export default function ProfileIdentityRibbon({ verified, genotype, onVerify }: Props) {
  if (verified) {
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

  return (
    <GenoCardFrame showWatermark={false} style={styles.frame}>
      <View style={[styles.accentBar, styles.accentPending]} />
      <View style={styles.unverifiedInner}>
        <View style={styles.iconPending}>
          <Ionicons name="person-circle-outline" size={24} color={COLORS.gold} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>IDENTITY CHECK</Text>
          <Text style={styles.title}>Verify you&apos;re real</Text>
          <Text style={styles.sub}>
            Confirm your {genotype} genotype with a profile photo so matches know you&apos;re
            legitimate on Genomatch Ltd Nigeria.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.verifyBtn, pressed && styles.pressed]}
            onPress={onVerify}
          >
            <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.verifyGradient}>
              <Ionicons name="finger-print" size={16} color={COLORS.forestDeep} />
              <Text style={styles.verifyText}>Verify now</Text>
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
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  pressed: { opacity: 0.9 },
});
