const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'duivctvcp';
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'genomatch_profiles';

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && uploadPreset);
}

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured.');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: `genomatch-${Date.now()}.jpg`,
  } as unknown as Blob);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'genomatch/avatars');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const payload = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message ?? 'Photo upload failed');
  }

  return payload.secure_url;
}
