# Second Barin – Authentication

## Overview

Auth is implemented with email + password, a central **AuthContext**, reusable **auth helpers**, **protected routes**, and **Login** / **Signup** pages. The auth provider remains invisible to users: all emails and verification links are branded as Second Barin and redirect back into the app. See **docs/BRANDED_AUTH_SETUP.md** for sender, templates, and redirect configuration.

## Folder structure

```
src/
  lib/auth.ts              # Reusable signUp, signIn, signOut + error messages (no provider names in UI)
  contexts/AuthContext.tsx # AuthProvider + useAuth hook
  components/ProtectedRoute.tsx
  pages/Login.tsx
  pages/Signup.tsx
  pages/AuthConfirm.tsx    # Email verification / recovery callback (runs on app domain only)
```

## Usage

- **Protected routes**: Wrap any route with `<ProtectedRoute>` so only logged-in users can access it. Unauthenticated users are redirected to `/login`, with the original URL stored for redirect-after-login.
- **Auth state**: Use `useAuth()` inside `AuthProvider` to get `user`, `session`, `isAuthenticated`, `isLoading`, and `signUp` / `signIn` / `signOut`.
- **Reusable auth**: Use `signUp`, `signIn`, `signOut` from `@/lib/auth` if you need to call auth outside React (e.g. in a service). The context wraps these with user-friendly error messages.

## Best practices

1. **Single auth source**: All session state comes from Supabase via `AuthContext`. `onAuthStateChange` keeps UI in sync with sign-in/sign-out and token refresh.
2. **Persistent login**: Supabase client is configured with `localStorage`, `persistSession: true`, and `autoRefreshToken: true`, so users stay logged in across refreshes and tabs.
3. **Loading state**: `ProtectedRoute` shows a loading UI until the initial session is known; avoid flashing the app or the login page.
4. **Errors**: Auth helpers return `{ ok, error? }` instead of throwing. `getAuthErrorMessage()` maps Supabase errors to user-friendly strings (invalid credentials, user exists, etc.).
5. **Guest routes**: Login and Signup are wrapped in a “guest only” route that redirects already-logged-in users to home, so they don’t see auth forms when signed in.
6. **Redirect after login**: Login page reads `location.state.from` (set by `ProtectedRoute`) and redirects there after successful sign-in; otherwise redirects to `/`.

## Avoiding “email rate limit exceeded”

Supabase limits how many emails can be sent per hour (e.g. signup confirmations). To avoid hitting this limit:

### Option 1: Disable email confirmation (dev / simple apps)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **Providers** → **Email**.
3. Turn **OFF** “Confirm email”.
4. Save.

After this, signup no longer sends a confirmation email, so the email rate limit is not triggered and you won’t see “email rate limit exceeded” from signups. Users are signed in immediately after signup.

### Option 2: Relax rate limits (Dashboard)

1. In the Dashboard go to **Authentication** → **Rate Limits**.
2. Increase **Signup** (e.g. “60 second window” or per-user limits) if you need more signup attempts in a short time.

The global “emails per hour” limit (e.g. 2/hour on the built-in sender) **cannot** be raised unless you use custom SMTP.

### Option 3: Custom SMTP (production)

1. **Authentication** → **SMTP** → enable **Custom SMTP** and set your provider (e.g. Resend, SendGrid, AWS SES).
2. Then under **Authentication** → **Rate Limits** you can set higher email rate limits.

Use Option 1 for development or when you don’t need email verification; use Option 3 when you need confirmation emails and higher limits in production.

## Security notes

- Never put the Supabase **service role** key in the frontend; use only the **anon** (publishable) key.
- Enforce access control in Supabase (RLS) so that `knowledge_items` and other tables are scoped by `auth.uid()`.
- Keep password rules in sync between frontend (e.g. min length) and Supabase Auth settings.
