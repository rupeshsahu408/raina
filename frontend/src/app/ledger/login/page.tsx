"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/ledger/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    try {
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.replace("/ledger/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fff;
          color: #1d2226;
        }
        .input-field:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5,150,105,0.08);
        }
        .input-field::placeholder { color: #9ca3af; }
      `}</style>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-gray-100">
        <Link href="/ledger" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-black text-xs">SL</span>
          </div>
          <span className="font-bold text-[#1d2226] text-sm">Smart Ledger</span>
        </Link>
        <p className="text-sm text-gray-500">
          No account?{" "}
          <Link href="/ledger/signup" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            Sign up free
          </Link>
        </p>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-600 items-center justify-center mb-4">
              <span className="text-white font-black text-base">SL</span>
            </div>
            <h1 className="text-2xl font-black text-[#1d2226] mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your Smart Ledger account</p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-5 disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="input-field"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-emerald-600 hover:text-emerald-700">Terms</a>
            {" & "}
            <a href="/privacy-policy" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LedgerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
