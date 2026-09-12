import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE = 'labstock_supabase_credentials';

export function getStoredCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  try {
    const stored = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
      }
    }
  } catch (e) {
    console.error('Failed to read stored supabase credentials', e);
  }

  return { url: envUrl, anonKey: envKey };
}

export function saveStoredCredentials(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
  resetSupabaseClient();
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getStoredCredentials();
  
  if (!url || !anonKey || url.includes('placeholder') || !url.startsWith('http')) {
    return null;
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (e) {
      console.error('Errore inizializzazione Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}
