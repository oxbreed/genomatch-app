import { uploadImageToCloudinary } from './cloudinary';
import { supabase } from './supabase';
import type { SelfieIdentityStatus } from './verification';

function isMissingRpcError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? '';
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    (msg.includes('function') && msg.includes('does not exist'))
  );
}

export async function submitIdentitySelfie(imageUri: string): Promise<{ status: string }> {
  const selfieUrl = await uploadImageToCloudinary(imageUri);

  const { data, error } = await supabase.rpc('submit_identity_verification', {
    p_selfie_url: selfieUrl,
  });

  if (error) {
    if (isMissingRpcError(error)) {
      throw new Error('Photo verification is not available yet. Please try again after the app updates.');
    }
    throw error;
  }

  const payload = (data ?? {}) as { status?: string };
  return { status: payload.status ?? 'pending' };
}

export async function getMyIdentityStatus(): Promise<{
  status: SelfieIdentityStatus;
  rejectionReason: string | null;
}> {
  const { data, error } = await supabase.rpc('get_my_identity_status');

  if (error) {
    if (isMissingRpcError(error)) {
      return { status: 'unverified', rejectionReason: null };
    }
    throw error;
  }

  const payload = (data ?? {}) as {
    status?: string;
    rejection_reason?: string | null;
  };

  return {
    status: (payload.status ?? 'unverified') as SelfieIdentityStatus,
    rejectionReason: payload.rejection_reason ?? null,
  };
}
