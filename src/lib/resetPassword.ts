import { supabase } from './supabase';

export const RESET_PASSWORD_REDIRECT = 'https://www.genomatch.app/reset-password';

export function isResetPasswordDeepLink(url: string): boolean {
  return url.includes('genomatch://reset-password') || url.includes('genomatch.app/reset-password');
}

function parseUrlParams(segment: string): URLSearchParams {
  const hashIdx = segment.indexOf('#');
  const clean = hashIdx >= 0 ? segment.slice(0, hashIdx) : segment;
  return new URLSearchParams(clean);
}

/** PKCE recovery links use `?code=` in the query string. */
export function extractPkceCode(url: string): string | null {
  const queryStart = url.indexOf('?');
  if (queryStart < 0) return null;
  const params = parseUrlParams(url.slice(queryStart + 1));
  return params.get('code');
}

/** Legacy implicit-flow links put tokens in the URL hash. */
export function extractImplicitTokens(
  url: string
): { access_token: string; refresh_token: string } | null {
  const hashStart = url.indexOf('#');
  const hash = hashStart >= 0 ? url.slice(hashStart + 1) : '';
  const params = new URLSearchParams(hash);
  const access_token = params.get('access_token');
  if (!access_token) return null;
  return {
    access_token,
    refresh_token: params.get('refresh_token') ?? '',
  };
}

export async function establishSessionFromResetUrl(
  url: string
): Promise<{ error: Error | null }> {
  const code = extractPkceCode(url);
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return { error: error ?? null };
  }

  const tokens = extractImplicitTokens(url);
  if (tokens) {
    const { error } = await supabase.auth.setSession(tokens);
    return { error: error ?? null };
  }

  return { error: new Error('No reset credentials found in link') };
}

export function sendPasswordResetEmail(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: RESET_PASSWORD_REDIRECT,
  });
}

export function isRecoveryTokenExpiredMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('expired') ||
    lower.includes('invalid') ||
    lower.includes('otp') ||
    lower.includes('token')
  );
}
