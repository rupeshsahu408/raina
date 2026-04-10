import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isCapacitorExport = process.env.CAPACITOR_EXPORT === "true";

const nextConfig: NextConfig = {
  turbopack: {},
  ...(isCapacitorExport
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {}),
};

const withPwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development" || isCapacitorExport,
});

export default withPwaConfig(nextConfig);
