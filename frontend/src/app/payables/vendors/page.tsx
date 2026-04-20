"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";
import { onAuthStateChanged } from "firebase/auth";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ─── Icons ─── */
const Building2 = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01"/>
  </svg>
);
const TrendingUp = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const FileText = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
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
const AlertTriangle = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);
const ArrowLeft = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
  </svg>
);
const Search = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const ChevronRight = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const BarChart3 = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
  </svg>
);
const Star = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const Users = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const RefreshCw = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
  </svg>
);

interface VendorStat {
  _id: string;
  vendor: string;
  vendorEmail?: string;
  invoiceCount: number;
  totalSpend: number;
  avgInvoice: number;
  lastInvoiceDate: string;
  approvedCount: number;
  paidCount: number;
  pendingCount: number;
  currencies: string[];
  isNewVendor?: boolean;
}

function formatCurrency(val: number, currency?: string) {
  if (!val) return "—";
  const code = currency?.trim().toUpperCase();
  if (!code) return new Intl.NumberFormat("en-IN", { minimumFractionDigits: Number.isInteger(val) ? 0 : 2, maximumFractionDigits: 2 }).format(val);
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: code, minimumFractionDigits: Number.isInteger(val) ? 0 : 2, maximumFractionDigits: 2 }).format(val);
  } catch {
    return `${code} ${val.toLocaleString("en-IN")}`;
  }
}
function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
function trustScore(v: VendorStat): { score: number; label: string } {
  if (v.invoiceCount < 2) return { score: 0, label: "New" };
  const payRate = (v.paidCount + v.approvedCount) / v.invoiceCount;
  if (payRate >= 0.9) return { score: 3, label: "Trusted" };
  if (payRate >= 0.6) return { score: 2, label: "Good" };
  return { score: 1, label: "Review" };
}

function TrustBadge({ v }: { v: VendorStat }) {
  const t = trustScore(v);
  const styles: Record<string, string> = {
    New:     "bg-yellow-50 border-yellow-200 text-yellow-700",
    Trusted: "bg-emerald-50 border-emerald-200 text-emerald-700",
    Good:    "bg-blue-50 border-blue-200 text-blue-700",
    Review:  "bg-orange-50 border-orange-200 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[t.label] ?? styles.New}`}>
      <Star className="w-3 h-3" />
      {t.label}
    </span>
  );
}

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorStat[]>([]);
  const [filtered, setFiltered] = useState<VendorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"spend" | "count" | "recent">("spend");
  const [filter, setFilter] = useState<"all" | "new" | "trusted">("all");

  const fetchVendors = useCallback(async (currentUser: { uid: string; token: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/payables/vendors`, { headers: payablesHeaders(currentUser) });
      const data = await res.json();
      setVendors(data.vendors ?? []);
    } catch { setVendors([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) return;
      const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) { const currentUser = { uid: firebaseUser.uid, token: await firebaseUser.getIdToken() }; setUser(currentUser); fetchVendors(currentUser); }
        else router.push("/payables/dashboard");
      });
      return () => unsub();
    } catch { router.push("/payables/dashboard"); }
  }, [router, fetchVendors]);

  useEffect(() => {
    let result = [...vendors];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((v) => v.vendor?.toLowerCase().includes(q) || v.vendorEmail?.toLowerCase().includes(q));
    }
    if (filter === "new") result = result.filter((v) => v.isNewVendor);
    if (filter === "trusted") result = result.filter((v) => trustScore(v).score >= 2);
    result.sort((a, b) => {
      if (sortBy === "spend") return b.totalSpend - a.totalSpend;
      if (sortBy === "count") return b.invoiceCount - a.invoiceCount;
      return new Date(b.lastInvoiceDate).getTime() - new Date(a.lastInvoiceDate).getTime();
    });
    setFiltered(result);
  }, [vendors, search, sortBy, filter]);

  const totalSpend = vendors.reduce((s, v) => s + v.totalSpend, 0);
  const newVendors = vendors.filter((v) => v.isNewVendor).length;
  const trustedVendors = vendors.filter((v) => trustScore(v).score >= 2).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/payables/dashboard")} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 text-sm sm:text-base">Vendor Directory</h1>
                <p className="text-xs text-gray-500 hidden sm:block">All your suppliers in one place</p>
              </div>
            </div>
          </div>
          <button onClick={() => user && fetchVendors(user)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Vendors", value: vendors.length, Icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Total Spend", value: formatCurrency(totalSpend), Icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "New Vendors", value: newVendors, Icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Trusted", value: trustedVendors, Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "new", "trusted"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {f === "all" ? "All" : f === "new" ? "New Vendors" : "Trusted"}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
            >
              <option value="spend">Sort: Highest Spend</option>
              <option value="count">Sort: Most Invoices</option>
              <option value="recent">Sort: Most Recent</option>
            </select>
          </div>
        </div>

        {/* Vendor list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-40" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-medium">
              {search || filter !== "all" ? "No vendors match your filters" : "No vendors yet"}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {search || filter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload or import invoices to start building your vendor directory"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((v) => (
              <div
                key={v._id}
                onClick={() => router.push(`/payables/vendors/${encodeURIComponent(v.vendor)}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer p-4"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {v.vendor?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">{v.vendor}</span>
                      <TrustBadge v={v} />
                      {v.isNewVendor && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">New</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {v.vendorEmail && <span className="text-xs text-gray-500 truncate max-w-[160px]">{v.vendorEmail}</span>}
                      <span className="text-xs text-gray-400">Last invoice: {timeAgo(v.lastInvoiceDate)}</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 text-center">
                    <div><div className="text-sm font-bold text-gray-900">{v.invoiceCount}</div><div className="text-xs text-gray-400">Invoices</div></div>
                    <div><div className="text-sm font-bold text-gray-900">{formatCurrency(v.avgInvoice, v.currencies?.[0])}</div><div className="text-xs text-gray-400">Avg Invoice</div></div>
                    <div><div className="text-sm font-bold text-violet-600">{formatCurrency(v.totalSpend, v.currencies?.[0])}</div><div className="text-xs text-gray-400">Total Spend</div></div>
                  </div>

                  <div className="sm:hidden text-right flex-shrink-0">
                    <div className="text-sm font-bold text-violet-600">{formatCurrency(v.totalSpend, v.currencies?.[0])}</div>
                    <div className="text-xs text-gray-400">{v.invoiceCount} invoices</div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 hidden sm:block" />
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                  {v.paidCount > 0 && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" />{v.paidCount} paid</span>}
                  {v.approvedCount > 0 && <span className="flex items-center gap-1 text-blue-600"><BarChart3 className="w-3 h-3" />{v.approvedCount} approved</span>}
                  {v.pendingCount > 0 && <span className="flex items-center gap-1 text-yellow-600"><Clock className="w-3 h-3" />{v.pendingCount} pending</span>}
                  <div className="ml-auto">
                    <div className="flex rounded-full overflow-hidden h-1.5 w-24 bg-gray-100">
                      {v.invoiceCount > 0 && (
                        <>
                          <div className="bg-emerald-400 h-full" style={{ width: `${((v.paidCount + v.approvedCount) / v.invoiceCount) * 100}%` }} />
                          <div className="bg-yellow-300 h-full" style={{ width: `${(v.pendingCount / v.invoiceCount) * 100}%` }} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
