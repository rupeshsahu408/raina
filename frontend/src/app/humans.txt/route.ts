export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const body = `/* TEAM */
  Company: Plyndrox AI
  Site: https://www.plyndrox.app
  Contact: support [at] plyndrox.app
  Twitter: @plyndroxai
  From: India

/* THANKS */
  Our community of early users and contributors worldwide.

/* SITE */
  Last update: ${new Date().toISOString().slice(0, 10)}
  Standards: HTML5, CSS3, ES2022
  Components: Next.js, React, TypeScript, Tailwind CSS
  Software: Plyndrox AI Platform
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
