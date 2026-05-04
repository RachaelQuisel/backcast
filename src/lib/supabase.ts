import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL — set it in .env locally and in your Vercel project env vars.'
  );
}
if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY — set it in .env locally and in your Vercel project env vars.'
  );
}

/**
 * Custom storage adapter using expo-secure-store for native
 * and localStorage for web.
 */
const isWebBrowser = Platform.OS === 'web' && typeof localStorage !== 'undefined';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWebBrowser) {
      return localStorage.getItem(key);
    }
    if (Platform.OS !== 'web') {
      return SecureStore.getItemAsync(key);
    }
    // SSR — no storage available
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWebBrowser) {
      localStorage.setItem(key, value);
      return;
    }
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWebBrowser) {
      localStorage.removeItem(key);
      return;
    }
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
