import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthContextValue } from "./auth.core";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAuthErrorMessage, signIn as authSignIn, signOut as authSignOut, signUp as authSignUp } from "@/lib/auth";
import { AuthContext } from "./auth.core";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateAuth = useCallback((session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
  }, []);

  useEffect(() => {
    // Get initial session (restores from localStorage)
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        updateAuth(s);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAuth(session);
    });

    return () => subscription.unsubscribe();
  }, [updateAuth]);

  const signUp = useCallback(async (email: string, password: string) => {
    const result = await authSignUp(email, password);
    if (result.ok) return { ok: true };
    return { ok: false, error: getAuthErrorMessage(result.error) };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    if (result.ok) return { ok: true };
    return { ok: false, error: getAuthErrorMessage(result.error) };
  }, []);

  const signOut = useCallback(async () => {
    const result = await authSignOut();
    if (result.ok) return { ok: true };
    return { ok: false, error: getAuthErrorMessage(result.error) };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      signUp,
      signIn,
      signOut,
    }),
    [user, session, isLoading, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
