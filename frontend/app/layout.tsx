import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import QueryClientProvider from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { Toaster } from "@/components/ui/toaster";
import { TopProgressBar } from "@/components/ui/top-progress-bar";
import { GlobalClickAnimation } from "@/components/ui/button-click-animation";
import { BackToTop } from "@/components/ui/back-to-top";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://krishiconnect.in";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KrishiConnect - Agri-Trade Management & Mandi Rates",
    template: "%s | KrishiConnect",
  },
  description: "B2B platform for agricultural trade, instant invoicing, live APMC mandi rates, and freight logistics.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "KrishiConnect - Agri-Trade Management & Mandi Rates",
    description: "B2B platform for agricultural trade, instant invoicing, live APMC mandi rates, and freight logistics.",
    url: siteUrl,
    siteName: "KrishiConnect",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@100..900&family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@200..800&family=Plus+Jakarta+Sans:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="krishi-theme">
          <QueryClientProvider>
            <AuthProvider>
              <LanguageProvider>
                <TopProgressBar />
                <GlobalClickAnimation />
                {children}
                <BackToTop />
                <Toaster />
                {/* Seamless Background Translation Element */}
                <div id="google_translate_element" style={{ display: "none" }} />
              </LanguageProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>

        {/* Global Multi-Regional Language Translation Engine */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.googleTranslateElementInit = function() {
                if (window.google && window.google.translate) {
                  new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,or,mr,pa,gu,kn,ta,te,bn,ml',
                    autoDisplay: false
                  }, 'google_translate_element');
                }
              };
            `,
          }}
        />
        <Script
          id="google-translate-cdn"
          strategy="afterInteractive"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />
      </body>
    </html>
  );
}
