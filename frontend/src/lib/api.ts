const DEFAULT_BACKEND_URL = "https://raina-1.onrender.com";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production" ? DEFAULT_BACKEND_URL : "/backend")
).replace(/\/$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function readApiJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      res.ok
        ? "Backend returned an invalid response. Please try again."
        : `Backend request failed (${res.status}). Please try again.`
    );
  }
}