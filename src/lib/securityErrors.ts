import type { PostgrestError } from '@supabase/supabase-js';

export type SecurityBlock =
  | 'account_banned'
  | 'account_suspended'
  | 'user_blocked'
  | 'rate_limit'
  | 'ip_banned'
  | 'city_locked'
  | 'city_cooldown'
  | 'city_location_mismatch';

const SECURITY_MESSAGES: Record<SecurityBlock, string> = {
  account_banned: 'This account has been permanently banned.',
  account_suspended: 'This account is temporarily suspended.',
  user_blocked: 'You cannot interact with this member.',
  rate_limit: 'You have reached the limit. Please try again later.',
  ip_banned: 'Access from your network is not allowed.',
  city_locked: 'Your city is locked after verification. Use Update my city if you have moved.',
  city_cooldown: 'You can update your city once every 12 months. Please try again later.',
  city_location_mismatch:
    'Your phone location does not match the detected city. Try again when you are in your new city.',
};

export function parseSecurityBlock(error: unknown): SecurityBlock | null {
  const message = extractErrorMessage(error);
  if (!message) return null;

  const upper = message.toUpperCase();

  if (upper.includes('ACCOUNT_BANNED') || upper.includes('PERMANENTLY BANNED')) {
    return 'account_banned';
  }
  if (upper.includes('ACCOUNT_SUSPENDED') || upper.includes('TEMPORARILY SUSPENDED')) {
    return 'account_suspended';
  }
  if (upper.includes('USER_BLOCKED')) return 'user_blocked';
  if (upper.includes('RATE_LIMIT_EXCEEDED') || upper.includes('RATE LIMIT')) {
    return 'rate_limit';
  }
  if (
    upper.includes('NETWORK IS NOT ALLOWED') ||
    upper.includes('NOT ALLOWED FROM YOUR NETWORK')
  ) {
    return 'ip_banned';
  }
  if (upper.includes('CITY_LOCKED')) return 'city_locked';
  if (upper.includes('CITY_UPDATE_COOLDOWN')) return 'city_cooldown';
  if (upper.includes('GPS DOES NOT MATCH') || upper.includes('CITY_NOT_SUPPORTED')) {
    return 'city_location_mismatch';
  }

  return null;
}

export function securityBlockMessage(block: SecurityBlock): string {
  return SECURITY_MESSAGES[block];
}

export function formatSecurityError(error: unknown, fallback: string): string {
  const block = parseSecurityBlock(error);
  return block ? securityBlockMessage(block) : fallback;
}

function extractErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message;

  const pg = error as PostgrestError;
  if (typeof pg.message === 'string') return pg.message;

  return null;
}
