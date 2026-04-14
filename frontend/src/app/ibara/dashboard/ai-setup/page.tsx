"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

interface BotConfig {
  businessName: string;
  businessType: string;
  location: string;
  workingHours: string;
  services: string;
  knowledgeBase: string;
  tone: "professional" | "friendly";
  language: "english" | "hindi" | "hinglish";
  isActive: boolean;
}

const defaultConfig: BotConfig = {
  businessName: "",
  businessType: "",
  location: "",
  workingHours: "",
  services: "",
  knowledgeBase: "",
  tone: "professional",
  language: "english",
  isActive: false,
};

async function safeJsonFetch(url: string, options?: RequestInit) {
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

function AISetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId") || "";

  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<BotConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/ibara/auth");
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/ibara/auth"); return; }
      setUser(u);
      if (siteId) {
        try {
          const { data } = await safeJsonFetch(`/api/ibara/sites/${siteId}/bot?userId=${u.uid}`);
          if (data.bot) {
            setConfig({
              businessName: data.bot.businessName || "",
              businessType: data.bot.businessType || "",
              location: data.bot.location || "",
              workingHours: data.bot.workingHours || "",
              services: data.bot.services || "",
              knowledgeBase: data.bot.knowledgeBase || "",
              tone: data.bot.tone || "professional",
              language: data.bot.language || "english",
              isActive: data.bot.isActive || false,
            });
          }
        } catch {}
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router, siteId]);

  const update = <K extends keyof BotConfig>(key: K, value: BotConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (activate = false) => {
    if (!user || !siteId) return;
    setError(null);
    setSaving(true);
    try {
      const payload = { ...config, userId: user.uid, isActive: activate || config.isActive };
      const { res, data } = await safeJsonFetch(`/api/ibara/sites/${siteId}/bot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setConfig((prev) => ({ ...prev, isActive: data.bot.isActive }));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "input-field w-full h-11 rounded-xl px-3.5 text-sm text-white placeholder:text-white/20";
  const textareaClass = "input-field w-full rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/20 resize-none";
  const labelClass = "block text-xs font-medium text-white/50 mb-1.5";

  return (
    <div>
      <style>{`
        .card-glass { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
        .input-field {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s;
        }
        .input-field:focus { border-color: rgba(124,58,237,0.6); outline: none; background: rgba(124,58,237,0.05); }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #06b6d4); transition: all 0.3s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(124,58,237,0.35); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .toggle-btn { border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; }
        .toggle-btn.active { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.5); color: #a78bfa; }
        .toggle-btn:not(.active):hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); }
      `}</style>

      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black mb-1">AI Setup</h1>
          <p className="text-white/30 text-sm">Train your chatbot with your business information</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.isActive ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-zinc-400 bg-zinc-400/10 border-zinc-400/20"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.isActive ? "bg-green-400" : "bg-zinc-400"}`} />
            {config.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300 mb-6">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-xs text-green-300 flex items-center gap-2 mb-6">
          <span>✓</span> Configuration saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Business Info */}
        <div className="card-glass rounded-2xl p-6">
          <h2 className="font-bold text-sm text-white/80 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-sm">🏢</span>
            Business Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Business Name *</label>
              <input
                type="text"
                value={config.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                placeholder="e.g. Sharma Electronics"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Business Type *</label>
              <input
                type="text"
                value={config.businessType}
                onChange={(e) => update("businessType", e.target.value)}
                placeholder="e.g. Electronics Retail, Restaurant, Clinic"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={config.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Patna, Bihar, India"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Working Hours</label>
              <input
                type="text"
                value={config.workingHours}
                onChange={(e) => update("workingHours", e.target.value)}
                placeholder="e.g. Mon–Sat 9am–7pm, Closed Sunday"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="card-glass rounded-2xl p-6">
          <h2 className="font-bold text-sm text-white/80 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/20 flex items-center justify-center text-sm">📋</span>
            Services & Products
          </h2>
          <div>
            <label className={labelClass}>List your main services or products</label>
            <textarea
              value={config.services}
              onChange={(e) => update("services", e.target.value)}
              placeholder="e.g.&#10;- Samsung & Apple phone repair&#10;- Screen replacement (₹800–₹5000)&#10;- Battery replacement (₹400–₹2000)&#10;- Data recovery services"
              rows={5}
              className={textareaClass}
            />
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="card-glass rounded-2xl p-6">
          <h2 className="font-bold text-sm text-white/80 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center text-sm">🧠</span>
            Knowledge Base
          </h2>
          <div>
            <label className={labelClass}>
              Additional information your AI should know (FAQs, policies, special offers, etc.)
            </label>
            <textarea
              value={config.knowledgeBase}
              onChange={(e) => update("knowledgeBase", e.target.value)}
              placeholder="e.g.&#10;Q: Do you offer home pickup?&#10;A: Yes, we offer free home pickup within 5km radius.&#10;&#10;Q: What's your warranty policy?&#10;A: All repairs come with 30-day warranty.&#10;&#10;Special: 10% off for students with ID."
              rows={8}
              className={textareaClass}
            />
          </div>
        </div>

        {/* Tone & Language */}
        <div className="card-glass rounded-2xl p-6">
          <h2 className="font-bold text-sm text-white/80 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-pink-600/20 border border-pink-500/20 flex items-center justify-center text-sm">🎨</span>
            Personality & Language
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Tone</label>
              <div className="flex gap-2">
                {(["professional", "friendly"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => update("tone", t)}
                    className={`toggle-btn flex-1 px-4 py-2.5 rounded-xl text-sm font-medium capitalize ${config.tone === t ? "active" : "text-white/40"}`}
                  >
                    {t === "professional" ? "👔 Professional" : "😊 Friendly"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/20">
                {config.tone === "professional"
                  ? "Formal, structured responses — ideal for clinics, legal, finance."
                  : "Warm, conversational tone — great for retail, food, lifestyle brands."}
              </p>
            </div>
            <div>
              <label className={labelClass}>Language</label>
              <div className="flex gap-2 flex-wrap">
                {(["english", "hindi", "hinglish"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => update("language", l)}
                    className={`toggle-btn px-4 py-2.5 rounded-xl text-sm font-medium capitalize flex-1 ${config.language === l ? "active" : "text-white/40"}`}
                  >
                    {l === "english" ? "🇬🇧 English" : l === "hindi" ? "🇮🇳 Hindi" : "🔀 Hinglish"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/20">
                {config.language === "hinglish" ? "Mix of Hindi and English — popular for Indian e-commerce." : `Responds purely in ${config.language}.`}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1 h-12 rounded-xl border border-white/10 hover:border-white/20 text-sm font-semibold text-white/60 hover:text-white transition-all"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : "Save Draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !config.businessName.trim()}
            className="btn-primary flex-2 flex-1 h-12 rounded-xl text-sm font-bold text-white"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Activating...
              </span>
            ) : config.isActive ? "✓ Update & Keep Active" : "⚡ Save & Activate AI"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AISetupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>}>
      <AISetupContent />
    </Suspense>
  );
}
