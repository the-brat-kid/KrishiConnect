"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const tokenClientRef = useRef<any>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
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
        await loginWithGoogle(response.credential, false);
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
    },
    [loginWithGoogle, toast]
  );

  const handleAccessTokenResponse = useCallback(
    async (tokenResponse: any) => {
      if (tokenResponse?.error) {
        setIsLoading(false);
        if (tokenResponse.error !== "popup_closed_by_user") {
          toast({
            title: "Google Sign-In error",
            description: tokenResponse.error_description || tokenResponse.error,
            variant: "destructive",
          });
        }
        return;
      }

      if (!tokenResponse?.access_token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await loginWithGoogle(tokenResponse.access_token, true);
        toast({
          title: "Welcome to KrishiConnect!",
          description: "Signed in with Google successfully.",
        });
      } catch (error: any) {
        console.error("Google access token login error:", error);
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
    },
    [loginWithGoogle, toast]
  );

  // Initialize both Google GSI ID client and OAuth2 TokenClient
  const initGoogleClients = useCallback(() => {
    if (typeof window === "undefined" || !window.google?.accounts) return;

    try {
      // 1. Initialize Google Identity Services (One Tap & ID token)
      if (window.google.accounts.id) {
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
            width: 360,
          });
        }
      }

      // 2. Initialize OAuth2 Token Client (Bulletproof direct popup trigger)
      if (window.google.accounts.oauth2) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          callback: handleAccessTokenResponse,
        });
      }
    } catch (err) {
      console.warn("Failed to initialize Google clients:", err);
    }
  }, [handleCredentialResponse, handleAccessTokenResponse, text]);

  useEffect(() => {
    if (scriptLoaded || window.google?.accounts) {
      initGoogleClients();
    }
  }, [scriptLoaded, initGoogleClients]);

  const handleCustomClick = () => {
    if (isLoading) return;

    // Primary: Google OAuth2 popup client
    if (tokenClientRef.current) {
      setIsLoading(true);
      tokenClientRef.current.requestAccessToken({ prompt: "consent select_account" });
      return;
    }

    // Fallback: Check if google script has loaded
    if (window.google?.accounts?.oauth2) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: handleAccessTokenResponse,
      });
      setIsLoading(true);
      tokenClientRef.current.requestAccessToken({ prompt: "consent select_account" });
      return;
    }

    // Fallback: One Tap prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    toast({
      title: "Connecting to Google...",
      description: "Please check your network connection while the Google service loads.",
    });
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
          initGoogleClients();
        }}
      />

      {/* Styled Liquid Glass Google Button (Full Width, Crisp & Responsive) */}
      <div className="relative w-full">
        <button
          type="button"
          onClick={handleCustomClick}
          disabled={isLoading}
          className="relative overflow-hidden w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-white/20 dark:border-white/15 bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-white/[0.02] dark:from-white/[0.08] dark:via-black/35 dark:to-black/50 text-foreground text-sm font-bold backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_8px_24px_rgba(0,0,0,0.3)] hover:border-white/35 hover:shadow-[inset_0_1px_2.5px_rgba(255,255,255,0.55),0_12px_30px_rgba(0,0,0,0.4)] active:scale-[0.99] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
        >
          {/* Top specular glint */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/[0.2] to-transparent" />

          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              {/* Official Google 'G' SVG Logo */}
              <div className="p-1 rounded-lg bg-white/90 shadow-xs flex items-center justify-center">
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
              </div>
              <span>{text === "signup_with" ? "Sign up with Google" : "Continue with Google"}</span>
            </>
          )}
        </button>

        {/* Hidden Official Google render container for GSI fallback */}
        <div
          ref={googleBtnRef}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
