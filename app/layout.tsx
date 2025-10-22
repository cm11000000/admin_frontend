import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWAWrapper } from '@/components/pwa/PWAWrapper';
import { QueryProvider } from '@/components/providers/QueryProvider';

// Disable Google font fetching in restricted build environments
const inter = { variable: '' } as const;
const jetbrainsMono = { variable: '' } as const;

// Enhanced metadata for SEO and mobile optimization
export const metadata: Metadata = {
  title: {
    default: "SabPaisa Admin Portal",
    template: "%s | SabPaisa Admin",
  },
  description:
    "World-class mobile-first admin portal for SabPaisa payment management - Modern, fast, and intuitive interface for seamless payment administration",
  keywords: [
    "SabPaisa",
    "Admin Portal",
    "Payment Management",
    "Dashboard",
    "Financial Admin",
    "Mobile-First",
  ],
  authors: [{ name: "SabPaisa" }],
  creator: "SabPaisa",
  publisher: "SabPaisa",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://admin.sabpaisa.com"),
  openGraph: {
    title: "SabPaisa Admin Portal",
    description:
      "World-class mobile-first admin portal for SabPaisa payment management",
    url: "https://admin.sabpaisa.com",
    siteName: "SabPaisa Admin",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SabPaisa Admin Portal",
    description:
      "World-class mobile-first admin portal for SabPaisa payment management",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SabPaisa Admin",
  },
};

// Mobile-first viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="SabPaisa Admin" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SabPaisa Admin" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[PWA] ServiceWorker registration successful:', registration.scope);
                    },
                    function(err) {
                      console.log('[PWA] ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`font-sans antialiased text-foreground bg-background min-h-screen overflow-x-hidden`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif' }}
        suppressHydrationWarning
      >
        {/* PWA Components - Rendered client-side only to avoid hydration errors */}
        <PWAWrapper />

        <QueryProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
