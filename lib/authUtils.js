import { supabase } from './supabaseClient';

/**
 * Clears all authentication-related data from localStorage
 */
export function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  
  const keys = Object.keys(window.localStorage);
  keys.forEach(key => {
    if (key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('ps_welcome_shown')) {
      window.localStorage.removeItem(key);
    }
  });
  
  // Also clear sessionStorage
  const sessionKeys = Object.keys(window.sessionStorage);
  sessionKeys.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      window.sessionStorage.removeItem(key);
    }
  });
}

/**
 * Force sign out and clean all auth data
 */
export async function forceSignOut() {
  try {
    clearAuthStorage();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error during force sign out:', error);
    // Even if signOut fails, clear local storage
    clearAuthStorage();
  }
}

/**
 * Check if current session is valid
 */
export async function validateSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      // Don't force sign out automatically here -- avoid removing user content
      // silently on transient/refresh errors. Let the caller decide how to
      // handle an invalid session (UI can prompt or redirect explicitly).
      console.error('Session validation error (no auto sign-out):', error);
      return false;
    }
    return !!data?.session;
  } catch (error) {
    console.error('Unexpected session validation error (no auto sign-out):', error);
    // Avoid forcing sign out here to preserve user content until explicit logout.
    return false;
  }
}
