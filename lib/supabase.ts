import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Ключі беруться зі змінних середовища (Vercel → Settings → Environment Variables,
 * локально — файл .env.local). Обидва ключі публічні: дані захищає RLS у базі.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = !!(url && key);

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!url || !key) throw new Error('Supabase не налаштовано: немає NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  client ??= createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}
