import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles email verification when the user clicks the link in the confirmation email.
 * Verification runs on our domain so the auth provider is never shown to the user.
 */
const AuthConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"confirming" | "success" | "error">("confirming");
  const [message, setMessage] = useState<string>("Confirming your email…");

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!tokenHash || !type) {
      setStatus("error");
      setMessage("Invalid or missing verification link. Please try signing up again or use the latest link from your email.");
      return;
    }

    const run = async () => {
      const otpType = type === "recovery" ? "recovery" : "email";
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });

      if (error) {
        setStatus("error");
        setMessage(error.message === "Token has expired or is invalid" ? "This link has expired. Please request a new verification email." : "Verification failed. Please try again or sign up again.");
        return;
      }

      setStatus("success");
      if (otpType === "recovery") {
        setMessage("Password reset confirmed. Taking you to sign in…");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } else {
        setMessage("Email confirmed. Taking you to Second Barin…");
        setTimeout(() => navigate("/", { replace: true }), 1500);
      }
    };

    run();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Second Barin</h1>
        {status === "confirming" && (
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
              aria-hidden
            />
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}
        {status === "success" && (
          <p className="text-muted-foreground">{message}</p>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <p className="text-destructive">{message}</p>
            <a
              href="/signup"
              className="inline-block text-primary underline-offset-4 hover:underline"
            >
              Back to sign up
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthConfirm;
