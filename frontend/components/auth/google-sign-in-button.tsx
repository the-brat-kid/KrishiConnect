"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "586620821912-vpp58t1c17uqqdl2mrf49d8ha98dtbpq.apps.googleusercontent.com";

interface GoogleSignInButtonProps {
  text?: "continue_with" | "signin_with" | "signup_with";
  className?: string;
}

export function GoogleSignInButton({ text = "continue_with", className = "" }: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!scriptLoaded || typeof window === "undefined" || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: text,
          shape: "rectangular",
          logo_alignment: "left",
          width: 380,
        });
      }
    } catch (err) {
      console.warn("Failed to initialize Google button:", err);
    }
  }, [scriptLoaded, text]);

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      toast({
        title: "Google Sign-In failed",
        description: "No credentials received from Google. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await loginWithGoogle(response.credential);
      toast({
        title: "Welcome to KrishiConnect!",
        description: "Signed in with Google successfully.",
      });
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Sign in failed",
        description:
          error.response?.data?.detail ||
          error.message ||
          "Google authentication could not be completed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomClick = () => {
    if (isLoading) return;

    if (window.google?.accounts?.id) {
      // Try triggering prompt (One Tap)
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt is suppressed, click the internal rendered button
          const btn = googleBtnRef.current?.querySelector('div[role="button"]') as HTMLElement | null;
          if (btn) {
            btn.click();
          }
        }
      });
    } else {
      toast({
        title: "Connecting to Google...",
        description: "Please wait a moment while the Google Sign-in service loads.",
      });
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      {/* Styled Google Button (Full Width, Crisp & Responsive) */}
      <div className="relative w-full">
        <button
          type="button"
          onClick={handleCustomClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground text-sm font-semibold shadow-xs hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Signing in with Google...</span>
            </>
          ) : (
            <>
              {/* Official Google 'G' SVG Logo */}
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{text === "signup_with" ? "Sign up with Google" : "Continue with Google"}</span>
            </>
          )}
        </button>

        {/* Hidden Official Google render container for browser iframe fallback */}
        <div
          ref={googleBtnRef}
          className="absolute inset-0 opacity-0 overflow-hidden pointer-events-auto [clip-path:inset(0)] flex items-center justify-center"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
