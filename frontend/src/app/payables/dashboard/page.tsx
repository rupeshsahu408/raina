"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ─── Icons (inline SVGs for zero-dep) ─── */
function Icon({ d, ...p }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d={d} />
    </svg>
  );
}
const UploadIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const MailIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const RefreshIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
  </svg>
);
const ChevronRightIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const AlertIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const ClockIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ZapIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const ArrowLeftIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
  </svg>
);
const CheckCircleIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const SettingsIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const CalendarIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);
const DownloadIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const TrendingUpIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const SearchIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const BuildingIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01" />
  </svg>
);
const FlagIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" />
  </svg>
);
const CreditCard = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

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
  flags?: Array<{ type: string; severity: string; message: string }>;
  isNewVendor?: boolean;
  assignedApproverEmail?: string;
  assignedApproverName?: string;
  hasDocument?: boolean;
}

interface Stats {
  total: number;
  totalAmount: number;
  pendingCount: number;
  approvedCount: number;
  processingCount: number;
  flaggedCount: number;
  pendingAmount: number;
  approvedAmount: number;
}

interface CompanyProfile {
  companyName?: string;
  industry?: string;
  monthlyInvoices?: string;
  onboarded?: boolean;
}

interface PersonalizationProfile {
  brandName?: string;
  logoBase64?: string;
  logoMimeType?: string;
  ownerName?: string;
  personalizationDone?: boolean;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical" | "success";
  invoiceId?: string;
  readAt?: string;
  createdAt: string;
}

type ExportFormat = "csv" | "excel" | "tally" | "zoho" | "quickbooks";

/* ─── Helpers ─── */
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  processing:       { label: "Processing",       color: "text-amber-700",   dot: "bg-amber-400",   bg: "bg-amber-50 border-amber-100" },
  extracted:        { label: "Ready for Review",  color: "text-blue-700",    dot: "bg-blue-500",    bg: "bg-blue-50 border-blue-100" },
  pending_approval: { label: "Pending Approval",  color: "text-violet-700",  dot: "bg-violet-500",  bg: "bg-violet-50 border-violet-100" },
  approved:         { label: "Approved",          color: "text-emerald-700", dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-100" },
  rejected:         { label: "Rejected",          color: "text-rose-700",    dot: "bg-rose-500",    bg: "bg-rose-50 border-rose-100" },
  paid:             { label: "Paid",              color: "text-teal-700",    dot: "bg-teal-500",    bg: "bg-teal-50 border-teal-100" },
};

function fmt(n?: number, currency?: string) {
  if (n == null) return "—";
  const code = currency?.trim().toUpperCase();
  if (!code) return new Intl.NumberFormat("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency: code, minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n); }
  catch { return `${code} ${n.toLocaleString("en-IN")}`; }
}
function fmtDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}
function daysUntil(dueDate: string) { return Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000); }
function isOverdue(dueDate?: string) { return !!dueDate && new Date(dueDate) < new Date(); }

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
  const [disconnectingGmail, setDisconnectingGmail] = useState(false);
  const [gmailMsg, setGmailMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount_high" | "amount_low" | "due_soon">("newest");
  const [companyData, setCompanyData] = useState<CompanyProfile>({});
  const [personalization, setPersonalization] = useState<PersonalizationProfile>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [processingNotice, setProcessingNotice] = useState<string | null>(null);
  const previousProcessingCount = useRef(0);

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

  const fetchData = useCallback(async (options?: { silent?: boolean }) => {
    if (!user) return;
    const silent = options?.silent ?? false;
    if (!silent) setLoading(true);
    try {
      const headers = payablesHeaders(user);
      const filterParam = activeFilter === "flagged" ? "all&flagged=true" : `status=${activeFilter}`;
      const searchParam = search.trim() ? `&q=${encodeURIComponent(search.trim())}` : "";
      const [invRes, allInvRes, statsRes, gmailRes, companyRes, notificationRes, personRes] = await Promise.all([
        fetch(`${BACKEND}/payables/invoices?${filterParam}${searchParam}&limit=50`, { headers }),
        fetch(`${BACKEND}/payables/invoices?status=all&limit=100`, { headers }),
        fetch(`${BACKEND}/payables/invoices/stats`, { headers }),
        fetch(`${BACKEND}/payables/gmail/status`, { headers }),
        fetch(`${BACKEND}/payables/company`, { headers }),
        fetch(`${BACKEND}/payables/notifications`, { headers }),
        fetch(`${BACKEND}/payables/personalization`, { headers }),
      ]);
      if (invRes.ok) { const d = await invRes.json(); setInvoices(d.invoices ?? []); }
      if (allInvRes.ok) { const d = await allInvRes.json(); setAllInvoices(d.invoices ?? []); }
      if (statsRes.ok) setStats(await statsRes.json());
      if (gmailRes.ok) { const d = await gmailRes.json(); setGmailConnected(d.connected); setGmailEmail(d.email ?? null); }
      if (companyRes.ok) setCompanyData(await companyRes.json());
      if (notificationRes.ok) {
        const d = await notificationRes.json();
        setNotifications(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      }
      if (personRes.ok) setPersonalization(await personRes.json());
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, [user, activeFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const processingCount = allInvoices.filter((inv) => inv.status === "processing").length;
    if (previousProcessingCount.current > 0 && processingCount === 0) {
      setProcessingNotice("AI processing finished. The latest invoice data is ready for review.");
    }
    if (processingCount > 0) setProcessingNotice(null);
    previousProcessingCount.current = processingCount;
  }, [allInvoices]);

  useEffect(() => {
    if (!user || !allInvoices.some((inv) => inv.status === "processing")) return;
    const timer = window.setInterval(() => {
      fetchData({ silent: true });
    }, 3000);
    return () => window.clearInterval(timer);
  }, [user, allInvoices, fetchData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const result = new URLSearchParams(window.location.search).get("gmail");
    if (result === "connected") {
      setGmailConnected(true);
      setGmailMsg({ text: "Gmail connected successfully. You can now import invoice emails.", type: "success" });
      window.history.replaceState({}, "", "/payables/dashboard");
    }
    if (result === "oauth_failed") {
      setGmailConnected(false);
      setGmailMsg({ text: "Gmail connection failed. Please try again.", type: "error" });
      window.history.replaceState({}, "", "/payables/dashboard");
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchFromGmail = async () => {
    if (!user) return;
    setFetchingGmail(true);
    setGmailMsg(null);
    try {
      const res = await fetch(`${BACKEND}/payables/fetch-gmail`, {
        method: "POST",
        headers: payablesHeaders(user),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setGmailMsg({
        text: data.fetched > 0
          ? `Found ${data.fetched} new invoice email${data.fetched !== 1 ? "s" : ""}. AI is extracting data…`
          : (data.message ?? "No new invoice emails found."),
        type: data.fetched > 0 ? "success" : "info",
      });
      if (data.fetched > 0) setProcessingNotice(null);
      setTimeout(fetchData, 3000);
    } catch (err: unknown) {
      setGmailMsg({ text: err instanceof Error ? err.message : "Failed to fetch from Gmail", type: "error" });
    } finally {
      setFetchingGmail(false);
    }
  };

  const connectGmail = async () => {
    if (!user) return;
    setFetchingGmail(true);
    setGmailMsg(null);
    try {
      const res = await fetch(`${BACKEND}/payables/gmail/auth-url?returnTo=${encodeURIComponent("/payables/dashboard?gmail=connected")}`, {
        headers: payablesHeaders(user),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start Gmail connection.");
      window.location.href = data.url;
    } catch (err) {
      setGmailMsg({ text: err instanceof Error ? err.message : "Could not start Gmail connection.", type: "error" });
      setFetchingGmail(false);
    }
  };

  const disconnectGmail = async () => {
    if (!user || !confirm("Disconnect Gmail? You can reconnect at any time.")) return;
    setDisconnectingGmail(true);
    try {
      const res = await fetch(`${BACKEND}/payables/gmail/disconnect`, {
        method: "DELETE",
        headers: payablesHeaders(user),
      });
      if (res.ok) {
        setGmailConnected(false);
        setGmailEmail(null);
        setGmailMsg({ text: "Gmail disconnected. Invoice auto-import is paused.", type: "info" });
      }
    } catch {
      setGmailMsg({ text: "Could not disconnect Gmail. Please try again.", type: "error" });
    } finally {
      setDisconnectingGmail(false);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  };

  const bulkAction = async (action: "approve" | "reject" | "paid" | "delete" | "analyze") => {
    if (!user || selectedIds.length === 0) return;
    if (action === "delete" && !confirm(`Delete ${selectedIds.length} selected invoices?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${BACKEND}/payables/invoices/bulk-action`, {
        method: "POST",
        headers: payablesHeaders(user, true),
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      if (!res.ok) throw new Error("Bulk action failed");
      setSelectedIds([]);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkLoading(false);
    }
  };

  const exportInvoices = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const params = new URLSearchParams({ format: exportFormat });
      if (activeFilter !== "all" && activeFilter !== "flagged") params.set("status", activeFilter);
      const res = await fetch(`${BACKEND}/payables/invoices/export?${params.toString()}`, { headers: payablesHeaders(user) });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.href = url;
      a.download = match?.[1] ?? `plyndrox-payables-${new Date().toISOString().split("T")[0]}.${exportFormat === "tally" ? "xml" : exportFormat === "excel" ? "xls" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { console.error("Export error", e); }
    finally { setExporting(false); }
  };

  const upcomingDue = allInvoices
    .filter((inv) => inv.dueDate && !["approved", "rejected", "paid"].includes(inv.status))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const overdueInvoices = allInvoices.filter(
    (inv) => inv.dueDate && isOverdue(inv.dueDate) && !["approved", "rejected", "paid"].includes(inv.status)
  );

  const flaggedInvoices = allInvoices.filter(
    (inv) => inv.flags && inv.flags.length > 0 && !["rejected", "paid"].includes(inv.status)
  );

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "amount_high") return (b.total ?? 0) - (a.total ?? 0);
    if (sortBy === "amount_low") return (a.total ?? 0) - (b.total ?? 0);
    if (sortBy === "due_soon") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

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
    { key: "all", label: "All" },
    { key: "extracted", label: "Ready" },
    { key: "pending_approval", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "paid", label: "Paid" },
    { key: "rejected", label: "Rejected" },
    { key: "flagged", label: `Flagged${stats?.flaggedCount ? ` (${stats.flaggedCount})` : ""}` },
    { key: "processing", label: "Processing" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {personalization.logoBase64 ? (
              <img
                src={`data:${personalization.logoMimeType ?? "image/png"};base64,${personalization.logoBase64}`}
                alt="brand logo"
                className="h-7 w-7 rounded-lg object-contain"
              />
            ) : null}
            <Link href="/payables" className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1d2226]">
              <ArrowLeftIcon className={`h-4 w-4 ${personalization.logoBase64 ? "hidden sm:block" : ""}`} />
              <span className={`hidden sm:inline ${personalization.brandName ? "font-semibold text-[#1d2226]" : ""}`}>
                {personalization.brandName || "Payables AI"}
              </span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={gmailConnected === false ? connectGmail : fetchFromGmail}
              disabled={fetchingGmail}
              title={gmailConnected === false ? "Connect Gmail" : "Fetch invoice emails from Gmail"}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:px-4"
            >
              {fetchingGmail ? <Spinner /> : <MailIcon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{fetchingGmail ? "Opening…" : gmailConnected === false ? "Connect Gmail" : "Fetch Gmail"}</span>
            </button>
            <Link
              href="/payables/emails"
              className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-100 sm:px-4"
            >
              <MailIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Email Inbox</span>
            </Link>
            <Link
              href="/payables/analyze"
              className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 shadow-sm transition hover:bg-violet-100 sm:px-4"
            >
              <ZapIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analyze</span>
            </Link>
            <Link
              href="/payables/scheduler"
              className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 sm:px-4"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Schedule</span>
            </Link>
            <Link
              href="/payables/upload"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 sm:px-4"
            >
              <UploadIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </Link>
            <Link
              href="/payables/setup"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition hover:border-violet-300 hover:text-violet-600"
              title="Workspace Setup & Personalization"
            >
              <SettingsIcon className="h-4 w-4" />
            </Link>
            <button onClick={() => fetchData()} className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition hover:border-gray-300 hover:text-[#1d2226]" title="Refresh">
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
              {personalization.brandName
                ? `${personalization.brandName}'s Invoices`
                : companyData.companyName
                ? `${companyData.companyName}'s Invoices`
                : "Invoice Dashboard"}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {personalization.ownerName
                ? `Welcome back, ${personalization.ownerName}. Your invoices are checked by AI before you act.`
                : "Your invoices, checked by AI for issues before you act."}
            </p>
          </div>
          {!loading && stats && stats.total === 0 && (
            <Link href="/payables/onboarding" className="text-xs font-semibold text-violet-600 underline hover:no-underline">
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

        {processingNotice && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{processingNotice}</span>
            <button onClick={() => setProcessingNotice(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
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

        {/* AI Flags alert */}
        {!loading && flaggedInvoices.length > 0 && activeFilter !== "flagged" && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
            <FlagIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-800">
                AI flagged {flaggedInvoices.length} invoice{flaggedInvoices.length !== 1 ? "s" : ""} for review
              </p>
              <p className="mt-0.5 text-xs text-orange-600">
                Possible duplicates, new vendors, or unusual amounts detected. Review before approving.
              </p>
            </div>
            <button
              onClick={() => setActiveFilter("flagged")}
              className="shrink-0 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-orange-700"
            >
              View flags
            </button>
          </div>
        )}

        {/* Stats grid */}
        {!loading && stats ? (
          <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: "Total invoices", value: stats.total, sub: "all time", icon: ZapIcon, iconBg: "bg-violet-100 text-violet-600", valueColor: "text-[#1d2226]" },
              { label: "Pending", value: stats.pendingCount, sub: fmt(stats.pendingAmount), icon: ClockIcon, iconBg: "bg-amber-100 text-amber-600", valueColor: "text-amber-600" },
              { label: "Approved", value: stats.approvedCount, sub: fmt(stats.approvedAmount), icon: CheckCircleIcon, iconBg: "bg-emerald-100 text-emerald-600", valueColor: "text-emerald-600" },
              { label: "Processing", value: stats.processingCount, sub: stats.processingCount > 0 ? "AI extracting" : "none active", icon: TrendingUpIcon, iconBg: "bg-blue-100 text-blue-600", valueColor: "text-blue-600" },
              { label: "AI Flagged", value: stats.flaggedCount ?? 0, sub: "need attention", icon: FlagIcon, iconBg: "bg-orange-100 text-orange-600", valueColor: stats.flaggedCount ? "text-orange-600" : "text-gray-400" },
            ].map(({ label, value, sub, icon: Icon, iconBg, valueColor }) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className={`mt-3 text-3xl font-black ${valueColor}`}>{value}</p>
                <p className="mt-1 text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : null}

        <div className="grid gap-7 xl:grid-cols-[1fr_320px]">
          {/* Main: invoice list */}
          <div>
            {selectedIds.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 p-3">
                <span className="mr-auto text-sm font-bold text-violet-800">{selectedIds.length} selected</span>
                {[
                  ["approve", "Approve"],
                  ["paid", "Mark paid"],
                  ["analyze", "Re-analyze"],
                  ["reject", "Reject"],
                  ["delete", "Delete"],
                ].map(([action, label]) => (
                  <button
                    key={action}
                    disabled={bulkLoading}
                    onClick={() => bulkAction(action as "approve" | "reject" | "paid" | "delete" | "analyze")}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${action === "delete" ? "bg-rose-600 text-white" : "bg-white text-violet-700 border border-violet-100"}`}
                  >
                    {label}
                  </button>
                ))}
                <button onClick={() => setSelectedIds([])} className="rounded-full px-3 py-1.5 text-xs font-bold text-gray-400">Clear</button>
              </div>
            )}

            {/* Search + Filter bar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by vendor or invoice number…"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                />
                {searchInput && (
                  <button
                    onClick={() => { setSearchInput(""); setSearch(""); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 shadow-sm outline-none transition focus:border-violet-300"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amount_high">Amount: high → low</option>
                <option value="amount_low">Amount: low → high</option>
                <option value="due_soon">Due date: soonest</option>
              </select>
              <button
                onClick={exportInvoices}
                disabled={exporting}
                title="Download structured invoice data"
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-[#1d2226] disabled:opacity-50"
              >
                {exporting ? <Spinner /> : <DownloadIcon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Download</span>
              </button>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 shadow-sm outline-none transition focus:border-violet-300"
                title="Choose accounting export format"
              >
                <option value="csv">Excel / CSV</option>
                <option value="excel">Excel workbook</option>
                <option value="tally">Tally Prime XML</option>
                <option value="zoho">Zoho Books CSV</option>
                <option value="quickbooks">QuickBooks CSV</option>
              </select>
            </div>

            {/* Filter tabs */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                    activeFilter === key
                      ? key === "flagged"
                        ? "bg-orange-600 text-white shadow-sm"
                        : "bg-[#1d2226] text-white shadow-sm"
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
            ) : sortedInvoices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                  <MailIcon className="h-7 w-7 text-gray-200" />
                </div>
                <p className="text-base font-bold text-gray-400">
                  {search ? `No invoices matching "${search}"` : activeFilter === "all" ? "No invoices yet" : `No ${activeFilter.replace("_", " ")} invoices`}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  {activeFilter === "all" && !search
                    ? "Upload your first invoice or connect Gmail to get started."
                    : `Try a different filter or clear your search.`}
                </p>
                {activeFilter === "all" && !search && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link href="/payables/upload" className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5">
                      Upload invoice
                    </Link>
                    <button onClick={fetchFromGmail} disabled={fetchingGmail} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 disabled:opacity-50">
                      {fetchingGmail ? "Fetching…" : "Fetch from Gmail"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedInvoices.map((inv) => {
                  const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.processing;
                  const overdue = !["approved", "rejected", "paid"].includes(inv.status) && isOverdue(inv.dueDate);
                  const hasCritical = inv.flags?.some((f) => f.severity === "critical");
                  const hasWarning = inv.flags?.some((f) => f.severity === "warning");
                  const flagCount = inv.flags?.length ?? 0;

                  return (
                    <Link
                      key={inv._id}
                      href={`/payables/invoice/${inv._id}`}
                      className={`group flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        hasCritical ? "border-red-200 bg-red-50/30" : hasWarning ? "border-orange-200 bg-orange-50/20" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inv._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.preventDefault(); toggleSelected(inv._id); }}
                        className="h-4 w-4 shrink-0 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${inv.source === "gmail" ? "bg-violet-50" : "bg-indigo-50"}`}>
                        {inv.source === "gmail" ? <MailIcon className="h-5 w-5 text-violet-500" /> : <UploadIcon className="h-5 w-5 text-indigo-500" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-[#1d2226]">
                            {inv.vendor ?? inv.originalFileName ?? "Unknown vendor"}
                          </p>
                          {inv.invoiceNumber && <span className="text-xs text-gray-400">#{inv.invoiceNumber}</span>}
                          {inv.isNewVendor && (
                            <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700">New vendor</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                          {inv.invoiceDate && <span>Issued {fmtDate(inv.invoiceDate)}</span>}
                          {inv.dueDate && (
                            <span className={overdue ? "font-bold text-rose-500" : ""}>
                              Due {fmtDate(inv.dueDate)}{overdue ? " · Overdue" : ""}
                            </span>
                          )}
                          {flagCount > 0 && (
                            <span className={`flex items-center gap-1 font-medium ${hasCritical ? "text-red-600" : "text-orange-500"}`}>
                              <FlagIcon className="h-3 w-3" />
                              {flagCount} AI flag{flagCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {inv.assignedApproverEmail && <span>Assigned to {inv.assignedApproverName || inv.assignedApproverEmail}</span>}
                          {inv.hasDocument && <span>Document saved</span>}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-base font-black text-[#1d2226]">{fmt(inv.total, inv.currency)}</span>
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

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Gmail integration card */}
            <div className={`rounded-2xl border p-5 shadow-sm ${gmailConnected === true ? "border-emerald-100 bg-white" : gmailConnected === false ? "border-amber-100 bg-amber-50" : "border-gray-100 bg-white"}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Gmail Integration</h3>
                {gmailConnected ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    Not connected
                  </span>
                )}
              </div>

              {gmailConnected === null ? (
                <div className="h-8 w-full animate-pulse rounded-xl bg-gray-100" />
              ) : gmailConnected ? (
                <div>
                  {gmailEmail && (
                    <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 border border-emerald-100">
                      <MailIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-800 truncate">{gmailEmail}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={fetchFromGmail}
                      disabled={fetchingGmail}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50 disabled:opacity-50"
                    >
                      {fetchingGmail ? <Spinner /> : <RefreshIcon className="h-3.5 w-3.5" />}
                      Fetch now
                    </button>
                    <button
                      onClick={disconnectGmail}
                      disabled={disconnectingGmail}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                      title="Disconnect Gmail"
                    >
                      {disconnectingGmail ? <Spinner /> : "Disconnect"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Auto-imports invoice emails from your inbox.</p>
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-xs text-amber-700">Connect your Gmail to automatically detect and import invoice emails into your dashboard.</p>
                  <button
                    onClick={connectGmail}
                    disabled={fetchingGmail}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d2226] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#2d3238] disabled:opacity-50"
                  >
                    {fetchingGmail ? <Spinner /> : <MailIcon className="h-3.5 w-3.5" />}
                    Connect Gmail
                  </button>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-gray-400">Quick actions</h3>
              <div className="space-y-2.5">
                <Link href="/payables/emails" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#1d2226] transition hover:border-blue-200 hover:bg-blue-50">
                  <MailIcon className="h-4 w-4 text-blue-500" />
                  Email Invoice Inbox
                  <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-300" />
                </Link>
                <Link href="/payables/upload" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50">
                  <UploadIcon className="h-4 w-4 text-violet-500" />
                  Upload invoice
                  <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-300" />
                </Link>
                <Link href="/payables/payments" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50">
                  <CreditCard className="h-4 w-4 text-violet-500" />
                  Payment queue
                  <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-300" />
                </Link>
                <Link href="/payables/vendors" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50">
                  <BuildingIcon className="h-4 w-4 text-blue-500" />
                  Vendor directory
                  <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-300" />
                </Link>
                <Link href="/payables/team" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50">
                  <BuildingIcon className="h-4 w-4 text-emerald-500" />
                  Team & roles
                  <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-300" />
                </Link>
                <Link href="/payables/rules" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50">
                  <FlagIcon className="h-4 w-4 text-orange-500" />
                  Approval rules
                  <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-300" />
                </Link>
                <Link href="/payables/settings" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-[#1d2226] transition hover:border-violet-200 hover:bg-violet-50">
                  <SettingsIcon className="h-4 w-4 text-gray-500" />
                  Settings & email templates
                  <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-300" />
                </Link>
              </div>
            </div>

            {/* Flagged by AI */}
            {!loading && flaggedInvoices.length > 0 && (
              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-500">
                  <FlagIcon className="h-3.5 w-3.5" />
                  AI Intelligence Flags
                </h3>
                <div className="space-y-2">
                  {flaggedInvoices.slice(0, 4).map((inv) => {
                    const hasCritical = inv.flags?.some((f) => f.severity === "critical");
                    return (
                      <Link
                        key={inv._id}
                        href={`/payables/invoice/${inv._id}`}
                        className={`flex items-start gap-2.5 rounded-xl border p-3 transition hover:opacity-80 ${
                          hasCritical ? "border-red-100 bg-red-50" : "border-orange-100 bg-orange-50"
                        }`}
                      >
                        <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-full flex items-center justify-center ${hasCritical ? "bg-red-200" : "bg-orange-200"}`}>
                          <FlagIcon className={`h-3 w-3 ${hasCritical ? "text-red-700" : "text-orange-700"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[#1d2226]">{inv.vendor ?? "Unknown"}</p>
                          <p className={`text-xs mt-0.5 ${hasCritical ? "text-red-600" : "text-orange-600"}`}>
                            {inv.flags![0].type.replace("_", " ")} · {fmt(inv.total, inv.currency)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                  {flaggedInvoices.length > 4 && (
                    <button onClick={() => setActiveFilter("flagged")} className="w-full rounded-xl border border-orange-100 bg-orange-50 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-100">
                      View all {flaggedInvoices.length} flagged invoices →
                    </button>
                  )}
                </div>
              </div>
            )}

            {notifications.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-400">
                    <AlertIcon className="h-3.5 w-3.5" />
                    Notifications
                  </h3>
                  {unreadCount > 0 && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{unreadCount} new</span>}
                </div>
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((n) => {
                    const card = (
                      <div className={`rounded-xl border p-3 ${n.severity === "critical" ? "border-red-100 bg-red-50" : n.severity === "warning" ? "border-orange-100 bg-orange-50" : "border-gray-100 bg-gray-50"}`}>
                        <p className="text-xs font-bold text-[#1d2226]">{n.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{n.message}</p>
                      </div>
                    );
                    return n.invoiceId ? <Link key={n._id} href={`/payables/invoice/${n.invoiceId}`}>{card}</Link> : <div key={n._id}>{card}</div>;
                  })}
                </div>
              </div>
            )}

            {/* Upcoming due dates */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-400">
                <ClockIcon className="h-3.5 w-3.5" />
                Upcoming due dates
              </h3>
              {loading ? (
                <div className="space-y-2.5">{[...Array(3)].map((_, i) => (<div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />))}</div>
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
                      <Link key={inv._id} href={`/payables/invoice/${inv._id}`} className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 transition hover:border-violet-200 hover:bg-violet-50">
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${over ? "bg-rose-100 text-rose-600" : urgent ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
                          {over ? "!" : days}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[#1d2226]">{inv.vendor ?? "Unknown vendor"}</p>
                          <p className={`text-xs ${over ? "font-semibold text-rose-500" : urgent ? "text-amber-500" : "text-gray-400"}`}>
                            {over ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `Due in ${days}d · ${fmtDate(inv.dueDate)}`}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-black text-[#1d2226]">{fmt(inv.total, inv.currency)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total liability */}
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
