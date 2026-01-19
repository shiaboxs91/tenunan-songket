import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { getMessages } from "next-intl/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { IntlProvider } from "@/components/providers/IntlProvider";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Tenunan Songket - Warisan Budaya Melayu",
  description: "Belanja kain songket asli berkualitas tinggi. Warisan budaya Melayu dengan benang emas asli, 100% handmade.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tenunan Songket",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "ms_MY",
    url: "https://tenunansongket.com",
    siteName: "Tenunan Songket",
    title: "Tenunan Songket - Warisan Budaya Melayu",
    description: "Belanja kain songket asli berkualitas tinggi. Warisan budaya Melayu dengan benang emas asli.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#D97706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value as Locale | undefined;
  const locale = localeCookie && locales.includes(localeCookie) ? localeCookie : defaultLocale;
  
  // Get messages for the locale
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.className}>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://tenunansongket.com" />
        <link rel="dns-prefetch" href="https://tenunansongket.com" />
        
        {/* PWA meta tags */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <IntlProvider locale={locale} messages={messages as Record<string, unknown>}>
          {children}
        </IntlProvider>
        <SpeedInsights />
        {/* Defer service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    navigator.serviceWorker.register('/sw.js');
                  }, 3000);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
