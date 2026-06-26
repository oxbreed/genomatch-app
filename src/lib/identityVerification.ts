import { uploadImageToCloudinary } from './cloudinary';
import { supabase } from './supabase';

export async function submitIdentitySelfie(imageUri: string): Promise<{ status: string }> {
  const selfieUrl = await uploadImageToCloudinary(imageUri);

  const { data, error } = await supabase.rpc('submit_identity_verification', {
    p_selfie_url: selfieUrl,
  });

  if (error) {
    throw error;
  }

  const payload = (data ?? {}) as { status?: string };
  return { status: payload.status ?? 'pending' };
}

export async function getMyIdentityStatus(): Promise<{
  status: string;
  rejectionReason: string | null;
}> {
  const { data, error } = await supabase.rpc('get_my_identity_status');

  if (error) {
    throw error;
  }

  const payload = (data ?? {}) as {
    status?: string;
    rejection_reason?: string | null;
  };

  return {
    status: payload.status ?? 'unverified',
    rejectionReason: payload.rejection_reason ?? null,
  };
}
