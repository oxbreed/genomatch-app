import { describe, expect, it } from 'vitest';
import { formatSecurityError, parseSecurityBlock } from './securityErrors';

describe('parseSecurityBlock', () => {
  it('detects account ban errors', () => {
    expect(parseSecurityBlock(new Error('ACCOUNT_BANNED'))).toBe('account_banned');
  });

  it('detects suspension errors', () => {
    expect(parseSecurityBlock({ message: 'ACCOUNT_SUSPENDED' })).toBe('account_suspended');
  });

  it('detects block and rate limit errors', () => {
    expect(parseSecurityBlock({ message: 'USER_BLOCKED' })).toBe('user_blocked');
    expect(parseSecurityBlock({ message: 'RATE_LIMIT_EXCEEDED' })).toBe('rate_limit');
  });

  it('detects IP ban auth messages', () => {
    expect(
      parseSecurityBlock({ message: 'Access from your network is not allowed.' })
    ).toBe('ip_banned');
  });
});

describe('formatSecurityError', () => {
  it('returns a friendly message for known security errors', () => {
    expect(formatSecurityError(new Error('RATE_LIMIT_EXCEEDED'), 'Failed')).toContain('limit');
  });

  it('falls back for unknown errors', () => {
    expect(formatSecurityError(new Error('Something else'), 'Failed')).toBe('Failed');
  });
});
