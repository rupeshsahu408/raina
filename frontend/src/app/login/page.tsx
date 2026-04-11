"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { AuthProviderButtons } from "@/components/AuthProviderButtons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-black px-4 py-6 text-zinc-50">
      <header className="mb-8 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Evara AI
        </p>
        <a
          href="/signup"
          className="text-xs text-zinc-400 underline underline-offset-4"
        >
          Need an account?
        </a>
      </header>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-7 flex flex-col items-center gap-3">
          <img
            src="/evara-logo.png"
            alt="Evara AI"
            className="h-24 w-24 object-contain"
            draggable={false}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Evara AI</span>
        </div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Sign in to continue your conversation with Evara.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
            {error}
          </div>
        ) : null}

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
              const auth = getFirebaseAuth();
              await signInWithEmailAndPassword(auth, email, password);
              router.replace("/chat");
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Could not sign in. Please try again."
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="space-y-2 text-sm">
            <label htmlFor="email" className="block text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none ring-0 focus:border-zinc-500"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2 text-sm">
            <label htmlFor="password" className="block text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none ring-0 focus:border-zinc-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 h-11 w-full rounded-2xl bg-zinc-100 text-sm font-medium text-black disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <AuthProviderButtons
          mode="login"
          onSuccess={() => {
            router.replace("/chat");
          }}
        />
      </main>
    </div>
  );
}

