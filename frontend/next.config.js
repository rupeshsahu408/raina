const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const allowedDevOrigins = new Set([
  "*.replit.dev",
  "*.kirk.replit.dev",
  "*.picard.replit.dev",
  "*.riker.replit.dev",
  "*.janeway.replit.dev",
  "*.replit.app",
]);
if (process.env.REPLIT_DEV_DOMAIN) allowedDevOrigins.add(process.env.REPLIT_DEV_DOMAIN.replace(/^https?:\/\//, ""));
if (process.env.REPLIT_DOMAINS) {
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const normalized = domain.trim().replace(/^https?:\/\//, "");
    if (normalized) allowedDevOrigins.add(normalized);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: Array.from(allowedDevOrigins),
  async rewrites() {
    return [
      { source: "/api/ibara/:path*", destination: `${BACKEND_URL}/api/ibara/:path*` },
      { source: "/v1/:path*", destination: `${BACKEND_URL}/v1/:path*` },
      { source: "/inbox/:path*", destination: `${BACKEND_URL}/inbox/:path*` },
      { source: "/backend/recruit/:path*", destination: `${BACKEND_URL}/recruit/:path*` },
      { source: "/backend/track", destination: `${BACKEND_URL}/track` },
      { source: "/backend/admin/tracking/:path*", destination: `${BACKEND_URL}/admin/tracking/:path*` },
      { source: "/recruit-public/:path*", destination: `${BACKEND_URL}/recruit-public/:path*` },
      { source: "/health", destination: `${BACKEND_URL}/health` },
      { source: "/api/health", destination: `${BACKEND_URL}/api/health` },
    ];
  },
};

module.exports = nextConfig;
