import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GENOMATCH_COMPANY } from '../../constants/company';
import { FONT_FAMILY, COLORS, RADIUS } from '../../theme';

type Props = {
  visible: boolean;
  deleting: boolean;
  onConfirm: (password: string) => void;
  onClose: () => void;
};

export default function ProfileDeleteAccountModal({
  visible,
  deleting,
  onConfirm,
  onClose,
}: Props) {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPassword('');
      setShowPass(false);
      setAcknowledged(false);
    }
  }, [visible]);

  const canDelete = acknowledged && password.length > 0 && !deleting;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="warning-outline" size={28} color={COLORS.error} />
          </View>

          <Text style={styles.title}>Delete your account?</Text>
          <Text style={styles.body}>
            This permanently deletes your profile, photos, matches, and messages. This cannot be
            undone.
          </Text>
          <Text style={styles.bodySecondary}>
            Enter your password to confirm. If you need help, contact{' '}
            {GENOMATCH_COMPANY.privacyEmail}.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.checkRow, pressed && styles.checkPressed]}
            onPress={() => setAcknowledged((prev) => !prev)}
            disabled={deleting}
          >
            <View style={[styles.checkbox, acknowledged && styles.checkboxOn]}>
              {acknowledged ? (
                <Ionicons name="checkmark" size={14} color={COLORS.forestDeep} />
              ) : null}
            </View>
            <Text style={styles.checkLabel}>
              I understand this will permanently delete my account and data.
            </Text>
          </Pressable>

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <View style={styles.passwordSpacer} />
            <Pressable onPress={() => setShowPass((prev) => !prev)} hitSlop={8} disabled={deleting}>
              <Text style={styles.togglePassText}>{showPass ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Your account password"
            placeholderTextColor="rgba(27, 122, 110, 0.35)"
            secureTextEntry={!showPass}
            autoComplete="password"
            textContentType="password"
            editable={!deleting}
          />

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.btnPressed]}
              onPress={onClose}
              disabled={deleting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.deleteBtn,
                !canDelete && styles.deleteBtnDisabled,
                pressed && canDelete && styles.btnPressed,
              ]}
              onPress={() => onConfirm(password)}
              disabled={!canDelete}
            >
              {deleting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.deleteText}>Delete my account</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 40, 24, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: COLORS.linen,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(163, 45, 45, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 22,
    color: COLORS.forestDeep,
    marginBottom: 10,
  },
  body: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(13, 40, 24, 0.72)',
    marginBottom: 8,
  },
  bodySecondary: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(13, 40, 24, 0.58)',
    marginBottom: 16,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  checkPressed: { opacity: 0.88 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 122, 110, 0.28)',
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
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.forestDeep,
  },
  label: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 14,
    color: COLORS.forest,
    marginBottom: 8,
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  passwordSpacer: { flex: 1 },
  togglePassText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 13,
    color: COLORS.forest,
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    height: 50,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 122, 110, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 14,
    color: COLORS.forestDeep,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(27, 122, 110, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: COLORS.forestDeep,
  },
  deleteBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnDisabled: {
    opacity: 0.45,
  },
  deleteText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  btnPressed: { opacity: 0.9 },
});
