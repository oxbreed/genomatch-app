import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenoBondMark } from '../../brand';
import { GenoHelixField } from '../../brand/graphics';
import { COLORS } from '../../theme';

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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.pattern} pointerEvents="none">
            <GenoHelixField width={260} height={80} opacity={0.2} />
          </View>
          <GenoBondMark size={48} />
          <Text style={styles.title}>Confirm your genotype</Text>
          <Text style={styles.body}>
            You confirm that <Text style={styles.bold}>{genotype}</Text> is accurate to the best of
            your knowledge. Verified members build stronger trust on GenoMatch.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.confirmWrap, pressed && styles.pressed]}
            onPress={onConfirm}
            disabled={verifying}
          >
            <LinearGradient colors={[COLORS.gold, '#C49A3A']} style={styles.confirm}>
              {verifying ? (
                <ActivityIndicator color={COLORS.forestDeep} />
              ) : (
                <Text style={styles.confirmText}>Yes, I confirm</Text>
              )}
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onClose} disabled={verifying}>
            <Text style={styles.cancel}>Cancel</Text>
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
    padding: 28,
  },
  card: {
    backgroundColor: COLORS.linen,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.4)',
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  title: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 22,
    color: COLORS.forestDeep,
    marginTop: 16,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.sage,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  bold: {
    fontFamily: 'Satoshi-Bold',
    color: COLORS.forestDeep,
  },
  confirmWrap: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
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
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 14,
  },
  pressed: { opacity: 0.9 },
});
