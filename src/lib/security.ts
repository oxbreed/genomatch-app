import { supabase } from './supabase';

export type { SecurityBlock } from './securityErrors';
export { formatSecurityError, parseSecurityBlock, securityBlockMessage } from './securityErrors';

export async function getMyAccountStatus(): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_my_account_status');
  if (error) return null;
  return typeof data === 'string' ? data : null;
}

/** Signs out suspended/banned accounts. Returns false when access should be denied. */
export async function enforceAccountAccess(): Promise<boolean> {
  const status = await getMyAccountStatus();
  if (status === 'banned' || status === 'suspended') {
    await supabase.auth.signOut();
    return false;
  }
  return true;
}
