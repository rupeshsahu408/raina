"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";
const AUTO_SCAN_INTERVAL_HOURS = 2;

/* ─── Icons ─── */
const MailIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const RefreshIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);
const SearchIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const ZapIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const TrashIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const CheckCircleIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const PaperclipIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const ArrowLeftIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
  </svg>
);
const ExternalLinkIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const AlertIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const ChevronDownIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const BuildingIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01" />
  </svg>
);
const LayersIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
);
const ListIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const XIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TrendingUpIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const ClockIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const FlagIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

/* ─── Types ─── */
interface GmailEmail {
  _id: string;
  gmailMessageId: string;
  subject?: string;
  from?: string;
  fromEmail?: string;
  snippet?: string;
  receivedAt?: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  status: "pending" | "processing" | "completed" | "failed";
  invoiceId?: string;
  processedAt?: string;
  errorMessage?: string;
}

interface Stats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
}

interface SupplierInvoice {
  _id: string;
  invoiceNumber?: string;
  vendor?: string;
  vendorEmail?: string;
  total?: number;
  currency?: string;
  invoiceDate?: string;
  dueDate?: string;
  status?: string;
  createdAt?: string;
  flags?: Array<{ type: string; message: string }>;
}

interface SupplierHistoryData {
  invoices: SupplierInvoice[];
  stats: {
    totalInvoices: number;
    totalSpend: number;
    avgInvoice: number;
    statusCounts: Record<string, number>;
    currencies: string[];
    latestDate?: string;
    latestInvoiceNumber?: string;
  };
}

interface SupplierGroup {
  key: string;
  name: string;
  email: string;
  emails: GmailEmail[];
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  latestDate?: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

/* ─── Helpers ─── */
function formatDate(d?: string) {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarColor(name?: string) {
  const colors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-red-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-cyan-500", "bg-orange-500"];
  if (!name) return colors[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function groupBySupplier(emails: GmailEmail[]): SupplierGroup[] {
  const map = new Map<string, GmailEmail[]>();
  for (const e of emails) {
    const key = (e.fromEmail || e.from || "unknown").toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  const groups: SupplierGroup[] = [];
  for (const [key, list] of map.entries()) {
    const sorted = [...list].sort((a, b) => new Date(b.receivedAt || 0).getTime() - new Date(a.receivedAt || 0).getTime());
    groups.push({
      key,
      name: sorted[0].from || sorted[0].fromEmail || "Unknown Sender",
      email: sorted[0].fromEmail || key,
      emails: sorted,
      pendingCount: list.filter((e) => e.status === "pending").length,
      processingCount: list.filter((e) => e.status === "processing").length,
      completedCount: list.filter((e) => e.status === "completed").length,
      failedCount: list.filter((e) => e.status === "failed").length,
      latestDate: sorted[0].receivedAt,
    });
  }
  return groups.sort((a, b) => {
    if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
    return new Date(b.latestDate || 0).getTime() - new Date(a.latestDate || 0).getTime();
  });
}

/* ─── Sub-components ─── */
function Spinner({ size = "h-4 w-4", color = "text-violet-600" }: { size?: string; color?: string }) {
  return (
    <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string; dot: string }> = {
    pending:    { label: "Pending",    cls: "bg-amber-50 text-amber-700 border border-amber-200",    dot: "bg-amber-400" },
    processing: { label: "Processing", cls: "bg-violet-50 text-violet-700 border border-violet-200",  dot: "bg-violet-500 animate-pulse" },
    completed:  { label: "Completed",  cls: "bg-green-50 text-green-700 border border-green-200",    dot: "bg-green-500" },
    failed:     { label: "Failed",     cls: "bg-red-50 text-red-700 border border-red-200",          dot: "bg-red-500" },
  };
  const c = cfg[status] ?? { label: status, cls: "bg-gray-50 text-gray-600 border border-gray-200", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function EmailCard({
  email, isProcessing, isDeleting, onFetch, onDelete,
}: {
  email: GmailEmail;
  isProcessing: boolean;
  isDeleting: boolean;
  onFetch: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border bg-white p-3.5 transition-all ${
      email.status === "processing" ? "border-violet-200 bg-violet-50/20"
      : email.status === "completed" ? "border-green-100"
      : email.status === "failed" ? "border-red-100"
      : "border-gray-100"
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={email.status} />
          {email.hasAttachment && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <PaperclipIcon className="h-3 w-3" />
              {email.attachmentName || "Attachment"}
            </span>
          )}
          <span className="ml-auto text-xs text-gray-400 shrink-0">{formatDate(email.receivedAt)}</span>
        </div>
        <p className="mt-1 text-sm font-medium text-gray-800 truncate">{email.subject || "(No subject)"}</p>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{email.snippet || "No preview"}</p>

        {email.status === "processing" && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-violet-700">
            <Spinner size="h-3 w-3" />
            AI extracting invoice data...
          </div>
        )}
        {email.status === "completed" && email.invoiceId && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Extracted
            </span>
            <Link href={`/payables/invoice/${email.invoiceId}`} className="flex items-center gap-0.5 text-xs text-violet-600 hover:text-violet-700 font-medium underline underline-offset-2">
              View Invoice <ExternalLinkIcon className="h-3 w-3" />
            </Link>
          </div>
        )}
        {email.status === "failed" && email.errorMessage && (
          <p className="mt-1 text-xs text-red-600">Error: {email.errorMessage}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {(email.status === "pending" || email.status === "failed") && (
          <button
            onClick={onFetch}
            disabled={isProcessing || isDeleting}
            className="flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? <Spinner size="h-3 w-3" color="text-white" /> : <ZapIcon className="h-3.5 w-3.5" />}
            Fetch
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={isDeleting || email.status === "processing"}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition-colors"
        >
          {isDeleting ? <Spinner size="h-3.5 w-3.5" /> : <TrashIcon className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

/* ─── Supplier History Panel (slide-over) ─── */
function SupplierHistoryPanel({
  group,
  user,
  onClose,
}: {
  group: SupplierGroup;
  user: { uid: string; token: string };
  onClose: () => void;
}) {
  const [data, setData] = useState<SupplierHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const color = avatarColor(group.name);
  const init = initials(group.name);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("name", group.name);
    if (group.email) params.set("email", group.email);
    fetch(`${BACKEND}/payables/supplier-history?${params}`, { headers: payablesHeaders(user) })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, [group.key]);

  const statusColors: Record<string, string> = {
    paid:             "bg-green-50 text-green-700 border-green-200",
    approved:         "bg-blue-50 text-blue-700 border-blue-200",
    pending_approval: "bg-amber-50 text-amber-700 border-amber-200",
    rejected:         "bg-red-50 text-red-700 border-red-200",
    processing:       "bg-violet-50 text-violet-700 border-violet-200",
    extracted:        "bg-cyan-50 text-cyan-700 border-cyan-200",
  };
  const statusLabel: Record<string, string> = {
    paid: "Paid", approved: "Approved", pending_approval: "Pending", rejected: "Rejected",
    processing: "Processing", extracted: "Extracted",
  };

  const fmt = (n: number, cur: string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: cur || "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:max-w-md">
        {/* Panel header */}
        <div className={`flex items-center gap-4 border-b border-gray-100 px-5 py-4`}>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color} text-white text-sm font-bold shadow`}>
            {init}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 text-base truncate">{group.name}</h2>
            <p className="text-xs text-gray-400 truncate">{group.email}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Spinner size="h-6 w-6" />
              <p className="text-sm text-gray-400">Loading invoice history...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : !data || data.stats.totalInvoices === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <BuildingIcon className="h-7 w-7 text-gray-300" />
              </div>
              <p className="font-medium text-gray-600">No processed invoices yet</p>
              <p className="text-sm text-gray-400 max-w-xs">
                Once you fetch and process emails from this supplier, their invoices will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Invoices</div>
                  <div className="text-xl font-bold text-gray-900">{data.stats.totalInvoices}</div>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-3 text-center">
                  <div className="text-xs text-violet-500 mb-1">Total Spend</div>
                  <div className="text-base font-bold text-violet-700 leading-tight">
                    {fmt(data.stats.totalSpend, data.stats.currencies[0] || "INR")}
                  </div>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-center">
                  <div className="text-xs text-blue-400 mb-1">Avg Invoice</div>
                  <div className="text-base font-bold text-blue-700 leading-tight">
                    {fmt(data.stats.avgInvoice, data.stats.currencies[0] || "INR")}
                  </div>
                </div>
              </div>

              {/* Status breakdown pills */}
              {Object.keys(data.stats.statusCounts).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Status Breakdown</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(data.stats.statusCounts).map(([st, cnt]) => (
                      <span key={st} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[st] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {statusLabel[st] ?? st} · {cnt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoice timeline */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Invoice History</p>
                <div className="space-y-2">
                  {data.invoices.map((inv) => {
                    const stCls = statusColors[inv.status ?? ""] ?? "bg-gray-50 text-gray-600 border-gray-200";
                    const stLabel = statusLabel[inv.status ?? ""] ?? inv.status ?? "Unknown";
                    const currency = inv.currency || data.stats.currencies[0] || "INR";
                    return (
                      <div key={inv._id} className="rounded-xl border border-gray-100 bg-white p-3 hover:border-violet-200 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {inv.invoiceNumber && (
                                <span className="text-xs font-bold text-gray-800">#{inv.invoiceNumber}</span>
                              )}
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${stCls}`}>
                                {stLabel}
                              </span>
                              {inv.flags && inv.flags.length > 0 && (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                  <FlagIcon className="h-3 w-3" />
                                  {inv.flags.length} flag{inv.flags.length !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                              {inv.invoiceDate && (
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-3 w-3" />
                                  {new Date(inv.invoiceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                                </span>
                              )}
                              {inv.dueDate && (
                                <span className={new Date(inv.dueDate) < new Date() && inv.status !== "paid" ? "text-red-500 font-medium" : ""}>
                                  Due {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {inv.total != null && (
                              <div className="text-sm font-bold text-gray-900">
                                {fmt(inv.total, currency)}
                              </div>
                            )}
                            <Link
                              href={`/payables/invoice/${inv._id}`}
                              className="mt-1 flex items-center gap-0.5 justify-end text-xs text-violet-600 hover:text-violet-700 font-medium"
                            >
                              View <ExternalLinkIcon className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                        {/* Show flags inline */}
                        {inv.flags && inv.flags.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {inv.flags.map((f, i) => (
                              <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">{f.message}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Panel footer */}
        <div className="border-t border-gray-100 px-5 py-4">
          <Link
            href={`/payables/dashboard?vendor=${encodeURIComponent(group.name)}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors"
          >
            <TrendingUpIcon className="h-4 w-4" />
            View all {group.name} invoices in dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

function SupplierCard({
  group, processingIds, deletingIds, supplierFetchingKeys, onFetchOne, onDelete, onFetchSupplier, onViewHistory,
}: {
  group: SupplierGroup;
  processingIds: Set<string>;
  deletingIds: Set<string>;
  supplierFetchingKeys: Set<string>;
  onFetchOne: (id: string) => void;
  onDelete: (id: string) => void;
  onFetchSupplier: (group: SupplierGroup) => void;
  onViewHistory: (group: SupplierGroup) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const color = avatarColor(group.name);
  const init = initials(group.name);
  const isFetchingSupplier = supplierFetchingKeys.has(group.key);
  const hasActiveProcessing = group.processingCount > 0;

  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all ${
      hasActiveProcessing ? "border-violet-200" : group.pendingCount > 0 ? "border-gray-200" : "border-gray-100"
    }`}>
      {/* Supplier header */}
      <div
        className={`flex items-center gap-4 p-4 cursor-pointer select-none transition-colors ${
          hasActiveProcessing ? "bg-violet-50/40" : "hover:bg-gray-50"
        }`}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Avatar — click to open history panel */}
        <button
          onClick={(e) => { e.stopPropagation(); onViewHistory(group); }}
          title="View invoice history"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color} text-white text-sm font-bold shadow-sm hover:ring-2 hover:ring-offset-1 hover:ring-violet-400 transition-all`}
        >
          {init}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory(group); }}
              className="font-bold text-gray-900 text-sm hover:text-violet-700 hover:underline underline-offset-2 transition-colors text-left"
            >
              {group.name}
            </button>
            {hasActiveProcessing && (
              <span className="flex items-center gap-1.5 text-xs text-violet-700 font-medium bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">
                <Spinner size="h-2.5 w-2.5" />
                Processing
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{group.email}</p>

          {/* Pill breakdown */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {group.emails.length} email{group.emails.length !== 1 ? "s" : ""}
            </span>
            {group.pendingCount > 0 && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                {group.pendingCount} pending
              </span>
            )}
            {group.processingCount > 0 && (
              <span className="rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-xs font-medium text-violet-700">
                {group.processingCount} processing
              </span>
            )}
            {group.completedCount > 0 && (
              <span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                {group.completedCount} done
              </span>
            )}
            {group.failedCount > 0 && (
              <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700">
                {group.failedCount} failed
              </span>
            )}
            <span className="text-xs text-gray-400 ml-1">· Latest {formatDate(group.latestDate)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {group.pendingCount > 0 && (
            <button
              onClick={() => onFetchSupplier(group)}
              disabled={isFetchingSupplier || hasActiveProcessing}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isFetchingSupplier ? <Spinner size="h-3.5 w-3.5" color="text-white" /> : <ZapIcon className="h-3.5 w-3.5" />}
              Fetch {group.pendingCount} Invoice{group.pendingCount !== 1 ? "s" : ""}
            </button>
          )}
          <button className={`rounded-lg p-1.5 text-gray-400 hover:text-gray-700 transition-colors`}>
            <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Email list */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-3 space-y-2">
          {group.emails.map((email) => (
            <EmailCard
              key={email._id}
              email={email}
              isProcessing={processingIds.has(email._id) || email.status === "processing"}
              isDeleting={deletingIds.has(email._id)}
              onFetch={() => onFetchOne(email._id)}
              onDelete={() => onDelete(email._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function EmailInboxPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, processing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"supplier" | "flat">("supplier");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [supplierFetchingKeys, setSupplierFetchingKeys] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [scanResult, setScanResult] = useState<{ discovered: number; message: string } | null>(null);
  const [lastAutoScan, setLastAutoScan] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierGroup | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  function addToast(type: Toast["type"], message: string) {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }

  const fetchEmails = useCallback(async (u: { uid: string; token: string }, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`${BACKEND}/payables/email-inbox?${params}`, { headers: payablesHeaders(u) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmails(data.emails ?? []);
      setStats(data.stats ?? { total: 0, pending: 0, processing: 0, completed: 0 });
      if (data.lastAutoScan) setLastAutoScan(data.lastAutoScan);
    } catch {
      if (!silent) addToast("error", "Failed to load emails");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { router.push("/payables"); return; }
      const token = await firebaseUser.getIdToken();
      const u = { uid: firebaseUser.uid, token };
      setUser(u);
      await fetchEmails(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchEmails(user);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!user) return;
    const hasActive = emails.some((e) => e.status === "processing");
    if (hasActive) {
      pollRef.current = setInterval(() => fetchEmails(user, true), 3000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [emails, user]);

  async function handleScan() {
    if (!user) return;
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch(`${BACKEND}/payables/email-inbox/scan`, { method: "POST", headers: payablesHeaders(user) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setScanResult({ discovered: data.discovered, message: data.message });
      addToast("success", data.message);
      await fetchEmails(user);
    } catch (err: any) {
      addToast("error", err.message || "Failed to scan inbox");
    } finally {
      setScanning(false);
    }
  }

  async function handleFetchOne(emailId: string) {
    if (!user) return;
    setProcessingIds((s) => new Set(s).add(emailId));
    try {
      const res = await fetch(`${BACKEND}/payables/email-inbox/${emailId}/process`, { method: "POST", headers: payablesHeaders(user) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      addToast("info", "AI is processing this invoice...");
      await fetchEmails(user, true);
    } catch (err: any) {
      addToast("error", err.message || "Failed to process email");
    } finally {
      setProcessingIds((s) => { const n = new Set(s); n.delete(emailId); return n; });
    }
  }

  async function handleFetchAll() {
    if (!user) return;
    setFetchingAll(true);
    try {
      const res = await fetch(`${BACKEND}/payables/email-inbox/process-all`, { method: "POST", headers: payablesHeaders(user) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      addToast("info", data.message || "Processing all invoices sequentially...");
      await fetchEmails(user, true);
    } catch (err: any) {
      addToast("error", err.message || "Failed to start batch processing");
    } finally {
      setFetchingAll(false);
    }
  }

  async function handleFetchSupplier(group: SupplierGroup) {
    if (!user) return;
    const pendingIds = group.emails.filter((e) => e.status === "pending" || e.status === "failed").map((e) => e._id);
    if (!pendingIds.length) return;
    setSupplierFetchingKeys((s) => new Set(s).add(group.key));
    addToast("info", `Processing ${pendingIds.length} invoice${pendingIds.length !== 1 ? "s" : ""} from ${group.name}...`);
    try {
      for (const id of pendingIds) {
        await fetch(`${BACKEND}/payables/email-inbox/${id}/process`, { method: "POST", headers: payablesHeaders(user) });
        await new Promise((r) => setTimeout(r, 800));
      }
      await fetchEmails(user, true);
      addToast("success", `All invoices from ${group.name} sent for AI processing`);
    } catch {
      addToast("error", `Some invoices from ${group.name} failed to start`);
    } finally {
      setSupplierFetchingKeys((s) => { const n = new Set(s); n.delete(group.key); return n; });
    }
  }

  async function handleDelete(emailId: string) {
    if (!user) return;
    setDeletingIds((s) => new Set(s).add(emailId));
    try {
      const res = await fetch(`${BACKEND}/payables/email-inbox/${emailId}`, { method: "DELETE", headers: payablesHeaders(user) });
      if (!res.ok) throw new Error();
      setEmails((prev) => prev.filter((e) => e._id !== emailId));
      addToast("success", "Email removed from inbox");
    } catch {
      addToast("error", "Failed to delete email");
    } finally {
      setDeletingIds((s) => { const n = new Set(s); n.delete(emailId); return n; });
    }
  }

  const pendingEmails = emails.filter((e) => e.status === "pending");
  const hasProcessing = stats.processing > 0 || emails.some((e) => e.status === "processing");
  const supplierGroups = groupBySupplier(emails);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="h-8 w-8" />
          <p className="text-gray-500 text-sm">Loading email inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/payables/dashboard" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors">
              <ArrowLeftIcon className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                <MailIcon className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">Email Invoice Inbox</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasProcessing && (
              <span className="flex items-center gap-1.5 text-xs text-violet-600 font-medium bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1">
                <Spinner size="h-3 w-3" />
                AI processing {stats.processing} invoice{stats.processing !== 1 ? "s" : ""}
              </span>
            )}
            <button onClick={() => user && fetchEmails(user)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
              <RefreshIcon className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-5">
        {/* Hero header */}
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Email Invoice Inbox</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                AI scans your Gmail for supplier invoices. Review by supplier or process all at once.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Auto-scan every {AUTO_SCAN_INTERVAL_HOURS}h
                </span>
                {lastAutoScan ? (
                  <span>Last scan: <span className="text-gray-600 font-medium">{formatDate(lastAutoScan)}</span></span>
                ) : (
                  <span>First scan runs 30s after server start</span>
                )}
              </div>
              {scanResult && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-700 font-medium">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  {scanResult.message}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={handleScan}
                disabled={scanning}
                className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm hover:bg-violet-50 disabled:opacity-60 transition-colors"
              >
                {scanning ? <Spinner /> : <RefreshIcon className="h-4 w-4" />}
                {scanning ? "Scanning..." : "Scan Gmail"}
              </button>
              <button
                onClick={handleFetchAll}
                disabled={fetchingAll || pendingEmails.length === 0}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {fetchingAll ? <Spinner color="text-white" /> : <ZapIcon className="h-4 w-4" />}
                {fetchingAll ? "Processing..." : `Fetch All Now (${pendingEmails.length})`}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Suppliers",  value: supplierGroups.length, color: "text-blue-700",   bg: "bg-blue-50",   icon: <BuildingIcon className="h-4 w-4 text-blue-400" /> },
            { label: "Pending",    value: stats.pending,         color: "text-amber-700",  bg: "bg-amber-50",  icon: <MailIcon className="h-4 w-4 text-amber-400" /> },
            { label: "Processing", value: stats.processing,      color: "text-violet-700", bg: "bg-violet-50", icon: <Spinner size="h-4 w-4" /> },
            { label: "Completed",  value: stats.completed,       color: "text-green-700",  bg: "bg-green-50",  icon: <CheckCircleIcon className="h-4 w-4 text-green-500" /> },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border border-gray-200 ${s.bg} p-4`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{s.label}</span>
                {s.icon}
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Processing banner */}
        {hasProcessing && (
          <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
            <Spinner />
            <div>
              <p className="text-sm font-medium text-violet-800">AI is processing invoices one by one</p>
              <p className="text-xs text-violet-600">Each invoice is being carefully analyzed. Page updates every 3 seconds.</p>
            </div>
          </div>
        )}

        {/* Toolbar: search + filter + view toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by supplier, subject, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
              {(["all", "pending", "processing", "completed", "failed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-violet-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
              <button
                onClick={() => setViewMode("supplier")}
                title="Group by supplier"
                className={`rounded-lg p-1.5 transition-colors ${viewMode === "supplier" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-gray-700"}`}
              >
                <LayersIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("flat")}
                title="Flat list"
                className={`rounded-lg p-1.5 transition-colors ${viewMode === "flat" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-gray-700"}`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Email content */}
        {emails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <MailIcon className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700">No invoice emails found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Click \"Scan Gmail\" to find supplier invoice emails automatically."}
            </p>
            {!search && statusFilter === "all" && (
              <button onClick={handleScan} disabled={scanning} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors">
                {scanning ? <Spinner color="text-white" /> : <RefreshIcon className="h-4 w-4" />}
                {scanning ? "Scanning..." : "Scan Gmail Inbox"}
              </button>
            )}
          </div>
        ) : viewMode === "supplier" ? (
          /* ── SUPPLIER GROUPED VIEW ── */
          <div className="space-y-3">
            {supplierGroups.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">No suppliers match your filter.</div>
            ) : (
              supplierGroups.map((group) => (
                <SupplierCard
                  key={group.key}
                  group={group}
                  processingIds={processingIds}
                  deletingIds={deletingIds}
                  supplierFetchingKeys={supplierFetchingKeys}
                  onFetchOne={handleFetchOne}
                  onDelete={handleDelete}
                  onFetchSupplier={handleFetchSupplier}
                  onViewHistory={setSelectedSupplier}
                />
              ))
            )}
          </div>
        ) : (
          /* ── FLAT LIST VIEW ── */
          <div className="space-y-2">
            {emails.map((email) => {
              const displayName = email.from || email.fromEmail || "Unknown Sender";
              const color = avatarColor(displayName);
              const init = initials(displayName);
              return (
                <div key={email._id} className={`group flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                  email.status === "processing" ? "border-violet-200 bg-violet-50/30"
                  : email.status === "completed" ? "border-green-200/50"
                  : email.status === "failed" ? "border-red-200/50"
                  : "border-gray-200"
                }`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color} text-white text-sm font-bold`}>
                    {init}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 truncate">{displayName}</span>
                      {email.fromEmail && email.fromEmail !== displayName && (
                        <span className="text-xs text-gray-400 truncate">&lt;{email.fromEmail}&gt;</span>
                      )}
                      <StatusBadge status={email.status} />
                      {email.hasAttachment && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <PaperclipIcon className="h-3 w-3" />
                          {email.attachmentName || "Attachment"}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-gray-400 shrink-0">{formatDate(email.receivedAt)}</span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-gray-800 truncate">{email.subject || "(No subject)"}</p>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{email.snippet || "No preview available"}</p>
                    {email.status === "processing" && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-violet-700">
                        <Spinner size="h-3 w-3" />
                        AI extracting invoice data...
                      </div>
                    )}
                    {email.status === "completed" && email.invoiceId && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          Invoice extracted
                        </span>
                        <Link href={`/payables/invoice/${email.invoiceId}`} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium underline underline-offset-2">
                          View Invoice <ExternalLinkIcon className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                    {email.status === "failed" && email.errorMessage && (
                      <p className="mt-2 text-xs text-red-600">Error: {email.errorMessage}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {(email.status === "pending" || email.status === "failed") && (
                      <button
                        onClick={() => handleFetchOne(email._id)}
                        disabled={processingIds.has(email._id) || deletingIds.has(email._id)}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
                      >
                        {processingIds.has(email._id) ? <Spinner size="h-3 w-3" color="text-white" /> : <ZapIcon className="h-3.5 w-3.5" />}
                        Fetch Now
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(email._id)}
                      disabled={deletingIds.has(email._id) || email.status === "processing"}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition-colors"
                    >
                      {deletingIds.has(email._id) ? <Spinner size="h-3.5 w-3.5" /> : <TrashIcon className="h-3.5 w-3.5" />}
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Supplier History Panel */}
      {selectedSupplier && user && (
        <SupplierHistoryPanel
          group={selectedSupplier}
          user={user}
          onClose={() => setSelectedSupplier(null)}
        />
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium ${
              t.type === "success" ? "bg-green-50 border-green-200 text-green-800"
              : t.type === "error" ? "bg-red-50 border-red-200 text-red-800"
              : "bg-violet-50 border-violet-200 text-violet-800"
            }`}
          >
            {t.type === "success" ? <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" />
             : t.type === "error" ? <AlertIcon className="h-4 w-4 text-red-500 shrink-0" />
             : <ZapIcon className="h-4 w-4 text-violet-500 shrink-0" />}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
