import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { InstallBanner } from "@/components/InstallBanner";
import { JsonLd } from "@/components/JsonLd";
import {
  SITE_URL,
  siteConfig,
  organizationJsonLd,
  websiteJsonLd,
  softwareApplicationJsonLd,
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.name,
  generator: "Next.js",
  keywords: [...siteConfig.defaultKeywords],
  authors: [{ name: siteConfig.organization.legalName, url: SITE_URL }],
  creator: siteConfig.organization.legalName,
  publisher: siteConfig.organization.legalName,
  referrer: "origin-when-cross-origin",
  category: "technology",
  alternates: {
    canonical: SITE_URL,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: SITE_URL,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Plyndrox AI — Every AI Tool You Need. Free for Everyone.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/icons/plyndrox-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/plyndrox-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icons/plyndrox-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Plyndrox AI",
    statusBarStyle: "default",
  },
  verification: {
    // Replace these with the actual verification tokens issued by each search engine
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const allowed = new Set(["white","dark","green","reading","ocean","rose","auto","light"]); let theme = localStorage.getItem("plyndrox_theme") || localStorage.getItem("evara_theme") || "white"; if (!allowed.has(theme)) theme = "white"; if (theme === "light") theme = "white"; const resolved = theme === "auto" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "white") : theme; document.documentElement.setAttribute("data-theme", resolved); localStorage.setItem("plyndrox_theme", theme); } catch (_) {} })();`,
          }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Plyndrox AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Plyndrox AI" />
        <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="/splashscreens/apple-splash-2048-2732.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" href="/splashscreens/apple-splash-1668-2388.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/splashscreens/apple-splash-1290-2796.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/splashscreens/apple-splash-1170-2532.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/splashscreens/apple-splash-750-1334.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="/splashscreens/apple-splash-640-1136.png" />
        <link rel="dns-prefetch" href="https://raina-1.onrender.com" />
        <link rel="preconnect" href="https://raina-1.onrender.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <JsonLd id="ld-organization" data={organizationJsonLd()} />
        <JsonLd id="ld-website" data={websiteJsonLd()} />
        <JsonLd id="ld-application" data={softwareApplicationJsonLd()} />
      </head>
      <body className="app-theme min-h-screen antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    if (!isStandalone) return;
  } catch(_) { return; }
  var s=document.createElement('div');
  s.id='pwa-splash';
  s.setAttribute('aria-hidden','true');
  s.style.cssText='position:fixed;inset:0;z-index:99999;background:#09090b;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.35s ease;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
  var img=document.createElement('img');
  img.src='/icons/plyndrox-192.png';
  img.alt='';
  img.setAttribute('aria-hidden','true');
  img.style.cssText='width:96px;height:96px;border-radius:22px;margin-bottom:24px;box-shadow:0 0 0 1px rgba(255,255,255,0.08),0 8px 32px rgba(0,0,0,0.6);';
  var t1=document.createElement('span');
  t1.textContent='Plyndrox AI';
  t1.style.cssText='color:#f8fafc;font-size:26px;font-weight:700;letter-spacing:-0.5px;';
  var t2=document.createElement('span');
  t2.textContent='Every AI tool you need';
  t2.style.cssText='color:rgba(255,255,255,0.42);font-size:14px;margin-top:8px;letter-spacing:0.2px;';
  s.appendChild(img);s.appendChild(t1);s.appendChild(t2);
  document.body.appendChild(s);
  function hide(){s.style.opacity='0';setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);},400);}
  if(document.readyState==='complete'){setTimeout(hide,150);}else{window.addEventListener('DOMContentLoaded',function(){setTimeout(hide,150);});}
})();`,
          }}
        />
        <ThemeProvider>
          <div className="min-h-screen">{children}</div>
          <InstallBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
