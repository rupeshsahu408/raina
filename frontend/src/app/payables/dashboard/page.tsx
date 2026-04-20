"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

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

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  processing: { label: "Processing", color: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  extracted: { label: "Ready for Review", color: "bg-blue-50 text-blue-700", dot: "bg-blue-400" },
  pending_approval: { label: "Pending Approval", color: "bg-violet-50 text-violet-700", dot: "bg-violet-400" },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400" },
  rejected: { label: "Rejected", color: "bg-rose-50 text-rose-700", dot: "bg-rose-400" },
};

function fmt(n?: number, currency = "USD") {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);
}

function fmtDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export default function PayablesDashboard() {
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [fetchingGmail, setFetchingGmail] = useState(false);
  const [gmailMsg, setGmailMsg] = useState("");
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = getAuth();
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
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user.token}`, "x-uid": user.uid };
      const [invRes, statsRes, gmailRes] = await Promise.all([
        fetch(`${BACKEND}/payables/invoices?status=${activeFilter}&limit=50`, { headers }),
        fetch(`${BACKEND}/payables/invoices/stats`, { headers }),
        fetch(`${BACKEND}/payables/gmail/status`, { headers }),
      ]);
      if (invRes.ok) { const d = await invRes.json(); setInvoices(d.invoices ?? []); }
      if (statsRes.ok) { const d = await statsRes.json(); setStats(d); }
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
    setGmailMsg("");
    try {
      const res = await fetch(`${BACKEND}/payables/fetch-gmail`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setGmailMsg(data.fetched > 0 ? `Found ${data.fetched} new invoice email${data.fetched !== 1 ? "s" : ""}. AI is extracting data…` : (data.message ?? "No new invoice emails found."));
      setTimeout(fetchData, 3000);
    } catch (err: unknown) {
      setGmailMsg(err instanceof Error ? err.message : "Failed to fetch from Gmail");
    } finally {
      setFetchingGmail(false);
    }
  };

  if (!user && !loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <AlertIcon className="h-12 w-12 text-gray-300" />
        <h2 className="text-xl font-black text-[#1d2226]">Sign in to access your payables</h2>
        <p className="text-sm text-gray-500">Your invoice dashboard is only accessible when signed in.</p>
        <Link href="/login" className="mt-2 rounded-full bg-[#1d2226] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2d3238]">
          Sign in
        </Link>
      </div>
    );
  }

  const statCards = stats ? [
    { label: "Total invoices", value: stats.total.toString(), sub: "all time", color: "text-[#1d2226]" },
    { label: "Pending approval", value: stats.pendingCount.toString(), sub: fmt(stats.pendingAmount), color: "text-violet-600" },
    { label: "Approved", value: stats.approvedCount.toString(), sub: fmt(stats.approvedAmount), color: "text-emerald-600" },
    { label: "Processing", value: stats.processingCount.toString(), sub: "being read by AI", color: "text-amber-600" },
  ] : [];

  const filters = [
    { key: "all", label: "All" },
    { key: "extracted", label: "Ready" },
    { key: "pending_approval", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "processing", label: "Processing" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/payables" className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1d2226]">
              <ArrowLeftIcon className="h-4 w-4" /> Payables AI
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Dashboard</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchFromGmail}
              disabled={fetchingGmail}
              title={gmailConnected === false ? "Gmail not connected" : "Fetch from Gmail"}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:px-4"
            >
              <MailIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {fetchingGmail ? "Fetching…" : "Fetch Gmail"}
              </span>
            </button>
            <Link
              href="/payables/upload"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 sm:px-4"
            >
              <UploadIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Upload</span>
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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">Invoice Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">All your invoices, organized and ready to review.</p>
        </div>

        {/* Gmail message */}
        {gmailMsg && (
          <div className="mb-6 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
            {gmailMsg}
          </div>
        )}

        {/* Gmail connect prompt */}
        {gmailConnected === false && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Gmail not connected</p>
              <p className="mt-0.5 text-sm text-amber-700">
                Connect your Gmail to automatically detect and import invoice emails.{" "}
                <Link href="/inbox/connect" className="font-semibold underline hover:no-underline">
                  Connect Gmail →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
                <p className="mt-1 text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
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

        {/* Invoice list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <MailIcon className="mx-auto mb-4 h-10 w-10 text-gray-200" />
            <p className="text-base font-bold text-gray-400">No invoices yet</p>
            <p className="mt-2 text-sm text-gray-400">
              {activeFilter === "all"
                ? "Upload your first invoice or connect Gmail to get started."
                : `No invoices with status "${activeFilter}".`}
            </p>
            {activeFilter === "all" && (
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/payables/upload" className="rounded-full bg-[#1d2226] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d3238]">
                  Upload invoice
                </Link>
                <button onClick={fetchFromGmail} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300">
                  Fetch from Gmail
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => {
              const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.processing;
              const overdue = inv.status !== "approved" && inv.status !== "rejected" && isOverdue(inv.dueDate);
              return (
                <Link
                  key={inv._id}
                  href={`/payables/invoice/${inv._id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md sm:p-5"
                >
                  {/* Source badge */}
                  <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${inv.source === "gmail" ? "bg-violet-50" : "bg-indigo-50"}`}>
                    {inv.source === "gmail" ? (
                      <MailIcon className="h-5 w-5 text-violet-500" />
                    ) : (
                      <UploadIcon className="h-5 w-5 text-indigo-500" />
                    )}
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
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                      {inv.invoiceDate && <span>Issued {fmtDate(inv.invoiceDate)}</span>}
                      {inv.dueDate && (
                        <span className={overdue ? "font-semibold text-rose-500" : ""}>
                          Due {fmtDate(inv.dueDate)} {overdue ? "· Overdue" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-base font-black text-[#1d2226]">
                      {fmt(inv.total, inv.currency)}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
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
    </div>
  );
}
