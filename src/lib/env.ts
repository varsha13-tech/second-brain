/**
 * Centralized env for Vite (VITE_*) so Supabase URL/key are read once and
 * both PUBLISHABLE_KEY and ANON_KEY naming are supported.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** Public origin of the app (e.g. https://secondbarin.com). Used for email redirects and auth callbacks. */
const APP_URL = import.meta.env.VITE_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "");

export const env = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  APP_URL,
  isSupabaseConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
} as const;
