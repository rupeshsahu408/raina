"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";
import { onAuthStateChanged } from "firebase/auth";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ─── Icons ─── */
const ArrowLeft = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
  </svg>
);
const CheckCircle2 = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
const Clock = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const XCircle = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>
);
const AlertTriangle = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);
const FileText = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const TrendingUp = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const Calendar = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);
const ExternalLink = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
  </svg>
);

interface Invoice {
  _id: string;
  vendor: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  total?: number;
  currency?: string;
  status: string;
  createdAt: string;
  flags?: Array<{ type: string; severity: string; message: string }>;
}

const statusConfig: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  processing:       { label: "Processing",      color: "bg-gray-100 text-gray-600",    Icon: Clock },
  extracted:        { label: "Extracted",        color: "bg-blue-50 text-blue-600",     Icon: FileText },
  pending_approval: { label: "Needs Review",     color: "bg-yellow-50 text-yellow-700", Icon: Clock },
  approved:         { label: "Approved",         color: "bg-violet-50 text-violet-700", Icon: CheckCircle2 },
  rejected:         { label: "Rejected",         color: "bg-red-50 text-red-700",       Icon: XCircle },
  paid:             { label: "Paid",             color: "bg-emerald-50 text-emerald-700", Icon: CheckCircle2 },
};

function formatCurrency(val?: number, currency = "USD") {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(val);
}
function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function daysUntil(d?: string) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

export default function VendorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vendorName = decodeURIComponent(params.vendor as string);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);

  const fetchInvoices = useCallback(async (currentUser: { uid: string; token: string }) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND}/payables/vendors/${encodeURIComponent(vendorName)}/invoices`,
        { headers: payablesHeaders(currentUser) }
      );
      const data = await res.json();
      setInvoices(data.invoices ?? []);
    } catch { setInvoices([]); }
    finally { setLoading(false); }
  }, [vendorName]);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) return;
      const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) { const currentUser = { uid: firebaseUser.uid, token: await firebaseUser.getIdToken() }; setUser(currentUser); fetchInvoices(currentUser); }
        else router.push("/payables/dashboard");
      });
      return () => unsub();
    } catch { router.push("/payables/dashboard"); }
  }, [router, fetchInvoices]);

  const totalSpend = invoices.reduce((s, i) => s + (i.total ?? 0), 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const flaggedCount = invoices.filter((i) => i.flags && i.flags.length > 0).length;
  const avgInvoice = invoices.length ? totalSpend / invoices.length : 0;
  const currency = invoices.find((i) => i.currency)?.currency ?? "USD";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/payables/vendors")} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {vendorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">{vendorName}</h1>
            <p className="text-xs text-gray-500">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Spend",  value: formatCurrency(totalSpend, currency), Icon: TrendingUp,   color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Avg Invoice",  value: formatCurrency(avgInvoice, currency),  Icon: FileText,     color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Paid",         value: paidCount,                             Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Flagged",      value: flaggedCount,                          Icon: AlertTriangle, color: flaggedCount > 0 ? "text-orange-500" : "text-gray-400", bg: flaggedCount > 0 ? "bg-orange-50" : "bg-gray-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <s.Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Invoice list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Invoice History</h2>
            <span className="text-xs text-gray-400">{invoices.length} total</span>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded w-32" />
                    <div className="h-3 bg-gray-50 rounded w-24" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No invoices from this vendor</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {invoices.map((inv) => {
                const cfg = statusConfig[inv.status] ?? statusConfig.processing;
                const StatusIcon = cfg.Icon;
                const days = daysUntil(inv.dueDate);
                const isOverdue = days !== null && days < 0 && !["paid", "rejected"].includes(inv.status);
                const isDueSoon = days !== null && days >= 0 && days <= 3 && !["paid", "approved", "rejected"].includes(inv.status);

                return (
                  <div key={inv._id} onClick={() => router.push(`/payables/invoice/${inv._id}`)} className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                        <StatusIcon className={`w-4 h-4 ${cfg.color.split(" ")[1]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">
                            {inv.invoiceNumber ? `#${inv.invoiceNumber}` : "No number"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                          {isOverdue && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Overdue</span>}
                          {isDueSoon && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Due soon</span>}
                          {inv.flags && inv.flags.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertTriangle className="w-3 h-3" />
                              {inv.flags.length} flag{inv.flags.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {inv.dueDate ? `Due ${formatDate(inv.dueDate)}` : `Added ${formatDate(inv.createdAt)}`}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-gray-900 text-sm">{formatCurrency(inv.total, inv.currency)}</div>
                        <ExternalLink className="w-3 h-3 text-gray-300 ml-auto mt-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
