import { supabase } from './supabase';

/**
 * Ensure the user has a session. Uses anonymous sign-in so users
 * don't need to create an account for the MVP — they just get a
 * persistent UUID tied to their device.
 */
export async function ensureSession(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      return session.user.id;
    }

    // Sign in anonymously — creates a new user with no email
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Anonymous sign-in failed:', error.message);
      return null;
    }

    return data.session?.user.id ?? null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Session initialization failed:', message);
    return null;
  }
}
