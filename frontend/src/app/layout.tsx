import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSettingsPanel } from "@/components/ThemeSettingsPanel";
import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plyndrox AI — Premium Personal, Business, and Regional AI",
  description:
    "Plyndrox AI is a premium AI platform for emotionally intelligent personal conversations, WhatsApp business automation, and Bihar-focused regional knowledge.",
  openGraph: {
    title: "Plyndrox AI — Intelligence with a soul",
    description:
      "A premium AI platform combining emotional companionship, business automation, and regional intelligence in one mobile-first experience.",
    siteName: "Plyndrox AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Plyndrox AI" />
        <link rel="icon" href="/plyndrox-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/plyndrox-192.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="app-theme min-h-screen antialiased bg-white text-[#1d2226]" suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen">{children}</div>
          <ThemeSettingsPanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
