import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { blockUser, reportUser, REPORT_REASONS } from '../lib/moderation';

type ReportBlockSheetProps = {
  visible: boolean;
  onClose: () => void;
  targetUserId: string;
  targetName: string;
  onBlocked?: () => void;
};

type SheetStep = 'menu' | 'reasons' | 'success';

export default function ReportBlockSheet({
  visible,
  onClose,
  targetUserId,
  targetName,
  onBlocked,
}: ReportBlockSheetProps) {
  const [step, setStep] = useState<SheetStep>('menu');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const displayName = targetName?.trim() || 'this user';

  useEffect(() => {
    if (!visible) {
      setStep('menu');
      setSuccessMessage('');
      setLoading(false);
      setError('');
    }
  }, [visible]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleBlock = async () => {
    setLoading(true);
    setError('');
    try {
      await blockUser(targetUserId);
      setSuccessMessage(`You have blocked ${displayName}. They will no longer appear in your matches.`);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not block user');
    } finally {
      setLoading(false);
    }
  };

  const handleReportReason = async (reason: string) => {
    setLoading(true);
    setError('');
    try {
      await reportUser(targetUserId, reason);
      setSuccessMessage('Report submitted. We will review within 24 hours.');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    const wasBlock = successMessage.includes('blocked');
    handleClose();
    if (wasBlock) {
      onBlocked?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />

          {step === 'menu' && (
            <>
              <Text style={styles.sheetTitle}>Safety</Text>
              <Pressable
                style={({ pressed }) => [styles.optionRow, pressed && styles.optionPressed]}
                onPress={() => setStep('reasons')}
                disabled={loading}
              >
                <Ionicons name="flag-outline" size={22} color={COLORS.forest} />
                <Text style={styles.optionText}>Report {displayName}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSubtle} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.optionRow, pressed && styles.optionPressed]}
                onPress={handleBlock}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.forest} size="small" />
                ) : (
                  <Ionicons name="ban-outline" size={22} color={COLORS.error} />
                )}
                <Text style={[styles.optionText, styles.optionDanger]}>
                  Block {displayName}
                </Text>
              </Pressable>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Pressable style={styles.cancelBtn} onPress={handleClose} disabled={loading}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </>
          )}

          {step === 'reasons' && (
            <>
              <Pressable style={styles.backRow} onPress={() => setStep('menu')} disabled={loading}>
                <Ionicons name="chevron-back" size={22} color={COLORS.forest} />
                <Text style={styles.backLabel}>Back</Text>
              </Pressable>
              <Text style={styles.sheetTitle}>Report {displayName}</Text>
              <Text style={styles.sheetSubtitle}>Why are you reporting this profile?</Text>
              {REPORT_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  style={({ pressed }) => [styles.reasonRow, pressed && styles.optionPressed]}
                  onPress={() => handleReportReason(reason)}
                  disabled={loading}
                >
                  <Text style={styles.reasonText}>{reason}</Text>
                </Pressable>
              ))}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {loading ? (
                <ActivityIndicator style={styles.loader} color={COLORS.forest} />
              ) : null}
            </>
          )}

          {step === 'success' && (
            <>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark-circle" size={48} color={COLORS.forest} />
              </View>
              <Text style={styles.successText}>{successMessage}</Text>
              <Pressable style={styles.doneBtn} onPress={handleDone}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 77, 46, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.ivory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(7, 77, 46, 0.2)',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.forest,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  sheetSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.forest,
  },
  optionDanger: {
    color: COLORS.error,
  },
  reasonRow: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reasonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.forest,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  backLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.forest,
  },
  cancelBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
    textAlign: 'center',
  },
  loader: {
    marginTop: 12,
  },
  successIconWrap: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: COLORS.forest,
    textAlign: 'center',
    marginBottom: 20,
  },
  doneBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.forest,
  },
});
