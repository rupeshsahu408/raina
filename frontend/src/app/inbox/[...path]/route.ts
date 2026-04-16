import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 70;

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const TIMEOUT_MS = 65_000;

async function proxy(req: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params;
  const targetUrl = `${BACKEND_URL}/inbox/${path.join("/")}${req.nextUrl.search || ""}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {};
    const auth = req.headers.get("Authorization");
    const contentType = req.headers.get("Content-Type");
    if (auth) headers.Authorization = auth;
    if (contentType) headers["Content-Type"] = contentType;

    const init: RequestInit = {
      method: req.method,
      headers,
      signal: controller.signal,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = await req.text();
    }

    const upstream = await fetch(targetUrl, init);
    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.name === "AbortError" ? "Inbox service timed out. Please try again." : "Inbox service is unavailable." },
      { status: 503 }
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, params);
}
