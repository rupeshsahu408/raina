import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
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
        <link rel="icon" href="/plyndrox-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/plyndrox-192.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preload" href="/plyndrox-logo.svg" as="image" type="image/svg+xml" />
        <link rel="dns-prefetch" href="https://raina-1.onrender.com" />
        <link rel="preconnect" href="https://raina-1.onrender.com" crossOrigin="anonymous" />
      </head>
      <body className="app-theme min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
