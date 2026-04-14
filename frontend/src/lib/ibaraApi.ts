const RENDER_BACKEND = "https://raina-1.onrender.com";

/**
 * Returns the correct base URL for IBARA API calls.
 *
 * Strategy (in priority order):
 * 1. Runtime hostname check — if NOT on localhost or .replit.dev, call Render directly.
 *    This is guaranteed to work in production regardless of env var availability.
 * 2. Build-time env var (NEXT_PUBLIC_BACKEND_URL) — works when properly injected at build.
 * 3. Local proxy fallback — used in dev environment only.
 */
export function ibaraUrl(path: string): string {
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    const isLocalDev =
      hostname === "localhost" ||
      hostname.startsWith("127.") ||
      hostname.endsWith(".replit.dev");
    if (!isLocalDev) {
      return `${RENDER_BACKEND}/api/ibara${path}`;
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    return `${envUrl}/api/ibara${path}`;
  }

  return `/api/ibara${path}`;
}
