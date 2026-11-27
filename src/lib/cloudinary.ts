import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'duivctvcp';
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'genomatch_profiles';

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && uploadPreset);
}

function toFileUri(localUri: string): string {
  if (
    localUri.startsWith('file://') ||
    localUri.startsWith('content://') ||
    localUri.startsWith('ph://') ||
    localUri.startsWith('assets-library://')
  ) {
    return localUri;
  }
  if (localUri.startsWith('/')) {
    return `file://${localUri}`;
  }
  return localUri;
}

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured.');
  }

  const file = new File(toFileUri(localUri));
  if (!file.exists) {
    throw new Error('Could not read that photo. Please take it again.');
  }

  // Expo fetch rejects the old { uri, name, type } part. A File is a supported part.
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'genomatch/avatars');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message ?? 'Photo upload failed');
  }

  return payload.secure_url;
}
