import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ArrowLeft, BarChart3, CalendarDays, CheckCircle2, ChevronRight, Edit2, FileText, Filter, LineChart, Save, Search, TrendingUp, X, AlertTriangle } from "lucide-react";

type LedgerEntry = {
  id: string;
  commodity: string;
  rate: number;
  quantity: number;
  amount: number;
  status: 'verified' | 'needs_review';
  sourceText?: string;
  notes?: string;
};

const MOCK_ENTRIES: LedgerEntry[] = [
  { id: '1', commodity: 'गेहूं', rate: 2400, quantity: 50, amount: 120000, status: 'verified', sourceText: 'गेहूं 50 qtl @ 2400' },
  { id: '2', commodity: 'सरसों', rate: 5200, quantity: 20, amount: 104000, status: 'needs_review', sourceText: 'सरसों 20 बोरी 5200' },
  { id: '3', commodity: 'चना', rate: 5800, quantity: 15, amount: 87000, status: 'verified', sourceText: 'चना 15 @ 5800' },
  { id: '4', commodity: 'मूंग', rate: 7200, quantity: 10, amount: 72000, status: 'verified', sourceText: 'मूंग 10 qtl 7200' },
  { id: '5', commodity: 'बाजरा', rate: 2100, quantity: 40, amount: 84000, status: 'needs_review', sourceText: 'बाजरा 40 @ 2100?' },
];

const monthlyRows = [
  { label: 'जनवरी', value: '₹8.4L', change: '+12%' },
  { label: 'फरवरी', value: '₹9.1L', change: '+8%' },
  { label: 'मार्च', value: '₹11.8L', change: '+18%' },
];

export function MobileEditWireframe() {
  const [entries, setEntries] = useState<LedgerEntry[]>(MOCK_ENTRIES);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [page, setPage] = useState<'dashboard' | 'timeline'>('dashboard');

  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
  const reviewCount = entries.filter((entry) => entry.status === 'needs_review').length;
  const verifiedCount = entries.length - reviewCount;

  const handleEdit = (entry: LedgerEntry) => {
    setEditingEntry({ ...entry });
  };

  const handleSave = () => {
    if (!editingEntry) return;
    const recalculatedAmount = editingEntry.rate * editingEntry.quantity;
    setEntries(entries.map((entry) => entry.id === editingEntry.id ? { ...editingEntry, amount: recalculatedAmount, status: 'verified' } : entry));
    setEditingEntry(null);
  };

  if (page === 'timeline') {
    return (
      <div className="min-h-[100dvh] max-w-md mx-auto bg-[#f4f8f5] text-slate-950 shadow-2xl overflow-hidden flex flex-col font-sans">
        <header className="bg-[#123f31] text-white px-4 pt-4 pb-5">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={() => setPage('dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Badge className="bg-white/14 text-white border-white/15 hover:bg-white/14">Separate Page</Badge>
          </div>
          <div className="mt-4">
            <p className="text-sm text-emerald-100">Business Summary Timeline</p>
            <h1 className="text-2xl font-bold tracking-tight">Performance Rollup</h1>
            <p className="mt-2 text-sm leading-5 text-emerald-50/90">Daily satti totals automatically roll into monthly summaries, then monthly totals roll into yearly performance.</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
          <Card className="border-0 bg-white shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Yearly performance</p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">₹1.24Cr</p>
                  <p className="mt-1 text-sm text-emerald-700 font-medium">+16% from last year</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <LineChart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 bg-white rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <CalendarDays className="h-5 w-5 text-emerald-700" />
                <p className="mt-3 text-xs text-slate-500">Today</p>
                <p className="text-lg font-bold">₹4.77L</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <BarChart3 className="h-5 w-5 text-emerald-700" />
                <p className="mt-3 text-xs text-slate-500">This month</p>
                <p className="text-lg font-bold">₹11.8L</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white rounded-3xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold">Auto rollup flow</h2>
                  <p className="text-xs text-slate-500">Daily to monthly to yearly</p>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="space-y-3">
                {['Daily entries saved', 'Monthly total generated', 'Yearly performance updated'].map((label, index) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">{index + 1}</div>
                    <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-slate-500">Automatic, no manual report needed</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white rounded-3xl shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3">Monthly totals</h2>
              <div className="space-y-2">
                {monthlyRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
                    <span className="font-medium">{row.label}</span>
                    <div className="text-right">
                      <p className="font-bold">{row.value}</p>
                      <p className="text-xs text-emerald-700">{row.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] max-w-md mx-auto bg-[#f4f8f5] text-slate-950 shadow-2xl overflow-hidden flex flex-col font-sans relative">
      <header className="bg-[#123f31] text-white px-4 pt-4 pb-5 rounded-b-[2rem] shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-100">Smart Ledger</p>
            <h1 className="font-bold text-lg leading-tight truncate">रामलाल ट्रेडिंग कं.</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-5 rounded-3xl bg-white/10 border border-white/12 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-emerald-50/80">कुल रकम</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">₹{totalAmount.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-xs text-emerald-50/80">12 Oct 2023 • {entries.length} parsed entries</p>
            </div>
            <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 border-0">{reviewCount} Review</Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 rounded-2xl bg-white shadow-sm">
            <CardContent className="p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-xs text-slate-500">Verified</p>
              <p className="text-xl font-bold">{verifiedCount}</p>
            </CardContent>
          </Card>
          <Card className="border-0 rounded-2xl bg-white shadow-sm">
            <CardContent className="p-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="mt-3 text-xs text-slate-500">Needs review</p>
              <p className="text-xl font-bold">{reviewCount}</p>
            </CardContent>
          </Card>
        </div>

        <Button onClick={() => setPage('timeline')} className="w-full h-auto rounded-3xl bg-white text-slate-950 hover:bg-white border border-emerald-100 shadow-sm px-4 py-4 justify-between group">
          <div className="flex items-center gap-3 text-left">
            <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold leading-tight">Business Timeline</p>
              <p className="text-xs font-normal text-slate-500 mt-1">Daily to monthly to yearly performance</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-700" />
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Parsed entries</h2>
            <p className="text-xs text-slate-500">Tap edit to correct any row</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full bg-white border-slate-200">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filter
          </Button>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className={`border-0 rounded-3xl bg-white shadow-sm overflow-hidden ${entry.status === 'needs_review' ? 'ring-1 ring-amber-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-1 h-9 w-9 shrink-0 rounded-2xl flex items-center justify-center ${entry.status === 'needs_review' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {entry.status === 'needs_review' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg leading-tight">{entry.commodity}</h3>
                        <Badge variant="secondary" className={`rounded-full border-0 text-[11px] ${entry.status === 'needs_review' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {entry.status === 'needs_review' ? 'Review' : 'Verified'}
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <p className="text-slate-500">Rate <span className="font-semibold text-slate-950">₹{entry.rate}</span></p>
                        <p className="text-slate-500">Qty <span className="font-semibold text-slate-950">{entry.quantity} qtl</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg">₹{(entry.rate * entry.quantity).toLocaleString('en-IN')}</p>
                    <Button variant="outline" size="sm" className="mt-3 h-9 rounded-full bg-white border-slate-200 text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50" onClick={() => handleEdit(entry)}>
                      <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                </div>
                {entry.status === 'needs_review' && (
                  <div className="mt-3 rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
                    Please confirm rate and quantity before finalizing.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-[#f4f8f5] via-[#f4f8f5] to-transparent p-4 pt-10">
        <Button className="w-full h-14 rounded-2xl bg-[#123f31] hover:bg-[#0d3026] text-base font-bold shadow-lg">
          <FileText className="mr-2 h-5 w-5" />
          Finalize ledger
        </Button>
      </div>

      <Sheet open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <SheetContent side="bottom" className="rounded-t-[2rem] px-0 pb-0 pt-4 h-[86vh] flex flex-col max-w-md mx-auto sm:max-w-md border-0">
          <div className="px-5 pb-3">
            <SheetHeader className="text-left">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="text-2xl font-bold">Edit ledger entry</SheetTitle>
                  <SheetDescription className="text-xs mt-2">
                    Source: <span className="font-medium text-slate-800 bg-slate-100 px-2 py-1 rounded-full">{editingEntry?.sourceText}</span>
                  </SheetDescription>
                </div>
                <Button variant="ghost" size="icon" className="-mr-2 rounded-full" onClick={() => setEditingEntry(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5 bg-slate-50/70">
            {editingEntry && (
              <>
                <Card className="border-0 rounded-3xl shadow-sm bg-white">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="commodity" className="text-slate-600 font-medium">Commodity</Label>
                      <Input id="commodity" value={editingEntry.commodity} onChange={(event) => setEditingEntry({ ...editingEntry, commodity: event.target.value })} className="h-12 text-lg font-semibold bg-white rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="rate" className="text-slate-600 font-medium">Rate</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                          <Input id="rate" type="number" value={editingEntry.rate} onChange={(event) => setEditingEntry({ ...editingEntry, rate: Number(event.target.value) })} className="h-12 text-lg font-semibold pl-7 bg-white rounded-2xl" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-slate-600 font-medium">Quantity</Label>
                        <div className="relative">
                          <Input id="quantity" type="number" value={editingEntry.quantity} onChange={(event) => setEditingEntry({ ...editingEntry, quantity: Number(event.target.value) })} className="h-12 text-lg font-semibold pr-10 bg-white rounded-2xl" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">qtl</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-3xl bg-[#123f31] text-white p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100">Recalculated amount</p>
                    <p className="text-xs text-emerald-50/70">Rate × Quantity</p>
                  </div>
                  <p className="text-2xl font-bold">₹{(editingEntry.rate * editingEntry.quantity).toLocaleString('en-IN')}</p>
                </div>

                <Card className="border-0 rounded-3xl shadow-sm bg-white">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-emerald-950">Mark as verified after save</p>
                        <p className="text-xs text-emerald-700">Review status will be cleared</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-slate-600 font-medium">Notes</Label>
                      <Input id="notes" placeholder="Add correction reason or payment note" value={editingEntry.notes || ''} onChange={(event) => setEditingEntry({ ...editingEntry, notes: event.target.value })} className="h-12 bg-white rounded-2xl" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="p-4 bg-white border-t flex gap-3 pb-8">
            <Button variant="outline" className="flex-1 h-14 rounded-2xl text-base font-semibold" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button className="flex-1 h-14 rounded-2xl text-base font-semibold bg-[#123f31] hover:bg-[#0d3026]" onClick={handleSave}>
              <Save className="mr-2 h-5 w-5" />
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
