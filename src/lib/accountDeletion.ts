import { GENOMATCH_COMPANY } from '../constants/company';
import { supabase } from './supabase';

export async function deleteUserAccount(password: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const email = session?.user?.email?.trim();
  if (!email) {
    throw new Error('Could not verify your account. Please sign in again.');
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (reauthError) {
    throw new Error('Incorrect password. Please try again.');
  }

  const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>(
    'delete-account',
    { method: 'POST' }
  );

  if (error) {
    const unavailable =
      error.message?.toLowerCase().includes('failed to send') ||
      error.message?.toLowerCase().includes('not found');
    if (unavailable) {
      throw new Error(
        `Account deletion is temporarily unavailable. Please contact ${GENOMATCH_COMPANY.privacyEmail}.`
      );
    }
    throw new Error(error.message ?? 'Account deletion failed. Please try again.');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.success) {
    throw new Error('Account deletion failed. Please try again.');
  }
}
