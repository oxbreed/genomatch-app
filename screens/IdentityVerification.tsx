import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraView as CameraViewInstance } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { submitIdentitySelfie } from '../src/lib/identityVerification';
import { COLORS, FONT_FAMILY, RADIUS, SHADOWS } from '../src/theme';

type ScreenPhase = 'camera' | 'preview' | 'success';

type Props = {
  /** Return to the screen that opened the check. */
  onClose: () => void;
  /** Fired after a selfie is accepted, so the caller can refresh status. */
  onSubmitted?: () => void;
};

export default function IdentityVerification({ onClose, onSubmitted }: Props) {
  const cameraRef = useRef<CameraViewInstance>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [phase, setPhase] = useState<ScreenPhase>('camera');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady || capturing) return;

    setCapturing(true);
    setError('');
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) {
        throw new Error('Could not capture your selfie. Please try again.');
      }
      setCapturedUri(photo.uri);
      setPhase('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not capture your selfie.');
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setPhase('camera');
    setError('');
  };

  const handleSubmit = async () => {
    if (!capturedUri || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      await submitIdentitySelfie(capturedUri);
      setPhase('success');
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your selfie. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <ScreenHeader onClose={onClose} title="Live selfie" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.ink} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <ScreenHeader onClose={onClose} title="Live selfie" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <CopyCard
            title="Camera access needed"
            body="GenoMatch needs the front camera to take a live selfie. Photos already in your gallery are not accepted. This is a photo check, not a passport or government ID."
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Allow camera access"
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={() => void requestPermission()}
          >
            <Text style={styles.primaryBtnText}>Allow camera access</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'success') {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <ScreenHeader onClose={onClose} title="Live selfie" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <CopyCard
            title="Submitted"
            body="Your selfie is with the trust team. You will be notified when the review is complete. This is a photo check, not a government ID."
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Done"
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.primaryBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'preview' && capturedUri) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <ScreenHeader onClose={onClose} title="Live selfie" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <CopyCard
            title="Review your selfie"
            body="Check that your face is clear and well lit. If it is not, retake the photo before you submit."
          />
          <View style={styles.previewFrame}>
            <Image source={{ uri: capturedUri }} style={styles.previewImage} resizeMode="cover" />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retake"
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              onPress={handleRetake}
              disabled={submitting}
            >
              <Text style={styles.secondaryBtnText}>Retake</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Submit selfie"
              style={({ pressed }) => [
                styles.primaryBtn,
                styles.submitBtn,
                pressed && styles.pressed,
                submitting && styles.disabled,
              ]}
              onPress={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.cream} />
              ) : (
                <Text style={styles.primaryBtnText}>Submit</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScreenHeader onClose={onClose} title="Live selfie" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <CopyCard
          title="Take a live selfie"
          body="Hold the phone in front of your face so it fills the frame. Take the photo with the camera on this screen. Do not choose a picture from your gallery. This is a photo check, not a passport or government ID."
        />
        <View style={styles.cameraFrame}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            onCameraReady={() => setCameraReady(true)}
          />
          <View style={styles.cameraOverlay} pointerEvents="none">
            <View style={styles.faceGuide} />
          </View>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Take selfie"
          style={({ pressed }) => [
            styles.captureBtn,
            pressed && styles.pressed,
            (!cameraReady || capturing) && styles.disabled,
          ]}
          onPress={() => void handleCapture()}
          disabled={!cameraReady || capturing}
        >
          {capturing ? (
            <ActivityIndicator color={COLORS.glossyRed} />
          ) : (
            <View style={styles.captureBtnInner} />
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ScreenHeader({ onClose, title }: { onClose: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close live selfie"
        onPress={onClose}
        hitSlop={8}
        style={styles.closeBtn}
      >
        <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function CopyCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.copyCard}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.cream,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(11, 12, 14, 0.18)',
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 20,
    color: COLORS.ink,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(11, 12, 14, 0.12)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
  },
  title: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 24,
    lineHeight: 30,
    color: COLORS.ink,
  },
  body: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 17,
    lineHeight: 26,
    color: COLORS.ink,
  },
  cameraFrame: {
    height: 420,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.ink,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGuide: {
    width: '72%',
    aspectRatio: 0.78,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    backgroundColor: 'transparent',
  },
  previewFrame: {
    height: 420,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.ink,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  captureBtn: {
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    ...SHADOWS.button,
  },
  captureBtnInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.glossyRed,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 56,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(11, 12, 14, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.ink,
  },
  submitBtn: {
    flex: 1.4,
  },
  primaryBtn: {
    minHeight: 56,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.glossyRed,
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: FONT_FAMILY.gothamBold,
    color: COLORS.cream,
  },
  error: {
    color: COLORS.error,
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
});
