import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 70;

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function proxy(req: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params;
  const pathStr = path.join("/");
  const search = req.nextUrl.search || "";
  const targetUrl = `${BACKEND_URL}/api/ibara/${pathStr}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("Content-Type") || "application/json",
  };
  const auth = req.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  let lastError: any;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const upstream = await fetchWithTimeout(targetUrl, {
        method: req.method,
        headers,
        body,
      });

      const text = await upstream.text();

      return new NextResponse(text, {
        status: upstream.status,
        headers: {
          "Content-Type":
            upstream.headers.get("Content-Type") || "application/json",
          ...CORS_HEADERS,
        },
      });
    } catch (err: any) {
      lastError = err;
      console.error(
        `[ibara-proxy] attempt ${attempt}/${MAX_RETRIES} failed:`,
        err?.message
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  }

  console.error("[ibara-proxy] all retries exhausted:", lastError?.message);
  return NextResponse.json(
    { error: "Service temporarily unavailable. Please try again in a moment." },
    { status: 503, headers: CORS_HEADERS }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, params);
}
