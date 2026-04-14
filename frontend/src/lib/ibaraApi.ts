export function ibaraUrl(path: string): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  return backendUrl
    ? `${backendUrl}/api/ibara${path}`
    : `/api/ibara${path}`;
}
