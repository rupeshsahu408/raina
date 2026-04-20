"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ─── Icons ─── */
const I = (d: string, p?: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d={d} /></svg>
);
const ArrowLeft = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>;
const Zap = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const AlertTriangle = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
const Shield = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>;
const TrendingUp = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;
const TrendingDown = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>;
const Copy = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>;
const Users = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const Clock = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const CheckCircle = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const ChevronDown = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6" /></svg>;
const ChevronUp = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m18 15-6-6-6 6" /></svg>;
const Sparkles = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>;
const RefreshCw = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>;

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-violet-600" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

/* ─── Formatters ─── */
function fmt(n: number, cur = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  } catch { return `${cur} ${n.toLocaleString()}`; }
}
function fmtFull(n: number, cur = "INR") {
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n); }
  catch { return `${cur} ${n.toLocaleString()}`; }
}

/* ─── Health Ring ─── */
function HealthRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 56;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - score / 100);
  const colorMap: Record<string, { stroke: string; text: string; bg: string; ring: string }> = {
    green: { stroke: "#22c55e", text: "text-emerald-600", bg: "bg-emerald-50", ring: "#dcfce7" },
    blue: { stroke: "#6366f1", text: "text-indigo-600", bg: "bg-indigo-50", ring: "#e0e7ff" },
    amber: { stroke: "#f59e0b", text: "text-amber-600", bg: "bg-amber-50", ring: "#fef3c7" },
    red: { stroke: "#ef4444", text: "text-rose-600", bg: "bg-rose-50", ring: "#fee2e2" },
  };
  const c = colorMap[color] ?? colorMap.green;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r={r} stroke={c.ring} strokeWidth="12" fill="none" />
          <circle cx="72" cy="72" r={r} stroke={c.stroke} strokeWidth="12" fill="none"
            strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div className="relative z-10 flex flex-col items-center">
          <span className={`text-4xl font-black ${c.text}`}>{score}</span>
          <span className="text-xs font-semibold text-gray-400">/ 100</span>
        </div>
      </div>
      <div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${c.bg} ${c.text}`}>
          {color === "green" && <CheckCircle className="h-3.5 w-3.5" />}
          {color === "amber" && <AlertTriangle className="h-3.5 w-3.5" />}
          {color === "red" && <AlertTriangle className="h-3.5 w-3.5" />}
          {color === "blue" && <CheckCircle className="h-3.5 w-3.5" />}
          {label}
        </span>
      </div>
    </div>
  );
}

/* ─── Section Card ─── */
function Section({ title, icon, badge, badgeColor = "gray", children, defaultOpen = false }: {
  title: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const badgeColors: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    red: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    violet: "bg-violet-100 text-violet-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50 active:bg-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50">{icon}</div>
          <span className="text-sm font-black text-[#1d2226]">{title}</span>
          {badge !== undefined && badge !== 0 && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeColors[badgeColor]}`}>{badge}</span>
          )}
          {(badge === 0 || badge === "0") && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Clear</span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100 px-5 pb-5 pt-4">{children}</div>}
    </div>
  );
}

/* ─── Priority Badge ─── */
function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "critical") return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">Critical</span>;
  if (severity === "warning") return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Warning</span>;
  return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">Info</span>;
}

/* ─── Mini Bar ─── */
function MiniBar({ value, max, color = "violet" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colors: Record<string, string> = { violet: "bg-violet-500", emerald: "bg-emerald-500", amber: "bg-amber-400", rose: "bg-rose-500", blue: "bg-blue-500" };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full transition-all duration-700 ${colors[color] ?? colors.violet}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ─── Types ─── */
interface AnalyzeData {
  generatedAt: string;
  currency: string;
  healthScore: number;
  healthLabel: string;
  healthColor: string;
  priorityActions: Array<{ id: string; type: string; severity: string; title: string; description: string; invoiceId?: string; amount?: number; currency?: string; vendor?: string }>;
  duplicates: Array<{ invoiceId: string; matchId: string; vendor: string; amount: number; currency: string; reason: string; confidence: string }>;
  fraudSignals: Array<{ invoiceId: string; vendor: string; type: string; description: string; severity: string }>;
  cashForecast: { d7: number; d14: number; d30: number; d7Count: number; d14Count: number; d30Count: number; dailyForecast: Array<{ day: string; amount: number }> };
  vendorIntelligence: { topVendors: Array<{ name: string; count: number; total: number; currency: string; lastSeen: string; isNew: boolean }>; newVendors: Array<{ name: string; count: number; total: number; currency: string; lastSeen: string }>; totalVendors: number };
  exceptions: Array<{ invoiceId: string; vendor: string; amount: number; currency: string; reasons: string[]; severity: string }>;
  monthOverMonth: { thisMonth: { count: number; total: number }; lastMonth: { count: number; total: number }; countChange: number | null; spendChange: number | null; avgApprovalDays: number | null };
  summary: { totalActive: number; overdueCount: number; overdueAmount: number; pendingApprovalCount: number; flaggedCount: number; duplicateCount: number; fraudCount: number; exceptionCount: number };
}

/* ─── Component ─── */
export default function AnalyzePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyzeData | null>(null);
  const [error, setError] = useState("");
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingTs, setBriefingTs] = useState<string | null>(null);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (u) { const token = await u.getIdToken(); setUser({ uid: u.uid, token }); }
        else { setUser(null); setLoading(false); }
      });
      return unsub;
    } catch { setUser(null); setLoading(false); return undefined; }
  }, []);

  const loadBriefing = useCallback(async (u: { uid: string; token: string }) => {
    setBriefingLoading(true);
    setBriefing(null);
    try {
      const res = await fetch(`${BACKEND}/payables/analyze/action-plan`, { headers: payablesHeaders(u) });
      if (res.ok) {
        const d = await res.json();
        setBriefing(d.briefing ?? null);
        setBriefingTs(d.generatedAt ?? null);
      }
    } catch { }
    finally { setBriefingLoading(false); }
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BACKEND}/payables/analyze`, { headers: payablesHeaders(user) });
      if (!res.ok) throw new Error("Failed to load analysis");
      setData(await res.json());
    } catch (e: any) { setError(e.message ?? "Error loading analysis"); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (user) loadBriefing(user); }, [user, loadBriefing]);

  if (!user && !loading) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
      <h2 className="text-xl font-black text-[#1d2226]">Sign in to access Analyze</h2>
      <Link href="/login" className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white">Sign in</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/payables/dashboard" className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1d2226]">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-black text-[#1d2226]">AI Analyze</span>
            </div>
          </div>
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </nav>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
            <Sparkles className="h-5 w-5 animate-pulse text-violet-600" />
          </div>
          <div>
            <p className="text-base font-black text-[#1d2226]">Running AI Analysis…</p>
            <p className="mt-1 text-sm text-gray-400">Scanning invoices, detecting patterns, computing health score</p>
          </div>
          <Spinner />
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="mx-4 mt-8 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center">
          <p className="font-semibold text-rose-700">{error}</p>
          <button onClick={load} className="mt-3 rounded-full bg-rose-600 px-6 py-2 text-sm font-bold text-white">Retry</button>
        </div>
      )}

      {/* ── Main Content ── */}
      {!loading && data && (
        <div className="mx-auto max-w-2xl space-y-4 px-4 pb-10 pt-6">

          {/* ── Health Score Hero ── */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-violet-200">AP Health Score</span>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
              <HealthRing score={data.healthScore} label={data.healthLabel} color={data.healthColor} />
              <div className="flex-1 sm:pl-4">
                <p className="text-sm text-violet-100">
                  {data.healthScore >= 85 ? "Your payables are in great shape. Keep approving invoices on time and staying on top of due dates." :
                    data.healthScore >= 70 ? "A few things need attention. Check priority actions below to resolve them quickly." :
                    data.healthScore >= 50 ? "Multiple issues detected. Overdue invoices and flags need your immediate review." :
                    "Critical state. Take action now — overdue invoices and serious flags are affecting your score."}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { label: "Overdue", value: data.summary.overdueCount, color: data.summary.overdueCount > 0 ? "text-rose-300" : "text-emerald-300" },
                    { label: "Flagged", value: data.summary.flaggedCount, color: data.summary.flaggedCount > 0 ? "text-amber-300" : "text-emerald-300" },
                    { label: "Exceptions", value: data.summary.exceptionCount, color: data.summary.exceptionCount > 0 ? "text-amber-300" : "text-emerald-300" },
                    { label: "Duplicates", value: data.summary.duplicateCount, color: data.summary.duplicateCount > 0 ? "text-rose-300" : "text-emerald-300" },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                      <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-violet-200">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 text-right text-[10px] text-violet-300">
              Last analyzed: {new Date(data.generatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* ── Today's Action Plan ── */}
          <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-violet-50 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-black text-[#1d2226]">Today's Action Plan</span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">AI Generated</span>
              </div>
              <button
                onClick={() => user && loadBriefing(user)}
                disabled={briefingLoading}
                className="rounded-full p-1.5 text-gray-400 transition hover:bg-violet-100 hover:text-violet-600 disabled:opacity-40"
                title="Regenerate"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${briefingLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="px-5 py-4">
              {briefingLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-lg bg-violet-50" />
                  <div className="h-4 w-5/6 animate-pulse rounded-lg bg-violet-50" />
                  <div className="h-4 w-4/6 animate-pulse rounded-lg bg-violet-50" />
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-violet-400">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    AI is reading your invoices and writing your plan…
                  </p>
                </div>
              ) : briefing ? (
                <div>
                  <p className="text-[15px] leading-relaxed text-[#1d2226]">{briefing}</p>
                  {briefingTs && (
                    <p className="mt-3 text-right text-[10px] text-gray-300">
                      Generated {new Date(briefingTs).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2 text-center">
                  <p className="text-sm text-gray-400">Could not load action plan. Tap refresh to try again.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Priority Actions ── */}
          <Section title="What Needs Attention Now" icon={<Zap className="h-4 w-4 text-rose-500" />} badge={data.priorityActions.length} badgeColor={data.priorityActions.length > 0 ? "red" : "green"} defaultOpen>
            {data.priorityActions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <p className="font-semibold text-emerald-700">All clear! No urgent actions needed.</p>
                <p className="text-sm text-gray-400">Your invoices are on track.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.priorityActions.map(action => (
                  <div key={action.id} className={`rounded-xl border p-4 ${action.severity === "critical" ? "border-rose-100 bg-rose-50" : action.severity === "warning" ? "border-amber-100 bg-amber-50" : "border-blue-100 bg-blue-50"}`}>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <SeverityBadge severity={action.severity} />
                        <p className={`mt-1.5 text-sm font-bold ${action.severity === "critical" ? "text-rose-800" : action.severity === "warning" ? "text-amber-800" : "text-blue-800"}`}>{action.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{action.description}</p>
                      </div>
                      {action.amount != null && (
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-[#1d2226]">{fmt(action.amount, action.currency)}</p>
                        </div>
                      )}
                    </div>
                    {action.invoiceId && (
                      <Link href={`/payables/invoice/${action.invoiceId}`} className={`mt-2 flex w-full items-center justify-center rounded-xl py-2 text-xs font-bold transition ${action.severity === "critical" ? "bg-rose-600 text-white hover:bg-rose-700" : action.severity === "warning" ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                        View Invoice →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── Cash Forecast ── */}
          <Section title="30-Day Cash Outflow Forecast" icon={<Clock className="h-4 w-4 text-blue-500" />} badgeColor="blue" defaultOpen>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Next 7 Days", amount: data.cashForecast.d7, count: data.cashForecast.d7Count, color: "rose" },
                { label: "Next 14 Days", amount: data.cashForecast.d14, count: data.cashForecast.d14Count, color: "amber" },
                { label: "Next 30 Days", amount: data.cashForecast.d30, count: data.cashForecast.d30Count, color: "blue" },
              ].map(bucket => (
                <div key={bucket.label} className={`rounded-xl border p-3 text-center ${bucket.color === "rose" ? "border-rose-100 bg-rose-50" : bucket.color === "amber" ? "border-amber-100 bg-amber-50" : "border-blue-100 bg-blue-50"}`}>
                  <p className={`text-lg font-black ${bucket.color === "rose" ? "text-rose-700" : bucket.color === "amber" ? "text-amber-700" : "text-blue-700"}`}>{fmt(bucket.amount, data.currency)}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-gray-500">{bucket.count} invoice{bucket.count !== 1 ? "s" : ""}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">{bucket.label}</p>
                </div>
              ))}
            </div>
            {/* Daily sparkline */}
            {data.cashForecast.dailyForecast.length > 0 && (() => {
              const maxAmt = Math.max(...data.cashForecast.dailyForecast.map(d => d.amount), 1);
              return (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-400">Day-by-day breakdown (next 14 days)</p>
                  <div className="flex items-end gap-1 h-16">
                    {data.cashForecast.dailyForecast.map((d, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${fmtFull(d.amount, data.currency)}`}>
                        <div className="w-full rounded-t" style={{ height: `${d.amount > 0 ? Math.max((d.amount / maxAmt) * 52, 4) : 2}px`, background: d.amount > 0 ? "#8b5cf6" : "#e5e7eb" }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between text-[9px] text-gray-300">
                    <span>{data.cashForecast.dailyForecast[0]?.day}</span>
                    <span>{data.cashForecast.dailyForecast[13]?.day}</span>
                  </div>
                </div>
              );
            })()}
            {data.cashForecast.d30 === 0 && (
              <p className="mt-2 text-center text-sm text-gray-400">No upcoming due dates in the next 30 days.</p>
            )}
          </Section>

          {/* ── Exception Report ── */}
          <Section title="Exception Report" icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} badge={data.exceptions.length} badgeColor={data.exceptions.length > 0 ? "amber" : "green"}>
            {data.exceptions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <p className="font-semibold text-emerald-700">No exceptions found.</p>
                <p className="text-sm text-gray-400">All invoices look clean and complete.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.exceptions.map(ex => (
                  <div key={ex.invoiceId} className={`rounded-xl border p-4 ${ex.severity === "critical" ? "border-rose-100 bg-rose-50" : "border-amber-100 bg-amber-50"}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={ex.severity} />
                        <p className="text-sm font-bold text-[#1d2226]">{ex.vendor}</p>
                      </div>
                      {ex.amount > 0 && <p className="text-sm font-black text-gray-700">{fmt(ex.amount, ex.currency)}</p>}
                    </div>
                    <ul className="mb-3 space-y-1">
                      {ex.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                          {r}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/payables/invoice/${ex.invoiceId}`} className="flex w-full items-center justify-center rounded-xl bg-[#1d2226] py-2 text-xs font-bold text-white transition hover:bg-gray-800">
                      Review Invoice →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── Fraud & Anomaly Signals ── */}
          <Section title="Fraud & Anomaly Signals" icon={<Shield className="h-4 w-4 text-rose-500" />} badge={data.fraudSignals.length} badgeColor={data.fraudSignals.length > 0 ? "red" : "green"}>
            {data.fraudSignals.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <Shield className="h-5 w-5 text-emerald-400" />
                <p className="font-semibold text-emerald-700">No fraud signals detected.</p>
                <p className="text-sm text-gray-400">All vendor patterns look consistent.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700 font-medium border border-rose-100">
                  AI detected changes in vendor behaviour. Verify directly with the vendor before making any payment.
                </div>
                {data.fraudSignals.map((sig, i) => (
                  <div key={i} className="rounded-xl border border-rose-100 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-bold text-[#1d2226]">{sig.vendor}</p>
                      <SeverityBadge severity={sig.severity} />
                    </div>
                    <p className="mb-3 text-xs text-gray-600">{sig.description}</p>
                    <Link href={`/payables/invoice/${sig.invoiceId}`} className="flex w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100">
                      Investigate →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── Duplicate Detection ── */}
          <Section title="Duplicate Invoice Scanner" icon={<Copy className="h-4 w-4 text-violet-500" />} badge={data.duplicates.length} badgeColor={data.duplicates.length > 0 ? "violet" : "green"}>
            {data.duplicates.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <p className="font-semibold text-emerald-700">No duplicate invoices found.</p>
                <p className="text-sm text-gray-400">AI scanned all invoices for duplicate patterns.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-violet-50 px-4 py-3 text-xs text-violet-700 font-medium border border-violet-100">
                  Possible double payments detected. Review both invoices before paying.
                </div>
                {data.duplicates.map((dup, i) => (
                  <div key={i} className="rounded-xl border border-violet-100 bg-white p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-bold text-[#1d2226]">{dup.vendor}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${dup.confidence === "High" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{dup.confidence} match</span>
                    </div>
                    <p className="mb-1 text-lg font-black text-violet-700">{fmtFull(dup.amount, dup.currency)}</p>
                    <p className="mb-3 text-xs text-gray-500">{dup.reason}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/payables/invoice/${dup.invoiceId}`} className="flex items-center justify-center rounded-xl bg-violet-600 py-2 text-xs font-bold text-white transition hover:bg-violet-700">Invoice A</Link>
                      <Link href={`/payables/invoice/${dup.matchId}`} className="flex items-center justify-center rounded-xl border border-violet-200 bg-violet-50 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100">Invoice B</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── Vendor Intelligence ── */}
          <Section title="Vendor Intelligence" icon={<Users className="h-4 w-4 text-blue-500" />} badge={data.vendorIntelligence.totalVendors} badgeColor="blue">
            <div className="space-y-4">
              {/* Top vendors */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Top Vendors by Spend</p>
                {data.vendorIntelligence.topVendors.length === 0 ? (
                  <p className="text-sm text-gray-400">No vendor data yet.</p>
                ) : (() => {
                  const maxTotal = Math.max(...data.vendorIntelligence.topVendors.map(v => v.total), 1);
                  return (
                    <div className="space-y-3">
                      {data.vendorIntelligence.topVendors.map((v, i) => (
                        <div key={v.name}>
                          <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-black text-white">{i + 1}</div>
                              <span className="text-sm font-semibold text-[#1d2226] truncate max-w-[140px]">{v.name}</span>
                              {v.isNew && <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">NEW</span>}
                            </div>
                            <span className="text-sm font-black text-[#1d2226]">{fmt(v.total, v.currency)}</span>
                          </div>
                          <MiniBar value={v.total} max={maxTotal} color="violet" />
                          <p className="mt-0.5 text-right text-[10px] text-gray-400">{v.count} invoice{v.count !== 1 ? "s" : ""}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              {/* New vendors */}
              {data.vendorIntelligence.newVendors.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">New Vendors (Last 30 Days)</p>
                  <div className="space-y-2">
                    {data.vendorIntelligence.newVendors.map(v => (
                      <div key={v.name} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-900">{v.name}</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">{fmt(v.total, v.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ── Month-over-Month ── */}
          <Section title="Month-over-Month Summary" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              {/* This month */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">This Month</p>
                <p className="text-2xl font-black text-[#1d2226]">{fmt(data.monthOverMonth.thisMonth.total, data.currency)}</p>
                <p className="mt-1 text-xs text-gray-500">{data.monthOverMonth.thisMonth.count} invoice{data.monthOverMonth.thisMonth.count !== 1 ? "s" : ""}</p>
              </div>
              {/* Last month */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Last Month</p>
                <p className="text-2xl font-black text-[#1d2226]">{fmt(data.monthOverMonth.lastMonth.total, data.currency)}</p>
                <p className="mt-1 text-xs text-gray-500">{data.monthOverMonth.lastMonth.count} invoice{data.monthOverMonth.lastMonth.count !== 1 ? "s" : ""}</p>
              </div>
            </div>
            {/* Changes */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {data.monthOverMonth.spendChange != null && (
                <div className={`rounded-xl border p-3 text-center ${data.monthOverMonth.spendChange > 0 ? "border-rose-100 bg-rose-50" : "border-emerald-100 bg-emerald-50"}`}>
                  <div className="flex justify-center mb-1">
                    {data.monthOverMonth.spendChange > 0 ? <TrendingUp className="h-4 w-4 text-rose-500" /> : <TrendingDown className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <p className={`text-sm font-black ${data.monthOverMonth.spendChange > 0 ? "text-rose-700" : "text-emerald-700"}`}>{data.monthOverMonth.spendChange > 0 ? "+" : ""}{data.monthOverMonth.spendChange}%</p>
                  <p className="text-[10px] text-gray-400">Spend</p>
                </div>
              )}
              {data.monthOverMonth.countChange != null && (
                <div className={`rounded-xl border p-3 text-center ${data.monthOverMonth.countChange > 0 ? "border-blue-100 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex justify-center mb-1">
                    {data.monthOverMonth.countChange > 0 ? <TrendingUp className="h-4 w-4 text-blue-500" /> : <TrendingDown className="h-4 w-4 text-gray-400" />}
                  </div>
                  <p className={`text-sm font-black ${data.monthOverMonth.countChange > 0 ? "text-blue-700" : "text-gray-600"}`}>{data.monthOverMonth.countChange > 0 ? "+" : ""}{data.monthOverMonth.countChange}%</p>
                  <p className="text-[10px] text-gray-400">Volume</p>
                </div>
              )}
              {data.monthOverMonth.avgApprovalDays != null && (
                <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 text-center">
                  <div className="flex justify-center mb-1">
                    <Clock className="h-4 w-4 text-violet-500" />
                  </div>
                  <p className="text-sm font-black text-violet-700">{data.monthOverMonth.avgApprovalDays}d</p>
                  <p className="text-[10px] text-gray-400">Avg Approval</p>
                </div>
              )}
            </div>
            {data.monthOverMonth.spendChange == null && data.monthOverMonth.countChange == null && (
              <p className="mt-3 text-center text-sm text-gray-400">Not enough history yet for comparison. Keep using Plyndrox and month-over-month trends will appear here.</p>
            )}
          </Section>

          {/* ── Footer CTA ── */}
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-violet-500" />
            <p className="text-sm font-black text-[#1d2226]">Analysis powered by Plyndrox AI</p>
            <p className="mt-1 text-xs text-gray-500">Data is analyzed in real-time from your invoices. Refresh anytime for the latest insights.</p>
            <Link href="/payables/dashboard" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5">
              Back to Dashboard
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
