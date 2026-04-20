"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

type UserState = { uid: string; token: string };
type Invoice = { _id: string; vendor?: string; invoiceNumber?: string; dueDate?: string; total?: number; currency?: string; status?: string; urgency?: string; daysUntilDue?: number | null; discountAlert?: { message: string; estimatedSavings: number } | null };
type QueueData = { queue: Invoice[]; summary: { totalQueued: number; approvedReady: number; approvedAmount: number; discountOpportunities: number; estimatedSavings: number } };
type ForecastBucket = { count: number; amount: number; invoices: Invoice[] };
type ForecastData = { buckets: Record<string, ForecastBucket> };
type AnalyticsData = { byVendor: Array<{ vendor?: string; amount: number; count: number }>; byMonth: Array<{ _id: string; amount: number; count: number }>; byStatus: Array<{ _id: string; amount: number; count: number }> };
type Provider = { provider: "quickbooks" | "xero"; status: string; externalCompanyName?: string; lastSyncAt?: string; lastSyncCount?: number };

function money(value?: number, currency?: string) {
  const amount = value ?? 0;
  const code = currency?.trim().toUpperCase();
  if (!code) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString()}`;
  }
}

function dateLabel(value?: string) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status?: string) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "pending_approval") return "bg-amber-50 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

export default function PayablesPaymentsPage() {
  const [user, setUser] = useState<UserState | null>(null);
  const [queue, setQueue] = useState<QueueData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) setUser({ uid: firebaseUser.uid, token: await firebaseUser.getIdToken() });
        else setLoading(false);
      });
    } catch {
      setLoading(false);
      return undefined;
    }
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers = payablesHeaders(user);
      const [queueRes, forecastRes, analyticsRes, accountingRes] = await Promise.all([
        fetch(`${BACKEND}/payables/payment-queue`, { headers }),
        fetch(`${BACKEND}/payables/cash-forecast`, { headers }),
        fetch(`${BACKEND}/payables/spend-analytics`, { headers }),
        fetch(`${BACKEND}/payables/accounting/status`, { headers }),
      ]);
      if (queueRes.ok) setQueue(await queueRes.json());
      if (forecastRes.ok) setForecast(await forecastRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (accountingRes.ok) setProviders((await accountingRes.json()).providers ?? []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const forecastRows = useMemo(() => {
    const labels: Record<string, string> = { overdue: "Overdue", thisWeek: "Next 7 days", thisMonth: "Next 30 days", nextMonth: "31-60 days", later: "Later" };
    return Object.entries(forecast?.buckets ?? {}).map(([key, value]) => ({ name: labels[key] ?? key, amount: value.amount, count: value.count }));
  }, [forecast]);

  const markPaid = async (invoice: Invoice) => {
    if (!user) return;
    await fetch(`${BACKEND}/payables/invoices/${invoice._id}/paid`, { method: "POST", headers: payablesHeaders(user, true), body: JSON.stringify({ paymentAmount: invoice.total }) });
    await load();
  };

  const connectProvider = async (provider: Provider["provider"]) => {
    if (!user) return;
    setSyncing(provider);
    try {
      await fetch(`${BACKEND}/payables/accounting/connect`, { method: "POST", headers: payablesHeaders(user, true), body: JSON.stringify({ provider, externalCompanyName: provider === "quickbooks" ? "QuickBooks" : "Xero" }) });
      await load();
    } finally {
      setSyncing(null);
    }
  };

  const syncProvider = async (provider: Provider["provider"]) => {
    if (!user) return;
    setSyncing(provider);
    try {
      await fetch(`${BACKEND}/payables/accounting/sync`, { method: "POST", headers: payablesHeaders(user, true), body: JSON.stringify({ provider }) });
      await load();
    } finally {
      setSyncing(null);
    }
  };

  const downloadCsv = async () => {
    if (!user) return;
    const res = await fetch(`${BACKEND}/payables/reports/summary.csv`, { headers: payablesHeaders(user) });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "payables-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!queue || !forecast) return;
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Payables AI Payment Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Approved ready: ${queue.summary.approvedReady} | Amount: ${money(queue.summary.approvedAmount)}`, 14, 28);
    autoTable(doc, { startY: 36, head: [["Vendor", "Invoice", "Status", "Due", "Amount"]], body: queue.queue.map((invoice) => [invoice.vendor ?? "Vendor", invoice.invoiceNumber ?? "—", invoice.status ?? "—", dateLabel(invoice.dueDate), money(invoice.total, invoice.currency)]) });
    doc.save("payables-payment-report.pdf");
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/payables/dashboard" className="text-sm text-gray-400 hover:text-[#1d2226]">Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Payments & cash intelligence</span>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadCsv} className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600">CSV</button>
            <button onClick={downloadPdf} className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white">PDF</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-[#1d2226]">Payment Queue & Cash Intelligence</h1>
          <p className="mt-2 text-sm text-gray-500">Prioritize approved payments, forecast cash outflows, find savings, and prepare accounting syncs.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["Queued", queue?.summary.totalQueued ?? 0],
            ["Ready to pay", queue?.summary.approvedReady ?? 0],
            ["Approved value", money(queue?.summary.approvedAmount)],
            ["Savings found", money(queue?.summary.estimatedSavings)],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="text-xs font-black uppercase tracking-wider text-gray-400">{label}</div>
              <div className="mt-2 text-2xl font-black text-[#1d2226]">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.9fr]">
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-black text-[#1d2226]">Prioritized payment queue</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {(queue?.queue ?? []).length === 0 ? <div className="p-6 text-sm text-gray-500">No invoices are waiting for payment.</div> : queue?.queue.map((invoice) => (
                <div key={invoice._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-[#1d2226]">{invoice.vendor ?? "Vendor"}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusClass(invoice.status)}`}>{invoice.status?.replace(/_/g, " ")}</span>
                      {invoice.urgency && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700">{invoice.urgency.replace(/_/g, " ")}</span>}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">#{invoice.invoiceNumber ?? "—"} · Due {dateLabel(invoice.dueDate)} · {money(invoice.total, invoice.currency)}</div>
                    {invoice.discountAlert && <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{invoice.discountAlert.message}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/payables/invoice/${invoice._id}`} className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600">Review</Link>
                    {invoice.status === "approved" && <button onClick={() => markPaid(invoice)} className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white">Mark paid</button>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-black text-[#1d2226]">Cash forecast</h2>
            <div className="mt-4 min-h-64">
              <ResponsiveContainer width="100%" height={256} minWidth={260}>
                <BarChart data={forecastRows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => money(typeof value === "number" ? value : Number(value ?? 0))} />
                  <Bar dataKey="amount" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {forecastRows.map((row) => <div key={row.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm"><span className="font-semibold text-gray-600">{row.name}</span><span className="font-black text-[#1d2226]">{money(row.amount)} · {row.count}</span></div>)}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-black text-[#1d2226]">Vendor spend analytics</h2>
            <div className="mt-4 space-y-3">
              {(analytics?.byVendor ?? []).slice(0, 8).map((vendor) => (
                <div key={vendor.vendor ?? "Unknown"}>
                  <div className="flex justify-between text-sm"><span className="font-semibold text-gray-600">{vendor.vendor ?? "Unknown vendor"}</span><span className="font-black text-[#1d2226]">{money(vendor.amount)}</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${Math.min(100, (vendor.amount / Math.max(...(analytics?.byVendor ?? [{ amount: 1 }]).map((v) => v.amount || 1))) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-black text-[#1d2226]">Accounting sync</h2>
            <p className="mt-1 text-sm text-gray-500">Prepare approved and paid invoices for QuickBooks or Xero export, with sync history stored in Payables AI.</p>
            <div className="mt-5 space-y-3">
              {providers.map((provider) => (
                <div key={provider.provider} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black capitalize text-[#1d2226]">{provider.provider}</div>
                      <div className="text-xs font-semibold text-gray-500">{provider.status.replace(/_/g, " ")}{provider.lastSyncAt ? ` · last sync ${new Date(provider.lastSyncAt).toLocaleString()}` : ""}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => connectProvider(provider.provider)} disabled={syncing === provider.provider} className="rounded-full border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 disabled:opacity-50">Connect</button>
                      <button onClick={() => syncProvider(provider.provider)} disabled={syncing === provider.provider} className="rounded-full bg-[#1d2226] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Sync</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
