import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxmrfazktupegpfxaljo.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY. Add it to your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
