# Branded auth setup – Second Barin

This guide configures the auth provider so that **all emails and redirects are clearly Second Barin** and the provider stays invisible to users.

## Goals

- **Sender**: Emails show “Second Barin” as sender name and use a Second Barin–owned address (e.g. `no-reply@secondbarin.com`).
- **Content**: Subject and body reference Second Barin; template uses app logo, colors, and tone.
- **Redirects**: Verification and password-reset links send users back into the Second Barin app only (no provider branding or domains in the browser).

## 1. App URL (required for redirects)

Set the public URL of your app so verification links point to Second Barin.

**`.env`**

```env
VITE_APP_URL=https://your-domain.com
```

- **Production**: `https://secondbarin.com` (or your real domain).
- **Local**: Omit `VITE_APP_URL`; the app will use `window.location.origin` (e.g. `http://localhost:5173`).

## 2. Auth provider URL configuration

In the auth provider dashboard (e.g. **Authentication → URL Configuration**):

- **Site URL**: Your app’s public origin, e.g. `https://secondbarin.com` (or `http://localhost:5173` for dev).
- **Redirect URLs**: Add every URL where users may land after clicking an email link, for example:
  - `https://secondbarin.com/auth/confirm`
  - `https://secondbarin.com/**`
  - For local: `http://localhost:5173/auth/confirm`, `http://localhost:5173/**`

This keeps all post-verification redirects inside your app.

## 3. Custom SMTP (branded sender)

To send from **Second Barin** and your own domain:

1. In the auth provider: **Authentication → SMTP** (or **Project Settings → Auth → SMTP**).
2. Enable **Custom SMTP** and configure your provider (e.g. Resend, SendGrid, AWS SES, Postmark).
3. Set:
  - **Sender email**: `no-reply@secondbarin.com` (or your verified domain).
  - **Sender name**: `Second Barin`.
4. Use the SMTP credentials from your provider (host, port, user, password).

After this, all auth emails are sent from “Second Barin &lt;no-reply@secondbarin.com&gt;”.

## 4. Branded email templates

In the auth provider: **Authentication → Email Templates**.

### Confirm signup

- **Subject**: `Confirm your Second Barin account`
- **Body (HTML)**: Use the contents of `docs/email-templates/confirm-signup.html`.

That template:

- Uses Second Barin styling (cream/sage/olive).
- Sends the user to **your app** at `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`, so they never see the provider’s domain.

### Reset password

- **Subject**: `Reset your Second Barin password`
- **Body (HTML)**: Use the contents of `docs/email-templates/reset-password.html`.

The template links to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`, so users stay on your domain; the app verifies the token and redirects to sign in.

### Other templates (optional)

Update any other auth-related templates (magic link, invite, change email, etc.) with the same:

- Subject lines that mention “Second Barin”.
- Same header/footer and tone as the confirm and reset templates.

## 5. In-app behaviour (already implemented)

- **Sign up**: `signUp()` sends `emailRedirectTo` to `${APP_URL}/auth/confirm`, so the provider’s confirmation email can point to your app.
- **`/auth/confirm`**: This route reads `token_hash` and `type` from the URL, verifies the token in the app, then redirects to `/`. Users never leave your domain.
- **Errors**: Auth errors are mapped to user-friendly messages; the provider name is never shown.

## Checklist

- [ ] `VITE_APP_URL` set in production `.env`.
- [ ] Site URL and Redirect URLs set in the auth provider to your app origin and `/auth/confirm`.
- [ ] Custom SMTP with sender “Second Barin” and `no-reply@secondbarin.com` (or your domain).
- [ ] Confirm signup and reset password templates updated with Second Barin subject and HTML from `docs/email-templates/`.
- [ ] Test: sign up → receive email → click link → land on your app and get redirected to home.
