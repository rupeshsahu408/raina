"use client";

import { useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const STORAGE_KEY = "evara_whatsapp_business_setup_v1";

type Status = {
  whatsappApiToken: boolean;
  whatsappPhoneNumberId: boolean;
  whatsappVerifyToken: boolean;
  aiApiKey: boolean;
  autoReplyEnabled: boolean;
};

type BusinessConfig = {
  businessName: string;
  businessType: string;
  workingHours: string;
  location: string;
  services: string;
  knowledgeBook: string;
  tone: "friendly" | "professional";
  languageMode: "auto" | "english" | "hindi" | "hinglish";
  autoReplyEnabled: boolean;
};

type LogItem = {
  id: string;
  customerName: string;
  customerMessage: string;
  aiReply: string;
  language: string;
  createdAt: string;
};

const DEFAULT_CONFIG: BusinessConfig = {
  businessName: "Evara Studio",
  businessType: "Service business",
  workingHours: "10 AM to 8 PM, Monday to Saturday",
  location: "India",
  services: "Consultation, bookings, product information, support",
  knowledgeBook:
    "We help customers quickly understand services, pricing, availability, booking steps, and support options. Keep replies short, polite, and useful.",
  tone: "professional",
  languageMode: "auto",
  autoReplyEnabled: true,
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-sm text-zinc-300">{label}</span>
      <span
        className={[
          "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
          ok ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200",
        ].join(" ")}
      >
        {ok ? "Ready" : "Missing"}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-300/60"
      />
    </label>
  );
}

export default function WhatsAppAIPage() {
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<Status | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState("");
  const [testMessage, setTestMessage] = useState("Namaste, kya aap delivery aur pricing bata sakte ho?");
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: "seed-1",
      customerName: "Riya Customer",
      customerMessage: "Hi, are you open today?",
      aiReply: "Hello! Yes, we are open during business hours. Please tell me what you need help with.",
      language: "English",
      createdAt: new Date().toISOString(),
    },
  ]);

  const readiness = useMemo(() => {
    if (!status) return 0;
    const checks = [
      status.whatsappApiToken,
      status.whatsappPhoneNumberId,
      status.whatsappVerifyToken,
      status.aiApiKey,
      status.autoReplyEnabled,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [status]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfig({ ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<BusinessConfig>) });
    } catch {}

    void refreshStatus();
  }, []);

  async function refreshStatus() {
    try {
      const res = await fetch(`${API}/v1/whatsapp/status`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({
        whatsappApiToken: false,
        whatsappPhoneNumberId: false,
        whatsappVerifyToken: false,
        aiApiKey: false,
        autoReplyEnabled: false,
      });
    }
  }

  async function saveSetup() {
    setSaving(true);
    setToast("");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      const res = await fetch(`${API}/v1/whatsapp/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Save failed");
      setToast("Business setup saved. Webhook replies will use this knowledge while the server is running.");
      await refreshStatus();
    } catch {
      setToast("Saved locally. Start the backend to sync this setup with the webhook.");
    } finally {
      setSaving(false);
    }
  }

  async function testReply() {
    const text = testMessage.trim();
    if (!text) return;
    setTesting(true);
    setToast("");
    try {
      const res = await fetch(`${API}/v1/whatsapp/preview-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, customerMessage: text }),
      });
      if (!res.ok) throw new Error("Preview failed");
      const data: { reply?: string; language?: string } = await res.json();
      setLogs((prev) => [
        {
          id: makeId(),
          customerName: "Preview customer",
          customerMessage: text,
          aiReply: data.reply || "No reply generated.",
          language: data.language || "Auto",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setToast("AI preview generated from your business knowledge book.");
    } catch {
      const fallback = `Thanks for messaging ${config.businessName || "us"}. We received your question and will help you shortly.`;
      setLogs((prev) => [
        {
          id: makeId(),
          customerName: "Preview customer",
          customerMessage: text,
          aiReply: fallback,
          language: "Fallback",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setToast("Backend unavailable, so a safe fallback reply was shown.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020807] text-zinc-100">
      <div className="premium-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl" />
      <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/evara-logo.png" alt="Evara AI" className="h-11 w-11 object-contain" draggable={false} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Evara AI Extension</p>
              <p className="text-sm text-zinc-400">WhatsApp AI Business Assistant</p>
            </div>
          </a>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={saveSetup}
              disabled={saving}
              className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Setup"}
            </button>
            <a href="/" className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.06]">
              Back Home
            </a>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/[0.10] via-white/[0.045] to-emerald-400/[0.06] p-6 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl sm:p-8">
              <div className="absolute right-8 top-8 hidden h-36 w-36 rotate-12 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 shadow-2xl shadow-emerald-400/10 lg:block" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                WhatsApp Cloud API + Evara AI
              </p>
              <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-tight sm:text-6xl">
                Auto-reply to customers with a multilingual AI business agent.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                Configure your business details, paste a knowledge book, test realistic customer messages, and connect WhatsApp credentials through secure server environment variables.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {["Hindi, English, Hinglish", "Auto-reply ON/OFF", "Business knowledge first"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-[2.25rem] border border-white/10 bg-black/30 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Launch readiness</p>
                  <p className="mt-1 text-3xl font-semibold">{readiness}%</p>
                </div>
                <div className="grid h-24 w-24 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 text-sm text-emerald-100 shadow-2xl shadow-emerald-400/10">
                  3D Hub
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <StatusPill ok={!!status?.whatsappApiToken} label="WhatsApp API token" />
                <StatusPill ok={!!status?.whatsappPhoneNumberId} label="Phone number ID" />
                <StatusPill ok={!!status?.whatsappVerifyToken} label="Webhook verify token" />
                <StatusPill ok={!!status?.aiApiKey} label="Server AI API key" />
              </div>
              <p className="mt-4 text-xs leading-6 text-zinc-500">
                Add secrets on the server as WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN, and NVIDIA_API_KEY. Values are never exposed to the browser.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Business information setup</h2>
                  <p className="mt-1 text-sm text-zinc-500">This data guides every AI reply.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.autoReplyEnabled}
                  onClick={() => setConfig((p) => ({ ...p, autoReplyEnabled: !p.autoReplyEnabled }))}
                  className={[
                    "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition",
                    config.autoReplyEnabled ? "bg-emerald-300 text-black" : "bg-zinc-800 text-zinc-300",
                  ].join(" ")}
                >
                  Auto reply {config.autoReplyEnabled ? "ON" : "OFF"}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business name" value={config.businessName} onChange={(v) => setConfig((p) => ({ ...p, businessName: v }))} />
                <Field label="Business type" value={config.businessType} onChange={(v) => setConfig((p) => ({ ...p, businessType: v }))} />
                <Field label="Working hours" value={config.workingHours} onChange={(v) => setConfig((p) => ({ ...p, workingHours: v }))} />
                <Field label="Location" value={config.location} onChange={(v) => setConfig((p) => ({ ...p, location: v }))} />
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Services / products
                </span>
                <textarea
                  value={config.services}
                  onChange={(e) => setConfig((p) => ({ ...p, services: e.target.value }))}
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-300/60"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Business knowledge book
                </span>
                <textarea
                  value={config.knowledgeBook}
                  onChange={(e) => setConfig((p) => ({ ...p, knowledgeBook: e.target.value }))}
                  className="min-h-44 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none transition focus:border-emerald-300/60"
                  placeholder="Paste FAQs, pricing rules, offers, delivery policy, refund policy, booking steps, and anything customers ask often."
                />
              </label>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Tone</span>
                  <select
                    value={config.tone}
                    onChange={(e) => setConfig((p) => ({ ...p, tone: e.target.value as BusinessConfig["tone"] }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Language</span>
                  <select
                    value={config.languageMode}
                    onChange={(e) => setConfig((p) => ({ ...p, languageMode: e.target.value as BusinessConfig["languageMode"] }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Test auto reply</h2>
              <p className="mt-1 text-sm text-zinc-500">Preview how the AI responds before connecting real WhatsApp traffic.</p>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none transition focus:border-emerald-300/60"
              />
              <button
                type="button"
                onClick={testReply}
                disabled={testing}
                className="mt-3 w-full rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60"
              >
                {testing ? "Generating..." : "Generate AI Reply"}
              </button>
              {toast ? <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-zinc-300">{toast}</p> : null}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Basic chat logs</h2>
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-zinc-400">{logs.length} chats</span>
              </div>
              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <article key={log.id} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-zinc-200">{log.customerName}</p>
                      <span className="text-[11px] text-zinc-500">{log.language}</span>
                    </div>
                    <p className="mt-3 rounded-2xl bg-black/30 p-3 text-sm text-zinc-300">{log.customerMessage}</p>
                    <p className="mt-2 rounded-2xl bg-emerald-300/10 p-3 text-sm leading-6 text-emerald-50">{log.aiReply}</p>
                    <p className="mt-2 text-[11px] text-zinc-600">{new Date(log.createdAt).toLocaleString()}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}