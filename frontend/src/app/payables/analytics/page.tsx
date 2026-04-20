"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import PayablesShell from "@/components/payables/PayablesShell";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ── Icons ── */
const ArrowLeft = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
  </svg>
);
const TrendingUp = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const TrendingDown = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />
  </svg>
);
const BarChart2 = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" />
  </svg>
);
const PieChartIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);
const Download = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const RefreshCw = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
  </svg>
);
const Users = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const Layers = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);
const Zap = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/* ── Formatters ── */
function fmtCurrency(n: number, cur = "INR") {
  try {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  } catch { return `₹${n}`; }
}
function fmtFull(n: number, cur = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  } catch { return `₹${n}`; }
}
function fmtMonth(m: string) {
  if (!m) return m;
  const [y, mo] = m.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(mo) - 1]} ${y?.slice(2)}`;
}

/* ── Color Palettes ── */
const VENDOR_COLORS = [
  "#7c3aed", "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4", "#84cc16",
  "#f97316", "#6366f1", "#14b8a6", "#a855f7", "#eab308",
];
const STATUS_COLORS: Record<string, string> = {
  paid: "#10b981",
  approved: "#6366f1",
  pending_approval: "#f59e0b",
  extracted: "#0ea5e9",
  rejected: "#ef4444",
  processing: "#94a3b8",
};
const SOURCE_COLORS: Record<string, string> = {
  upload: "#7c3aed",
  gmail: "#4285f4",
  supplier_link: "#10b981",
};
const SOURCE_LABELS: Record<string, string> = {
  upload: "Manual Upload",
  gmail: "Gmail",
  supplier_link: "Supplier Portal",
};

/* ── Skeleton ── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

/* ── Custom Tooltip ── */
function ChartTooltip({ active, payload, label, currency = "INR" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {fmtFull(p.value, currency)}
        </p>
      ))}
    </div>
  );
}

/* ── Vendor Tooltip ── */
function VendorTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
      <p className="mb-1 max-w-[200px] truncate text-xs font-bold text-gray-700">{label}</p>
      <p className="text-sm font-semibold text-violet-600">{fmtFull(payload[0]?.value)}</p>
      {payload[1] && <p className="text-xs text-gray-400">{payload[1]?.value} invoices</p>}
    </div>
  );
}

/* ── Pie Custom Label ── */
function PieLabel({ cx, cy, midAngle, outerRadius, percent, name }: any) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = outerRadius + 28;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" className="text-[10px]" fill="#64748b" fontSize={10}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */
export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState("all");
  const [activeVendorTab, setActiveVendorTab] = useState<"chart" | "table">("chart");
  const [refreshing, setRefreshing] = useState(false);

  /* ── Auth ── */
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/payables"); return; }
      const token = await u.getIdToken();
      setUser({ uid: u.uid, token });
    });
    return () => unsub();
  }, [router]);

  /* ── Fetch ── */
  const fetchData = useCallback(async (p = period, showRefresh = false) => {
    if (!user) return;
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const headers = payablesHeaders(user);
      const url = `${BACKEND}/payables/spend-analytics?period=${p}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, period]);

  useEffect(() => { if (user) fetchData(period); }, [user, period]);

  /* ── Period change ── */
  function changePeriod(p: string) {
    setPeriod(p);
  }

  /* ── Export CSV ── */
  function exportCSV() {
    if (!data?.byVendor) return;
    const rows = [
      ["Supplier", "Total Spend", "Invoice Count", "Avg Invoice", "Paid Count"],
      ...data.byVendor.map((v: any) => [
        v.vendor ?? "Unknown",
        v.amount?.toFixed(2),
        v.count,
        v.avgAmount?.toFixed(2),
        v.paidCount,
      ]),
    ];
    const csv = rows.map((r) => r.map((c: any) => `"${c ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spend-analytics-${period}.csv`;
    a.click();
  }

  /* ── Derived stats ── */
  const topVendor = data?.byVendor?.[0];
  const totalSpend = data?.summary?.total ?? 0;
  const invoiceCount = data?.summary?.count ?? 0;
  const avgInvoice = data?.summary?.avgAmount ?? 0;
  const momGrowth: number | null = data?.momGrowth ?? null;
  const avgMonthly = data?.byMonth?.length
    ? data.byMonth.reduce((s: number, m: any) => s + (m.amount ?? 0), 0) / data.byMonth.length
    : 0;

  /* ── Status data ── */
  const statusData = (data?.byStatus ?? []).map((s: any) => ({
    name: s._id?.replace(/_/g, " ") ?? "Unknown",
    key: s._id,
    amount: s.amount ?? 0,
    count: s.count ?? 0,
    color: STATUS_COLORS[s._id] ?? "#94a3b8",
  }));
  const statusTotal = statusData.reduce((s: number, d: any) => s + d.amount, 0);

  /* ── Source data ── */
  const sourceData = (data?.bySource ?? []).map((s: any) => ({
    name: SOURCE_LABELS[s._id] ?? s._id ?? "Unknown",
    amount: s.amount ?? 0,
    count: s.count ?? 0,
    color: SOURCE_COLORS[s._id] ?? "#94a3b8",
  }));

  /* ── Line items (category proxy) ── */
  const categoryData = (data?.topLineItems ?? []).map((li: any, i: number) => ({
    name: li._id ?? "Other",
    amount: li.amount ?? 0,
    count: li.count ?? 0,
    color: VENDOR_COLORS[i % VENDOR_COLORS.length],
  }));

  /* ── Monthly chart data ── */
  const monthlyData = (data?.byMonth ?? []).map((m: any) => ({
    month: fmtMonth(m._id ?? m.month ?? ""),
    amount: m.amount ?? 0,
    count: m.count ?? 0,
  }));

  /* ── Vendor chart data ── */
  const vendorData = (data?.byVendor ?? []).slice(0, 10).map((v: any) => ({
    name: v.vendor ?? "Unknown",
    amount: v.amount ?? 0,
    count: v.count ?? 0,
  }));

  const periods = [
    { value: "30d", label: "Last 30 days" },
    { value: "3m", label: "3 months" },
    { value: "6m", label: "6 months" },
    { value: "1y", label: "1 year" },
    { value: "all", label: "All time" },
  ];

  return (
    <PayablesShell
      pageTitle="Spend Analytics"
      pageSubtitle="Supplier-wise, category-wise, and monthly spend"
      headerActions={
        <>
          <button
            onClick={() => fetchData(period, true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition hover:border-gray-300 hover:text-[#1d2226] disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportCSV}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm transition hover:bg-violet-100 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </>
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">Spend Analytics</h1>
            <p className="mt-0.5 text-sm text-gray-400">Supplier-wise, category-wise, and monthly spend — all in one place.</p>
          </div>
          {/* Period selector */}
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => changePeriod(p.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${period === p.value ? "bg-violet-600 text-white shadow-sm" : "text-gray-500 hover:text-[#1d2226]"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ── */}
        {loading ? (
          <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              label="Total Spend"
              value={fmtCurrency(totalSpend)}
              sub={`${invoiceCount} invoice${invoiceCount !== 1 ? "s" : ""}`}
              icon={<Zap className="h-4 w-4" />}
              iconBg="bg-violet-100 text-violet-600"
            />
            <KpiCard
              label="Avg Monthly"
              value={fmtCurrency(avgMonthly)}
              sub={`over ${data?.byMonth?.length ?? 0} months`}
              icon={<BarChart2 className="h-4 w-4" />}
              iconBg="bg-indigo-100 text-indigo-600"
            />
            <KpiCard
              label="Top Supplier"
              value={topVendor?.vendor ? (topVendor.vendor.length > 16 ? topVendor.vendor.slice(0, 15) + "…" : topVendor.vendor) : "—"}
              sub={topVendor ? fmtCurrency(topVendor.amount) : "no data"}
              icon={<Users className="h-4 w-4" />}
              iconBg="bg-emerald-100 text-emerald-600"
            />
            <KpiCard
              label="MoM Growth"
              value={momGrowth !== null ? `${momGrowth >= 0 ? "+" : ""}${momGrowth.toFixed(1)}%` : "—"}
              sub="vs previous month"
              icon={momGrowth !== null && momGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              iconBg={momGrowth !== null && momGrowth >= 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}
              valueColor={momGrowth !== null && momGrowth > 0 ? "text-rose-600" : momGrowth !== null && momGrowth < 0 ? "text-emerald-600" : "text-gray-400"}
            />
          </div>
        )}

        {/* ── Monthly Trend ── */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#1d2226]">Monthly Spend Trend</h2>
              <p className="text-xs text-gray-400">How much you're spending each month</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-64" />
          ) : monthlyData.length === 0 ? (
            <EmptyChart message="No monthly data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => fmtCurrency(v)} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="amount" name="Spend" stroke="#7c3aed" strokeWidth={2.5} fill="url(#spendGrad)" dot={{ r: 4, fill: "#7c3aed", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* ── Vendor + Category row ── */}
        <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Supplier breakdown */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#1d2226]">Supplier Spend</h2>
                <p className="text-xs text-gray-400">Top suppliers by total invoice value</p>
              </div>
              <div className="flex gap-1 rounded-lg border border-gray-100 bg-gray-50 p-0.5">
                <button
                  onClick={() => setActiveVendorTab("chart")}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${activeVendorTab === "chart" ? "bg-white text-violet-700 shadow-sm" : "text-gray-400"}`}
                >
                  Chart
                </button>
                <button
                  onClick={() => setActiveVendorTab("table")}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${activeVendorTab === "table" ? "bg-white text-violet-700 shadow-sm" : "text-gray-400"}`}
                >
                  Table
                </button>
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-72" />
            ) : vendorData.length === 0 ? (
              <EmptyChart message="No supplier data yet" />
            ) : activeVendorTab === "chart" ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={vendorData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => fmtCurrency(v)} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={100}
                    tickFormatter={(v) => v.length > 14 ? v.slice(0, 13) + "…" : v}
                  />
                  <Tooltip content={<VendorTooltip />} />
                  <Bar dataKey="amount" name="Spend" radius={[0, 6, 6, 0]}>
                    {vendorData.map((_: any, i: number) => (
                      <Cell key={i} fill={VENDOR_COLORS[i % VENDOR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left font-semibold uppercase tracking-wider text-gray-400">#</th>
                      <th className="pb-2 text-left font-semibold uppercase tracking-wider text-gray-400">Supplier</th>
                      <th className="pb-2 text-right font-semibold uppercase tracking-wider text-gray-400">Total Spend</th>
                      <th className="pb-2 text-right font-semibold uppercase tracking-wider text-gray-400">Invoices</th>
                      <th className="pb-2 text-right font-semibold uppercase tracking-wider text-gray-400">Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.byVendor ?? []).map((v: any, i: number) => (
                      <tr key={i} className="border-b border-gray-50 transition hover:bg-violet-50/30">
                        <td className="py-2.5 pr-2 font-bold text-gray-300">#{i + 1}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: VENDOR_COLORS[i % VENDOR_COLORS.length] }} />
                            <span className="font-semibold text-[#1d2226]">{v.vendor ?? "Unknown"}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-bold text-violet-700">{fmtCurrency(v.amount)}</td>
                        <td className="py-2.5 text-right text-gray-500">{v.count}</td>
                        <td className="py-2.5 text-right text-gray-400">{fmtCurrency(v.avgAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Category / Line items */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#1d2226]">Spend Categories</h2>
                <p className="text-xs text-gray-400">Top line items by amount</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-64" />
            ) : categoryData.length === 0 ? (
              <EmptyChart message="No line item data yet" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="amount"
                      labelLine={false}
                      label={PieLabel}
                    >
                      {categoryData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmtFull(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1.5">
                  {categoryData.slice(0, 6).map((d: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
                      <span className="flex-1 truncate text-gray-600">{d.name}</span>
                      <span className="font-bold text-[#1d2226]">{fmtCurrency(d.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* ── Status + Source row ── */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {/* Status breakdown */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#1d2226]">Invoice Status Breakdown</h2>
                <p className="text-xs text-gray-400">Spend by approval stage</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <PieChartIcon className="h-4 w-4" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-48" />
            ) : statusData.length === 0 ? (
              <EmptyChart message="No status data" />
            ) : (
              <div className="space-y-3">
                {statusData.map((s: any) => {
                  const pct = statusTotal > 0 ? (s.amount / statusTotal) * 100 : 0;
                  return (
                    <div key={s.key}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-semibold capitalize text-gray-600">
                          <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                          {s.name}
                        </span>
                        <span className="font-bold text-[#1d2226]">{fmtCurrency(s.amount)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 1)}%`, background: s.color }} />
                      </div>
                      <p className="mt-0.5 text-right text-[10px] text-gray-400">{s.count} invoice{s.count !== 1 ? "s" : ""} · {pct.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Source breakdown */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#1d2226]">Invoice Sources</h2>
                <p className="text-xs text-gray-400">Where your invoices come from</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-48" />
            ) : sourceData.length === 0 ? (
              <EmptyChart message="No source data" />
            ) : (
              <div className="flex flex-col gap-4">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="amount" labelLine={false}>
                      {sourceData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmtFull(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2">
                  {sourceData.map((s: any) => (
                    <div key={s.name} className="rounded-xl border border-gray-100 p-3 text-center">
                      <div className="mx-auto mb-1 h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                      <p className="text-xs font-bold text-[#1d2226]">{s.count}</p>
                      <p className="text-[10px] text-gray-400">{s.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── Vendor comparison: bar chart (count vs amount) ── */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#1d2226]">Top Suppliers — Monthly Breakdown</h2>
              <p className="text-xs text-gray-400">Month-by-month spend trend</p>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-56" />
          ) : monthlyData.length === 0 ? (
            <EmptyChart message="No data for selected period" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => fmtCurrency(v)} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="amount" name="Spend" fill="#7c3aed" radius={[5, 5, 0, 0]}>
                  {monthlyData.map((_: any, i: number) => (
                    <Cell key={i} fill={i === monthlyData.length - 1 ? "#7c3aed" : "#c4b5fd"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Footer */}
        <p className="text-center text-xs text-gray-300">
          Analytics are computed in real-time from your invoice data · Plyndrox Spend Intelligence
        </p>
      </div>
    </PayablesShell>
  );
}

/* ── KPI Card ── */
function KpiCard({
  label, value, sub, icon, iconBg, valueColor = "text-[#1d2226]",
}: {
  label: string; value: string; sub: string; icon: React.ReactNode; iconBg: string; valueColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <p className={`mt-3 text-2xl font-black leading-tight ${valueColor}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  );
}

/* ── Empty Chart ── */
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-gray-50">
      <BarChart2 className="h-8 w-8 text-gray-200" />
      <p className="text-sm text-gray-400">{message}</p>
      <p className="text-xs text-gray-300">Upload invoices to start seeing analytics</p>
    </div>
  );
}
