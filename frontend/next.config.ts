import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isCapacitorExport = process.env.CAPACITOR_EXPORT === "true";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

// Allow Replit dev proxy origins
const allowedDevOrigins: string[] = [];
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedDevOrigins.push(process.env.REPLIT_DEV_DOMAIN);
  allowedDevOrigins.push(process.env.REPLIT_DEV_DOMAIN.replace(".replit.dev", ".repl.co"));
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
        async rewrites() {
          return [
            {
              source: "/v1/:path*",
              destination: `${BACKEND_URL}/v1/:path*`,
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

export default withPwaConfig(nextConfig);
