"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { AuthProviderButtons } from "@/components/AuthProviderButtons";
import Link from "next/link";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/chat";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gray-50 border-r border-gray-200 p-10">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/evara-logo.png" alt="Plyndrox AI" className="h-8 w-8 object-contain" />
          <span className="text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Plyndrox AI</span>
        </Link>
        <div>
          <div className="flex flex-col gap-4">
            {[
              ["Personal AI", "Emotional support and memory that grows with you."],
              ["Bihar AI", "Regional knowledge for education, jobs & culture."],
              ["Plyndrox Business AI", "Automate WhatsApp & website support in minutes."],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#1d2226]">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Plyndrox AI</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <img src="/evara-logo.png" alt="Plyndrox AI" className="h-7 w-7 object-contain" />
            <span className="text-sm font-black uppercase tracking-[0.2em] text-[#1d2226]">Plyndrox AI</span>
          </Link>
          <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="text-xs text-gray-500 hover:text-[#1d2226] transition">
            Already have an account?
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center max-w-sm mx-auto w-full">
          <h1 className="text-2xl font-black text-[#1d2226]">Create your account</h1>
          <p className="mt-1.5 text-sm text-gray-500">Join Plyndrox AI — free to get started.</p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
                router.replace(nextPath);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not create account. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-[#1d2226]">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-[#1d2226] outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-[#1d2226]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-[#1d2226] outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-[#1d2226]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-[#1d2226] outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl bg-[#1d2226] text-sm font-bold text-white shadow-sm transition hover:bg-[#2d3238] disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <AuthProviderButtons
            mode="signup"
            onSuccess={() => { router.replace(nextPath); }}
          />

          <p className="mt-6 text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-violet-600 hover:text-violet-700 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignupForm />
    </Suspense>
  );
}
