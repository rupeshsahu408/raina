"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { ibaraUrl } from "@/lib/ibaraApi";

type VerificationStatus = "pending" | "verified" | "failed" | "checking";

interface Site {
  _id: string;
  domain: string;
  verificationToken: string;
  verificationStatus: "pending" | "verified" | "failed";
}

export default function IbaraOnboarding() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [step, setStep] = useState<1 | 2>(1);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [creating, setCreating] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus>("pending");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch {
      router.replace("/ibara/auth");
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthLoading(false);
      if (!u) {
        router.replace("/ibara/auth");
      } else {
        setUser(u);
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
      setSite(data.site);
      if (data.site.verificationStatus === "verified") {
        router.replace(`/ibara/dashboard/overview?siteId=${data.site._id}`);
      } else {
        setStep(2);
      }
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async () => {
    if (!site) return;
    setVerifying(true);
    setVerifyStatus("checking");
    setVerifyMsg("");
    try {
      const token = await user!.getIdToken();
      const { res, data } = await safeJsonFetch(ibaraUrl(`/sites/${site._id}/verify`), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user!.uid }),
      });
      if (!res.ok) throw new Error(data.error || "Verification failed");
      if (data.verified) {
        setVerifyStatus("verified");
        setTimeout(() => {
          router.replace(`/ibara/dashboard/overview?siteId=${site._id}`);
        }, 1500);
      } else {
        setVerifyStatus("failed");
        setVerifyMsg(data.message || "DNS record not found. Please check your settings.");
      }
    } catch (err) {
      setVerifyStatus("failed");
      setVerifyMsg(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05050F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050F] text-white">
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
        .code-block { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); font-family: 'Courier New', monospace; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full animate-pulse-glow"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5">
        <button onClick={() => router.push("/ibara")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">I</span>
          </div>
          <span className="font-bold text-sm">IBARA AI</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? "bg-violet-600 text-white" : "border border-white/15 text-white/30"}`}>1</div>
          <div className={`w-12 h-px ${step >= 2 ? "bg-violet-600" : "bg-white/10"}`} />
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? "bg-violet-600 text-white" : "border border-white/15 text-white/30"}`}>2</div>
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-73px)] px-6 py-12">
        <div className="w-full max-w-lg">

          {step === 1 && (
            <div className="card-glass rounded-3xl p-8">
              <div className="mb-8">
                <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/20 items-center justify-center text-2xl mb-4">
                  🌐
                </div>
                <h1 className="text-2xl font-black mb-2">Add your website</h1>
                <p className="text-white/40 text-sm leading-relaxed">
                  Enter your website URL to get started. We'll verify you own the domain in the next step.
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
                    className="input-field w-full h-12 rounded-xl px-4 text-sm text-white placeholder:text-white/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary w-full h-12 rounded-xl text-sm font-semibold text-white"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registering...
                    </span>
                  ) : "Continue →"}
                </button>
              </form>
            </div>
          )}

          {step === 2 && site && (
            <div className="card-glass rounded-3xl p-8">
              <div className="mb-8">
                <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-violet-600/20 border border-cyan-500/20 items-center justify-center text-2xl mb-4">
                  🔒
                </div>
                <h1 className="text-2xl font-black mb-2">Verify your domain</h1>
                <p className="text-white/40 text-sm leading-relaxed">
                  Add this DNS TXT record to <span className="text-white font-medium">{site.domain}</span> to prove you own it. Then click Verify.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="code-block rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3 text-white/30 uppercase tracking-wider">
                    <span>Type</span>
                    <span>Name</span>
                    <span>Value</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-white/80 font-mono">
                    <span className="text-cyan-400">TXT</span>
                    <span>@</span>
                    <span className="break-all text-violet-300">ibara-verify={site.verificationToken}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <p className="text-xs text-amber-300/80 leading-relaxed">
                    <span className="font-semibold">Note:</span> DNS changes can take up to 24 hours to propagate, but usually take just a few minutes.
                  </p>
                </div>
              </div>

              {verifyStatus === "verified" && (
                <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="text-sm font-semibold text-green-300">Domain verified!</p>
                    <p className="text-xs text-green-300/60">Redirecting to dashboard...</p>
                  </div>
                </div>
              )}

              {verifyStatus === "failed" && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-xs text-red-300">{verifyMsg}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-xl border border-white/10 hover:border-white/20 text-sm font-medium text-white/50 hover:text-white transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleVerify}
                  disabled={verifying || verifyStatus === "verified"}
                  className="btn-primary flex-2 flex-1 h-12 rounded-xl text-sm font-semibold text-white"
                >
                  {verifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Checking DNS...
                    </span>
                  ) : "Verify Domain →"}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-white/20">
                Having trouble?{" "}
                <a href="https://www.cloudflare.com/learning/dns/dns-records/dns-txt-record/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
                  Learn about DNS TXT records
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
