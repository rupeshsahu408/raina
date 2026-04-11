import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evara AI",
  description:
    "Evara AI – a calm, emotionally intelligent AI companion in your pocket.",
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
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Evara AI" />
        <link rel="apple-touch-icon" href="/icons/evara-192.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
