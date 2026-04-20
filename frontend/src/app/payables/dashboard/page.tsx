"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ─── Icons ─── */
function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  );
}
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

/* ─── Types ─── */
interface Invoice {
  _id: string;
  source: "upload" | "gmail";
  status: string;
  vendor?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  total?: number;
  createdAt: string;
  originalFileName?: string;
}

interface Stats {
  total: number;
  totalAmount: number;
  pendingCount: number;
  approvedCount: number;
  processingCount: number;
  pendingAmount: number;
  approvedAmount: number;
}

/* ─── Helpers ─── */
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  processing: { label: "Processing", color: "text-amber-700", dot: "bg-amber-400", bg: "bg-amber-50 border-amber-100" },
  extracted: { label: "Ready for Review", color: "text-blue-700", dot: "bg-blue-500", bg: "bg-blue-50 border-blue-100" },
  pending_approval: { label: "Pending Approval", color: "text-violet-700", dot: "bg-violet-500", bg: "bg-violet-50 border-violet-100" },
  approved: { label: "Approved", color: "text-emerald-700", dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-100" },
  rejected: { label: "Rejected", color: "text-rose-700", dot: "bg-rose-500", bg: "bg-rose-50 border-rose-100" },
};

function fmt(n?: number, currency = "USD") {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

function fmtDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

function daysUntil(dueDate: string) {
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  return diff;
}

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

/* ─── Spinner ─── */
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

/* ─── Component ─── */
export default function PayablesDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [fetchingGmail, setFetchingGmail] = useState(false);
  const [gmailMsg, setGmailMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (u) {
          const token = await u.getIdToken();
          setUser({ uid: u.uid, token });
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      return unsub;
    } catch {
      setUser(null);
      setLoading(false);
      return undefined;
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${user.token}`, "x-uid": user.uid };
      const [invRes, allInvRes, statsRes, gmailRes] = await Promise.all([
        fetch(`${BACKEND}/payables/invoices?status=${activeFilter}&limit=50`, { headers }),
        fetch(`${BACKEND}/payables/invoices?status=all&limit=100`, { headers }),
        fetch(`${BACKEND}/payables/invoices/stats`, { headers }),
        fetch(`${BACKEND}/payables/gmail/status`, { headers }),
      ]);
      if (invRes.ok) { const d = await invRes.json(); setInvoices(d.invoices ?? []); }
      if (allInvRes.ok) { const d = await allInvRes.json(); setAllInvoices(d.invoices ?? []); }
      if (statsRes.ok) setStats(await statsRes.json());
      if (gmailRes.ok) { const d = await gmailRes.json(); setGmailConnected(d.connected); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, activeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchFromGmail = async () => {
    if (!user) return;
    setFetchingGmail(true);
    setGmailMsg(null);
    try {
      const res = await fetch(`${BACKEND}/payables/fetch-gmail`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setGmailMsg({
        text: data.fetched > 0
          ? `Found ${data.fetched} new invoice email${data.fetched !== 1 ? "s" : ""}. AI is extracting data…`
          : (data.message ?? "No new invoice emails found."),
        type: data.fetched > 0 ? "success" : "info",
      });
      setTimeout(fetchData, 3000);
    } catch (err: unknown) {
      setGmailMsg({ text: err instanceof Error ? err.message : "Failed to fetch from Gmail", type: "error" });
    } finally {
      setFetchingGmail(false);
    }
  };

  /* Upcoming due dates — next 5 non-approved invoices with a due date */
  const upcomingDue = allInvoices
    .filter((inv) => inv.dueDate && !["approved", "rejected"].includes(inv.status))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const overdueInvoices = allInvoices.filter(
    (inv) => inv.dueDate && isOverdue(inv.dueDate) && !["approved", "rejected"].includes(inv.status)
  );

  /* Not signed in */
  if (!user && !loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100">
          <AlertIcon className="h-8 w-8 text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#1d2226]">Sign in to access your payables</h2>
          <p className="mt-2 text-sm text-gray-500">Your invoice dashboard is only accessible when signed in.</p>
        </div>
        <Link href="/login" className="mt-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          Sign in
        </Link>
      </div>
    );
  }

  const filters = [
    { key: "all", label: "All invoices" },
    { key: "extracted", label: "Ready to review" },
    { key: "pending_approval", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "processing", label: "Processing" },
  ];

  const companyData = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("payables_company") ?? "{}")
    : {};

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/payables" className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1d2226]">
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Payables AI</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchFromGmail}
              disabled={fetchingGmail}
              title={gmailConnected === false ? "Gmail not connected" : "Fetch invoice emails from Gmail"}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:px-4"
            >
              {fetchingGmail ? <Spinner /> : <MailIcon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{fetchingGmail ? "Fetching…" : "Fetch Gmail"}</span>
            </button>
            <Link
              href="/payables/upload"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 sm:px-4"
            >
              <UploadIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Upload Invoice</span>
            </Link>
            <button
              onClick={fetchData}
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition hover:border-gray-300 hover:text-[#1d2226]"
              title="Refresh"
            >
              <RefreshIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">
              {companyData.companyName ? `${companyData.companyName}'s Invoices` : "Invoice Dashboard"}
            </h1>
            <p className="mt-1 text-sm text-gray-400">All your invoices, organized and ready to review.</p>
          </div>
          {!loading && stats && stats.total === 0 && (
            <Link
              href="/payables/onboarding"
              className="text-xs font-semibold text-violet-600 underline hover:no-underline"
            >
              Setup guide →
            </Link>
          )}
        </div>

        {/* Gmail banner */}
        {gmailMsg && (
          <div className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            gmailMsg.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
            gmailMsg.type === "error" ? "border-rose-100 bg-rose-50 text-rose-700" :
            "border-violet-100 bg-violet-50 text-violet-700"
          }`}>
            <ZapIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{gmailMsg.text}</span>
            <button onClick={() => setGmailMsg(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Gmail not connected prompt */}
        {gmailConnected === false && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Gmail not connected</p>
              <p className="mt-0.5 text-xs text-amber-600">
                Connect Gmail to automatically detect and import invoice emails.{" "}
                <Link href="/inbox/connect" className="font-bold underline hover:no-underline">Connect now →</Link>
              </p>
            </div>
            <button className="text-xs text-amber-400 hover:text-amber-600" onClick={() => setGmailConnected(null)}>✕</button>
          </div>
        )}

        {/* Overdue alert */}
        {!loading && overdueInvoices.length > 0 && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-bold text-rose-800">
                {overdueInvoices.length} invoice{overdueInvoices.length !== 1 ? "s" : ""} overdue
              </p>
              <p className="mt-0.5 text-xs text-rose-600">
                {overdueInvoices.map((i) => i.vendor || "Unknown").join(", ")} — please review and action immediately.
              </p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        {!loading && stats && (
          <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Total invoices",
                value: stats.total,
                sub: "all time",
                icon: <ZapIcon className="h-4 w-4" />,
                iconBg: "bg-violet-100 text-violet-600",
                valueColor: "text-[#1d2226]",
              },
              {
                label: "Pending approval",
                value: stats.pendingCount,
                sub: fmt(stats.pendingAmount),
                icon: <ClockIcon className="h-4 w-4" />,
                iconBg: "bg-amber-100 text-amber-600",
                valueColor: "text-amber-600",
              },
              {
                label: "Approved",
                value: stats.approvedCount,
                sub: fmt(stats.approvedAmount),
                icon: <CheckCircleIcon className="h-4 w-4" />,
                iconBg: "bg-emerald-100 text-emerald-600",
                valueColor: "text-emerald-600",
              },
              {
                label: "Being processed",
                value: stats.processingCount,
                sub: "AI extracting",
                icon: <TrendingUpIcon className="h-4 w-4" />,
                iconBg: "bg-blue-100 text-blue-600",
                valueColor: "text-blue-600",
              },
            ].map(({ label, value, sub, icon, iconBg, valueColor }) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
                    {icon}
                  </div>
                </div>
                <p className={`mt-3 text-3xl font-black ${valueColor}`}>{value}</p>
                <p className="mt-1 text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton for stats */}
        {loading && (
          <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        )}

        <div className="grid gap-7 xl:grid-cols-[1fr_320px]">
          {/* Main: invoice list */}
          <div>
            {/* Filter tabs */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                    activeFilter === key
                      ? "bg-[#1d2226] text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-[#1d2226]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                  <MailIcon className="h-7 w-7 text-gray-200" />
                </div>
                <p className="text-base font-bold text-gray-400">
                  {activeFilter === "all" ? "No invoices yet" : `No ${activeFilter.replace("_", " ")} invoices`}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  {activeFilter === "all"
                    ? "Upload your first invoice or connect Gmail to get started."
                    : `Switch to "All invoices" to see everything.`}
                </p>
                {activeFilter === "all" && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/payables/upload"
                      className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                    >
                      Upload invoice
                    </Link>
                    <button
                      onClick={fetchFromGmail}
                      disabled={fetchingGmail}
                      className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 disabled:opacity-50"
                    >
                      {fetchingGmail ? "Fetching…" : "Fetch from Gmail"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {invoices.map((inv) => {
                  const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.processing;
                  const overdue = inv.status !== "approved" && inv.status !== "rejected" && isOverdue(inv.dueDate);
                  return (
                    <Link
                      key={inv._id}
                      href={`/payables/invoice/${inv._id}`}
                      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
                    >
                      {/* Source icon */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${inv.source === "gmail" ? "bg-violet-50" : "bg-indigo-50"}`}>
                        {inv.source === "gmail"
                          ? <MailIcon className="h-5 w-5 text-violet-500" />
                          : <UploadIcon className="h-5 w-5 text-indigo-500" />}
                      </div>

                      {/* Main info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-[#1d2226]">
                            {inv.vendor ?? inv.originalFileName ?? "Unknown vendor"}
                          </p>
                          {inv.invoiceNumber && (
                            <span className="text-xs text-gray-400">#{inv.invoiceNumber}</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                          {inv.invoiceDate && <span>Issued {fmtDate(inv.invoiceDate)}</span>}
                          {inv.dueDate && (
                            <span className={overdue ? "font-bold text-rose-500" : ""}>
                              Due {fmtDate(inv.dueDate)}{overdue ? " · Overdue" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: amount + status */}
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-base font-black text-[#1d2226]">
                          {fmt(inv.total, inv.currency)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>

                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-gray-500" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: upcoming due dates + quick actions */}
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-gray-400">Quick actions</h3>
              <div className="space-y-2.5">
                <Link
                  href="/payables/upload"
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50"
                >
                  <UploadIcon className="h-4 w-4 text-violet-500" />
                  Upload invoice
                  <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-300" />
                </Link>
                <button
                  onClick={fetchFromGmail}
                  disabled={fetchingGmail}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50 disabled:opacity-50"
                >
                  <MailIcon className="h-4 w-4 text-indigo-500" />
                  {fetchingGmail ? "Fetching from Gmail…" : "Fetch Gmail invoices"}
                  <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-300" />
                </button>
                {!gmailConnected && (
                  <Link
                    href="/inbox/connect"
                    className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    <AlertIcon className="h-4 w-4 text-amber-500" />
                    Connect Gmail
                    <ChevronRightIcon className="ml-auto h-4 w-4 text-amber-300" />
                  </Link>
                )}
              </div>
            </div>

            {/* Upcoming due dates */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-400">
                <ClockIcon className="h-3.5 w-3.5" />
                Upcoming due dates
              </h3>
              {loading ? (
                <div className="space-y-2.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : upcomingDue.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircleIcon className="mx-auto mb-2 h-8 w-8 text-emerald-300" />
                  <p className="text-xs text-gray-400">No upcoming due dates.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingDue.map((inv) => {
                    const days = daysUntil(inv.dueDate!);
                    const over = days < 0;
                    const urgent = days >= 0 && days <= 3;
                    return (
                      <Link
                        key={inv._id}
                        href={`/payables/invoice/${inv._id}`}
                        className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 transition hover:border-violet-200 hover:bg-violet-50"
                      >
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                          over ? "bg-rose-100 text-rose-600"
                          : urgent ? "bg-amber-100 text-amber-600"
                          : "bg-gray-100 text-gray-500"
                        }`}>
                          {over ? "!" : days}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[#1d2226]">
                            {inv.vendor ?? "Unknown vendor"}
                          </p>
                          <p className={`text-xs ${over ? "font-semibold text-rose-500" : urgent ? "text-amber-500" : "text-gray-400"}`}>
                            {over ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `Due in ${days}d · ${fmtDate(inv.dueDate)}`}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-black text-[#1d2226]">
                          {fmt(inv.total, inv.currency)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary blurb */}
            {!loading && stats && stats.total > 0 && (
              <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
                <p className="text-xs font-black uppercase tracking-wider text-violet-500">Total liability</p>
                <p className="mt-2 text-2xl font-black text-[#1d2226]">{fmt(stats.pendingAmount + stats.approvedAmount)}</p>
                <p className="mt-1 text-xs text-violet-500">{stats.pendingCount + stats.approvedCount} invoices pending payment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
