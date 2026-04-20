"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ─── Inline Icons ─── */
const ArrowLeft = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>;
const Calendar = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>;
const Sparkles = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>;
const CheckCircle = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const AlertTriangle = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
const RefreshCw = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>;
const Banknote = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>;
const ChevronDown = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6" /></svg>;
const ChevronUp = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m18 15-6-6-6 6" /></svg>;
const ShieldAlert = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>;

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-violet-600" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ─── Types ─── */
interface SchedulerInvoice {
  id: string;
  vendor: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  dueDate: string | null;
  status: string;
  hasCriticalFlag: boolean;
  bankDetails: { bankName?: string; accountNumber?: string; ifscCode?: string } | null;
}

interface Bucket {
  key: string;
  label: string;
  color: "red" | "orange" | "yellow" | "blue" | "green" | "gray";
  invoices: SchedulerInvoice[];
  total: number;
}

interface SchedulerData {
  buckets: Bucket[];
  totalScheduled: number;
  totalInvoices: number;
  aiRecommendation: string;
  generatedAt: string;
}

/* ─── Helpers ─── */
function fmtAmt(n: number, currency = "INR") {
  const code = currency?.trim().toUpperCase() || "INR";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: code, minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toLocaleString("en-IN")}`;
  }
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const BUCKET_STYLES: Record<string, { bg: string; border: string; badge: string; badgeTxt: string; dot: string; headerBg: string; headerTxt: string }> = {
  red: { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100", badgeTxt: "text-rose-700", dot: "bg-rose-500", headerBg: "bg-rose-50", headerTxt: "text-rose-800" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100", badgeTxt: "text-orange-700", dot: "bg-orange-500", headerBg: "bg-orange-50", headerTxt: "text-orange-800" },
  yellow: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100", badgeTxt: "text-amber-700", dot: "bg-amber-500", headerBg: "bg-amber-50", headerTxt: "text-amber-800" },
  blue: { bg: "bg-blue-50", border: "border-blue-100", badge: "bg-blue-100", badgeTxt: "text-blue-700", dot: "bg-blue-500", headerBg: "bg-blue-50", headerTxt: "text-blue-800" },
  green: { bg: "bg-emerald-50", border: "border-emerald-100", badge: "bg-emerald-100", badgeTxt: "text-emerald-700", dot: "bg-emerald-500", headerBg: "bg-emerald-50", headerTxt: "text-emerald-800" },
  gray: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100", badgeTxt: "text-gray-600", dot: "bg-gray-400", headerBg: "bg-gray-50", headerTxt: "text-gray-700" },
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700" },
  pending_approval: { label: "Pending Approval", cls: "bg-amber-100 text-amber-700" },
  extracted: { label: "Extracted", cls: "bg-blue-100 text-blue-700" },
};

/* ─── Payment Ref Form ─── */
function PaymentRefForm({ inv, onConfirm, onCancel }: {
  inv: SchedulerInvoice;
  onConfirm: (data: { paidNote: string; paymentDate: string; paymentAmount: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState(String(inv.total));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onConfirm({ paidNote: ref.trim() || `Payment confirmed`, paymentDate: date, paymentAmount: parseFloat(amount) || inv.total });
    setSubmitting(false);
  };

  return (
    <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
      <p className="mb-3 text-xs font-black text-violet-800">Record Payment Details</p>
      <div className="space-y-2.5">
        <div>
          <label className="mb-1 block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">UTR / Reference No.</label>
          <input
            value={ref}
            onChange={e => setRef(e.target.value)}
            placeholder="e.g. UTR123456789"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1d2226] placeholder-gray-300 focus:border-violet-400 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Payment Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1d2226] focus:border-violet-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Amount Paid</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1d2226] focus:border-violet-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50">Cancel</button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {submitting ? <Spinner /> : <CheckCircle className="h-3.5 w-3.5" />}
          Confirm Payment
        </button>
      </div>
    </div>
  );
}

/* ─── Bucket Card ─── */
function BucketCard({ bucket, onMarkPaid }: { bucket: Bucket; onMarkPaid: (id: string, data: { paidNote: string; paymentDate: string; paymentAmount: number }) => Promise<void> }) {
  const [open, setOpen] = useState(bucket.key === "overdue" || bucket.key === "today");
  const [paying, setPaying] = useState<Record<string, boolean>>({});
  const [formOpen, setFormOpen] = useState<string | null>(null);
  const st = BUCKET_STYLES[bucket.color] ?? BUCKET_STYLES.gray;

  const handlePay = async (inv: SchedulerInvoice, data: { paidNote: string; paymentDate: string; paymentAmount: number }) => {
    setPaying(p => ({ ...p, [inv.id]: true }));
    setFormOpen(null);
    await onMarkPaid(inv.id, data);
    setPaying(p => ({ ...p, [inv.id]: false }));
  };

  return (
    <div className={`overflow-hidden rounded-2xl border ${st.border} bg-white shadow-sm`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex w-full items-center justify-between px-5 py-4 ${st.headerBg} transition`}
      >
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />
          <span className={`text-sm font-black ${st.headerTxt}`}>{bucket.label}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.badge} ${st.badgeTxt}`}>
            {bucket.invoices.length} invoice{bucket.invoices.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-black ${st.headerTxt}`}>{fmtAmt(bucket.total)}</span>
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="divide-y divide-gray-50">
          {bucket.invoices.map(inv => (
            <div key={inv.id} className={`px-5 py-4 ${inv.hasCriticalFlag ? "bg-rose-50/40" : "bg-white"}`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="truncate text-sm font-bold text-[#1d2226]">{inv.vendor}</span>
                    {inv.hasCriticalFlag && (
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                    )}
                  </div>
                  <span className="text-xs text-gray-400">#{inv.invoiceNumber}</span>
                </div>
                <span className="shrink-0 text-sm font-black text-[#1d2226]">{fmtAmt(inv.total, inv.currency)}</span>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                {inv.dueDate && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.badge} ${st.badgeTxt}`}>
                    <Calendar className="h-2.5 w-2.5" />
                    Due {fmtDate(inv.dueDate)}
                  </span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_LABELS[inv.status]?.cls ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[inv.status]?.label ?? inv.status}
                </span>
                {inv.bankDetails?.bankName && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                    <Banknote className="h-2.5 w-2.5" />
                    {inv.bankDetails.bankName}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/payables/invoice/${inv.id}`}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  View Invoice
                </Link>
                <button
                  onClick={() => setFormOpen(formOpen === inv.id ? null : inv.id)}
                  disabled={paying[inv.id]}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {paying[inv.id] ? <Spinner /> : <CheckCircle className="h-3.5 w-3.5" />}
                  Mark as Paid
                </button>
              </div>
              {formOpen === inv.id && (
                <PaymentRefForm
                  inv={inv}
                  onConfirm={(data) => handlePay(inv, data)}
                  onCancel={() => setFormOpen(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function SchedulerPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [data, setData] = useState<SchedulerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (u) { const token = await u.getIdToken(); setUser({ uid: u.uid, token }); }
        else { setUser(null); setAuthLoading(false); }
      });
      return unsub;
    } catch { setUser(null); setAuthLoading(false); return undefined; }
  }, []);

  const load = useCallback(async (u: { uid: string; token: string }) => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BACKEND}/payables/scheduler`, { headers: payablesHeaders(u) });
      if (!res.ok) throw new Error("Failed to load schedule");
      setData(await res.json());
    } catch (e: any) { setError(e.message ?? "Error loading schedule"); }
    finally { setLoading(false); setAuthLoading(false); }
  }, []);

  useEffect(() => { if (user) load(user); }, [user, load]);

  const handleMarkPaid = useCallback(async (invoiceId: string, paymentData?: { paidNote: string; paymentDate: string; paymentAmount: number }) => {
    if (!user) return;
    try {
      const paidInvoiceTotal = data?.buckets.flatMap(b => b.invoices).find(inv => inv.id === invoiceId)?.total ?? 0;
      const res = await fetch(`${BACKEND}/payables/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { ...payablesHeaders(user), "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          paidNote: paymentData?.paidNote ?? "Marked paid via Payment Scheduler",
          paymentDate: paymentData?.paymentDate,
          paymentAmount: paymentData?.paymentAmount ?? paidInvoiceTotal,
        }),
      });
      if (res.ok) {
        setPaidIds(prev => new Set([...prev, invoiceId]));
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            buckets: prev.buckets.map(b => ({
              ...b,
              invoices: b.invoices.filter(inv => inv.id !== invoiceId),
              total: b.total - (b.invoices.find(inv => inv.id === invoiceId)?.total ?? 0),
            })).filter(b => b.invoices.length > 0),
            totalInvoices: prev.totalInvoices - 1,
            totalScheduled: prev.totalScheduled - paidInvoiceTotal,
          };
        });
      }
    } catch { }
  }, [user, data]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb]">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <h2 className="text-xl font-black text-[#1d2226]">Sign in to access the Scheduler</h2>
        <Link href="/payables/login" className="rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-gray-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/payables/dashboard" className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[#1d2226]">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-sm font-black text-[#1d2226]">Payment Scheduler</h1>
              <p className="text-[10px] text-gray-400">AI-optimized payment plan</p>
            </div>
          </div>
          <button
            onClick={() => user && load(user)}
            disabled={loading}
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition hover:border-violet-300 hover:text-violet-600 disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        {loading && !data && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Spinner />
            <p className="text-sm text-gray-400">Building your optimized payment schedule…</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {data && (
          <>
            {/* ── Summary Hero ── */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 p-5 text-white shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-xl bg-white/15">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black">Payment Schedule</h2>
                  <p className="text-xs text-violet-200">
                    {new Date(data.generatedAt).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[10px] font-semibold text-violet-200 uppercase tracking-wide">Total Pending</p>
                  <p className="text-xl font-black">{fmtAmt(data.totalScheduled)}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[10px] font-semibold text-violet-200 uppercase tracking-wide">Invoices</p>
                  <p className="text-xl font-black">{data.totalInvoices}</p>
                  <p className="text-[10px] text-violet-300">{data.buckets.length} group{data.buckets.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Bucket bars */}
              <div className="space-y-1.5">
                {data.buckets.map(b => {
                  const pct = data.totalScheduled > 0 ? Math.round((b.total / data.totalScheduled) * 100) : 0;
                  return (
                    <div key={b.key} className="flex items-center gap-2">
                      <span className="w-20 shrink-0 truncate text-[10px] text-violet-200">{b.label.split(" (")[0]}</span>
                      <div className="flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-1.5 rounded-full bg-white/60 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-[10px] font-bold text-white">{fmtAmt(b.total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── AI Recommendation ── */}
            <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-violet-50 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-black text-[#1d2226]">AI Payment Recommendation</span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">Smart</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-[15px] leading-relaxed text-[#1d2226]">{data.aiRecommendation}</p>
              </div>
            </div>

            {/* ── Bucket Cards ── */}
            {data.buckets.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-center shadow-sm">
                <CheckCircle className="h-14 w-14 text-emerald-400" />
                <h3 className="text-lg font-black text-[#1d2226]">All Clear!</h3>
                <p className="text-sm text-gray-400">No pending invoices in the schedule.</p>
                <Link href="/payables/dashboard" className="mt-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white">Back to Dashboard</Link>
              </div>
            ) : (
              <>
                <p className="px-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Payment Groups — Sorted by Urgency</p>
                {data.buckets.map(b => (
                  <BucketCard key={b.key} bucket={b} onMarkPaid={handleMarkPaid} />
                ))}
              </>
            )}

            {/* ── Footer tip ── */}
            {data.buckets.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  Tap "Mark as Paid" on any invoice to remove it from the schedule. Invoices are grouped by urgency — start from the top to minimize late fees.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
