import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Edit2,
  FileText,
  Filter,
  LineChart,
  Save,
  Search,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";

type LedgerEntry = {
  id: string;
  commodity: string;
  rate: number;
  quantity: number;
  amount: number;
  status: 'verified' | 'needs_review';
  confidence: string;
  sourceText: string;
  notes?: string;
};

const INITIAL_ENTRIES: LedgerEntry[] = [
  { id: '1', commodity: 'गेहूं', rate: 2400, quantity: 50, amount: 120000, status: 'verified', confidence: '96%', sourceText: 'गेहूं 50 qtl @ 2400' },
  { id: '2', commodity: 'सरसों', rate: 5200, quantity: 20, amount: 104000, status: 'needs_review', confidence: '72%', sourceText: 'सरसों 20 बोरी 5200' },
  { id: '3', commodity: 'चना', rate: 5800, quantity: 15, amount: 87000, status: 'verified', confidence: '94%', sourceText: 'चना 15 @ 5800' },
  { id: '4', commodity: 'मूंग', rate: 7200, quantity: 10, amount: 72000, status: 'verified', confidence: '91%', sourceText: 'मूंग 10 qtl 7200' },
  { id: '5', commodity: 'बाजरा', rate: 2100, quantity: 40, amount: 84000, status: 'needs_review', confidence: '68%', sourceText: 'बाजरा 40 @ 2100?' },
];

const dailyCards = [
  { label: 'Today', value: '₹4.67L', detail: '5 entries captured' },
  { label: 'This month', value: '₹11.8L', detail: '18 upload sessions' },
  { label: 'This year', value: '₹1.24Cr', detail: '+16% performance' },
];

const monthlyRows = [
  { label: 'January 2026', sessions: 14, amount: '₹8.4L', top: 'गेहूं' },
  { label: 'February 2026', sessions: 16, amount: '₹9.1L', top: 'सरसों' },
  { label: 'March 2026', sessions: 18, amount: '₹11.8L', top: 'चना' },
  { label: 'April 2026', sessions: 6, amount: '₹3.2L', top: 'मूंग' },
];

function formatMoney(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function StatusBadge({ status }: { status: LedgerEntry['status'] }) {
  if (status === 'needs_review') {
    return <Badge className="rounded-full border-0 bg-amber-100 text-amber-800 hover:bg-amber-100">Review</Badge>;
  }

  return <Badge className="rounded-full border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Verified</Badge>;
}

function EntryCard({ entry, onEdit }: { entry: LedgerEntry; onEdit: (entry: LedgerEntry) => void }) {
  return (
    <Card className={`overflow-hidden rounded-3xl border-0 bg-white shadow-sm ring-1 ${entry.status === 'needs_review' ? 'ring-amber-200' : 'ring-slate-100'}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${entry.status === 'needs_review' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {entry.status === 'needs_review' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold leading-tight text-slate-950">{entry.commodity}</h3>
                <StatusBadge status={entry.status} />
              </div>
              <p className="mt-1 text-xs text-slate-500">Source: {entry.sourceText}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm sm:min-w-[360px]">
                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Rate</p>
                  <p className="font-semibold text-slate-950">₹{entry.rate}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Qty</p>
                  <p className="font-semibold text-slate-950">{entry.quantity} qtl</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">AI</p>
                  <p className="font-semibold text-slate-950">{entry.confidence}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-500">Amount</p>
              <p className="text-xl font-bold text-slate-950">{formatMoney(entry.rate * entry.quantity)}</p>
            </div>
            <Button variant="outline" className="h-10 rounded-full border-slate-200 bg-white px-4 font-semibold text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900" onClick={() => onEdit(entry)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {entry.status === 'needs_review' && (
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-850">
            Rate or quantity needs confirmation before finalizing this ledger.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CalculatorPanel({ compact = false }: { compact?: boolean }) {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const calculate = (first: number, second: number, selectedOperator: string) => {
    if (selectedOperator === '+') return first + second;
    if (selectedOperator === '-') return first - second;
    if (selectedOperator === '×') return first * second;
    if (selectedOperator === '÷') return second === 0 ? first : first / second;
    return second;
  };

  const formatDisplay = (value: number) => {
    if (!Number.isFinite(value)) return 'Error';
    return Number(value.toFixed(8)).toLocaleString('en-IN');
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }
    setDisplay(display === '0' ? digit : `${display}${digit}`);
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) setDisplay(`${display}.`);
  };

  const clear = () => {
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (waitingForOperand) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const toggleSign = () => {
    setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`);
  };

  const percentage = () => {
    const value = Number(display.replace(/,/g, ''));
    setDisplay(formatDisplay(value / 100));
  };

  const chooseOperator = (nextOperator: string) => {
    const inputValue = Number(display.replace(/,/g, ''));

    if (storedValue === null) {
      setStoredValue(inputValue);
    } else if (operator) {
      const result = calculate(storedValue, inputValue, operator);
      setStoredValue(result);
      setDisplay(formatDisplay(result));
    }

    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const equals = () => {
    if (storedValue === null || !operator) return;
    const inputValue = Number(display.replace(/,/g, ''));
    const result = calculate(storedValue, inputValue, operator);
    setDisplay(formatDisplay(result));
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const keyClass = "h-12 rounded-2xl text-base font-bold";
  const buttons = [
    { label: 'C', action: clear, style: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
    { label: '±', action: toggleSign, style: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
    { label: '%', action: percentage, style: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
    { label: '÷', action: () => chooseOperator('÷'), style: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
    { label: '7', action: () => inputDigit('7') },
    { label: '8', action: () => inputDigit('8') },
    { label: '9', action: () => inputDigit('9') },
    { label: '×', action: () => chooseOperator('×'), style: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
    { label: '4', action: () => inputDigit('4') },
    { label: '5', action: () => inputDigit('5') },
    { label: '6', action: () => inputDigit('6') },
    { label: '-', action: () => chooseOperator('-'), style: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
    { label: '1', action: () => inputDigit('1') },
    { label: '2', action: () => inputDigit('2') },
    { label: '3', action: () => inputDigit('3') },
    { label: '+', action: () => chooseOperator('+'), style: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
    { label: '0', action: () => inputDigit('0'), span: 'col-span-2' },
    { label: '.', action: inputDecimal },
    { label: '=', action: equals, style: 'bg-[#123f31] text-white hover:bg-[#0d3026]' },
  ];

  return (
    <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
      <CardContent className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-950">Quick Calculator</h3>
            <p className="text-sm text-slate-500">For rate, quantity, commission, and cash checks</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <Calculator className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 rounded-3xl bg-[#123f31] px-4 py-4 text-right text-white">
          <p className="text-xs text-emerald-100">{storedValue !== null && operator ? `${formatDisplay(storedValue)} ${operator}` : 'Ready'}</p>
          <p className="mt-1 min-h-10 break-all text-3xl font-bold tracking-tight">{display}</p>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {buttons.map((button) => (
            <Button key={button.label} className={`${keyClass} ${button.span || ''} ${button.style || 'bg-slate-50 text-slate-950 hover:bg-slate-100'}`} onClick={button.action}>
              {button.label}
            </Button>
          ))}
        </div>
        <Button variant="ghost" className="mt-3 h-9 w-full rounded-full text-slate-500 hover:text-slate-900" onClick={backspace}>
          Backspace
        </Button>
      </CardContent>
    </Card>
  );
}

export function MobileEditWireframe() {
  const [entries, setEntries] = useState<LedgerEntry[]>(INITIAL_ENTRIES);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [page, setPage] = useState<'dashboard' | 'timeline'>('dashboard');
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  const totalAmount = entries.reduce((sum, entry) => sum + entry.rate * entry.quantity, 0);
  const reviewCount = entries.filter((entry) => entry.status === 'needs_review').length;
  const verifiedCount = entries.length - reviewCount;

  const handleSave = () => {
    if (!editingEntry) return;
    setEntries((current) => current.map((entry) => entry.id === editingEntry.id ? {
      ...editingEntry,
      amount: editingEntry.rate * editingEntry.quantity,
      status: 'verified',
      confidence: '100%',
    } : entry));
    setEditingEntry(null);
  };

  if (page === 'timeline') {
    return (
      <div className="min-h-screen bg-[#f4f8f5] text-slate-950">
        <header className="border-b border-emerald-900/10 bg-[#123f31] text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" className="rounded-full text-white hover:bg-white/10 hover:text-white" onClick={() => setPage('dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to ledger
              </Button>
              <Badge className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/10">Separate page</Badge>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-sm font-medium text-emerald-100">Business Summary Timeline</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Daily totals, monthly totals, yearly performance</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
                  This page separates reporting from editing. Daily saved ledger sessions roll into monthly totals, and monthly totals roll into yearly performance automatically.
                </p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-emerald-100">Yearly performance</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <p className="text-4xl font-bold">₹1.24Cr</p>
                  <p className="rounded-full bg-emerald-200 px-3 py-1 text-sm font-bold text-emerald-950">+16%</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {dailyCards.map((card) => (
              <Card key={card.label} className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p>
                  <p className="mt-1 text-sm text-emerald-700">{card.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Automatic rollup flow</h2>
                    <p className="text-sm text-slate-500">No manual summary sheet required</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-emerald-700" />
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    ['1', 'Daily ledger saved', 'Every uploaded or manually entered satti is saved as a daily business record.'],
                    ['2', 'Monthly total updated', 'Commodity totals, quantities, and amounts are grouped into the current month.'],
                    ['3', 'Yearly performance refreshed', 'Monthly records combine into annual trend and performance reporting.'],
                  ].map(([step, title, text]) => (
                    <div key={step} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">{step}</div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-950">{title}</p>
                        <p className="mt-1 text-sm text-slate-500">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Monthly summary</h2>
                    <p className="text-sm text-slate-500">Generated from daily ledger sessions</p>
                  </div>
                  <Badge className="w-fit rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Live rollup</Badge>
                </div>
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
                  {monthlyRows.map((row, index) => (
                    <div key={row.label} className={`grid grid-cols-[1.2fr_0.6fr_0.8fr] gap-3 px-4 py-3 text-sm ${index !== monthlyRows.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div>
                        <p className="font-semibold text-slate-950">{row.label}</p>
                        <p className="text-xs text-slate-500">Top: {row.top}</p>
                      </div>
                      <p className="text-slate-600">{row.sessions} sessions</p>
                      <p className="text-right font-bold text-emerald-800">{row.amount}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f5] text-slate-950">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#123f31] font-bold text-white">SL</div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-950 sm:text-lg">रामलाल ट्रेडिंग कं.</h1>
              <p className="text-xs text-slate-500">Smart Ledger Dashboard</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="outline" className="rounded-full bg-white"><Search className="mr-2 h-4 w-4" />Search</Button>
            <Button variant="outline" className="rounded-full bg-white"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          </div>
          <Button className="rounded-full bg-[#123f31] hover:bg-[#0d3026] sm:hidden"><Search className="h-4 w-4" /></Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden rounded-3xl border-0 bg-[#123f31] text-white shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-emerald-100">Current upload total</p>
                  <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{formatMoney(totalAmount)}</p>
                  <p className="mt-2 text-sm text-emerald-50/85">12 Oct 2023 • {entries.length} parsed entries • {reviewCount} need review</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:min-w-[220px]">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs text-emerald-100">Verified</p>
                    <p className="text-2xl font-bold">{verifiedCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs text-emerald-100">Review</p>
                    <p className="text-2xl font-bold">{reviewCount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Button onClick={() => setPage('timeline')} className="h-auto justify-between rounded-3xl border border-emerald-100 bg-white p-5 text-left text-slate-950 shadow-sm hover:bg-white">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <LineChart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-bold">Performance Timeline</p>
                  <p className="mt-1 text-xs font-normal text-slate-500 sm:text-sm">Open the separate daily, monthly, yearly summary page</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Button>

            <Button onClick={() => setCalculatorOpen(true)} className="h-auto justify-between rounded-3xl border border-emerald-100 bg-white p-5 text-left text-slate-950 shadow-sm hover:bg-white lg:hidden">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <Calculator className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-bold">Quick Calculator</p>
                  <p className="mt-1 text-xs font-normal text-slate-500 sm:text-sm">Open calculator while reviewing entries</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Button>

            <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Upload or capture satti</p>
                  <p className="mt-1 text-xs text-slate-500">Add a new photo/PDF or take a fresh photo</p>
                </div>
                <Button className="rounded-full bg-[#123f31] hover:bg-[#0d3026]"><Upload className="mr-2 h-4 w-4" />Add</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Parsed entries</h2>
                <p className="text-sm text-slate-500">Clean cards on mobile, wider row layout on tablet and desktop.</p>
              </div>
              <div className="flex gap-2 sm:hidden">
                <Button variant="outline" className="rounded-full bg-white"><Filter className="mr-2 h-4 w-4" />Filter</Button>
              </div>
            </div>
            <div className="space-y-3">
              {entries.map((entry) => <EntryCard key={entry.id} entry={entry} onEdit={setEditingEntry} />)}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
            <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Review queue</h3>
                    <p className="text-sm text-slate-500">Fix uncertain AI rows first</p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="mt-4 space-y-2">
                  {entries.filter((entry) => entry.status === 'needs_review').map((entry) => (
                    <button key={entry.id} onClick={() => setEditingEntry(entry)} className="flex w-full items-center justify-between rounded-2xl bg-amber-50 px-3 py-3 text-left">
                      <span className="font-semibold text-amber-950">{entry.commodity}</span>
                      <span className="text-sm text-amber-800">{entry.confidence}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="hidden lg:block">
              <CalculatorPanel compact />
            </div>

            <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardContent className="p-5">
                <h3 className="font-bold">Finalize ledger</h3>
                <p className="mt-1 text-sm text-slate-500">Save verified rows and update business reporting.</p>
                <Button className="mt-4 h-12 w-full rounded-2xl bg-[#123f31] font-bold hover:bg-[#0d3026]">
                  <FileText className="mr-2 h-5 w-5" />
                  Finalize
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>

      <Sheet open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <SheetContent side="bottom" className="mx-auto flex h-[88vh] max-w-2xl flex-col rounded-t-[2rem] border-0 px-0 pb-0 pt-4 sm:h-[82vh]">
          <div className="px-5 pb-3 sm:px-6">
            <SheetHeader className="text-left">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="text-2xl font-bold">Edit ledger entry</SheetTitle>
                  <SheetDescription className="mt-2 text-xs">
                    Source: <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-800">{editingEntry?.sourceText}</span>
                  </SheetDescription>
                </div>
                <Button variant="ghost" size="icon" className="-mr-2 rounded-full" onClick={() => setEditingEntry(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/80 px-5 py-4 sm:px-6">
            {editingEntry && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="rounded-3xl border-0 bg-white shadow-sm sm:col-span-2">
                  <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-1">
                      <Label htmlFor="commodity">Commodity</Label>
                      <Input id="commodity" value={editingEntry.commodity} onChange={(event) => setEditingEntry({ ...editingEntry, commodity: event.target.value })} className="h-12 rounded-2xl text-lg font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate">Rate</Label>
                      <Input id="rate" type="number" value={editingEntry.rate} onChange={(event) => setEditingEntry({ ...editingEntry, rate: Number(event.target.value) })} className="h-12 rounded-2xl text-lg font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" value={editingEntry.quantity} onChange={(event) => setEditingEntry({ ...editingEntry, quantity: Number(event.target.value) })} className="h-12 rounded-2xl text-lg font-semibold" />
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-3xl bg-[#123f31] p-5 text-white">
                  <p className="text-sm text-emerald-100">Recalculated amount</p>
                  <p className="mt-2 text-3xl font-bold">{formatMoney(editingEntry.rate * editingEntry.quantity)}</p>
                  <p className="mt-1 text-xs text-emerald-50/75">Rate × Quantity</p>
                </div>

                <Card className="rounded-3xl border-0 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
                      <div>
                        <p className="font-semibold text-emerald-950">Mark verified after save</p>
                        <p className="text-xs text-emerald-700">Clears review status</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input id="notes" placeholder="Correction reason or payment note" value={editingEntry.notes || ''} onChange={(event) => setEditingEntry({ ...editingEntry, notes: event.target.value })} className="h-12 rounded-2xl" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="flex gap-3 border-t bg-white p-4 pb-8 sm:px-6">
            <Button variant="outline" className="h-14 flex-1 rounded-2xl text-base font-semibold" onClick={() => setEditingEntry(null)}>Cancel</Button>
            <Button className="h-14 flex-1 rounded-2xl bg-[#123f31] text-base font-semibold hover:bg-[#0d3026]" onClick={handleSave}>
              <Save className="mr-2 h-5 w-5" />
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={calculatorOpen} onOpenChange={setCalculatorOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-[2rem] border-0 bg-[#f4f8f5] px-4 pb-8 pt-4 sm:max-w-md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-bold">Quick Calculator</SheetTitle>
              <SheetDescription>Use it without leaving the ledger review flow.</SheetDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCalculatorOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <CalculatorPanel compact />
        </SheetContent>
      </Sheet>
    </div>
  );
}
