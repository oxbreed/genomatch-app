import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession, signInWithPassword, invoke } = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession,
      signInWithPassword,
    },
    functions: {
      invoke,
    },
  },
}));

import { deleteUserAccount } from './accountDeletion';

describe('deleteUserAccount', () => {
  beforeEach(() => {
    getSession.mockReset();
    signInWithPassword.mockReset();
    invoke.mockReset();
  });

  it('rejects when there is no signed-in email', async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    await expect(deleteUserAccount('password123')).rejects.toThrow(
      /sign in again/i
    );
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(invoke).not.toHaveBeenCalled();
  });

  it('rejects an incorrect password and does not call delete-account', async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { email: 'member@genomatch.app' } } },
    });
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login' } });

    await expect(deleteUserAccount('wrong-password')).rejects.toThrow(
      /incorrect password/i
    );
    expect(invoke).not.toHaveBeenCalled();
  });

  it('invokes the delete-account function after a successful reauth', async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { email: 'member@genomatch.app' } } },
    });
    signInWithPassword.mockResolvedValue({ error: null });
    invoke.mockResolvedValue({ data: { success: true }, error: null });

    await expect(deleteUserAccount('password123')).resolves.toBeUndefined();
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'member@genomatch.app',
      password: 'password123',
    });
    expect(invoke).toHaveBeenCalledWith('delete-account', { method: 'POST' });
  });

  it('surfaces a contact path when the edge function is missing', async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { email: 'member@genomatch.app' } } },
    });
    signInWithPassword.mockResolvedValue({ error: null });
    invoke.mockResolvedValue({
      data: null,
      error: { message: 'Edge Function not found' },
    });

    await expect(deleteUserAccount('password123')).rejects.toThrow(
      /privacy@genomatch\.app/i
    );
  });

  it('rejects when the function returns an unsuccessful payload', async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { email: 'member@genomatch.app' } } },
    });
    signInWithPassword.mockResolvedValue({ error: null });
    invoke.mockResolvedValue({ data: { success: false }, error: null });

    await expect(deleteUserAccount('password123')).rejects.toThrow(
      /account deletion failed/i
    );
  });
});
