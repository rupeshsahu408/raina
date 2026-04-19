"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { Suspense } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function ConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "checking" | "connected" | "error">("checking");
  const [connectedEmail, setConnectedEmail] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/login?next=/inbox/connect");
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthLoading(false);
      if (!u) { router.replace("/login?next=/inbox/connect"); return; }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    checkStatus();
  }, [user]);

  async function getToken() {
    const auth = getFirebaseAuth();
    return auth.currentUser?.getIdToken() ?? "";
  }

  async function checkStatus() {
    setStatus("checking");
    try {
      const token = await getToken();
      const res = await fetch(`${API}/inbox/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.connected) {
        setConnectedEmail(data.email ?? "");
        setStatus("connected");
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  }

  async function handleConnect() {
    setConnecting(true);
    setErrorMsg("");
    try {
      const token = await getToken();
      const res = await fetch(`${API}/inbox/auth-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg("Could not generate authorization URL. Please try again.");
        setConnecting(false);
      }
    } catch {
      setErrorMsg("Something went wrong. Check your connection and try again.");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const token = await getToken();
      await fetch(`${API}/inbox/disconnect`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Wipe every inbox-related cache so the new account starts completely fresh
      const inboxLocalKeys = [
        "plyndrox_daily_briefing",
        "plyndrox_daily_briefing_date",
        "plyndrox_drafts",
        "plyndrox_scheduled",
        "inbox_health_briefing_date",
      ];
      inboxLocalKeys.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();

      setStatus("idle");
      setConnectedEmail("");
    } catch {
      setErrorMsg("Could not disconnect. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  }

  if (authLoading || status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04030a]">
        <div className="h-8 w-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04030a] text-[#1d2226] flex flex-col">
      

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <Link href="/inbox" className="flex items-center gap-2.5 text-gray-500 hover:text-white transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="text-sm">Inbox AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <img src="/evara-logo.png" alt="Evara" className="h-7 w-7 object-contain opacity-70" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Plyndrox</span>
        </div>
      </nav>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {status === "connected" ? (
            <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Gmail Connected</h1>
              <p className="text-sm text-gray-500 mb-1">Signed in as</p>
              <p className="text-sm font-bold text-emerald-300 mb-6">{connectedEmail}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push("/inbox/dashboard")}
                  className="w-full rounded-2xl bg-white py-3.5 text-sm font-black text-black transition hover:bg-zinc-200"
                >
                  Open Inbox Dashboard
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 transition hover:border-red-500/30 hover:text-red-400 disabled:opacity-50"
                >
                  {disconnecting ? "Disconnecting..." : "Disconnect Gmail"}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-gray-200 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-violet-500/25 bg-violet-500/10">
                <svg className="h-8 w-8" viewBox="0 0 24 24">
                  <rect width="20" height="16" x="2" y="4" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400" />
                </svg>
              </div>

              <h1 className="text-2xl font-black text-white mb-2">Connect your Gmail</h1>
              <p className="text-sm text-gray-500 mb-8 leading-6">
                Securely authorize Plyndrox to read and reply to your emails. We use OAuth 2.0 — we never store your password.
              </p>

              {errorMsg && (
                <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white py-4 text-sm font-black text-black transition hover:bg-zinc-200 disabled:opacity-60 mb-4"
              >
                {connecting ? (
                  <div className="h-4 w-4 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {connecting ? "Redirecting to Google..." : "Continue with Google"}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-600">
                <span className="flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  OAuth 2.0 secured
                </span>
                <span>·</span>
                <span>No password stored</span>
                <span>·</span>
                <span>Disconnect anytime</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#04030a]">
        <div className="h-8 w-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    }>
      <ConnectContent />
    </Suspense>
  );
}
