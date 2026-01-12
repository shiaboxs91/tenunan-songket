import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
    locale: "id_ID",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.className}>
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
        {children}
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
