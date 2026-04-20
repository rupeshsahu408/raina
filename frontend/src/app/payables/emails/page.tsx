"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ─── Icons ─── */
function Icon({ d, ...p }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d={d} />
    </svg>
  );
}
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

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string; dot?: string }> = {
    pending:    { label: "Pending",    cls: "bg-amber-50 text-amber-700 border border-amber-200",   dot: "bg-amber-400" },
    processing: { label: "Processing", cls: "bg-violet-50 text-violet-700 border border-violet-200", dot: "bg-violet-500 animate-pulse" },
    completed:  { label: "Completed",  cls: "bg-green-50 text-green-700 border border-green-200",   dot: "bg-green-500" },
    failed:     { label: "Failed",     cls: "bg-red-50 text-red-700 border border-red-200",         dot: "bg-red-500" },
  };
  const c = cfg[status] ?? { label: status, cls: "bg-gray-50 text-gray-600 border border-gray-200", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ─── Spinner ─── */
function Spinner({ size = "h-4 w-4" }: { size?: string }) {
  return <svg className={`animate-spin ${size} text-violet-600`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>;
}

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
  const colors = ["bg-violet-500", "bg-blue-500", "bg-green-500", "bg-amber-500", "bg-red-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];
  if (!name) return colors[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
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
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [scanResult, setScanResult] = useState<{ discovered: number; message: string } | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  function toast(type: Toast["type"], message: string) {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
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
    } catch {
      if (!silent) toast("error", "Failed to load emails");
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
      toast("success", data.message);
      await fetchEmails(user);
    } catch (err: any) {
      toast("error", err.message || "Failed to scan inbox");
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
      toast("info", "AI is processing this invoice...");
      await fetchEmails(user, true);
    } catch (err: any) {
      toast("error", err.message || "Failed to process email");
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
      toast("info", data.message || "Processing all invoices sequentially...");
      await fetchEmails(user, true);
    } catch (err: any) {
      toast("error", err.message || "Failed to start batch processing");
    } finally {
      setFetchingAll(false);
    }
  }

  async function handleDelete(emailId: string) {
    if (!user) return;
    setDeletingIds((s) => new Set(s).add(emailId));
    try {
      const res = await fetch(`${BACKEND}/payables/email-inbox/${emailId}`, { method: "DELETE", headers: payablesHeaders(user) });
      if (!res.ok) throw new Error();
      setEmails((prev) => prev.filter((e) => e._id !== emailId));
      toast("success", "Email removed from inbox");
    } catch {
      toast("error", "Failed to delete email");
    } finally {
      setDeletingIds((s) => { const n = new Set(s); n.delete(emailId); return n; });
    }
  }

  const pendingEmails = emails.filter((e) => e.status === "pending");
  const processingEmails = emails.filter((e) => e.status === "processing");
  const hasProcessing = stats.processing > 0 || processingEmails.length > 0;

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
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
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

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Hero header */}
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Email Invoice Inbox</h1>
              <p className="mt-1 text-sm text-gray-500">
                AI scans your Gmail for supplier invoices. Review each one and let AI extract the data automatically.
              </p>
              {scanResult && (
                <div className="mt-3 flex items-center gap-2 text-sm text-violet-700 font-medium">
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
                {scanning ? "Scanning Gmail..." : "Scan Gmail Inbox"}
              </button>
              <button
                onClick={handleFetchAll}
                disabled={fetchingAll || pendingEmails.length === 0}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {fetchingAll ? <Spinner size="h-4 w-4" /> : <ZapIcon className="h-4 w-4" />}
                {fetchingAll ? "Processing All..." : `Fetch All Now (${pendingEmails.length})`}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Emails", value: stats.total, color: "text-gray-900", bg: "bg-white" },
            { label: "Pending",      value: stats.pending, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Processing",   value: stats.processing, color: "text-violet-700", bg: "bg-violet-50" },
            { label: "Completed",    value: stats.completed, color: "text-green-700", bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border border-gray-200 ${s.bg} p-4 text-center`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Processing progress banner */}
        {hasProcessing && (
          <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
            <Spinner />
            <div>
              <p className="text-sm font-medium text-violet-800">AI is processing invoices one by one</p>
              <p className="text-xs text-violet-600">Each invoice is being carefully analyzed and extracted. This page auto-updates every 3 seconds.</p>
            </div>
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by sender, subject, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shrink-0">
            {(["all", "pending", "processing", "completed", "failed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-violet-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Email list */}
        {emails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <MailIcon className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700">No invoice emails found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Click \"Scan Gmail Inbox\" to find supplier invoice emails automatically."}
            </p>
            {!search && statusFilter === "all" && (
              <button onClick={handleScan} disabled={scanning} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors">
                {scanning ? <Spinner /> : <RefreshIcon className="h-4 w-4" />}
                {scanning ? "Scanning..." : "Scan Gmail Inbox"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {emails.map((email) => (
              <EmailCard
                key={email._id}
                email={email}
                isProcessing={processingIds.has(email._id) || email.status === "processing"}
                isDeleting={deletingIds.has(email._id)}
                onFetch={() => handleFetchOne(email._id)}
                onDelete={() => handleDelete(email._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium transition-all animate-in slide-in-from-right ${
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

/* ─── Email Card ─── */
function EmailCard({
  email,
  isProcessing,
  isDeleting,
  onFetch,
  onDelete,
}: {
  email: GmailEmail;
  isProcessing: boolean;
  isDeleting: boolean;
  onFetch: () => void;
  onDelete: () => void;
}) {
  const displayName = email.from || email.fromEmail || "Unknown Sender";
  const color = avatarColor(displayName);
  const init = initials(displayName);

  return (
    <div className={`group flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${email.status === "processing" ? "border-violet-200 bg-violet-50/30" : email.status === "completed" ? "border-green-200/50" : email.status === "failed" ? "border-red-200/50" : "border-gray-200"}`}>
      {/* Avatar */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color} text-white text-sm font-bold`}>
        {init}
      </div>

      {/* Content */}
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
            <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            AI is extracting invoice data...
          </div>
        )}

        {email.status === "completed" && email.invoiceId && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Invoice extracted successfully
            </span>
            <Link
              href={`/payables/invoice/${email.invoiceId}`}
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium underline underline-offset-2"
            >
              View Invoice
              <ExternalLinkIcon className="h-3 w-3" />
            </Link>
          </div>
        )}

        {email.status === "failed" && email.errorMessage && (
          <p className="mt-2 text-xs text-red-600">Error: {email.errorMessage}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {(email.status === "pending" || email.status === "failed") && (
          <button
            onClick={onFetch}
            disabled={isProcessing || isDeleting}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? (
              <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <ZapIcon className="h-3.5 w-3.5" />
            )}
            Fetch Now
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={isDeleting || email.status === "processing"}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition-colors"
        >
          {isDeleting ? (
            <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <TrashIcon className="h-3.5 w-3.5" />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}
