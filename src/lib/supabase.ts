import { createClient } from '@supabase/supabase-js';
import {
  deleteLargeSecureItem,
  getLargeSecureItem,
  setLargeSecureItem,
} from './largeSecureStore';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://rxmrfazktupegpfxaljo.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY. Add it to your .env.local file.'
  );
}

/** Encrypted session storage for React Native (not AsyncStorage). */
const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await getLargeSecureItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await setLargeSecureItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await deleteLargeSecureItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    storageKey: 'genomatch-auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});
