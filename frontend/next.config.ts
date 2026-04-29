import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isCapacitorExport = process.env.CAPACITOR_EXPORT === "true";

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "production" ? "https://raina-1.onrender.com" : "http://localhost:8080")
).replace(/\/$/, "");

// Allow Replit dev proxy origins
const allowedDevOrigins = new Set<string>([
  "*.replit.dev",
  "*.janeway.replit.dev",
  "*.repl.co",
]);
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedDevOrigins.add(process.env.REPLIT_DEV_DOMAIN.replace(/^https?:\/\//, ""));
}
if (process.env.REPLIT_DOMAINS) {
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const normalized = domain.trim().replace(/^https?:\/\//, "");
    if (normalized) allowedDevOrigins.add(normalized);
  }
}

const nextConfig: NextConfig = {
  turbopack: {},
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },
  experimental: {
    optimizePackageImports: ["recharts", "react-markdown", "remark-gfm", "firebase", "@firebase/auth", "@firebase/app", "@firebase/firestore"],
  },
  transpilePackages: [
    "firebase",
    "@firebase/app",
    "@firebase/auth",
    "@firebase/firestore",
    "@firebase/storage",
    "@firebase/analytics",
    "@firebase/functions",
    "@firebase/messaging",
    "@firebase/performance",
    "@firebase/remote-config",
    "@firebase/util",
    "@firebase/logger",
    "@firebase/component",
    "@firebase/installations",
  ],
  allowedDevOrigins: allowedDevOrigins.size > 0 ? Array.from(allowedDevOrigins) : undefined,
  ...(isCapacitorExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
      }
    : {
        images: {
          formats: ["image/avif" as const, "image/webp" as const],
          minimumCacheTTL: 31536000,
          deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
          imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        },
        async headers() {
          return [
            {
              // Long-lived cache for immutable Next.js static chunks
              source: "/_next/static/:path*",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
            {
              // Long-lived cache for Next.js optimized images (/_next/image?url=...&w=...&q=...).
              // The optimizer URL is content-addressed by query, so output is effectively immutable.
              source: "/_next/image(.*)",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
            {
              // Long-lived cache for public static asset folders (icons, marketing, splashscreens, fonts)
              source: "/:folder(icons|marketing|splashscreens|fonts)/:path*",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
            {
              // Cache the brand logo aggressively — content-addressed by filename
              source: "/plyndrox-logo.svg",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
            {
              // Favicon — long cache, but allow occasional refresh
              source: "/favicon.ico",
              headers: [
                { key: "Cache-Control", value: "public, max-age=604800" },
              ],
            },
            {
              // Web app manifest — short cache so PWA updates propagate quickly
              source: "/manifest.webmanifest",
              headers: [
                { key: "Cache-Control", value: "public, max-age=3600" },
              ],
            },
            {
              // Security + privacy headers on all routes
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                { key: "X-DNS-Prefetch-Control", value: "on" },
                { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
                { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self), interest-cohort=(), browsing-topics=()" },
              ],
            },
            {
              // Allow any website to call the Plyndrox Web API (needed for the embedded widget)
              source: "/api/ibara/:path*",
              headers: [
                { key: "Access-Control-Allow-Origin", value: "*" },
                { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
                { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
              ],
            },
            {
              // Allow any website to load the widget script
              source: "/ibara-widget.js",
              headers: [
                { key: "Access-Control-Allow-Origin", value: "*" },
                { key: "Cache-Control", value: "public, max-age=3600" },
              ],
            },
          ];
        },
        async rewrites() {
          return [
            {
              source: "/api/ibara/:path*",
              destination: `${BACKEND_URL}/api/ibara/:path*`,
            },
            {
              source: "/v1/:path*",
              destination: `${BACKEND_URL}/v1/:path*`,
            },
            {
              source: "/inbox/:path*",
              destination: `${BACKEND_URL}/inbox/:path*`,
            },
            // Authenticated recruit API calls (prefixed with /backend to avoid conflict with frontend pages)
            {
              source: "/backend/recruit/:path*",
              destination: `${BACKEND_URL}/recruit/:path*`,
            },
            {
              source: "/backend/:path*",
              destination: `${BACKEND_URL}/:path*`,
            },
            // Public recruit API calls
            {
              source: "/recruit-public/:path*",
              destination: `${BACKEND_URL}/recruit-public/:path*`,
            },
            {
              source: "/health",
              destination: `${BACKEND_URL}/health`,
            },
            {
              source: "/api/health",
              destination: `${BACKEND_URL}/api/health`,
            },
          ];
        },
      }),
};

const withPwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development" || isCapacitorExport,
  fallbacks: {
    document: "/offline.html",
  },
});

export default withPwaConfig(nextConfig) as NextConfig;
