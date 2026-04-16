"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface AnalyticsSummary {
  totalEmails: number;
  sentCount: number;
  unreadCount: number;
  starredCount: number;
  aiRescuedCount: number;
  avgPriorityScore: number;
  readRate: number;
  leadCount: number;
}

interface VolumeTrendItem {
  date: string;
  received: number;
  sent: number;
}

interface ActivityHourItem {
  hour: number;
  count: number;
}

interface ActivityDowItem {
  day: string;
  count: number;
}

interface SenderItem {
  name: string;
  email: string;
  count: number;
  domain: string;
  intents: Record<string, number>;
}

interface DomainItem {
  domain: string;
  count: number;
}

interface AnalyticsData {
  period: { days: number; from: string; to: string };
  summary: AnalyticsSummary;
  intentBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  riskBreakdown: { High: number; Medium: number; Low: number };
  gmailCategories: Record<string, number>;
  volumeTrend: VolumeTrendItem[];
  activityByHour: ActivityHourItem[];
  activityByDow: ActivityDowItem[];
  topSenders: SenderItem[];
  topDomains: DomainItem[];
  insights: string[];
  generatedAt: string;
}

function BackIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
}
function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return <svg className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>;
}
function BarChartIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>;
}
function UsersIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function ZapIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
}
function TrendUpIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
}
function GlobeIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
}
function ClockIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function SparkleIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>;
}
function InboxIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
}

const INTENT_COLORS: Record<string, string> = {
  Lead: "#8b5cf6",
  Support: "#f59e0b",
  Payment: "#10b981",
  Meeting: "#3b82f6",
  Spam: "#ef4444",
  FYI: "#6b7280",
};

const INTENT_BG: Record<string, string> = {
  Lead: "bg-violet-100 text-violet-700",
  Support: "bg-amber-100 text-amber-700",
  Payment: "bg-emerald-100 text-emerald-700",
  Meeting: "bg-blue-100 text-blue-700",
  Spam: "bg-red-100 text-red-700",
  FYI: "bg-gray-100 text-gray-600",
};

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>;

  const size = 160;
  const radius = 60;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const slices = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const pct = d.value / total;
      const offset = circumference * (1 - cumulative);
      const dash = circumference * pct;
      cumulative += pct;
      return { ...d, pct, offset, dash };
    });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={24}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset + circumference}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          ))}
          <circle cx={cx} cy={cy} r={48} fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-800">{total}</span>
          <span className="text-[10px] text-gray-400 font-medium">emails</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-600 font-medium">{s.label}</span>
            <span className="text-xs text-gray-400">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data, days }: { data: VolumeTrendItem[]; days: number }) {
  const containerRef = useRef<SVGSVGElement>(null);
  const W = 600;
  const H = 140;
  const pad = { top: 10, right: 16, bottom: 28, left: 32 };

  if (!data.length) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>;

  const maxVal = Math.max(...data.map((d) => Math.max(d.received, d.sent)), 1);
  const toX = (i: number) => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const toY = (v: number) => pad.top + (1 - v / maxVal) * (H - pad.top - pad.bottom);

  const receivedPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.received)}`).join(" ");
  const sentPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.sent)}`).join(" ");
  const receivedFill = `${receivedPath} L${toX(data.length - 1)},${toY(0)} L${toX(0)},${toY(0)} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(p * maxVal));
  const labelStep = Math.max(1, Math.floor(data.length / 6));

  return (
    <svg ref={containerRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map((v, i) => (
        <g key={i}>
          <line x1={pad.left} y1={toY(v)} x2={W - pad.right} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1" />
          <text x={pad.left - 4} y={toY(v) + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
        </g>
      ))}
      <path d={receivedFill} fill="url(#receivedGrad)" />
      <path d={receivedPath} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={sentPath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
      {data.map((d, i) => {
        if (i % labelStep !== 0 && i !== data.length - 1) return null;
        const label = d.date.slice(5);
        return (
          <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" fontSize="8.5" fill="#94a3b8">{label}</text>
        );
      })}
      <text x={W - pad.right} y={12} textAnchor="end" fontSize="9" fill="#8b5cf6" fontWeight="600">Received</text>
      <text x={W - pad.right} y={24} textAnchor="end" fontSize="9" fill="#10b981" fontWeight="600">Sent</text>
    </svg>
  );
}

function HourHeatmap({ data }: { data: ActivityHourItem[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const fmt = (h: number) => {
    const ampm = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}${ampm}`;
  };
  return (
    <div className="flex gap-1 items-end flex-wrap">
      {data.map((d) => {
        const intensity = d.count / maxCount;
        const opacity = 0.1 + intensity * 0.9;
        return (
          <div key={d.hour} className="flex flex-col items-center gap-1 group relative">
            <div
              className="w-5 rounded-sm transition-all duration-200 cursor-pointer"
              style={{ height: `${Math.max(6, intensity * 48)}px`, background: `rgba(139,92,246,${opacity})` }}
            />
            {d.hour % 3 === 0 && (
              <span className="text-[8px] text-gray-400 font-medium">{fmt(d.hour)}</span>
            )}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {fmt(d.hour)}: {d.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DowBars({ data }: { data: ActivityDowItem[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex gap-2 items-end justify-between h-24">
      {data.map((d) => {
        const pct = d.count / maxCount;
        return (
          <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1 group relative">
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {d.day}: {d.count}
            </div>
            <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${Math.max(4, pct * 72)}px`,
                  background: pct > 0.7 ? "linear-gradient(180deg,#8b5cf6,#6d28d9)" : pct > 0.4 ? "linear-gradient(180deg,#a78bfa,#8b5cf6)" : "#e9e4fd",
                }}
              />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function RiskBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{value} <span className="text-gray-400 text-xs">({Math.round(pct)}%)</span></span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);
  const hasFetched = useRef(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) router.replace("/inbox");
    });
    return unsub;
  }, [router]);

  const fetchAnalytics = useCallback(async (days: number) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API}/inbox/analyze?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to load analytics" }));
        throw new Error(err.error || "Failed to load analytics");
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authReady && user && !hasFetched.current) {
      hasFetched.current = true;
      fetchAnalytics(period);
    }
  }, [authReady, user, fetchAnalytics, period]);

  const handlePeriodChange = (days: number) => {
    setPeriod(days);
    fetchAnalytics(days);
  };

  const intentChartData = data
    ? Object.entries(data.intentBreakdown)
        .filter(([, v]) => v > 0)
        .map(([label, value]) => ({ label, value, color: INTENT_COLORS[label] ?? "#6b7280" }))
    : [];

  const priorityOrder = ["Urgent", "Risk Detected", "High-Value Lead", "Payment", "Support Issue", "Needs Reply", "Low Priority"];
  const priorityColors: Record<string, string> = {
    "Urgent": "#ef4444",
    "Risk Detected": "#f97316",
    "High-Value Lead": "#8b5cf6",
    "Payment": "#10b981",
    "Support Issue": "#f59e0b",
    "Needs Reply": "#3b82f6",
    "Low Priority": "#9ca3af",
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/inbox/dashboard"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-xl hover:bg-gray-100"
            >
              <BackIcon />
              Back
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#5c4ff6,#7c3aed)", boxShadow: "0 4px 12px rgba(92,79,246,0.35)" }}>
                  <BarChartIcon />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900 leading-none">Analyze</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Gmail Intelligence Dashboard</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
              {[7, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => handlePeriodChange(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    period === d
                      ? "text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={period === d ? { background: "linear-gradient(135deg,#5c4ff6,#7c3aed)" } : undefined}
                >
                  {d}d
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchAnalytics(period)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshIcon spinning={loading} />
              {loading ? "Analyzing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <SparkleIcon />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">Analyzing your Gmail…</p>
              <p className="text-sm text-gray-400 mt-1">Scanning emails, detecting patterns & generating insights</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="font-bold text-red-700 mb-1">Could not load analytics</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button onClick={() => fetchAnalytics(period)} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">
              Try Again
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Summary metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <MetricCard
                icon={<InboxIcon />}
                label="Emails Received"
                value={data.summary.totalEmails}
                sub={`Last ${period} days`}
                color="bg-violet-100 text-violet-600"
              />
              <MetricCard
                icon={<TrendUpIcon />}
                label="Emails Sent"
                value={data.summary.sentCount}
                sub="Outbound"
                color="bg-emerald-100 text-emerald-600"
              />
              <MetricCard
                icon={<ZapIcon />}
                label="Unread"
                value={data.summary.unreadCount}
                sub={`${100 - data.summary.readRate}% of inbox`}
                color="bg-amber-100 text-amber-600"
              />
              <MetricCard
                icon={<SparkleIcon />}
                label="Leads Detected"
                value={data.summary.leadCount}
                sub="High-value opportunities"
                color="bg-purple-100 text-purple-600"
              />
              <MetricCard
                icon={<ZapIcon />}
                label="AI Rescued"
                value={data.summary.aiRescuedCount}
                sub="Saved from promotions"
                color="bg-blue-100 text-blue-600"
              />
              <MetricCard
                icon={<BarChartIcon />}
                label="Avg Priority"
                value={`${data.summary.avgPriorityScore}/100`}
                sub="Priority score"
                color="bg-rose-100 text-rose-600"
              />
            </div>

            {/* AI Insights */}
            {data.insights.length > 0 && (
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <SparkleIcon />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-sm">AI Insights</h2>
                    <p className="text-violet-200 text-xs">Smart observations from your inbox</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {data.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white/10 rounded-xl px-3.5 py-2.5">
                      <span className="text-sm leading-relaxed text-white/90">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Volume Trend + Intent Breakdown */}
            <div className="grid lg:grid-cols-5 gap-4 mb-6">
              <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-black text-gray-800">Email Volume Trend</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Received vs sent over the last {period} days</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-500 rounded inline-block" />Received</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" />Sent</span>
                  </div>
                </div>
                <div className="h-40">
                  <LineChart data={data.volumeTrend} days={period} />
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-black text-gray-800 mb-1">Intent Breakdown</h2>
                <p className="text-xs text-gray-400 mb-4">What type of emails you receive</p>
                <DonutChart data={intentChartData} />
              </div>
            </div>

            {/* Priority Distribution + Activity by Day */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-black text-gray-800 mb-1">Priority Distribution</h2>
                <p className="text-xs text-gray-400 mb-5">How your emails are categorized by urgency</p>
                <div className="space-y-3">
                  {priorityOrder.map((cat) => {
                    const count = data.priorityBreakdown[cat] ?? 0;
                    if (count === 0) return null;
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-600 w-32 shrink-0">{cat}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${data.summary.totalEmails > 0 ? (count / data.summary.totalEmails) * 100 : 0}%`, background: priorityColors[cat] ?? "#6b7280" }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <ClockIcon />
                  <h2 className="font-black text-gray-800">Activity by Day of Week</h2>
                </div>
                <p className="text-xs text-gray-400 mb-5">When you receive the most email</p>
                <DowBars data={data.activityByDow} />
              </div>
            </div>

            {/* Hourly Heatmap */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-1">
                <ClockIcon />
                <h2 className="font-black text-gray-800">Hourly Activity Heatmap</h2>
              </div>
              <p className="text-xs text-gray-400 mb-5">Which hours of the day see the most incoming email</p>
              <HourHeatmap data={data.activityByHour} />
            </div>

            {/* Top Senders + Top Domains */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <UsersIcon />
                  <h2 className="font-black text-gray-800">Top Senders</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">People who email you the most</p>
                {data.topSenders.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">No sender data available</p>
                ) : (
                  <div className="space-y-2">
                    {data.topSenders.map((s, i) => {
                      const topIntent = Object.entries(s.intents).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "FYI";
                      const maxCount = data.topSenders[0]?.count || 1;
                      const pct = (s.count / maxCount) * 100;
                      return (
                        <div key={i} className="flex items-center gap-3 group">
                          <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: INTENT_COLORS[topIntent] ?? "#6b7280" }}>
                            {(s.name || s.email)[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-gray-800 truncate">{s.name || s.email.split("@")[0]}</p>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${INTENT_BG[topIntent] ?? "bg-gray-100 text-gray-600"}`}>{topIntent}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: INTENT_COLORS[topIntent] ?? "#6b7280" }} />
                            </div>
                          </div>
                          <span className="text-sm font-black text-gray-700 shrink-0 w-6 text-right">{s.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <GlobeIcon />
                  <h2 className="font-black text-gray-800">Top Domains</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">Where your email originates</p>
                {data.topDomains.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">No domain data</p>
                ) : (
                  <div className="space-y-3">
                    {data.topDomains.map((d, i) => {
                      const maxCount = data.topDomains[0]?.count || 1;
                      const pct = (d.count / maxCount) * 100;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-gray-700 truncate">{d.domain}</span>
                            <span className="text-gray-500 shrink-0 ml-2">{d.count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#5c4ff6,#7c3aed)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Risk Breakdown + Gmail Categories */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-black text-gray-800 mb-1">Risk Level Breakdown</h2>
                <p className="text-xs text-gray-400 mb-5">How risky your inbox is right now</p>
                <div className="space-y-4">
                  <RiskBar label="High Risk" value={data.riskBreakdown.High} total={data.summary.totalEmails} color="#ef4444" />
                  <RiskBar label="Medium Risk" value={data.riskBreakdown.Medium} total={data.summary.totalEmails} color="#f59e0b" />
                  <RiskBar label="Low Risk" value={data.riskBreakdown.Low} total={data.summary.totalEmails} color="#10b981" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-black text-gray-800 mb-1">Gmail Categories</h2>
                <p className="text-xs text-gray-400 mb-5">How Gmail categorizes your emails</p>
                <div className="space-y-4">
                  {Object.entries(data.gmailCategories).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          cat === "primary" ? "bg-violet-500" :
                          cat === "promotions" ? "bg-amber-500" :
                          cat === "social" ? "bg-blue-500" :
                          cat === "updates" ? "bg-emerald-500" : "bg-gray-400"
                        }`} />
                        <span className="text-sm font-medium text-gray-700 capitalize">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{
                            width: `${data.summary.totalEmails > 0 ? (count / data.summary.totalEmails) * 100 : 0}%`,
                            background: cat === "primary" ? "#8b5cf6" : cat === "promotions" ? "#f59e0b" : cat === "social" ? "#3b82f6" : "#10b981"
                          }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center py-4">
              <p className="text-xs text-gray-400">
                Analysis based on up to 200 emails · Generated {data ? new Date(data.generatedAt).toLocaleString() : ""}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
