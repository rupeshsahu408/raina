const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.kirk.replit.dev",
    "*.replit.app",
  ],
  async rewrites() {
    return [
      { source: "/api/ibara/:path*", destination: `${BACKEND_URL}/api/ibara/:path*` },
      { source: "/v1/:path*", destination: `${BACKEND_URL}/v1/:path*` },
      { source: "/inbox/:path*", destination: `${BACKEND_URL}/inbox/:path*` },
      { source: "/backend/recruit/:path*", destination: `${BACKEND_URL}/recruit/:path*` },
      { source: "/recruit-public/:path*", destination: `${BACKEND_URL}/recruit-public/:path*` },
      { source: "/health", destination: `${BACKEND_URL}/health` },
      { source: "/api/health", destination: `${BACKEND_URL}/api/health` },
    ];
  },
};

module.exports = nextConfig;
