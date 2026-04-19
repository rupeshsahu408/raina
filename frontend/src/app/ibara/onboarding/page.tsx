"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { ibaraUrl } from "@/lib/ibaraApi";

export default function IbaraOnboarding() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch {
      router.replace("/ibara/auth");
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthLoading(false);
      if (!u) {
        router.replace("/ibara/auth");
        return;
      }
      setUser(u);

      try {
        const res = await fetch(ibaraUrl(`/sites?userId=${u.uid}`));
        const data = await res.json();
        if (data.sites?.length) {
          router.replace(`/ibara/dashboard/connect?siteId=${data.sites[0]._id}`);
        }
      } catch {
        // No sites yet — stay on onboarding
      }
    });
    return () => unsub();
  }, [router]);

  async function safeJsonFetch(url: string, options: RequestInit) {
    const res = await fetch(url, options);
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server error (${res.status}). Please try again.`);
    }
    return { res, data };
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError("");
    if (!url.trim()) return setUrlError("Please enter your website URL");
    setCreating(true);
    try {
      const token = await user!.getIdToken();
      const { res, data } = await safeJsonFetch(ibaraUrl("/sites"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user!.uid, websiteUrl: url.trim() }),
      });
      if (!res.ok) throw new Error(data.error || "Failed to register site");
      router.replace(`/ibara/dashboard/connect?siteId=${data.site._id}`);
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1d2226]">
      <style>{`
        @keyframes pulse-glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .card-glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); }
        .input-field {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s;
        }
        .input-field:focus { border-color: rgba(124,58,237,0.6); outline: none; background: rgba(124,58,237,0.05); }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #06b6d4); transition: all 0.3s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(124,58,237,0.35); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full animate-pulse-glow"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
      </div>

      <header className="relative z-10 flex items-center px-6 py-5 border-b border-gray-200">
        <button onClick={() => router.push("/ibara")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <span className="text-[#1d2226] font-bold text-xs">I</span>
          </div>
          <span className="font-bold text-sm">IBARA AI</span>
        </button>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-73px)] px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="card-glass rounded-3xl p-8">
            <div className="mb-8">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/20 items-center justify-center text-2xl mb-4">
                🌐
              </div>
              <h1 className="text-2xl font-black mb-2">Add your website</h1>
              <p className="text-white/40 text-sm leading-relaxed">
                Enter your website URL to get started. We'll help you connect your AI chatbot right after.
              </p>
            </div>

            {urlError && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {urlError}
              </div>
            )}

            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Website URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourcompany.com"
                  required
                  className="input-field w-full h-12 rounded-xl px-4 text-sm text-[#1d2226] placeholder:text-white/20"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="btn-primary w-full h-12 rounded-xl text-sm font-semibold text-[#1d2226]"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </span>
                ) : "Continue →"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-white/20 leading-relaxed">
              No coding required. You'll choose how to connect on the next screen.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
