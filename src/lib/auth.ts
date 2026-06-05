import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';

/** Prefer local session (fast, works offline) before validating with getUser(). */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (__DEV__) {
    console.log('[auth] getSession', {
      userId: session?.user?.id ?? null,
      expiresAt: session?.expires_at ?? null,
      error: sessionError?.message ?? null,
    });
  }

  if (session?.user?.id) return session.user.id;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (__DEV__) {
    console.log('[auth] getUser fallback', {
      userId: user?.id ?? null,
      error: userError?.message ?? null,
    });
  }

  return user?.id ?? null;
}

export async function logAuthState(context: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (__DEV__) {
    console.log(`[auth] ${context}`, {
      hasSession: !!session,
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
    });
  }
}

export function logSupabaseResult(
  label: string,
  data: unknown,
  error: PostgrestError | null
): void {
  if (__DEV__) {
    console.log(`[supabase] ${label}`, {
      rowCount: Array.isArray(data) ? data.length : data ? 1 : 0,
      data,
      error: error
        ? {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details,
          }
        : null,
    });

    if (error?.code === '42501') {
      console.warn(`[supabase] ${label} — possible RLS policy block (code 42501)`);
    }
    if (error?.message?.includes('does not exist')) {
      console.warn(
        `[supabase] ${label} — table may be missing; run Supabase migrations`
      );
    }
  }
}
