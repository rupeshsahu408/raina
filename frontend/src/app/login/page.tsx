"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { AuthProviderButtons } from "@/components/AuthProviderButtons";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/chat";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10" style={{ background: "var(--surface-muted)", borderRight: "1px solid var(--border)" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 shrink-0">
            <img src="/plyndrox-logo.svg" alt="" className="h-10 w-10 object-contain plyndrox-logo-img" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.24em]" style={{ color: "var(--foreground)" }}>Plyndrox AI</span>
        </Link>
        <div>
          <blockquote className="text-2xl font-bold leading-snug max-w-sm" style={{ color: "var(--foreground)" }}>
            &ldquo;An AI companion that feels calm, capable, and human.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm max-w-xs leading-6" style={{ color: "var(--text-secondary)" }}>
            Personal conversations, regional knowledge, and business automation — all in one place.
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>© {new Date().getFullYear()} Plyndrox AI</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 shrink-0">
              <img src="/plyndrox-logo.svg" alt="" className="h-9 w-9 object-contain plyndrox-logo-img" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: "var(--foreground)" }}>Plyndrox AI</span>
          </Link>
          <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="text-xs transition" style={{ color: "var(--text-secondary)" }}>
            Need an account?
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center max-w-sm mx-auto w-full">
          <h1 className="text-2xl font-black" style={{ color: "var(--foreground)" }}>Welcome back</h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>Sign in to continue to Plyndrox AI.</p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const auth = getFirebaseAuth();
                await signInWithEmailAndPassword(auth, email, password);
                router.replace(nextPath);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-violet-200"
                style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-violet-200"
                style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl bg-[#1d2226] text-sm font-bold text-white shadow-sm transition hover:bg-[#2d3238] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <AuthProviderButtons
            mode="login"
            onSuccess={() => { router.replace(nextPath); }}
          />

          <p className="mt-6 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-violet-600 hover:text-violet-700 transition">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
