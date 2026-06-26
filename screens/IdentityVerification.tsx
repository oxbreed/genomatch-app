import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraView as CameraViewInstance } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GenoPremiumChrome } from '../src/brand/graphics';
import { submitIdentitySelfie } from '../src/lib/identityVerification';
import { COLORS, GLASS, RADIUS, SHADOWS } from '../src/theme';

type ScreenPhase = 'camera' | 'preview' | 'success';

export default function IdentityVerification() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your selfie. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <GenoPremiumChrome variant="linen" />
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.forest} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <GenoPremiumChrome variant="linen" />
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconWrap}>
              <Ionicons name="camera-outline" size={28} color={COLORS.forest} />
            </View>
            <Text style={styles.title}>Camera access needed</Text>
            <Text style={styles.subtitle}>
              We need your front camera to take a live selfie for identity verification. Gallery
              photos are not accepted.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryBtnWrap, pressed && styles.pressed]}
              onPress={() => void requestPermission()}
            >
              <LinearGradient colors={[COLORS.gold, '#C49A38']} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Allow camera access</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (phase === 'success') {
    return (
      <View style={styles.container}>
        <GenoPremiumChrome variant="linen" />
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <View style={styles.permissionCard}>
            <View style={[styles.permissionIconWrap, styles.successIconWrap]}>
              <Ionicons name="checkmark-circle" size={32} color={COLORS.forest} />
            </View>
            <Text style={styles.title}>Submitted — we'll review it shortly</Text>
            <Text style={styles.subtitle}>
              Our team will verify your selfie manually. You'll be notified once review is complete.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (phase === 'preview' && capturedUri) {
    return (
      <View style={styles.container}>
        <GenoPremiumChrome variant="linen" />
        <StatusBar style="dark" />
        <View style={styles.content}>
          <Text style={styles.title}>Review your selfie</Text>
          <Text style={styles.subtitle}>
            Make sure your face is clearly visible and well lit before submitting.
          </Text>

          <View style={styles.previewFrame}>
            <Image source={{ uri: capturedUri }} style={styles.previewImage} resizeMode="cover" />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              onPress={handleRetake}
              disabled={submitting}
            >
              <Text style={styles.secondaryBtnText}>Retake</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtnWrap,
                styles.submitBtnWrap,
                pressed && styles.pressed,
                submitting && styles.disabled,
              ]}
              onPress={() => void handleSubmit()}
              disabled={submitting}
            >
              <LinearGradient colors={[COLORS.gold, '#C49A38']} style={styles.primaryBtn}>
                {submitting ? (
                  <View style={styles.submittingRow}>
                    <ActivityIndicator color={COLORS.forest} size="small" />
                    <Text style={styles.primaryBtnText}>Submitting…</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryBtnText}>Submit</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GenoPremiumChrome variant="linen" />
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Take a live selfie</Text>
        <Text style={styles.subtitle}>
          Position your face in the frame. This must be a live camera photo — not from your gallery.
        </Text>

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
          style={({ pressed }) => [
            styles.captureBtn,
            pressed && styles.pressed,
            (!cameraReady || capturing) && styles.disabled,
          ]}
          onPress={() => void handleCapture()}
          disabled={!cameraReady || capturing}
        >
          {capturing ? (
            <ActivityIndicator color={COLORS.forest} />
          ) : (
            <View style={styles.captureBtnInner} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  content: {
    flex: 1,
    paddingTop: 72,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  permissionCard: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: GLASS.insetBorder,
    backgroundColor: GLASS.insetFill,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  permissionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(168, 213, 186, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successIconWrap: {
    backgroundColor: 'rgba(168, 213, 186, 0.45)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(7, 77, 46, 0.65)',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraFrame: {
    flex: 1,
    minHeight: 360,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#0D2818',
    marginBottom: 24,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    flex: 1,
    minHeight: 360,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#0D2818',
    marginBottom: 20,
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
    borderColor: COLORS.forest,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    ...SHADOWS.button,
  },
  captureBtnInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.forest,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  secondaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.forest,
  },
  primaryBtnWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  submitBtnWrap: {
    flex: 1.4,
  },
  primaryBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.forest,
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  error: {
    color: '#A32D2D',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
});
