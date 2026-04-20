"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

function ArrowLeftIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>;
}
function EditIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function CheckIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>;
}
function XIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function TrashIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function BuildingIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01"/></svg>;
}
function RefreshIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
}
function DollarIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}

interface LineItem { description: string; quantity?: number; unitPrice?: number; amount?: number; }

interface InvoiceFlag {
  type: "duplicate" | "new_vendor" | "amount_anomaly" | "missing_fields" | "overdue_risk";
  severity: "info" | "warning" | "critical";
  message: string;
  relatedInvoiceId?: string;
}

interface Invoice {
  _id: string;
  source: "upload" | "gmail";
  status: string;
  vendor?: string;
  vendorEmail?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  lineItems?: LineItem[];
  notes?: string;
  confidence?: number;
  originalFileName?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  paidAt?: string;
  paymentAmount?: number;
  createdAt: string;
  flags?: InvoiceFlag[];
  isNewVendor?: boolean;
  analysedAt?: string;
  hasDocument?: boolean;
  originalMimeType?: string;
  assignedApproverEmail?: string;
  assignedApproverName?: string;
  approvalRuleName?: string;
  approvedBy?: string;
  comments?: Array<{ id: string; body: string; authorEmail?: string; createdAt: string }>;
  auditLogs?: Array<{ _id: string; action: string; actorEmail?: string; createdAt: string; details?: Record<string, unknown> }>;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  processing:       { label: "Processing",       color: "bg-amber-50 text-amber-700 border-amber-100" },
  extracted:        { label: "Ready for Review",  color: "bg-blue-50 text-blue-700 border-blue-100" },
  pending_approval: { label: "Pending Approval",  color: "bg-violet-50 text-violet-700 border-violet-100" },
  approved:         { label: "Approved",          color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  rejected:         { label: "Rejected",          color: "bg-rose-50 text-rose-700 border-rose-100" },
  paid:             { label: "Paid",              color: "bg-teal-50 text-teal-700 border-teal-100" },
};

const FLAG_CONFIG = {
  duplicate:       { label: "Duplicate Invoice",    icon: "⚠️", bg: "bg-red-50 border-red-200",    text: "text-red-800",   badge: "bg-red-100 text-red-700" },
  new_vendor:      { label: "New Vendor",           icon: "👤", bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-700" },
  amount_anomaly:  { label: "Unusual Amount",       icon: "💰", bg: "bg-orange-50 border-orange-200", text: "text-orange-800", badge: "bg-orange-100 text-orange-700" },
  missing_fields:  { label: "Missing Information",  icon: "📋", bg: "bg-blue-50 border-blue-200",    text: "text-blue-800",  badge: "bg-blue-100 text-blue-700" },
  overdue_risk:    { label: "Overdue Risk",         icon: "⏰", bg: "bg-red-50 border-red-200",      text: "text-red-800",   badge: "bg-red-100 text-red-700" },
};

function fmt(n?: number, currency = "USD") {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}
function fmtDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

export default function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Invoice>>({});
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
  const [comment, setComment] = useState("");
  const [commenting, setCommenting] = useState(false);

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

  const fetchInvoice = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${BACKEND}/payables/invoices/${id}`, {
        headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid },
      });
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setInvoice(data);
      setEditData(data);
    } catch { router.push("/payables/dashboard"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchInvoice(); }, [user, id]); // eslint-disable-line

  useEffect(() => {
    if (!user || !invoice?.hasDocument) return;
    let objectUrl = "";
    fetch(`${BACKEND}/payables/invoices/${id}/document`, {
      headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid },
    })
      .then((res) => res.ok ? res.blob() : null)
      .then((blob) => {
        if (!blob) return;
        objectUrl = URL.createObjectURL(blob);
        setDocumentUrl(objectUrl);
      })
      .catch(() => setDocumentUrl(""));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [user, invoice?.hasDocument, id]);

  const save = async () => {
    if (!user || !invoice) return;
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/payables/invoices/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid, "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Save failed");
      setInvoice(await res.json());
      setEditing(false);
    } catch {} finally { setSaving(false); }
  };

  const approve = async () => {
    if (!user || !invoice) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND}/payables/invoices/${id}/approve`, {
        method: "POST", headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid },
      });
      setInvoice(await res.json());
    } finally { setActionLoading(false); }
  };

  const reject = async () => {
    if (!user || !invoice) return;
    setActionLoading(true);
    try {
      await fetch(`${BACKEND}/payables/invoices/${id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      await fetchInvoice();
      setShowRejectModal(false);
    } finally { setActionLoading(false); }
  };

  const markPaid = async () => {
    if (!user || !invoice) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND}/payables/invoices/${id}/paid`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid, "Content-Type": "application/json" },
        body: JSON.stringify({ paymentAmount: parseFloat(paymentAmount) || invoice.total }),
      });
      setInvoice(await res.json());
      setShowPaidModal(false);
    } finally { setActionLoading(false); }
  };

  const reAnalyze = async () => {
    if (!user || !invoice) return;
    setAnalysing(true);
    try {
      const res = await fetch(`${BACKEND}/payables/invoices/${id}/analyze`, {
        method: "POST", headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid },
      });
      setInvoice(await res.json());
    } finally { setAnalysing(false); }
  };

  const addComment = async () => {
    if (!user || !comment.trim()) return;
    setCommenting(true);
    try {
      const res = await fetch(`${BACKEND}/payables/invoices/${id}/comments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid, "Content-Type": "application/json" },
        body: JSON.stringify({ body: comment }),
      });
      if (res.ok) {
        setInvoice(await res.json());
        setComment("");
      }
    } finally {
      setCommenting(false);
    }
  };

  const deleteInvoice = async () => {
    if (!user || !confirm("Delete this invoice? This cannot be undone.")) return;
    await fetch(`${BACKEND}/payables/invoices/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${user.token}`, "x-uid": user.uid },
    });
    router.push("/payables/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" />
      </div>
    );
  }
  if (!invoice) return null;

  const cfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.processing;
  const canApprove = ["extracted", "pending_approval"].includes(invoice.status);
  const canReject = ["extracted", "pending_approval", "approved"].includes(invoice.status);
  const canMarkPaid = invoice.status === "approved";
  const criticalFlags = invoice.flags?.filter((f) => f.severity === "critical") ?? [];
  const warningFlags = invoice.flags?.filter((f) => f.severity === "warning") ?? [];
  const infoFlags = invoice.flags?.filter((f) => f.severity === "info") ?? [];
  const allFlags = [...criticalFlags, ...warningFlags, ...infoFlags];

  const field = (label: string, val?: string | number, className = "") => (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1d2226]">{val ?? "—"}</p>
    </div>
  );

  const editField = (label: string, key: keyof Invoice, type: "text" | "number" | "date" = "text") => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      <input
        type={type}
        value={(editData[key] as string | number) ?? ""}
        onChange={(e) => setEditData((d) => ({ ...d, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#1d2226] outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/payables/dashboard" className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1d2226]">
              <ArrowLeftIcon className="h-4 w-4" /> Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reAnalyze}
              disabled={analysing}
              title="Re-run AI analysis"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 disabled:opacity-50"
            >
              <RefreshIcon className={`h-3.5 w-3.5 ${analysing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{analysing ? "Analysing…" : "Re-analyze"}</span>
            </button>
            {!editing && (
              <button
                onClick={() => { setEditing(true); setEditData(invoice); }}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300"
              >
                <EditIcon className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            <button
              onClick={deleteInvoice}
              className="flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-100"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header card */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">
                  {invoice.vendor ?? "Unknown Vendor"}
                </h1>
                {invoice.isNewVendor && (
                  <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-700">New Vendor</span>
                )}
              </div>
              {invoice.invoiceNumber && (
                <p className="mt-1 text-sm text-gray-400">Invoice #{invoice.invoiceNumber}</p>
              )}
              {invoice.vendor && (
                <Link
                  href={`/payables/vendors/${encodeURIComponent(invoice.vendor)}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline"
                >
                  <BuildingIcon className="h-3.5 w-3.5" />
                  View vendor history
                </Link>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`rounded-full border px-3 py-1.5 text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
              <span className="text-3xl font-black text-[#1d2226]">{fmt(invoice.total, invoice.currency)}</span>
            </div>
          </div>

          {/* Confidence bar */}
          {invoice.confidence != null && (
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">AI extraction confidence</span>
                <span className="text-xs font-bold text-gray-600">{Math.round(invoice.confidence * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${invoice.confidence > 0.8 ? "bg-emerald-400" : invoice.confidence > 0.5 ? "bg-amber-400" : "bg-rose-400"}`}
                  style={{ width: `${invoice.confidence * 100}%` }}
                />
              </div>
              {invoice.confidence < 0.7 && (
                <p className="mt-1.5 text-xs text-amber-600">Low confidence — please verify the details carefully.</p>
              )}
            </div>
          )}
        </div>

        {/* ─── AI Intelligence Flags Panel ─── */}
        {allFlags.length > 0 && (
          <div className="mb-6 rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-orange-50 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-sm">🤖</div>
                <h2 className="text-sm font-black text-orange-900">AI Intelligence Report</h2>
                <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs font-bold text-orange-800">
                  {allFlags.length} flag{allFlags.length !== 1 ? "s" : ""}
                </span>
              </div>
              {invoice.analysedAt && (
                <span className="text-xs text-orange-500">
                  Analysed {new Date(invoice.analysedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            <div className="divide-y divide-orange-50">
              {allFlags.map((flag, i) => {
                const config = FLAG_CONFIG[flag.type] ?? { label: flag.type, icon: "⚡", bg: "bg-gray-50 border-gray-200", text: "text-gray-800", badge: "bg-gray-100 text-gray-700" };
                const severityColors = {
                  critical: "text-red-600 bg-red-50",
                  warning: "text-orange-600 bg-orange-50",
                  info: "text-blue-600 bg-blue-50",
                };
                return (
                  <div key={i} className={`px-5 py-4 ${flag.severity === "critical" ? "bg-red-50/50" : flag.severity === "warning" ? "bg-orange-50/30" : ""}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg leading-none mt-0.5">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-[#1d2226]">{config.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${severityColors[flag.severity]}`}>
                            {flag.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{flag.message}</p>
                        {flag.relatedInvoiceId && (
                          <Link
                            href={`/payables/invoice/${flag.relatedInvoiceId}`}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:underline"
                          >
                            → View related invoice
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left: details */}
          <div className="space-y-6">
            {invoice.hasDocument && (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">Original Document</h2>
                  {invoice.originalFileName && <span className="max-w-[220px] truncate text-xs font-semibold text-gray-400">{invoice.originalFileName}</span>}
                </div>
                <div className="bg-gray-50 p-3">
                  {documentUrl ? (
                    invoice.originalMimeType?.startsWith("image/") ? (
                      <img src={documentUrl} alt="Original invoice document" className="max-h-[520px] w-full rounded-xl object-contain" />
                    ) : (
                      <iframe src={documentUrl} title="Original invoice document" className="h-[520px] w-full rounded-xl bg-white" />
                    )
                  ) : (
                    <div className="flex h-52 items-center justify-center text-sm text-gray-400">Loading document preview…</div>
                  )}
                </div>
              </div>
            )}

            {/* Invoice details */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-gray-400">Invoice Details</h2>
              {editing ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {editField("Vendor", "vendor")}
                  {editField("Vendor Email", "vendorEmail")}
                  {editField("Invoice Number", "invoiceNumber")}
                  {editField("Invoice Date", "invoiceDate", "date")}
                  {editField("Due Date", "dueDate", "date")}
                  {editField("Currency", "currency")}
                  {editField("Subtotal", "subtotal", "number")}
                  {editField("Tax", "tax", "number")}
                  {editField("Total", "total", "number")}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {field("Vendor", invoice.vendor)}
                  {field("Vendor Email", invoice.vendorEmail)}
                  {field("Invoice Number", invoice.invoiceNumber)}
                  {field("Invoice Date", fmtDate(invoice.invoiceDate))}
                  {field("Due Date", fmtDate(invoice.dueDate))}
                  {field("Currency", invoice.currency)}
                  {field("Subtotal", fmt(invoice.subtotal, invoice.currency))}
                  {field("Tax", fmt(invoice.tax, invoice.currency))}
                  {field("Total", fmt(invoice.total, invoice.currency))}
                  {field("Approver", invoice.assignedApproverName || invoice.assignedApproverEmail)}
                  {field("Approval Rule", invoice.approvalRuleName)}
                </div>
              )}

              {invoice.notes && !editing && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Payment Terms / Notes</p>
                  <p className="mt-1 text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}

              {editing && (
                <div className="mt-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Notes</label>
                  <textarea
                    value={(editData.notes as string) ?? ""}
                    onChange={(e) => setEditData((d) => ({ ...d, notes: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#1d2226] outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              )}

              {editing && (
                <div className="mt-5 flex gap-3">
                  <button onClick={save} disabled={saving} className="rounded-full bg-[#1d2226] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d3238] disabled:opacity-50">
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button onClick={() => setEditing(false)} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300">
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Line items */}
            {invoice.lineItems && invoice.lineItems.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-400">Line Items</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <th className="pb-3 text-left">Description</th>
                        <th className="pb-3 text-right">Qty</th>
                        <th className="pb-3 text-right">Unit Price</th>
                        <th className="pb-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoice.lineItems.map((item, i) => (
                        <tr key={i}>
                          <td className="py-3 text-[#1d2226]">{item.description}</td>
                          <td className="py-3 text-right text-gray-500">{item.quantity ?? "—"}</td>
                          <td className="py-3 text-right text-gray-500">{fmt(item.unitPrice, invoice.currency)}</td>
                          <td className="py-3 text-right font-semibold text-[#1d2226]">{fmt(item.amount, invoice.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200">
                        <td colSpan={3} className="pt-3 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Total</td>
                        <td className="pt-3 text-right text-base font-black text-[#1d2226]">{fmt(invoice.total, invoice.currency)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right: actions */}
          <div className="space-y-4">
            {/* Actions panel */}
            {!["rejected", "paid"].includes(invoice.status) && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-400">Actions</h2>
                <div className="space-y-3">
                  {canApprove && (
                    <button
                      onClick={approve}
                      disabled={actionLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckIcon className="h-4 w-4" /> Approve Invoice
                    </button>
                  )}
                  {canMarkPaid && (
                    <button
                      onClick={() => { setPaymentAmount(String(invoice.total ?? "")); setShowPaidModal(true); }}
                      disabled={actionLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
                    >
                      <DollarIcon className="h-4 w-4" /> Mark as Paid
                    </button>
                  )}
                  {canReject && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                    >
                      <XIcon className="h-4 w-4" /> Reject Invoice
                    </button>
                  )}
                </div>
                {criticalFlags.length > 0 && (
                  <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-100">
                    ⚠️ This invoice has {criticalFlags.length} critical flag{criticalFlags.length !== 1 ? "s" : ""}. Review carefully before approving.
                  </p>
                )}
                {criticalFlags.length === 0 && (
                  <p className="mt-4 text-xs text-gray-400">Once approved, this invoice moves to your payment queue.</p>
                )}
              </div>
            )}

            {/* Status summary */}
            {invoice.status === "approved" && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-sm font-bold text-emerald-700">This invoice has been approved.</p>
                {invoice.approvedAt && <p className="mt-1 text-xs text-gray-500">on {fmtDate(invoice.approvedAt)}</p>}
                {invoice.approvedBy && <p className="mt-1 text-xs text-gray-500">by {invoice.approvedBy}</p>}
                <p className="mt-3 text-xs text-emerald-700">
                  Payment of <strong>{fmt(invoice.total, invoice.currency)}</strong> is due {fmtDate(invoice.dueDate)}.
                </p>
              </div>
            )}
            {invoice.status === "rejected" && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                <p className="text-sm font-bold text-rose-700">This invoice was rejected.</p>
                {invoice.rejectedAt && <p className="mt-1 text-xs text-gray-500">on {fmtDate(invoice.rejectedAt)}</p>}
                {invoice.rejectionReason && <p className="mt-2 text-xs text-gray-500">Reason: {invoice.rejectionReason}</p>}
              </div>
            )}
            {invoice.status === "paid" && (
              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
                <p className="text-sm font-bold text-teal-700">Payment confirmed</p>
                {invoice.paidAt && <p className="mt-1 text-xs text-gray-500">Paid on {fmtDate(invoice.paidAt)}</p>}
                {invoice.paymentAmount && (
                  <p className="mt-1 text-xs text-teal-700">Amount: <strong>{fmt(invoice.paymentAmount, invoice.currency)}</strong></p>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-gray-400">Metadata</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-400">Source</dt>
                  <dd className="text-sm font-semibold text-[#1d2226] capitalize">{invoice.source === "gmail" ? "Gmail import" : "Manual upload"}</dd>
                </div>
                {invoice.originalFileName && (
                  <div>
                    <dt className="text-xs text-gray-400">File name</dt>
                    <dd className="break-all text-sm font-semibold text-[#1d2226]">{invoice.originalFileName}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-400">Added on</dt>
                  <dd className="text-sm font-semibold text-[#1d2226]">{fmtDate(invoice.createdAt)}</dd>
                </div>
                {invoice.analysedAt && (
                  <div>
                    <dt className="text-xs text-gray-400">AI analysed</dt>
                    <dd className="text-sm font-semibold text-[#1d2226]">{fmtDate(invoice.analysedAt)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-400">AI Flags</dt>
                  <dd className={`text-sm font-semibold ${allFlags.length > 0 ? (criticalFlags.length > 0 ? "text-red-600" : "text-orange-500") : "text-emerald-600"}`}>
                    {allFlags.length > 0 ? `${allFlags.length} flag${allFlags.length !== 1 ? "s" : ""} detected` : "No flags — looks clean"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-gray-400">Comments</h2>
              <div className="space-y-3">
                {(invoice.comments ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400">No comments yet.</p>
                ) : (
                  [...(invoice.comments ?? [])].reverse().map((c) => (
                    <div key={c.id} className="rounded-xl bg-gray-50 p-3">
                      <p className="text-sm text-[#1d2226]">{c.body}</p>
                      <p className="mt-1 text-xs text-gray-400">{c.authorEmail || "Team member"} · {fmtDate(c.createdAt)}</p>
                    </div>
                  ))
                )}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add an internal note for your team…"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <button onClick={addComment} disabled={commenting || !comment.trim()} className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                  {commenting ? "Posting…" : "Add comment"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-gray-400">Audit Trail</h2>
              {(invoice.auditLogs ?? []).length === 0 ? (
                <p className="text-sm text-gray-400">No activity recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {(invoice.auditLogs ?? []).map((log) => (
                    <div key={log._id} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-violet-500" />
                      <div>
                        <p className="text-sm font-semibold capitalize text-[#1d2226]">{log.action.replaceAll("_", " ")}</p>
                        <p className="text-xs text-gray-400">{log.actorEmail || "System"} · {fmtDate(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black text-[#1d2226]">Reject Invoice</h3>
            <p className="mt-1 text-sm text-gray-500">Optionally explain why you're rejecting this invoice.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate invoice, incorrect amount…"
              rows={3}
              className="mt-4 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={reject} disabled={actionLoading} className="flex-1 rounded-full bg-rose-600 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-50">
                {actionLoading ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button onClick={() => setShowRejectModal(false)} className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid modal */}
      {showPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black text-[#1d2226]">Mark as Paid</h3>
            <p className="mt-1 text-sm text-gray-500">Confirm the payment amount to mark this invoice as paid.</p>
            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Payment Amount ({invoice.currency ?? "USD"})</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={markPaid} disabled={actionLoading} className="flex-1 rounded-full bg-teal-600 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-50">
                {actionLoading ? "Saving…" : "Confirm Payment"}
              </button>
              <button onClick={() => setShowPaidModal(false)} className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
