"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const STORAGE_KEY = "evara_whatsapp_business_setup_v1";
const PROFILE_ID_KEY = "evara_whatsapp_business_id_v1";

type Status = {
  whatsappApiToken: boolean;
  whatsappPhoneNumberId: boolean;
  whatsappVerifyToken: boolean;
  aiApiKey: boolean;
  autoReplyEnabled: boolean;
  connected?: boolean;
  credentialSource?: "database" | "env" | "none";
  callbackUrl?: string;
  lastTestAt?: string | null;
  lastError?: string | null;
  tokenLast4?: string | null;
  oauthReady?: boolean;
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
  from?: string;
  customerName: string;
  customerMessage: string;
  aiReply: string;
  language: string;
  createdAt: string;
};

type CredentialForm = {
  apiToken: string;
  phoneNumberId: string;
  verifyToken: string;
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
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
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

function SecretField({
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
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
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
  const [status, setStatus] = useState<Status | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState("");
  const [testMessage, setTestMessage] = useState("Namaste, kya aap delivery aur pricing bata sakte ho?");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [activeTab, setActiveTab] = useState<"setup" | "preview" | "logs">("setup");
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectStep, setConnectStep] = useState<1 | 2 | 3>(1);
  const [credentialSaving, setCredentialSaving] = useState(false);
  const [connectionTesting, setConnectionTesting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [credentials, setCredentials] = useState<CredentialForm>({
    apiToken: "",
    phoneNumberId: "",
    verifyToken: "evara_ai_secure_2026",
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/login?next=/whatsapp-ai/dashboard");
      } else {
        setAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, [router]);

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
    if (!authChecked) return;
    const id = readBusinessId();
    setBusinessId(id);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfig({ ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<BusinessConfig>) });
    } catch {}

    void refreshStatus(id);
    void loadPersistedSetup(id);
    void loadLogs(id);
  }, [authChecked]);

  async function refreshStatus(id = businessId) {
    try {
      const qs = id ? `?businessId=${encodeURIComponent(id)}` : "";
      const res = await fetch(`${API}/v1/whatsapp/status${qs}`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({
        whatsappApiToken: false,
        whatsappPhoneNumberId: false,
        whatsappVerifyToken: false,
        aiApiKey: false,
        autoReplyEnabled: false,
        connected: false,
        credentialSource: "none",
      });
    }
  }

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
      await refreshStatus(businessId);
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

  async function saveCredentials() {
    if (!credentials.apiToken.trim() || !credentials.phoneNumberId.trim() || !credentials.verifyToken.trim()) {
      setConnectionMessage("Enter all three credentials before continuing.");
      return;
    }

    setCredentialSaving(true);
    setConnectionMessage("");
    try {
      const res = await fetch(`${API}/v1/whatsapp/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, ...credentials }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save credentials");
      if (data.status) setStatus(data.status);
      setCredentials((prev) => ({ ...prev, apiToken: "" }));
      setConnectionMessage("Credentials saved securely. Now test the connection.");
      setConnectStep(3);
    } catch (err) {
      setConnectionMessage(err instanceof Error ? err.message : "Could not save credentials.");
    } finally {
      setCredentialSaving(false);
    }
  }

  async function testConnection() {
    setConnectionTesting(true);
    setConnectionMessage("");
    try {
      const res = await fetch(`${API}/v1/whatsapp/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.status) setStatus(data.status);
      if (!res.ok) throw new Error(data?.error || "Connection test failed");
      setConnectionMessage("Connected successfully. WhatsApp Cloud API is ready.");
      await refreshStatus(businessId);
    } catch (err) {
      setConnectionMessage(err instanceof Error ? err.message : "Connection test failed.");
    } finally {
      setConnectionTesting(false);
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
            <img src="/evara-logo.png" alt="Evara" className="h-8 w-8 rounded-lg object-contain bg-black p-1" draggable={false} />
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
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-zinc-900 px-4 py-2 text-sm text-white shadow-xl animate-in slide-in-from-top-2 fade-in">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 md:grid md:grid-cols-12 md:gap-8 md:py-10">
        {/* Desktop Sidebar / Mobile Tabs */}
        <aside className="md:col-span-3">
          <div className="sticky top-24 hidden md:block space-y-1">
            <div className="mb-6 px-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Health</p>
              <div className="mt-2 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${readiness === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-sm font-medium">{readiness}% Ready</span>
              </div>
            </div>
            
            {(["setup", "preview", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? "bg-emerald-50 text-emerald-900" 
                    : "text-zinc-600 hover:bg-zinc-100"
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
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Business Profile</h2>
                    <p className="text-sm text-zinc-500">Core details that guide AI context.</p>
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
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Services & Products
                  </span>
                  <textarea
                    value={config.services}
                    onChange={(e) => setConfig((p) => ({ ...p, services: e.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </label>

                <label className="mt-5 block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
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
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Tone</span>
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
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Language Mode</span>
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

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">WhatsApp Connection</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      status?.connected ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {status?.connected ? "Connected" : "Not Connected"}
                    </span>
                    <button
                      onClick={() => {
                        setConnectOpen(true);
                        setConnectStep(status?.whatsappApiToken ? 3 : 1);
                      }}
                      className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Connect WhatsApp
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Pre-configured webhook</p>
                  {status?.callbackUrl && (
                    <p className="mt-1 break-all text-sm font-medium text-emerald-950">
                      {status.callbackUrl}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-emerald-800">
                    Verify token is validated automatically on the backend. Stored credentials are never returned to this dashboard.
                  </p>
                </div>

                {connectOpen && (
                  <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        { id: 1, title: "Step 1", label: "API Token" },
                        { id: 2, title: "Step 2", label: "Phone ID" },
                        { id: 3, title: "Step 3", label: "Verify & Test" },
                      ].map((step) => (
                        <button
                          key={step.id}
                          onClick={() => setConnectStep(step.id as 1 | 2 | 3)}
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            connectStep === step.id
                              ? "border-emerald-500 bg-white shadow-sm"
                              : "border-zinc-200 bg-white/60"
                          }`}
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">{step.title}</span>
                          <span className="block text-sm font-semibold text-zinc-900">{step.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        {connectStep === 1 && (
                          <div className="space-y-4">
                            <SecretField
                              label="WhatsApp Cloud API Token"
                              value={credentials.apiToken}
                              onChange={(value) => setCredentials((prev) => ({ ...prev, apiToken: value }))}
                              placeholder="Paste token starting with EA..."
                            />
                            <button
                              onClick={() => setConnectStep(2)}
                              disabled={!credentials.apiToken.trim()}
                              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 sm:w-auto"
                            >
                              Continue
                            </button>
                          </div>
                        )}

                        {connectStep === 2 && (
                          <div className="space-y-4">
                            <Field
                              label="Phone Number ID"
                              value={credentials.phoneNumberId}
                              onChange={(value) => setCredentials((prev) => ({ ...prev, phoneNumberId: value }))}
                              placeholder="Example: 1043854315484140"
                            />
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <button
                                onClick={() => setConnectStep(1)}
                                className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700"
                              >
                                Back
                              </button>
                              <button
                                onClick={() => setConnectStep(3)}
                                disabled={!credentials.phoneNumberId.trim()}
                                className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
                              >
                                Continue
                              </button>
                            </div>
                          </div>
                        )}

                        {connectStep === 3 && (
                          <div className="space-y-4">
                            <SecretField
                              label="Verify Token"
                              value={credentials.verifyToken}
                              onChange={(value) => setCredentials((prev) => ({ ...prev, verifyToken: value }))}
                              placeholder="evara_ai_secure_2026"
                            />
                            <div className="grid gap-2 sm:grid-cols-2">
                              <button
                                onClick={saveCredentials}
                                disabled={credentialSaving || !credentials.verifyToken.trim()}
                                className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
                              >
                                {credentialSaving ? "Saving..." : "Save Securely"}
                              </button>
                              <button
                                onClick={testConnection}
                                disabled={connectionTesting || !(status?.whatsappApiToken && status?.whatsappPhoneNumberId && status?.whatsappVerifyToken)}
                                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
                              >
                                {connectionTesting ? "Testing..." : "Test Connection"}
                              </button>
                            </div>
                            {connectionMessage && (
                              <p className={`rounded-xl px-4 py-3 text-sm ${
                                status?.connected ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                              }`}>
                                {connectionMessage}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <h3 className="font-semibold">How to get credentials</h3>
                        <ol className="mt-3 space-y-2 text-sm text-zinc-600">
                          <li>1. Open Meta Developers and select your WhatsApp app.</li>
                          <li>2. Copy the Cloud API access token from API Setup.</li>
                          <li>3. Copy the Phone Number ID from the same page.</li>
                          <li>4. Use the verify token shown for your webhook setup.</li>
                        </ol>
                        <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500">
                          Current source: {status?.credentialSource || "none"}
                          {status?.lastTestAt ? ` · Last tested ${new Date(status.lastTestAt).toLocaleString()}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  {[
                    { key: "whatsappApiToken", label: "WhatsApp API Token", ok: status?.whatsappApiToken },
                    { key: "whatsappPhoneNumberId", label: "Phone Number ID", ok: status?.whatsappPhoneNumberId },
                    { key: "whatsappVerifyToken", label: "Webhook Verify Token", ok: status?.whatsappVerifyToken },
                    { key: "aiApiKey", label: "AI API Key", ok: status?.aiApiKey },
                  ].map((s) => (
                    <div key={s.key} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                      <span className="text-sm font-medium text-zinc-700">{s.label}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${s.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-red-800'}`}>
                        {s.ok ? 'Ready' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 h-[600px] flex flex-col">
              <h2 className="text-lg font-bold">Simulator</h2>
              <p className="text-sm text-zinc-500 mb-6">Test how the AI responds using your config.</p>
              
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
                <p className="text-sm text-zinc-500">Recent conversations with customers.</p>
              </div>
              <div className="divide-y divide-zinc-100">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-sm text-zinc-500">No logs yet.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-5 sm:p-6 hover:bg-zinc-50/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-sm">{log.customerName}</span>
                        <span className="text-[11px] text-zinc-400 font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="grid gap-3">
                        <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Customer</span>
                          {log.customerMessage}
                        </div>
                        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                          <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest block mb-1">Evara AI</span>
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
                activeTab === tab ? "text-emerald-600" : "text-zinc-500"
              }`}
            >
              <span className="text-[11px] font-semibold tracking-wide mt-1">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
