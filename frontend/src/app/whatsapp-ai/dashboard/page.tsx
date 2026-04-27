"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { PlatformSwitcher } from "@/components/PlatformSwitcher";
import { setLastActivePlatform } from "@/lib/platformSession";
import EmbeddedSignupButton from "./EmbeddedSignupButton";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const STORAGE_KEY = "evara_whatsapp_business_setup_v1";
const PROFILE_ID_KEY = "evara_whatsapp_business_id_v1";

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
  from?: string;
  customerName: string;
  customerMessage: string;
  aiReply: string;
  language: string;
  createdAt: string;
};

const DEFAULT_CONFIG: BusinessConfig = {
  businessName: "Plyndrox Studio",
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

function readBusinessId() {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(PROFILE_ID_KEY);
  if (existing?.trim()) return existing.trim();
  const id = `biz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(PROFILE_ID_KEY, id);
  return id;
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
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
      />
    </label>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  
  const [businessId, setBusinessId] = useState("");
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState("");
  const [testMessage, setTestMessage] = useState("Namaste, kya aap delivery aur pricing bata sakte ho?");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [activeTab, setActiveTab] = useState<"setup" | "preview" | "logs">("setup");
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/login?next=/whatsapp-ai/dashboard");
      } else {
        setAuthChecked(true);
        setLastActivePlatform("whatsapp-ai");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    const id = readBusinessId();
    setBusinessId(id);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfig({ ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<BusinessConfig>) });
    } catch {}

    void loadPersistedSetup(id);
    void loadLogs(id);
  }, [authChecked]);

  async function loadPersistedSetup(id = businessId) {
    if (!id) return;
    try {
      const res = await fetch(`${API}/v1/whatsapp/config?businessId=${encodeURIComponent(id)}`);
      if (!res.ok) return;
      const data: { config?: Partial<BusinessConfig>; persisted?: boolean } = await res.json();
      if (data.config) {
        const nextConfig = { ...DEFAULT_CONFIG, ...data.config };
        setConfig(nextConfig);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
      }
    } catch {}
  }

  async function loadLogs(id = businessId) {
    if (!id) return;
    try {
      const res = await fetch(`${API}/v1/whatsapp/logs?businessId=${encodeURIComponent(id)}`);
      if (!res.ok) return;
      const data: { logs?: LogItem[] } = await res.json();
      if (Array.isArray(data.logs) && data.logs.length > 0) {
        setLogs(data.logs);
      }
    } catch {}
  }

  async function saveSetup() {
    setSaving(true);
    setToast("");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      const res = await fetch(`${API}/v1/whatsapp/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, ...config }),
      });
      if (!res.ok) throw new Error("Save failed");
      await res.json();
      setToast("Business setup saved successfully.");
      await loadLogs();
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("Saved locally. Start the backend to sync this setup with the webhook.");
      setTimeout(() => setToast(""), 4000);
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
        body: JSON.stringify({ businessId, ...config, customerMessage: text }),
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
      setTestMessage("");
      void loadLogs();
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
    } finally {
      setTesting(false);
    }
  }

  if (!authChecked) {
    return <div className="min-h-screen bg-[#FAFAFA]" />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-20 md:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 rounded-lg object-contain bg-white p-1 plyndrox-logo-img" draggable={false} />
            <span className="font-semibold tracking-tight">Business Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveSetup}
              disabled={saving}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Config"}
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white px-4 py-2 text-sm text-white shadow-xl animate-in slide-in-from-top-2 fade-in">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 md:grid md:grid-cols-12 md:gap-8 md:py-10">
        {/* Desktop Sidebar / Mobile Tabs */}
        <aside className="md:col-span-3">
          <div className="sticky top-24 hidden md:block space-y-1">
            {(["setup", "preview", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? "bg-emerald-50 text-emerald-900" 
                    : "text-gray-400 hover:bg-zinc-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="md:col-span-9 mt-6 md:mt-0">
          {activeTab === "setup" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <EmbeddedSignupButton
                businessId={businessId}
                onConnected={() => loadPersistedSetup(businessId)}
              />
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Business Profile</h2>
                    <p className="text-sm text-gray-400">Core details that guide AI context.</p>
                  </div>
                  <button
                    onClick={() => setConfig((p) => ({ ...p, autoReplyEnabled: !p.autoReplyEnabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.autoReplyEnabled ? 'bg-emerald-600' : 'bg-zinc-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.autoReplyEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Business name" value={config.businessName} onChange={(v) => setConfig((p) => ({ ...p, businessName: v }))} />
                  <Field label="Business type" value={config.businessType} onChange={(v) => setConfig((p) => ({ ...p, businessType: v }))} />
                  <Field label="Working hours" value={config.workingHours} onChange={(v) => setConfig((p) => ({ ...p, workingHours: v }))} />
                  <Field label="Location" value={config.location} onChange={(v) => setConfig((p) => ({ ...p, location: v }))} />
                </div>

                <label className="mt-5 block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Services & Products
                  </span>
                  <textarea
                    value={config.services}
                    onChange={(e) => setConfig((p) => ({ ...p, services: e.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </label>

                <label className="mt-5 block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Knowledge Book
                  </span>
                  <textarea
                    value={config.knowledgeBook}
                    onChange={(e) => setConfig((p) => ({ ...p, knowledgeBook: e.target.value }))}
                    className="min-h-40 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                    placeholder="Paste FAQs, pricing rules, refund policy, and common questions..."
                  />
                </label>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tone</span>
                    <select
                      value={config.tone}
                      onChange={(e) => setConfig((p) => ({ ...p, tone: e.target.value as BusinessConfig["tone"] }))}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Language Mode</span>
                    <select
                      value={config.languageMode}
                      onChange={(e) => setConfig((p) => ({ ...p, languageMode: e.target.value as BusinessConfig["languageMode"] }))}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
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
          )}

          {activeTab === "preview" && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 h-[600px] flex flex-col">
              <h2 className="text-lg font-bold">Simulator</h2>
              <p className="text-sm text-gray-400 mb-6">Test how the AI responds using your config.</p>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 rounded-xl bg-[#EFEAE2] p-4 bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QZ30M39s_.png')]">
                {logs.slice(0, 5).reverse().map((log) => (
                  <div key={log.id} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#DCF8C6] px-4 py-2 text-sm text-zinc-900 shadow-sm">
                        {log.customerMessage}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm">
                        {log.aiReply}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-end gap-2 mt-auto">
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Type a customer message..."
                  className="max-h-32 min-h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      testReply();
                    }
                  }}
                />
                <button
                  onClick={testReply}
                  disabled={testing || !testMessage.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition-opacity hover:bg-emerald-700 disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-0 sm:p-0 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="border-b border-zinc-100 p-5 sm:p-6 bg-zinc-50/50">
                <h2 className="text-lg font-bold">Chat History</h2>
                <p className="text-sm text-gray-400">Recent conversations with customers.</p>
              </div>
              <div className="divide-y divide-zinc-100">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400">No logs yet.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-5 sm:p-6 hover:bg-zinc-50/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-sm">{log.customerName}</span>
                        <span className="text-[11px] text-gray-500 font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="grid gap-3">
                        <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Customer</span>
                          {log.customerMessage}
                        </div>
                        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                          <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest block mb-1">Plyndrox AI</span>
                          {log.aiReply}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/90 backdrop-blur-md md:hidden pb-safe">
        <div className="flex items-center justify-around p-2">
          {(["setup", "preview", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center p-2 min-w-[70px] rounded-xl transition-colors ${
                activeTab === tab ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <span className="text-[11px] font-semibold tracking-wide mt-1">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </nav>
      <PlatformSwitcher current="whatsapp-ai" />
    </div>
  );
}
