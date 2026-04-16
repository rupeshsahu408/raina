import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 70;

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const TIMEOUT_MS = 65_000;

export async function GET(req: NextRequest) {
  const targetUrl = `${BACKEND_URL}/inbox/lead-intelligence${req.nextUrl.search || ""}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {};
    const auth = req.headers.get("Authorization");
    if (auth) headers.Authorization = auth;

    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.name === "AbortError" ? "Lead analysis timed out. Please try again." : "Lead analysis service is unavailable." },
      { status: 503 }
    );
  } finally {
    clearTimeout(timer);
  }
}
