import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoBondMark } from '../../brand';
import { VERIFICATION_ATTESTATIONS, type VerificationAttestationId } from '../../lib/verification';
import { COLORS, RADIUS } from '../../theme';

type Props = {
  visible: boolean;
  genotype: string;
  verifying: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ProfileGenotypeVerifyModal({
  visible,
  genotype,
  verifying,
  onConfirm,
  onClose,
}: Props) {
  const [checked, setChecked] = useState<Record<VerificationAttestationId, boolean>>({
    identity: false,
    genotype: false,
    conduct: false,
  });

  useEffect(() => {
    if (!visible) {
      setChecked({ identity: false, genotype: false, conduct: false });
    }
  }, [visible]);

  const allChecked = useMemo(
    () => VERIFICATION_ATTESTATIONS.every((item) => checked[item.id]),
    [checked]
  );

  const toggle = (id: VerificationAttestationId) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <GenoBondMark size={40} />
          </View>
          <Text style={styles.title}>Verify your identity</Text>
          <Text style={styles.body}>
            Confirm that <Text style={styles.bold}>{genotype}</Text> is accurate and that your
            profile represents you honestly. Verified members build stronger trust on Genomatch
            Ltd Nigeria.
          </Text>

          <View style={styles.checklist}>
            {VERIFICATION_ATTESTATIONS.map((item) => {
              const isOn = checked[item.id];
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.checkRow, pressed && styles.checkPressed]}
                  onPress={() => toggle(item.id)}
                  disabled={verifying}
                >
                  <View style={[styles.checkbox, isOn && styles.checkboxOn]}>
                    {isOn ? <Ionicons name="checkmark" size={14} color={COLORS.forestDeep} /> : null}
                  </View>
                  <Text style={styles.checkLabel}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.note}>
            Verification requires a profile photo so matches can see the real you.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.confirmWrap,
              pressed && styles.pressed,
              (!allChecked || verifying) && styles.confirmDisabled,
            ]}
            onPress={onConfirm}
            disabled={!allChecked || verifying}
          >
            <LinearGradient
              colors={
                !allChecked || verifying
                  ? ['rgba(143, 175, 149, 0.45)', 'rgba(143, 175, 149, 0.3)']
                  : [COLORS.gold, '#C49A38']
              }
              style={styles.confirm}
            >
              {verifying ? (
                <ActivityIndicator color={COLORS.forestDeep} />
              ) : (
                <Text style={styles.confirmText}>Confirm verification</Text>
              )}
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onClose} disabled={verifying}>
            <Text style={styles.cancel}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.linen,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  iconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 22,
    letterSpacing: -0.3,
    color: COLORS.forestDeep,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.sage,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  bold: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forestDeep,
  },
  checklist: {
    gap: 10,
    marginBottom: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  checkPressed: { opacity: 0.88 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(143, 175, 149, 0.65)',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  checkLabel: {
    flex: 1,
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.forestDeep,
  },
  note: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSubtle,
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  confirmDisabled: { opacity: 0.95 },
  confirm: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: COLORS.forestDeep,
  },
  cancel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: COLORS.sage,
    marginTop: 14,
    textAlign: 'center',
  },
  pressed: { opacity: 0.9 },
});
