"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface CategoryData { count: number; unread: number; }
interface OverviewData {
  total: number;
  categories: Record<string, CategoryData>;
}

const CATEGORIES = [
  { id: "primary",    label: "Primary",          icon: "✉️",  color: "from-violet-500 to-violet-600", bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  { id: "updates",    label: "Updates",           icon: "🔔",  color: "from-blue-500 to-blue-600",     bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700" },
  { id: "promotions", label: "Promotions",        icon: "🏷️",  color: "from-amber-500 to-amber-600",   bg: "bg-amber-50",  border: "border-amber-100",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700" },
  { id: "social",     label: "Social",            icon: "👥",  color: "from-pink-500 to-pink-600",     bg: "bg-pink-50",   border: "border-pink-100",   text: "text-pink-700",   badge: "bg-pink-100 text-pink-700" },
  { id: "starred",    label: "Starred",           icon: "⭐",  color: "from-yellow-500 to-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" },
  { id: "sent",       label: "Sent",              icon: "📤",  color: "from-emerald-500 to-emerald-600",bg:"bg-emerald-50",border: "border-emerald-100",text: "text-emerald-700",badge: "bg-emerald-100 text-emerald-700" },
  { id: "drafts",     label: "Drafts",            icon: "📝",  color: "from-slate-500 to-slate-600",   bg: "bg-slate-50",  border: "border-slate-100",  text: "text-slate-700",  badge: "bg-slate-100 text-slate-700" },
  { id: "archive",    label: "Archive",           icon: "🗃️",  color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
  { id: "spam",       label: "Spam",              icon: "🚫",  color: "from-red-500 to-red-600",       bg: "bg-red-50",    border: "border-red-100",    text: "text-red-700",    badge: "bg-red-100 text-red-700" },
  { id: "trash",      label: "Trash",             icon: "🗑️",  color: "from-gray-500 to-gray-600",     bg: "bg-gray-50",   border: "border-gray-200",   text: "text-gray-600",   badge: "bg-gray-100 text-gray-600" },
  { id: "waiting",    label: "Waiting for Reply", icon: "⏳",  color: "from-orange-500 to-orange-600", bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  { id: "hot",        label: "Hot Leads",         icon: "🔥",  color: "from-rose-500 to-rose-600",     bg: "bg-rose-50",   border: "border-rose-100",   text: "text-rose-700",   badge: "bg-rose-100 text-rose-700" },
  { id: "warm",       label: "Warm Leads",        icon: "🌤️",  color: "from-orange-400 to-orange-500", bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-600", badge: "bg-orange-100 text-orange-600" },
  { id: "cold",       label: "Cold Leads",        icon: "❄️",  color: "from-sky-500 to-sky-600",       bg: "bg-sky-50",    border: "border-sky-100",    text: "text-sky-700",    badge: "bg-sky-100 text-sky-700" },
];

function BackIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>; }
function SearchIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function RefreshIcon({ spinning }: { spinning?: boolean }) { return <svg className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>; }
function ChevronRightIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>; }

export default function ExploreOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u); setAuthReady(true);
      if (!u) router.replace("/inbox");
    });
    return unsub;
  }, [router]);

  const fetchOverview = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API}/inbox/explore/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } catch {}
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (authReady && user) fetchOverview();
  }, [authReady, user, fetchOverview]);

  const filtered = CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/inbox/analyze" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition text-sm font-medium">
          <BackIcon />
          Analyze
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-gray-800">Email Universe</span>
        <div className="ml-auto">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 border border-gray-200 transition disabled:opacity-50"
          >
            <RefreshIcon spinning={loading} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero total */}
        <div className="mb-8 text-center">
          <div className="inline-flex flex-col items-center gap-2 rounded-[2rem] border border-violet-100 bg-white px-12 py-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Total Emails</p>
            {loading && !data ? (
              <div className="h-16 w-32 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <span className="text-7xl font-black text-gray-900 tabular-nums">
                {data?.total?.toLocaleString() ?? "—"}
              </span>
            )}
            <p className="text-sm text-gray-400 font-medium">across all folders · deduplicated</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          />
        </div>

        {/* Category grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(cat => {
            const catData = data?.categories[cat.id];
            const count = catData?.count ?? 0;
            const unread = catData?.unread ?? 0;
            return (
              <Link
                key={cat.id}
                href={`/inbox/analyze/explore/${cat.id}`}
                className={`group flex items-center gap-4 rounded-2xl border ${cat.border} ${cat.bg} px-5 py-4 transition hover:shadow-md hover:-translate-y-0.5 duration-200`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-xl shadow-sm`}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-bold ${cat.text}`}>{cat.label}</p>
                    {unread > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${cat.badge}`}>
                        {unread} unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {loading && !data ? (
                      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl font-black text-gray-800 tabular-nums">
                        {count.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 font-medium">emails</p>
                  </div>
                </div>
                <div className={`shrink-0 ${cat.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <ChevronRightIcon />
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            No categories match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
