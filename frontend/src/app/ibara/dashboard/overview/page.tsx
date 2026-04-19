"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { ibaraUrl } from "@/lib/ibaraApi";
import { PlatformSwitcher } from "@/components/PlatformSwitcher";
import { setLastActivePlatform } from "@/lib/platformSession";

interface Site {
  _id: string;
  domain: string;
  verificationStatus: "pending" | "verified" | "failed";
  verificationToken: string;
  createdAt: string;
  connectionMethod?: string | null;
  connectionStatus?: "not_connected" | "connected" | "pending";
  detectedPlatform?: string;
}

interface Bot {
  _id: string;
  businessName: string;
  businessType: string;
  tone: string;
  language: string;
  isActive: boolean;
}

function OverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId") || "";

  const [user, setUser] = useState<User | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/ibara/auth");
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/ibara/auth"); return; }
      setUser(u);
      setLastActivePlatform("ibara");
      if (!siteId) { setLoading(false); return; }
      try {
        const [sitesRes, botRes, connRes] = await Promise.all([
          fetch(ibaraUrl(`/sites?userId=${u.uid}`)),
          fetch(ibaraUrl(`/sites/${siteId}/bot?userId=${u.uid}`)),
          fetch(ibaraUrl(`/sites/${siteId}/connection`)),
        ]);
        const sitesData = await sitesRes.json();
        const botData = await botRes.json();
        const connData = await connRes.json();
        const found = sitesData.sites?.find((s: Site) => s._id === siteId);
        if (found) {
          found.connectionMethod = connData.connectionMethod;
          found.connectionStatus = connData.connectionStatus;
          found.detectedPlatform = connData.detectedPlatform;
        }
        setSite(found || null);
        setBot(botData.bot || null);
      } catch {}
      setLoading(false);
    });
    return () => unsub();
  }, [router, siteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const statusColor = {
    verified: "text-green-400 bg-green-400/10 border-green-400/20",
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    failed: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div>
      <style>{`
        .card-glass { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
        .stat-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); transition: all 0.3s; }
        .stat-card:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-2px); }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #06b6d4); transition: all 0.3s ease; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(124,58,237,0.35); }
      `}</style>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1">Overview</h1>
        <p className="text-white/30 text-sm">Your IBARA AI command center</p>
      </div>

      {!site ? (
        <div className="card-glass rounded-2xl p-8 text-center">
          <p className="text-white/40 mb-4">No site selected.</p>
          <button onClick={() => router.push("/ibara/onboarding")} className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold text-white">
            Add your first website
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Domain", value: site.domain, icon: "🌐", sub: "Your verified website" },
              {
                label: "DNS Status",
                value: <span className={`px-2 py-1 rounded-lg text-xs font-semibold border capitalize ${statusColor[site.verificationStatus]}`}>{site.verificationStatus}</span>,
                icon: "🔒",
                sub: site.verificationStatus === "verified" ? "Domain confirmed" : "Awaiting verification"
              },
              {
                label: "Bot Connection",
                value: site.connectionStatus === "connected"
                  ? <span className="px-2 py-1 rounded-lg text-xs font-semibold border text-green-400 bg-green-400/10 border-green-400/20">Live</span>
                  : site.connectionStatus === "pending"
                  ? <span className="px-2 py-1 rounded-lg text-xs font-semibold border text-amber-400 bg-amber-400/10 border-amber-400/20">Pending</span>
                  : <span className="px-2 py-1 rounded-lg text-xs font-semibold border text-gray-500 bg-zinc-400/10 border-zinc-400/20">Not Connected</span>,
                icon: "🔗",
                sub: site.connectionMethod ? `via ${site.connectionMethod}` : "Connect via dashboard"
              },
              {
                label: "AI Bot",
                value: bot ? <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${bot.isActive ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-gray-500 bg-zinc-400/10 border-zinc-400/20"}`}>{bot.isActive ? "Active" : "Inactive"}</span> : <span className="text-white/20 text-sm">Not set up</span>,
                icon: "🤖",
                sub: bot ? `${bot.businessName || "Unnamed"} bot` : "Configure in AI Setup"
              },
            ].map((s) => (
              <div key={s.label} className="stat-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-xs text-white/30 font-medium">{s.label}</span>
                </div>
                <div className="text-sm font-semibold text-white truncate">{s.value}</div>
                <p className="text-[11px] text-white/20 mt-1 truncate">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Connection status callout */}
          {site.connectionStatus !== "connected" ? (
            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 to-cyan-600/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 border border-violet-500/30 flex items-center justify-center text-2xl shrink-0">🔗</div>
              <div className="flex-1">
                <h3 className="font-bold text-violet-200 mb-0.5">Connect your bot to your website</h3>
                <p className="text-sm text-white/40">Your chatbot is configured but not yet connected to <strong className="text-white/60">{site.domain}</strong>. Connect it now so visitors can start chatting.</p>
              </div>
              <button
                onClick={() => router.push(`/ibara/dashboard/connect?siteId=${siteId}`)}
                className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
              >
                Connect Bot →
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-2xl shrink-0">✅</div>
              <div className="flex-1">
                <h3 className="font-bold text-green-300 mb-0.5">Chatbot is live!</h3>
                <p className="text-sm text-green-300/50">Your AI chatbot is actively running on <strong>{site.domain}</strong></p>
              </div>
              <button
                onClick={() => window.open(`https://${site.domain}`, "_blank")}
                className="shrink-0 px-4 py-2 rounded-xl border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/10 transition-all"
              >
                Visit Site →
              </button>
            </div>
          )}

          {/* Quick actions */}
          <div className="card-glass rounded-2xl p-6">
            <h2 className="font-bold text-base mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <button
                onClick={() => router.push(`/ibara/dashboard/connect?siteId=${siteId}`)}
                className="flex items-start gap-3 p-4 rounded-xl bg-violet-600/10 border border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-600/15 transition-all text-left group"
              >
                <span className="text-2xl mt-0.5">🔗</span>
                <div>
                  <p className="text-sm font-semibold text-violet-300 group-hover:text-violet-200 transition-colors">Connect Website</p>
                  <p className="text-xs text-white/30 mt-0.5">Add bot to your website</p>
                </div>
              </button>
              <button
                onClick={() => router.push(`/ibara/dashboard/ai-setup?siteId=${siteId}`)}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all text-left group"
              >
                <span className="text-2xl mt-0.5">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-white/60 group-hover:text-white/80 transition-colors">Configure AI</p>
                  <p className="text-xs text-white/30 mt-0.5">Set up bot personality</p>
                </div>
              </button>
              <button
                onClick={() => router.push(`/ibara/dashboard/preview?siteId=${siteId}`)}
                className="flex items-start gap-3 p-4 rounded-xl bg-cyan-600/10 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-600/15 transition-all text-left group"
              >
                <span className="text-2xl mt-0.5">💬</span>
                <div>
                  <p className="text-sm font-semibold text-cyan-300 group-hover:text-cyan-200 transition-colors">Test Chatbot</p>
                  <p className="text-xs text-white/30 mt-0.5">Preview bot responses</p>
                </div>
              </button>
              <button
                onClick={() => router.push("/ibara/onboarding")}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all text-left group"
              >
                <span className="text-2xl mt-0.5">🌐</span>
                <div>
                  <p className="text-sm font-semibold text-white/60 group-hover:text-white/80 transition-colors">Add Website</p>
                  <p className="text-xs text-white/30 mt-0.5">Connect another domain</p>
                </div>
              </button>
            </div>
          </div>

          {/* Bot summary */}
          {bot ? (
            <div className="card-glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base">Bot Configuration</h2>
                <button
                  onClick={() => router.push(`/ibara/dashboard/ai-setup?siteId=${siteId}`)}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Edit →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {[
                  { label: "Business Name", value: bot.businessName || "–" },
                  { label: "Business Type", value: bot.businessType || "–" },
                  { label: "Tone", value: bot.tone ? bot.tone.charAt(0).toUpperCase() + bot.tone.slice(1) : "–" },
                  { label: "Language", value: bot.language ? bot.language.charAt(0).toUpperCase() + bot.language.slice(1) : "–" },
                  { label: "Status", value: bot.isActive ? "🟢 Active" : "⚪ Inactive" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-white/30 mb-1">{item.label}</p>
                    <p className="font-medium text-white/80">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card-glass rounded-2xl p-8 text-center border-dashed border-gray-200">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
                🤖
              </div>
              <h3 className="font-bold mb-2">Configure your AI</h3>
              <p className="text-white/30 text-sm mb-5">
                Tell IBARA AI about your business so it can answer your customers' questions.
              </p>
              <button
                onClick={() => router.push(`/ibara/dashboard/ai-setup?siteId=${siteId}`)}
                className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold text-white"
              >
                Start AI Setup →
              </button>
            </div>
          )}

          {/* DNS info if not verified */}
          {site.verificationStatus !== "verified" && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-4">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <h3 className="font-semibold text-amber-300 mb-1">Domain not verified</h3>
                <p className="text-sm text-amber-300/50 mb-3">
                  Your domain needs to be verified before the chatbot goes live.
                </p>
                <button
                  onClick={() => router.push("/ibara/onboarding")}
                  className="text-xs font-semibold text-amber-300 border border-amber-500/30 hover:border-amber-500/60 px-4 py-2 rounded-lg transition-all"
                >
                  Verify Domain →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <PlatformSwitcher current="ibara" />
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>}>
      <OverviewContent />
    </Suspense>
  );
}
