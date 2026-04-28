import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { InstallBanner } from "@/components/InstallBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800", "900"],
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Plyndrox AI — Every AI Tool You Need. Free for Everyone.",
  description:
    "7 powerful AI workspaces in one platform — personal companion, WhatsApp automation, email intelligence, invoice processing, hiring pipeline, regional AI, and smart ledger. Free for individuals and businesses worldwide.",
  keywords: "AI platform, business automation, WhatsApp AI, invoice AI, email AI, recruiting AI, personal AI, free AI tools",
  openGraph: {
    title: "Plyndrox AI — Every AI Tool You Need. Free for Everyone.",
    description:
      "7 AI workspaces. No paywalls. No subscriptions. Built for individuals and businesses across the world.",
    siteName: "Plyndrox AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plyndrox AI — Every AI Tool You Need. Free for Everyone.",
    description: "7 AI workspaces. No paywalls. Free for everyone, everywhere.",
  },
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Plyndrox AI" />
        <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="/splashscreens/apple-splash-2048-2732.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" href="/splashscreens/apple-splash-1668-2388.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/splashscreens/apple-splash-1290-2796.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/splashscreens/apple-splash-1170-2532.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/splashscreens/apple-splash-750-1334.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="/splashscreens/apple-splash-640-1136.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/plyndrox-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/plyndrox-16.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/plyndrox-180.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="dns-prefetch" href="https://raina-1.onrender.com" />
        <link rel="preconnect" href="https://raina-1.onrender.com" crossOrigin="anonymous" />
      </head>
      <body className="app-theme min-h-screen antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var s=document.createElement('div');
  s.id='pwa-splash';
  s.setAttribute('aria-hidden','true');
  s.style.cssText='position:fixed;inset:0;z-index:99999;background:#09090b;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.45s ease;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
  var img=document.createElement('img');
  img.src='/icons/plyndrox-192.png';
  img.alt='Plyndrox AI';
  img.style.cssText='width:96px;height:96px;border-radius:22px;margin-bottom:24px;box-shadow:0 0 0 1px rgba(255,255,255,0.08),0 8px 32px rgba(0,0,0,0.6);';
  var t1=document.createElement('span');
  t1.textContent='Plyndrox AI';
  t1.style.cssText='color:#f8fafc;font-size:26px;font-weight:700;letter-spacing:-0.5px;';
  var t2=document.createElement('span');
  t2.textContent='Every AI tool you need';
  t2.style.cssText='color:rgba(255,255,255,0.42);font-size:14px;margin-top:8px;letter-spacing:0.2px;';
  s.appendChild(img);s.appendChild(t1);s.appendChild(t2);
  document.body.appendChild(s);
  function hide(){s.style.opacity='0';setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);},500);}
  if(document.readyState==='complete'){hide();}else{window.addEventListener('load',hide);}
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
