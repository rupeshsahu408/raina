"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLedgerAuth } from "@/contexts/LedgerAuthContext";

type Entry = {
  id: number;
  commodity: string;
  commodityKey: string;
  rate: number;
  quantity: number;
  unit: string;
  amount: number;
  uncertain: boolean;
  rawLine: string;
};

type GroupEntry = {
  displayName: string;
  entries: number[];
  totalQuantity: number;
  totalAmount: number;
  minRate: number;
  maxRate: number;
  avgRate: number;
  priceDistribution: { rate: number; quantity: number; percentage: number }[];
};

type SessionData = {
  rawText: string;
  entries: Entry[];
  grouped: Record<string, GroupEntry>;
  summary: {
    totalEntries: number;
    totalQuantity: number;
    totalAmount: number;
    commodityCount: number;
    topCommodity: string;
    processingNote: string;
  };
  meta: { processedAt: string; fileSizeKb: number };
};

function fmt(n: number) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function fmtQty(n: number, unit = "qtl") {
  return `${Number(n).toLocaleString("en-IN")} ${unit}`;
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  );
}

type Tab = "raw" | "grouped" | "summary";

export default function LedgerSession() {
  const { user, loading } = useLedgerAuth();
  const router = useRouter();
  const [data, setData] = useState<SessionData | null>(null);
  const [tab, setTab] = useState<Tab>("raw");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBuf, setEditBuf] = useState<Partial<Entry>>({});

  useEffect(() => {
    if (!loading && !user) { router.replace("/ledger/login"); return; }
    const raw = sessionStorage.getItem("ledger_session");
    if (!raw) { router.replace("/ledger/dashboard"); return; }
    try {
      const parsed: SessionData = JSON.parse(raw);
      setData(parsed);
      setEntries(parsed.entries || []);
    } catch {
      router.replace("/ledger/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditBuf({ rate: entry.rate, quantity: entry.quantity, commodity: entry.commodity });
  }

  function saveEdit(entryId: number) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== entryId) return e;
        const rate = Number(editBuf.rate ?? e.rate);
        const quantity = Number(editBuf.quantity ?? e.quantity);
        const amount = rate * quantity;
        return { ...e, rate, quantity, amount, commodity: editBuf.commodity ?? e.commodity, uncertain: false };
      })
    );
    setEditingId(null);
    setEditBuf({});
  }

  function cancelEdit() { setEditingId(null); setEditBuf({}); }

  const totalAmount = entries.reduce((s, e) => s + e.amount, 0);
  const totalQty = entries.reduce((s, e) => s + e.quantity, 0);

  const groupedLive: Record<string, { displayName: string; entries: Entry[]; totalQty: number; totalAmt: number; rates: number[] }> = {};
  for (const e of entries) {
    const key = e.commodityKey || e.commodity.toLowerCase().replace(/\s+/g, "_");
    if (!groupedLive[key]) groupedLive[key] = { displayName: e.commodity, entries: [], totalQty: 0, totalAmt: 0, rates: [] };
    groupedLive[key].entries.push(e);
    groupedLive[key].totalQty += e.quantity;
    groupedLive[key].totalAmt += e.amount;
    groupedLive[key].rates.push(e.rate);
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
      tab === t ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500 hover:text-[#1d2226] hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .afu { animation: fadeUp 0.4s ease-out forwards; }
        .entry-row { transition: background 0.15s; }
        .entry-row:hover { background: #f9fafb; }
      `}</style>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/ledger/dashboard")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <Link href="/ledger" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-black text-xs">SL</span>
              </div>
              <span className="font-bold text-[#1d2226] text-sm hidden sm:block">Smart Ledger</span>
            </Link>
          </div>
          <div className="text-xs text-gray-400">
            {new Date(data.meta.processedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            {" · "}{data.meta.fileSizeKb} KB
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Summary pills */}
        <div className="afu grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Value", val: fmt(totalAmount), color: "emerald" },
            { label: "Total Qty", val: fmtQty(totalQty), color: "blue" },
            { label: "Commodities", val: String(Object.keys(groupedLive).length), color: "violet" },
            { label: "Entries", val: String(entries.length), color: "gray" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="text-lg font-black text-[#1d2226]">{s.val}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="afu flex gap-2 mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 w-fit">
          <button className={tabClass("raw")} onClick={() => setTab("raw")}>🔵 Raw View</button>
          <button className={tabClass("grouped")} onClick={() => setTab("grouped")}>🟢 Grouped</button>
          <button className={tabClass("summary")} onClick={() => setTab("summary")}>📊 Summary</button>
        </div>

        {/* ── RAW VIEW ── */}
        {tab === "raw" && (
          <div className="afu space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className="font-bold text-[#1d2226]">Raw Extracted Data</h2>
              <span className="text-xs text-gray-400 ml-auto">Exact extraction · editable</span>
            </div>

            {/* Raw OCR text */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Original OCR text</p>
              <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-48 overflow-y-auto">
                {data.rawText || "No text extracted"}
              </pre>
            </div>

            {/* Entry table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Parsed entries</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />High confidence</span>
                  <span className="flex items-center gap-1 text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Review</span>
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No entries could be parsed from this image.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">Commodity</div>
                    <div className="col-span-2 text-right">Rate/qtl</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>

                  {entries.map((entry) => (
                    <div key={entry.id} className="entry-row px-5 py-3">
                      {editingId === entry.id ? (
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-1 text-xs text-gray-300">{entry.id}</div>
                          <div className="col-span-3">
                            <input
                              className="w-full text-sm border border-emerald-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-100"
                              value={editBuf.commodity ?? entry.commodity}
                              onChange={(e) => setEditBuf((b) => ({ ...b, commodity: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              className="w-full text-sm border border-emerald-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-100 text-right"
                              value={editBuf.rate ?? entry.rate}
                              onChange={(e) => setEditBuf((b) => ({ ...b, rate: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              className="w-full text-sm border border-emerald-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-100 text-right"
                              value={editBuf.quantity ?? entry.quantity}
                              onChange={(e) => setEditBuf((b) => ({ ...b, quantity: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="col-span-2 text-right text-sm font-semibold text-emerald-600">
                            {fmt((editBuf.rate ?? entry.rate) * (editBuf.quantity ?? entry.quantity))}
                          </div>
                          <div className="col-span-2 flex items-center justify-end gap-1">
                            <button onClick={() => saveEdit(entry.id)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                              <CheckIcon className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors text-xs font-bold">✕</button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-1">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${entry.uncertain ? "bg-amber-400" : "bg-emerald-500"}`} />
                          </div>
                          <div className="col-span-3 text-sm font-semibold text-[#1d2226]">{entry.commodity}</div>
                          <div className="col-span-2 text-sm text-gray-500 text-right">{fmt(entry.rate)}</div>
                          <div className="col-span-2 text-sm text-gray-500 text-right">{fmtQty(entry.quantity, entry.unit)}</div>
                          <div className="col-span-2 text-sm font-bold text-emerald-600 text-right">{fmt(entry.amount)}</div>
                          <div className="col-span-2 flex justify-end">
                            <button onClick={() => startEdit(entry)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors">
                              <EditIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                      {entry.uncertain && editingId !== entry.id && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-500 ml-5">
                          <AlertIcon className="h-3 w-3" /> Review suggested · Original: <span className="font-mono">{entry.rawLine}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Footer total */}
                  <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-emerald-50 border-t border-emerald-100">
                    <div className="col-span-4 text-sm font-bold text-[#1d2226]">Total</div>
                    <div className="col-span-2 text-right text-sm font-semibold text-gray-600">—</div>
                    <div className="col-span-2 text-right text-sm font-semibold text-gray-600">{fmtQty(totalQty)}</div>
                    <div className="col-span-2 text-right text-sm font-black text-emerald-700">{fmt(totalAmount)}</div>
                    <div className="col-span-2" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GROUPED VIEW ── */}
        {tab === "grouped" && (
          <div className="afu space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="font-bold text-[#1d2226]">Grouped by Commodity</h2>
              <span className="text-xs text-gray-400 ml-auto">Rate × Qty = Amount · all steps shown</span>
            </div>

            {Object.keys(groupedLive).length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">No data to group.</div>
            ) : (
              Object.entries(groupedLive).map(([key, group]) => {
                const minRate = Math.min(...group.rates);
                const maxRate = Math.max(...group.rates);
                const avgRate = group.rates.reduce((a, b) => a + b, 0) / group.rates.length;
                const priceDist: Record<number, number> = {};
                for (const e of group.entries) { priceDist[e.rate] = (priceDist[e.rate] || 0) + e.quantity; }

                return (
                  <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Group header */}
                    <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-black text-[#1d2226] text-base">{group.displayName}</h3>
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">{group.entries.length} entries</p>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="text-xs text-gray-400">Total Qty</p>
                          <p className="font-bold text-[#1d2226]">{fmtQty(group.totalQty)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total Value</p>
                          <p className="font-black text-emerald-600">{fmt(group.totalAmt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Entry calculations */}
                    <div className="divide-y divide-gray-50">
                      {group.entries.map((e, i) => (
                        <div key={i} className="px-5 py-3 flex items-center gap-3 text-sm flex-wrap">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.uncertain ? "bg-amber-400" : "bg-emerald-500"}`} />
                          <span className="text-gray-500 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded">{fmt(e.rate)}</span>
                          <span className="text-gray-300">×</span>
                          <span className="text-gray-500 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded">{fmtQty(e.quantity, e.unit)}</span>
                          <span className="text-gray-300">=</span>
                          <span className="font-bold text-[#1d2226]">{fmt(e.amount)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Rate stats */}
                    <div className="px-5 py-4 border-t border-gray-50 bg-gray-50">
                      <div className="flex flex-wrap gap-4 mb-3">
                        <div className="text-xs"><span className="text-gray-400">Min rate </span><span className="font-bold text-[#1d2226]">{fmt(minRate)}</span></div>
                        <div className="text-xs"><span className="text-gray-400">Max rate </span><span className="font-bold text-[#1d2226]">{fmt(maxRate)}</span></div>
                        <div className="text-xs"><span className="text-gray-400">Avg rate </span><span className="font-bold text-[#1d2226]">{fmt(Math.round(avgRate))}</span></div>
                      </div>
                      {Object.entries(priceDist).length > 1 && (
                        <div className="space-y-1.5">
                          <p className="text-xs text-gray-400 mb-2">Price distribution</p>
                          {Object.entries(priceDist).map(([rate, qty]) => {
                            const pct = Math.round((qty / group.totalQty) * 100);
                            return (
                              <div key={rate} className="flex items-center gap-3">
                                <span className="text-xs font-mono text-gray-500 w-16">{fmt(Number(rate))}</span>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── SUMMARY VIEW ── */}
        {tab === "summary" && (
          <div className="afu space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <h2 className="font-bold text-[#1d2226]">Summary Intelligence</h2>
            </div>

            {/* Top stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-xs text-gray-400 mb-2">Total Transaction Value</p>
                <p className="text-3xl font-black text-emerald-600">{fmt(totalAmount)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-xs text-gray-400 mb-2">Total Quantity</p>
                <p className="text-3xl font-black text-[#1d2226]">{totalQty.toLocaleString("en-IN")}</p>
                <p className="text-xs text-gray-400">quintals</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-xs text-gray-400 mb-2">Commodities Traded</p>
                <p className="text-3xl font-black text-[#1d2226]">{Object.keys(groupedLive).length}</p>
              </div>
            </div>

            {/* Per-commodity intelligence */}
            {Object.entries(groupedLive).map(([key, group]) => {
              const minRate = Math.min(...group.rates);
              const maxRate = Math.max(...group.rates);
              const avgRate = group.rates.reduce((a, b) => a + b, 0) / group.rates.length;
              const priceDist: Record<number, number> = {};
              for (const e of group.entries) { priceDist[e.rate] = (priceDist[e.rate] || 0) + e.quantity; }
              const topPrice = Object.entries(priceDist).sort((a, b) => b[1] - a[1])[0];

              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black text-[#1d2226]">{group.displayName}</h3>
                    <span className="text-sm font-bold text-emerald-600">{fmt(group.totalAmt)}</span>
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Qty traded</p>
                      <p className="font-bold text-[#1d2226]">{fmtQty(group.totalQty)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Avg rate</p>
                      <p className="font-bold text-[#1d2226]">{fmt(Math.round(avgRate))}<span className="text-xs font-normal text-gray-400">/qtl</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Price range</p>
                      <p className="font-bold text-[#1d2226]">{fmt(minRate)} – {fmt(maxRate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Top price point</p>
                      <p className="font-bold text-violet-600">
                        {topPrice ? `${Math.round((topPrice[1] / group.totalQty) * 100)}% @ ${fmt(Number(topPrice[0]))}` : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Commodity share bar */}
                  <div className="px-5 pb-4">
                    <p className="text-xs text-gray-400 mb-2">Share of total value</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${totalAmount > 0 ? Math.round((group.totalAmt / totalAmount) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#1d2226]">
                        {totalAmount > 0 ? Math.round((group.totalAmt / totalAmount) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Processing note */}
            {data.summary?.processingNote && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertIcon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">{data.summary.processingNote}</p>
              </div>
            )}

            {/* New upload CTA */}
            <div className="bg-emerald-600 rounded-2xl p-6 text-center">
              <p className="text-white font-bold mb-1">Done with this satti?</p>
              <p className="text-emerald-100 text-sm mb-4">Upload another to continue your records.</p>
              <button
                onClick={() => router.push("/ledger/dashboard")}
                className="px-6 py-2.5 bg-white text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-all"
              >
                Upload Next Satti
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
