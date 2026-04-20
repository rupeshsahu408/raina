"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type Severity = "high" | "medium" | "low";

interface Issue {
  type: string;
  label: string;
  count: number;
  deduction: number;
  action: string;
  href: string;
  severity: Severity;
}

interface HealthData {
  score: number;
  grade: string;
  gradeColor: string;
  issues: Issue[];
  briefing: {
    greeting: string;
    priorities: string[];
    message: string;
  };
  metrics: {
    urgentCount: number;
    overdueFollowUps: number;
    totalFollowUps: number;
    overdueWaiting: number;
    totalWaiting: number;
    paymentCount: number;
    leadCount: number;
    unreadCount: number;
  };
  generatedAt: string;
}

function BackIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
}
function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return <svg className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>;
}
function HeartIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
}
function ArrowRightIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
}
function CheckIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}

function issueIcon(type: string) {
  switch (type) {
    case "urgent": return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.86 2 8.28 0L22 7.86l0 8.28L16.14 22l-8.28 0L2 16.14l0-8.28Z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
    case "followup": return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case "waiting": return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case "payment": return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>;
    case "lead": return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>;
    default: return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
  }
}

function issueColors(severity: Severity) {
  if (severity === "high") return { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600 bg-red-100", badge: "bg-red-100 text-red-700", btn: "bg-red-600 hover:bg-red-700 text-white" };
  if (severity === "medium") return { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600 bg-amber-100", badge: "bg-amber-100 text-amber-700", btn: "bg-amber-500 hover:bg-amber-600 text-white" };
  return { bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-500 bg-slate-100", badge: "bg-slate-100 text-slate-600", btn: "bg-slate-600 hover:bg-slate-700 text-white" };
}

function gradeStyles(score: number) {
  if (score >= 90) return { ring: "#10b981", track: "#d1fae5", label: "text-emerald-700", bg: "from-emerald-500 to-teal-400", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", glow: "shadow-emerald-200" };
  if (score >= 75) return { ring: "#3b82f6", track: "#dbeafe", label: "text-blue-700", bg: "from-blue-500 to-indigo-400", badge: "bg-blue-100 text-blue-800 border-blue-200", glow: "shadow-blue-200" };
  if (score >= 60) return { ring: "#f59e0b", track: "#fef3c7", label: "text-amber-700", bg: "from-amber-500 to-orange-400", badge: "bg-amber-100 text-amber-800 border-amber-200", glow: "shadow-amber-200" };
  return { ring: "#ef4444", track: "#fee2e2", label: "text-red-700", bg: "from-red-500 to-rose-400", badge: "bg-red-100 text-red-800 border-red-200", glow: "shadow-red-200" };
}

function ScoreRing({ score, animated }: { score: number; animated: boolean }) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayed, setDisplayed] = useState(0);
  const styles = gradeStyles(score);

  useEffect(() => {
    if (!animated) { setDisplayed(score); return; }
    let start: number | null = null;
    const duration = 1200;
    function step(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(ease * score));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [score, animated]);

  const offset = circumference - (displayed / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={styles.track} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={styles.ring} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-slate-900 leading-none">{displayed}</span>
        <span className="text-sm font-bold text-slate-400 mt-1">out of 100</span>
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

const BRIEFING_KEY = "inbox_health_briefing_date";

export default function InboxHealthPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animated, setAnimated] = useState(false);
  const [briefingDismissed, setBriefingDismissed] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/login?next=/inbox/health");
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthLoading(false);
      if (!u) { router.replace("/login?next=/inbox/health"); return; }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  const getToken = useCallback(async () => {
    if (!user) return "";
    return user.getIdToken();
  }, [user]);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    setAnimated(false);
    try {
      const res = await fetch(`${API}/inbox/health-score`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load health score");
      setData(json);
      setTimeout(() => setAnimated(true), 100);

      const today = new Date().toDateString();
      const lastSeen = localStorage.getItem(BRIEFING_KEY);
      if (lastSeen !== today) {
        setShowBriefing(true);
        setBriefingDismissed(false);
      }
    } catch (e: any) {
      setError(e.message || "Could not load health score.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (user && !hasLoaded.current) {
      hasLoaded.current = true;
      void load();
    }
  }, [user, load]);

  function dismissBriefing() {
    setBriefingDismissed(true);
    localStorage.setItem(BRIEFING_KEY, new Date().toDateString());
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-white"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" /></div>;
  }

  const styles = data ? gradeStyles(data.score) : gradeStyles(0);

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-slate-900">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-[#14112a] px-5 py-4 text-white shadow-xl shadow-indigo-950/10">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link href="/inbox/dashboard" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/15 hover:text-white">
            <BackIcon />
            Back to Inbox
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-2xl bg-rose-400/15 text-rose-300"><HeartIcon /></span>
            <div>
              <h1 className="text-xl font-black tracking-tight">Inbox Health Score</h1>
              <p className="text-xs text-gray-500">Your daily inbox productivity score</p>
            </div>
          </div>
          <button
            onClick={() => { hasLoaded.current = false; void load(); }}
            disabled={loading}
            className="ml-auto flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-[#14112a] transition hover:bg-zinc-100 disabled:opacity-60"
          >
            <RefreshIcon spinning={loading} />
            Refresh Score
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">

        {/* Daily Briefing Modal */}
        {showBriefing && !briefingDismissed && data && (
          <div className="rounded-3xl border border-indigo-200 bg-white shadow-xl shadow-indigo-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${styles.bg} px-6 py-5`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-black text-white">{data.briefing.greeting} 👋</p>
                  <p className="mt-1 text-white/80 text-sm font-medium">Your Inbox Health is <span className="font-black text-white">{data.score}/100</span></p>
                </div>
                <button onClick={dismissBriefing} className="rounded-full bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 text-xs font-bold transition">Dismiss</button>
              </div>
            </div>
            <div className="px-6 py-5">
              {data.briefing.priorities.length > 0 ? (
                <>
                  <p className="text-sm font-black text-slate-800 mb-3">Top priorities today:</p>
                  <ul className="space-y-2 mb-4">
                    {data.briefing.priorities.map((p, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-black text-indigo-700">{i + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-400">{data.briefing.message}</p>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckIcon /></span>
                  <p className="text-sm font-semibold text-slate-700">{data.briefing.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Score Card */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col items-center gap-6">
              <div className="h-[200px] w-[200px] rounded-full animate-pulse bg-slate-100" />
              <div className="space-y-2 w-48 text-center">
                <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/4 mx-auto" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button onClick={() => { hasLoaded.current = false; void load(); }} className="mt-3 text-sm font-bold text-indigo-600 underline">Retry</button>
          </div>
        ) : data ? (
          <>
            {/* Main Score + Grade */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="flex flex-col items-center gap-4">
                  <ScoreRing score={data.score} animated={animated} />
                  <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${styles.badge} shadow-lg ${styles.glow}`}>
                    <HeartIcon />
                    {data.grade}
                  </div>
                </div>

                <div className="flex-1 space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {data.score >= 90 ? "Inbox is in great shape!" :
                       data.score >= 75 ? "Almost there — a few things to clear." :
                       data.score >= 60 ? "Some attention needed today." :
                       data.score >= 40 ? "Your inbox needs work." :
                       "Critical — act now to recover your score."}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {data.issues.length === 0
                        ? "Everything is under control. Keep maintaining this habit."
                        : `${data.issues.length} issue${data.issues.length > 1 ? "s" : ""} are pulling your score down. Fix them to reach 100.`}
                    </p>
                    {data.generatedAt && (
                      <p className="mt-2 text-xs text-slate-400">Last updated at {formatTime(data.generatedAt)}</p>
                    )}
                  </div>

                  {/* Score breakdown bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Score progress</span>
                      <span>{data.score}/100</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${styles.bg} transition-all duration-1000`}
                        style={{ width: animated ? `${data.score}%` : "0%" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Critical</span>
                      <span>Fair</span>
                      <span>Good</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  {/* Metrics pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Unread", value: data.metrics.unreadCount, color: "bg-slate-100 text-slate-700" },
                      { label: "Urgent", value: data.metrics.urgentCount, color: data.metrics.urgentCount > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500" },
                      { label: "Overdue F/U", value: data.metrics.overdueFollowUps, color: data.metrics.overdueFollowUps > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500" },
                      { label: "Waiting", value: data.metrics.totalWaiting, color: "bg-indigo-100 text-indigo-700" },
                      { label: "Payments", value: data.metrics.paymentCount, color: data.metrics.paymentCount > 0 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500" },
                      { label: "Leads", value: data.metrics.leadCount, color: data.metrics.leadCount > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500" },
                    ].map(m => (
                      <span key={m.label} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${m.color}`}>
                        {m.value} {m.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Issues breakdown */}
            {data.issues.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">What's hurting your score</h3>
                  <span className="text-xs text-slate-400">{data.issues.reduce((a, i) => a + i.deduction, 0)} points deducted total</span>
                </div>
                {data.issues.map((issue) => {
                  const c = issueColors(issue.severity);
                  return (
                    <div key={issue.type} className={`rounded-3xl border ${c.border} ${c.bg} p-5`}>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.icon}`}>
                          {issueIcon(issue.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-black text-slate-900">{issue.label}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${c.badge}`}>
                              {issue.count} item{issue.count > 1 ? "s" : ""}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                              -{issue.deduction} pts
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {issue.type === "urgent" && "These emails require an immediate response. Every hour delayed risks losing trust or a deal."}
                            {issue.type === "followup" && "These follow-ups passed their scheduled date. Following up now keeps deals and relationships alive."}
                            {issue.type === "waiting" && "You sent these messages 2+ days ago and haven't heard back. A gentle nudge can reopen the conversation."}
                            {issue.type === "payment" && "Payment-related emails need quick attention to avoid friction or delays."}
                            {issue.type === "lead" && "Sales leads detected in your inbox. Prompt responses increase conversion rates significantly."}
                            {issue.type === "unread" && "Unread messages accumulate and can cause you to miss important communications."}
                          </p>
                        </div>
                        <Link
                          href={issue.href}
                          className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${c.btn}`}
                        >
                          {issue.action}
                          <ArrowRightIcon />
                        </Link>
                      </div>
                      {/* Deduction bar */}
                      <div className="mt-4">
                        <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-current opacity-40 transition-all duration-700"
                            style={{ width: `${Math.min((issue.deduction / 30) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon />
                </div>
                <p className="text-lg font-black text-emerald-800">Inbox Zero — No Issues Found!</p>
                <p className="mt-1 text-sm text-emerald-600">All follow-ups, replies, and pending items are handled. Great job.</p>
              </div>
            )}

            {/* How the score works */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">How your score is calculated</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Urgent emails", deduction: "−8 pts each", icon: "🚨", desc: "Every urgent unread email in your inbox" },
                  { label: "Overdue follow-ups", deduction: "−6 pts each", icon: "🔔", desc: "Follow-ups that have passed their scheduled date" },
                  { label: "Waiting for reply", deduction: "−5 pts each", icon: "⏱️", desc: "Threads with no response for 2+ days" },
                  { label: "Payment emails", deduction: "−8 pts each", icon: "💳", desc: "Unresolved billing or invoice messages" },
                  { label: "Sales leads", deduction: "−3 pts each", icon: "⚡", desc: "Leads detected in inbox without a reply" },
                  { label: "Unread messages", deduction: "−2 pts each", icon: "📬", desc: "General unread mail that needs attention" },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-black text-slate-800">{item.label}</p>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600">{item.deduction}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400 text-center">Scores are capped per category so a single area cannot tank your entire score.</p>
            </div>

            {/* Quick nav */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Inbox", href: "/inbox/dashboard", icon: "📥", desc: "Handle urgent emails" },
                { label: "Follow-Ups", href: "/inbox/followups", icon: "🔔", desc: "Clear overdue follow-ups" },
                { label: "Leads", href: "/inbox/leads", icon: "⚡", desc: "Convert sales leads" },
                { label: "Connect", href: "/inbox/connect", icon: "⚙️", desc: "Gmail settings" },
              ].map(nav => (
                <Link
                  key={nav.label}
                  href={nav.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 text-center transition hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm"
                >
                  <p className="text-2xl mb-1">{nav.icon}</p>
                  <p className="text-xs font-black text-slate-800 group-hover:text-indigo-700">{nav.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{nav.desc}</p>
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
