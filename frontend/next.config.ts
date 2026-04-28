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
        output: "export",
        images: { unoptimized: true },
      }
    : {
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
              // Long-lived cache for public static assets (SVG, fonts, icons)
              source: "/:path((?!_next).*)\\.(?:svg|png|jpg|jpeg|webp|avif|ico|woff|woff2|ttf|otf|eot)$",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
            {
              // Medium cache for HTML (allow revalidation)
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
