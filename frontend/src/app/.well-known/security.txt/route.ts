export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  const body = `Contact: mailto:security@plyndrox.app
Contact: mailto:support@plyndrox.app
Expires: ${expires.toISOString()}
Preferred-Languages: en, hi
Canonical: https://www.plyndrox.app/.well-known/security.txt
Policy: https://www.plyndrox.app/privacy-policy
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
