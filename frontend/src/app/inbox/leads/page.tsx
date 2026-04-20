"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import ComposeModal, { type ComposeSentMeta } from "@/components/ComposeModal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type LeadScore = "Hot" | "Warm" | "Cold";
type BuyingIntent = "High" | "Medium" | "Low";
type ScoreFilter = "All" | LeadScore;

interface LeadItem {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  name: string;
  email: string;
  date: string;
  snippet: string;
  isUnread: boolean;
  priorityScore: number;
  leadScore: LeadScore;
  buyingIntent: BuyingIntent;
  opportunitySummary: string;
  suggestedAction: string;
  replyStrategy: string;
  replyDraft: string;
  confidence: number;
  reason: string;
  source: "ai" | "rules";
}

interface PipelineStats {
  generatedAt?: string;
  scanned: number;
  candidates: number;
  analyzedWithAi: number;
  counts: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    highIntent: number;
  };
}

function avatarColor(name: string): string {
  const colors = ["#dc2626", "#ea580c", "#059669", "#2563eb", "#7c3aed", "#0891b2", "#be123c", "#4f46e5"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return colors[h % colors.length];
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Yesterday";
    if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function plainToHtml(value: string): string {
  return value
    .split(/\n{2,}/)
    .map(part => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function replySubject(subject: string): string {
  const trimmed = subject.trim() || "(no subject)";
  return /^re:/i.test(trimmed) ? trimmed : `Re: ${trimmed}`;
}

function scoreStyle(score: LeadScore) {
  if (score === "Hot") return { card: "border-red-200 bg-red-50", badge: "bg-red-600 text-white", text: "text-red-700", ring: "ring-red-200" };
  if (score === "Warm") return { card: "border-amber-200 bg-amber-50", badge: "bg-amber-500 text-white", text: "text-amber-700", ring: "ring-amber-200" };
  return { card: "border-sky-200 bg-sky-50", badge: "bg-sky-500 text-white", text: "text-sky-700", ring: "ring-sky-200" };
}

function intentStyle(intent: BuyingIntent) {
  if (intent === "High") return "bg-emerald-100 text-emerald-700";
  if (intent === "Medium") return "bg-indigo-100 text-indigo-700";
  return "bg-slate-100 text-slate-600";
}

function BackIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
}

function SparkIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>;
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return <svg className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>;
}

function SendIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></svg>;
}

export default function LeadsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<ScoreFilter>("All");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeInitialTo, setComposeInitialTo] = useState("");
  const [composeInitialSubject, setComposeInitialSubject] = useState("");
  const [composeInitialBody, setComposeInitialBody] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch {
      router.replace("/login?next=/inbox/leads");
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthLoading(false);
      if (!u) {
        router.replace("/login?next=/inbox/leads");
        return;
      }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  const getToken = useCallback(async () => {
    if (!user) return "";
    return user.getIdToken();
  }, [user]);

  const loadLeads = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/inbox/lead-intelligence?maxResults=60`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) throw new Error("Lead API routing is not configured correctly.");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load leads");
      setLeads(data.leads ?? []);
      setPipeline(data.pipeline ?? null);
    } catch (e: any) {
      setError(e.message || "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (user) void loadLeads();
  }, [user, loadLeads]);

  const counts = useMemo(() => ({
    All: pipeline?.counts.total ?? leads.length,
    Hot: pipeline?.counts.hot ?? leads.filter(l => l.leadScore === "Hot").length,
    Warm: pipeline?.counts.warm ?? leads.filter(l => l.leadScore === "Warm").length,
    Cold: pipeline?.counts.cold ?? leads.filter(l => l.leadScore === "Cold").length,
  }), [leads, pipeline]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => filter === "All" || lead.leadScore === filter);
  }, [leads, filter]);

  const selectedLead = leads.find(lead => lead.id === selectedLeadId) ?? filteredLeads[0] ?? null;

  useEffect(() => {
    if (!selectedLeadId && filteredLeads[0]) setSelectedLeadId(filteredLeads[0].id);
    if (selectedLeadId && !filteredLeads.some(lead => lead.id === selectedLeadId)) setSelectedLeadId(filteredLeads[0]?.id ?? null);
  }, [filteredLeads, selectedLeadId]);

  function replyNow(lead: LeadItem) {
    setComposeInitialTo(lead.email || lead.from);
    setComposeInitialSubject(replySubject(lead.subject));
    setComposeInitialBody(plainToHtml(lead.replyDraft));
    setComposeOpen(true);
  }

  function handleSent(_folder?: string, _meta?: ComposeSentMeta) {
    setToast("Reply sent through Gmail.");
    setTimeout(() => setToast(""), 3500);
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-white"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-[#14112a] px-5 py-4 text-white shadow-xl shadow-indigo-950/10">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <Link href="/inbox/dashboard" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/15 hover:text-white">
            <BackIcon />
            Back to Inbox
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><SparkIcon /></span>
            <div>
              <h1 className="text-xl font-black tracking-tight">Lead & Revenue Intelligence</h1>
              <p className="text-xs text-gray-500">AI-ranked opportunities from your Gmail conversations</p>
            </div>
          </div>
          <button
            onClick={() => void loadLeads()}
            disabled={loading}
            className="ml-auto flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-[#14112a] transition hover:bg-zinc-100 disabled:opacity-60"
          >
            <RefreshIcon spinning={loading} />
            Analyze Inbox
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[390px_1fr]">
        <section className="space-y-4">
          <div className="rounded-3xl border border-indigo-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-900">Pipeline snapshot</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {pipeline ? `${pipeline.scanned} Gmail messages scanned, ${pipeline.candidates} possible opportunities found.` : "Analyze your inbox to rank active revenue conversations."}
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase text-indigo-700">
                {pipeline?.analyzedWithAi ?? 0} AI reviewed
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="text-[10px] font-black uppercase text-emerald-600">High intent</p>
                <p className="mt-1 text-xl font-black text-emerald-700">{pipeline?.counts.highIntent ?? leads.filter(l => l.buyingIntent === "High").length}</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-3">
                <p className="text-[10px] font-black uppercase text-violet-600">Reply-ready</p>
                <p className="mt-1 text-xl font-black text-violet-700">{leads.filter(l => l.replyDraft).length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase text-slate-500">Updated</p>
                <p className="mt-1 text-sm font-black text-slate-700">{pipeline?.generatedAt ? formatDate(pipeline.generatedAt) : "Pending"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(["All", "Hot", "Warm", "Cold"] as ScoreFilter[]).map(item => {
              const active = filter === item;
              return (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-2xl border px-3 py-3 text-left transition ${active ? "border-[#5c4ff6] bg-white shadow-sm" : "border-transparent bg-white/70 hover:bg-white"}`}
                >
                  <p className={`text-2xl font-black ${item === "Hot" ? "text-red-600" : item === "Warm" ? "text-amber-600" : item === "Cold" ? "text-sky-600" : "text-slate-900"}`}>{counts[item]}</p>
                  <p className="text-[11px] font-bold text-slate-500">{item}</p>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-black">Revenue pipeline</p>
              <p className="text-xs text-slate-500">Sorted by strongest buying intent first</p>
            </div>
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                  <button onClick={() => void loadLeads()} className="mt-3 text-sm font-bold text-indigo-600 underline">Retry</button>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300"><SparkIcon /></div>
                  <p className="text-sm font-bold text-slate-600">No leads found in this filter</p>
                  <p className="mt-1 text-xs text-slate-400">Click Analyze Inbox after new conversations arrive.</p>
                </div>
              ) : (
                filteredLeads.map(lead => {
                  const style = scoreStyle(lead.leadScore);
                  const active = selectedLead?.id === lead.id;
                  return (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-[#f8f7ff] ${active ? "bg-[#eeebff]" : "bg-white"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ring-4 ${style.ring}`} style={{ background: avatarColor(lead.name || lead.email) }}>
                          {(lead.name || lead.email || "?")[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-black text-slate-900">{lead.name || lead.email}</p>
                            {lead.isUnread && <span className="h-2 w-2 rounded-full bg-[#5c4ff6]" />}
                            <span className="ml-auto shrink-0 text-[11px] text-slate-400">{formatDate(lead.date)}</span>
                          </div>
                          <p className="mt-0.5 truncate text-xs font-semibold text-slate-600">{lead.subject}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${style.badge}`}>{lead.leadScore} Lead</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${intentStyle(lead.buyingIntent)}`}>{lead.buyingIntent} Intent</span>
                            {lead.source === "ai" && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black uppercase text-violet-700">AI</span>}
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{lead.opportunitySummary}</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="min-h-[620px] rounded-3xl border border-slate-200 bg-white shadow-sm">
          {!selectedLead ? (
            <div className="flex h-full min-h-[620px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300"><SparkIcon /></div>
              <p className="text-sm font-bold text-slate-600">Select a lead to see the revenue plan</p>
            </div>
          ) : (
            <div className="p-5 lg:p-7">
              <div className={`mb-6 rounded-3xl border p-5 ${scoreStyle(selectedLead.leadScore).card}`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ background: avatarColor(selectedLead.name || selectedLead.email) }}>
                      {(selectedLead.name || selectedLead.email || "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black text-slate-950">{selectedLead.name || selectedLead.email}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${scoreStyle(selectedLead.leadScore).badge}`}>{selectedLead.leadScore} Lead</span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${intentStyle(selectedLead.buyingIntent)}`}>{selectedLead.buyingIntent} Intent</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{selectedLead.email}</p>
                      <p className="mt-3 text-sm font-bold text-slate-800">{selectedLead.subject}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => replyNow(selectedLead)}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#5c4ff6] px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-[#4f43e0]"
                  >
                    <SendIcon />
                    Reply Now
                  </button>
                  <Link
                    href="/inbox/dashboard"
                    className="flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Open Inbox
                  </Link>
                </div>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead score</p>
                  <p className={`mt-2 text-2xl font-black ${scoreStyle(selectedLead.leadScore).text}`}>{selectedLead.leadScore}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buying intent</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{selectedLead.buyingIntent}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confidence</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{Math.round(selectedLead.confidence)}%</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-100 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Opportunity summary</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{selectedLead.opportunitySummary}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Suggested action</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{selectedLead.suggestedAction}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 p-5 lg:col-span-2">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Reply strategy</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{selectedLead.replyStrategy}</p>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">AI reply draft</p>
                      <button onClick={() => replyNow(selectedLead)} className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#5c4ff6] shadow-sm transition hover:bg-indigo-50">Use draft</button>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{selectedLead.replyDraft}</div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 lg:col-span-2">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Why AI flagged this</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{selectedLead.reason}</p>
                  <p className="mt-3 text-xs text-slate-400">Original snippet: {selectedLead.snippet}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-2xl">{toast}</div>}

      {composeOpen && (
        <ComposeModal
          user={user}
          apiBase={API}
          onClose={() => setComposeOpen(false)}
          onSent={handleSent}
          initialTo={composeInitialTo}
          initialSubject={composeInitialSubject}
          initialBodyHtml={composeInitialBody}
        />
      )}
    </div>
  );
}
