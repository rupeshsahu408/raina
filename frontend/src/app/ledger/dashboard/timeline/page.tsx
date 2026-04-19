"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLedgerAuth } from "@/contexts/LedgerAuthContext";
import {
  defaultLedgerProfile,
  formatCommodityName,
  formatLedgerCurrency,
  formatLedgerQuantity,
  ledgerLabel,
  type LedgerBusinessProfile,
} from "@/lib/ledgerPersonalization";

type BusinessCommodity = {
  key: string;
  name: string;
  totalQuantity: number;
  totalAmount: number;
  entryCount: number;
};

type BusinessPeriod = {
  key: string;
  label: string;
  sessionCount: number;
  totalEntries: number;
  totalQuantity: number;
  totalAmount: number;
  commodities: BusinessCommodity[];
};

type BusinessSummary = {
  daily: BusinessPeriod[];
  monthly: BusinessPeriod[];
  yearly: BusinessPeriod[];
};

function ArrowLeftIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
}

function TrendingUpIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
}

function CalendarIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>;
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-[1.5rem] border bg-white p-4 shadow-sm ${tone}`}>
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#1d2226]">{value}</p>
    </div>
  );
}

export default function BusinessSummaryTimelinePage() {
  const { user, loading } = useLedgerAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<LedgerBusinessProfile>(defaultLedgerProfile);
  const [summary, setSummary] = useState<BusinessSummary>({ daily: [], monthly: [], yearly: [] });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/ledger/login");
  }, [user, loading, router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setSummaryLoading(true);
    try {
      const token = await user.getIdToken();
      const [profileRes, summaryRes] = await Promise.all([
        fetch("/backend/ledger/profile", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/backend/ledger/business-summary", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile({
          ...defaultLedgerProfile,
          ...(profileData.profile || {}),
          preferences: {
            ...defaultLedgerProfile.preferences,
            ...(profileData.profile?.preferences || {}),
          },
        });
      }
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary({
          daily: summaryData.daily || [],
          monthly: summaryData.monthly || [],
          yearly: summaryData.yearly || [],
        });
      }
    } finally {
      setSummaryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !loading) loadData();
  }, [user, loading, loadData]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f8f5]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-100 border-t-[#123f31]" />
      </div>
    );
  }

  const displayMoney = (amount: number) => formatLedgerCurrency(amount, profile);
  const displayQty = (quantity: number) => formatLedgerQuantity(quantity, profile);
  const displayCommodity = (name: string) => formatCommodityName(name, profile);
  const textFor = (key: Parameters<typeof ledgerLabel>[0]) => ledgerLabel(key, profile);
  const topYear = summary.yearly[0];
  const topMonth = summary.monthly[0];
  const topDay = summary.daily[0];

  return (
    <div className="min-h-screen bg-[#f4f8f5]">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/ledger/dashboard" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#123f31] shadow-sm ring-1 ring-emerald-100">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to dashboard
          </Link>
          <button onClick={loadData} disabled={summaryLoading} className="w-fit rounded-full bg-[#123f31] px-5 py-2 text-sm font-black text-white disabled:opacity-60">
            {summaryLoading ? "Refreshing…" : "Refresh timeline"}
          </button>
        </div>

        <section className="rounded-[2rem] bg-[#123f31] p-5 text-white shadow-sm sm:p-8">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.26em] text-emerald-100">Business Summary Timeline</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{textFor("businessSummary")}</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-emerald-50 sm:text-base">
            Smart Ledger now shows your performance as a separate timeline page: each daily satti upload rolls into monthly totals, and monthly totals roll into yearly business performance.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <MetricCard label="Latest day" value={topDay ? displayMoney(topDay.totalAmount) : "₹0"} tone="border-emerald-100" />
          <MetricCard label="Latest month" value={topMonth ? displayMoney(topMonth.totalAmount) : "₹0"} tone="border-blue-100" />
          <MetricCard label="Latest year" value={topYear ? displayMoney(topYear.totalAmount) : "₹0"} tone="border-purple-100" />
        </section>

        {summary.daily.length === 0 && !summaryLoading ? (
          <section className="mt-6 rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-emerald-100">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CalendarIcon className="h-7 w-7" />
            </div>
            <p className="text-lg font-black text-[#1d2226]">No business summary yet</p>
            <p className="mt-1 text-sm font-medium text-gray-500">Upload sattis from the dashboard and this timeline will fill automatically.</p>
          </section>
        ) : (
          <section className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-5">
              <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                    <TrendingUpIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Rollup flow</p>
                    <p className="text-sm font-bold text-slate-500">Daily → Monthly → Yearly</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { title: "Daily entries", count: summary.daily.length, color: "bg-emerald-500" },
                    { title: "Monthly summaries", count: summary.monthly.length, color: "bg-blue-500" },
                    { title: "Yearly summaries", count: summary.yearly.length, color: "bg-purple-500" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                      <span className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="flex-1 text-sm font-black text-[#1d2226]">{item.title}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-purple-100">
                <p className="text-xs font-black uppercase tracking-wider text-purple-700">{textFor("yearlySummary")}</p>
                <div className="mt-4 space-y-3">
                  {summary.yearly.map((year) => (
                    <div key={year.key} className="rounded-2xl bg-purple-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-2xl font-black text-[#1d2226]">{year.label}</p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-purple-700">{year.totalEntries} entries</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-bold text-gray-400">{textFor("totalQuantity")}</p>
                          <p className="font-black text-purple-700">{displayQty(year.totalQuantity)}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-bold text-gray-400">{textFor("totalPayment")}</p>
                          <p className="font-black text-purple-700">{displayMoney(year.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-blue-100">
                <p className="text-xs font-black uppercase tracking-wider text-blue-700">{textFor("monthlySummary")}</p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100">
                  <div className="grid grid-cols-4 bg-blue-50 px-4 py-3 text-xs font-black uppercase tracking-wider text-blue-700">
                    <span>Month</span>
                    <span className="text-right">Uploads</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {summary.monthly.map((month) => (
                    <div key={month.key} className="grid grid-cols-4 items-center border-t border-blue-50 px-4 py-3 text-sm">
                      <span className="font-black text-[#1d2226]">{month.label}</span>
                      <span className="text-right font-semibold text-gray-500">{month.sessionCount}</span>
                      <span className="text-right font-semibold text-gray-500">{displayQty(month.totalQuantity)}</span>
                      <span className="text-right font-black text-blue-700">{displayMoney(month.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-emerald-100">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-700">{textFor("dailyEntries")}</p>
                <div className="mt-4 space-y-3">
                  {summary.daily.slice(0, 12).map((day) => (
                    <div key={day.key} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-[#1d2226]">{day.label}</p>
                          <p className="text-xs font-semibold text-gray-400">{day.sessionCount} uploads · {day.totalEntries} entries</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">{displayQty(day.totalQuantity)}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">{displayMoney(day.totalAmount)}</span>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {day.commodities.slice(0, 6).map((commodity) => (
                          <div key={commodity.key} className="rounded-xl bg-white px-3 py-2">
                            <p className="truncate text-xs font-black text-[#1d2226]">{displayCommodity(commodity.name)}</p>
                            <p className="text-xs font-semibold text-gray-400">{displayQty(commodity.totalQuantity)}</p>
                            <p className="text-xs font-black text-emerald-700">{displayMoney(commodity.totalAmount)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}