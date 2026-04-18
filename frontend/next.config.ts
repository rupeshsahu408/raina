import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isCapacitorExport = process.env.CAPACITOR_EXPORT === "true";

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "production" ? "https://raina-1.onrender.com" : "http://localhost:8080")
).replace(/\/$/, "");

// Allow Replit dev proxy origins
const allowedDevOrigins: string[] = [
  "*.replit.dev",
  "*.kirk.replit.dev",
  "*.repl.co",
  "*.replit.app",
  "*.worf.replit.dev",
];
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedDevOrigins.push(process.env.REPLIT_DEV_DOMAIN);
  allowedDevOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
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
  allowedDevOrigins: allowedDevOrigins.length > 0 ? allowedDevOrigins : undefined,
  ...(isCapacitorExport
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            {
              // Allow any website to call the IBARA API (needed for the embedded widget)
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
});

const configWithPWA = withPwaConfig(nextConfig);

export default {
  ...configWithPWA,
  allowedDevOrigins,
};
