import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export type AuthActions = {
  signUp: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<{ ok: boolean; error?: string }>;
};

export type AuthContextValue = AuthState & AuthActions;

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
