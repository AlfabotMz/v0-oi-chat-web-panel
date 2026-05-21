import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function getSupabaseClient(url: string, anonKey: string) {
  if (!url || !anonKey) {
    throw new Error("Missing Supabase URL or Anon Key");
  }
  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    }
  });
}

export * from './agents';
