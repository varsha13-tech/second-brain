import { supabase } from "@/integrations/supabase/client";
import { env } from "@/lib/env";

export type AuthResult = { ok: true } | { ok: false; error: string };

/**
 * Reusable auth functions for email/password authentication.
 * Return a typed result so callers can handle success vs error without throwing.
 * Verification links redirect to the Second Barin app (provider remains invisible).
 */

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const options =
    env.APP_URL ?
      { emailRedirectTo: `${env.APP_URL.replace(/\/$/, "")}/auth/confirm` }
    : undefined;
  const { error } = await supabase.auth.signUp({ email, password, options });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * User-friendly messages for auth errors. Provider name is never shown to users.
 */
export function getAuthErrorMessage(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials"))
    return "Invalid email or password.";
  if (lower.includes("user already registered") || lower.includes("already been registered"))
    return "An account with this email already exists. Try logging in.";
  if (lower.includes("email not confirmed"))
    return "Please confirm your email before signing in.";
  if (lower.includes("rate limit") || lower.includes("rate_limit"))
    return "Too many attempts. Please wait a few minutes and try again.";
  if (lower.includes("token") && (lower.includes("expired") || lower.includes("invalid")))
    return "This link has expired. Please request a new verification email.";
  if (lower.includes("password"))
    return "Password does not meet requirements. Use at least 6 characters.";
  // Fallback: never expose provider or technical strings
  if (lower.includes("supabase") || lower.includes("provider") || lower.includes("auth "))
    return "Something went wrong. Please try again.";
  return rawMessage;
}
