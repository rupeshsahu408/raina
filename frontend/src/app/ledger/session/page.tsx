"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pdfToImageBlob } from "@/lib/pdfToImage";
import { useLedgerAuth } from "@/contexts/LedgerAuthContext";
import {
  defaultLedgerProfile,
  formatCommodityName,
  formatLedgerCurrency,
  formatLedgerQuantity,
  type LedgerBusinessProfile,
} from "@/lib/ledgerPersonalization";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

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
  sessionId?: string;
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
function fmtRaw(n: number) {
  return Number(n).toLocaleString("en-IN");
}
function fmtQty(n: number, unit = "qtl") {
  return `${Number(n).toLocaleString("en-IN")} ${unit}`;
}

/* ── Icons ── */
function ArrowLeftIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
}
function EditIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>;
}
function CheckIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>;
}
function AlertIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
}
function TrendingUpIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
}
function PieChartIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
}
function DownloadIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
}
function FileTextIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
}
function ShareIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>;
}
function CheckCircleIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
}

type Tab = "raw" | "grouped" | "summary";

const CHART_COLORS = [
  "#059669", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444",
  "#10b981", "#3b82f6", "#a855f7", "#f97316", "#ec4899",
];

const CustomTooltipPie = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-sm font-bold text-gray-800">{payload[0].name}</p>
        <p className="text-xs text-emerald-600 font-semibold">{fmt(payload[0].value)}</p>
        <p className="text-xs text-gray-400">{payload[0].payload.pct}% of total</p>
      </div>
    );
  }
  return null;
};

const CustomTooltipBar = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {p.name === "Quantity" ? `${p.value} qtl` : fmt(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

type AppendStage = "idle" | "uploading" | "processing" | "done" | "error";

export default function LedgerSession() {
  const { user, loading } = useLedgerAuth();
  const router = useRouter();
  const [data, setData] = useState<SessionData | null>(null);
  const [tab, setTab] = useState<Tab>("raw");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBuf, setEditBuf] = useState<Partial<Entry>>({});
  const [profile, setProfile] = useState<LedgerBusinessProfile>(defaultLedgerProfile);

  /* Export state */
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const exportMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Append-more state */
  const [appendOpen, setAppendOpen] = useState(false);
  const [appendStage, setAppendStage] = useState<AppendStage>("idle");
  const [appendError, setAppendError] = useState<string | null>(null);
  const [appendIsPdf, setAppendIsPdf] = useState(false);
  const [appendCount, setAppendCount] = useState(0);
  const appendFileRef = useRef<HTMLInputElement>(null);
  const appendCamRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/backend/ledger/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const result = await res.json();
        if (!active) return;
        setProfile({
          ...defaultLedgerProfile,
          ...(result.profile || {}),
          preferences: {
            ...defaultLedgerProfile.preferences,
            ...(result.profile?.preferences || {}),
          },
        });
      } catch {
        if (active) setProfile(defaultLedgerProfile);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const displayMoney = (amount: number) => formatLedgerCurrency(amount, profile);
  const displayQty = (quantity: number) => formatLedgerQuantity(quantity, profile);
  const displayCommodity = (name: string) => formatCommodityName(name, profile);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Append: convert Blob → base64 data URL ── */
  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(",")[1]);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  /* ── Append: process a file selected by the user ── */
  async function appendProcessFile(file: File) {
    if (!data?.sessionId) {
      setAppendError("This session cannot be updated (no session ID). Please start a new upload from the dashboard.");
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !file.type.startsWith("image/")) {
      setAppendError("Please upload an image (JPG, PNG, WebP) or a PDF file.");
      return;
    }

    setAppendError(null);
    setAppendIsPdf(isPdf);
    setAppendStage("uploading");

    try {
      let imageBlob: Blob;
      if (isPdf) {
        imageBlob = await pdfToImageBlob(file);
      } else {
        imageBlob = file;
      }

      const imageBase64 = await blobToBase64(imageBlob);
      setAppendStage("processing");

      const token = await user!.getIdToken();
      const res = await fetch(`/backend/ledger/sessions/${data.sessionId}/append`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, mimeType: "image/jpeg" }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to process. Please try again.");

      const updated: SessionData = {
        ...data,
        rawText: result.rawText,
        entries: result.entries,
        grouped: result.grouped,
        summary: result.summary,
      };
      setData(updated);
      setEntries(result.entries || []);
      sessionStorage.setItem("ledger_session", JSON.stringify(updated));
      setAppendCount((c) => c + 1);
      setAppendStage("done");
      setTimeout(() => {
        setAppendStage("idle");
        setAppendOpen(false);
      }, 1800);
    } catch (err: any) {
      setAppendStage("error");
      setAppendError(err.message || "Something went wrong. Please try again.");
    }
  }

  function appendHandleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    appendProcessFile(files[0]);
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditBuf({ rate: entry.rate, quantity: entry.quantity, commodity: entry.commodity, unit: entry.unit, rawLine: entry.rawLine });
  }

  function saveEdit(entryId: number) {
    setEntries((prev) => {
      const nextEntries = prev.map((e) => {
        if (e.id !== entryId) return e;
        const rate = Number(editBuf.rate ?? e.rate);
        const quantity = Number(editBuf.quantity ?? e.quantity);
        const amount = rate * quantity;
        return {
          ...e,
          rate,
          quantity,
          amount,
          commodity: editBuf.commodity ?? e.commodity,
          unit: editBuf.unit ?? e.unit,
          rawLine: editBuf.rawLine ?? e.rawLine,
          uncertain: false,
        };
      });
      setData((prevData) => {
        if (!prevData) return prevData;
        const nextData = {
          ...prevData,
          entries: nextEntries,
          summary: {
            ...prevData.summary,
            totalEntries: nextEntries.length,
            totalQuantity: nextEntries.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: nextEntries.reduce((sum, item) => sum + item.amount, 0),
          },
        };
        sessionStorage.setItem("ledger_session", JSON.stringify(nextData));
        return nextData;
      });
      return nextEntries;
    });
    setEditingId(null);
    setEditBuf({});
  }

  function cancelEdit() { setEditingId(null); setEditBuf({}); }

  const totalAmount = entries.reduce((s, e) => s + e.amount, 0);
  const totalQty = entries.reduce((s, e) => s + e.quantity, 0);
  const editingEntry = entries.find((entry) => entry.id === editingId) || null;

  const groupedLive: Record<string, {
    displayName: string;
    entries: Entry[];
    totalQty: number;
    totalAmt: number;
    rates: number[];
  }> = {};
  for (const e of entries) {
    const key = e.commodityKey || e.commodity.toLowerCase().replace(/\s+/g, "_");
    if (!groupedLive[key]) groupedLive[key] = { displayName: e.commodity, entries: [], totalQty: 0, totalAmt: 0, rates: [] };
    groupedLive[key].entries.push(e);
    groupedLive[key].totalQty += e.quantity;
    groupedLive[key].totalAmt += e.amount;
    groupedLive[key].rates.push(e.rate);
  }

  function flashMsg(msg: string) {
    setExportMsg(msg);
    if (exportMsgTimer.current) clearTimeout(exportMsgTimer.current);
    exportMsgTimer.current = setTimeout(() => setExportMsg(null), 3000);
  }

  /* ── Export: CSV ── */
  function exportCSV() {
    const dateStr = new Date(data!.meta.processedAt).toLocaleDateString("en-IN");
    const header = ["#", "Commodity", "Rate (₹/qtl)", "Quantity (qtl)", "Amount (₹)", "Confidence"];
    const rows = entries.map((e, i) => [
      i + 1,
      e.commodity,
      e.rate,
      e.quantity,
      e.amount,
      e.uncertain ? "Review" : "High",
    ]);
    const summaryRows = [
      [],
      ["SUMMARY"],
      ["Total Value (₹)", totalAmount],
      ["Total Quantity (qtl)", totalQty],
      ["Commodities", Object.keys(groupedLive).length],
      ["Total Entries", entries.length],
      ["Processed At", dateStr],
    ];
    const allRows = [header, ...rows, ...summaryRows];
    const csvContent = allRows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satti-${new Date(data!.meta.processedAt).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flashMsg("CSV downloaded");
  }

  /* ── Export: PDF ── */
  async function exportPDF() {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const dateStr = new Date(data!.meta.processedAt).toLocaleString("en-IN", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

    /* ── Header band ── */
    doc.setFillColor(5, 150, 105); // emerald-600
    doc.rect(0, 0, pageW, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SMART LEDGER", 14, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Satti Analysis Report", 14, 19);
    doc.text(dateStr, pageW - 14, 19, { align: "right" });

    /* ── Summary boxes ── */
    doc.setTextColor(30, 30, 30);
    const boxY = 34;
    const boxes = [
      { label: "Total Value", value: fmt(totalAmount) },
      { label: "Total Quantity", value: `${fmtRaw(totalQty)} qtl` },
      { label: "Commodities", value: String(Object.keys(groupedLive).length) },
      { label: "Entries", value: String(entries.length) },
    ];
    const boxW = (pageW - 28 - 9) / 4;
    boxes.forEach((box, i) => {
      const bx = 14 + i * (boxW + 3);
      doc.setFillColor(240, 253, 244); // emerald-50
      doc.setDrawColor(209, 250, 229);
      doc.roundedRect(bx, boxY, boxW, 18, 3, 3, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text(box.label, bx + boxW / 2, boxY + 6, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(5, 150, 105);
      doc.text(box.value, bx + boxW / 2, boxY + 13, { align: "center" });
    });

    /* ── Entries table ── */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("All Entries", 14, boxY + 26);

    autoTable(doc, {
      startY: boxY + 30,
      head: [["#", "Commodity", "Rate (₹/qtl)", "Qty (qtl)", "Amount (₹)", ""]],
      body: entries.map((e, i) => [
        i + 1,
        e.commodity,
        fmtRaw(e.rate),
        fmtRaw(e.quantity),
        fmtRaw(e.amount),
        e.uncertain ? "⚠ Review" : "✓",
      ]),
      foot: [["", "TOTAL", "", fmtRaw(totalQty), fmtRaw(totalAmount), ""]],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: [240, 253, 244], textColor: [5, 100, 80], fontStyle: "bold" },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right", fontStyle: "bold" },
        5: { halign: "center", cellWidth: 18 },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    /* ── Per-commodity summary ── */
    const afterEntries = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("Commodity Summary", 14, afterEntries);

    const commRows = Object.entries(groupedLive).map(([, g]) => {
      const min = Math.min(...g.rates);
      const max = Math.max(...g.rates);
      const avg = Math.round(g.rates.reduce((a, b) => a + b, 0) / g.rates.length);
      const share = totalAmount > 0 ? Math.round((g.totalAmt / totalAmount) * 100) : 0;
      return [
        g.displayName,
        g.entries.length,
        fmtRaw(g.totalQty),
        fmtRaw(min),
        fmtRaw(avg),
        fmtRaw(max),
        fmtRaw(g.totalAmt),
        `${share}%`,
      ];
    });

    autoTable(doc, {
      startY: afterEntries + 4,
      head: [["Commodity", "Entries", "Qty (qtl)", "Min ₹", "Avg ₹", "Max ₹", "Total ₹", "Share"]],
      body: commRows,
      styles: { fontSize: 8.5, cellPadding: 3 },
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right", fontStyle: "bold" },
        5: { halign: "right" },
        6: { halign: "right", fontStyle: "bold", textColor: [5, 100, 80] },
        7: { halign: "center" },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    /* ── Footer ── */
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Generated by Smart Ledger · ${dateStr} · Page ${i} of ${totalPages}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    doc.save(`satti-report-${new Date(data!.meta.processedAt).toISOString().slice(0, 10)}.pdf`);
    flashMsg("PDF downloaded");
  }

  /* ── Share: WhatsApp ── */
  function shareWhatsApp() {
    const dateStr = new Date(data!.meta.processedAt).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

    const commLines = Object.entries(groupedLive)
      .map(([, g]) => {
        const avg = Math.round(g.rates.reduce((a, b) => a + b, 0) / g.rates.length);
        return `• ${g.displayName}: ${fmtRaw(g.totalQty)} qtl @ avg ₹${fmtRaw(avg)}/qtl = ₹${fmtRaw(g.totalAmt)}`;
      })
      .join("\n");

    const msg = [
      `*Smart Ledger — Satti Report*`,
      `📅 ${dateStr}`,
      ``,
      `*Overall Summary*`,
      `💰 Total Value: ₹${fmtRaw(totalAmount)}`,
      `📦 Total Qty: ${fmtRaw(totalQty)} qtl`,
      `🌾 Commodities: ${Object.keys(groupedLive).length}`,
      `📝 Entries: ${entries.length}`,
      ``,
      `*Commodity Breakdown*`,
      commLines,
      ``,
      `_Generated by Smart Ledger_`,
    ].join("\n");

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    flashMsg("WhatsApp opened");
  }

  const tabClass = (t: Tab) =>
    `px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
      tab === t ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500 hover:text-[#1d2226] hover:bg-gray-100"
    }`;

  /* ── Chart data ── */
  const donutData = Object.entries(groupedLive).map(([, g], i) => ({
    name: g.displayName,
    value: g.totalAmt,
    pct: totalAmount > 0 ? Math.round((g.totalAmt / totalAmount) * 100) : 0,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const barData = Object.entries(groupedLive).map(([, g]) => {
    const minRate = Math.min(...g.rates);
    const maxRate = Math.max(...g.rates);
    const avgRate = Math.round(g.rates.reduce((a, b) => a + b, 0) / g.rates.length);
    return {
      name: g.displayName.length > 8 ? g.displayName.slice(0, 8) + "…" : g.displayName,
      fullName: g.displayName,
      "Min Rate": minRate,
      "Avg Rate": avgRate,
      "Max Rate": maxRate,
      Quantity: g.totalQty,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .afu { animation: fadeUp 0.4s ease-out forwards; }
        .entry-row { transition: background 0.15s; }
        .entry-row:hover { background: #f9fafb; }
        .export-toast { animation: slideDown 0.3s ease-out; }
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
              <span className="font-bold text-[#1d2226] text-sm hidden sm:block">{profile.businessName || "Smart Ledger"}</span>
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
            { label: "Total Value", val: displayMoney(totalAmount) },
            { label: "Total Qty", val: displayQty(totalQty) },
            { label: "Commodities", val: String(Object.keys(groupedLive).length) },
            { label: "Entries", val: String(entries.length) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="text-base sm:text-lg font-black text-[#1d2226]">{s.val}</p>
            </div>
          ))}
        </div>

        {/* ── Export & Share toolbar ── */}
        <div className="afu mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ShareIcon className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Export & Share</span>
          </div>

          {/* Toast confirmation */}
          {exportMsg && (
            <div className="export-toast flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              {exportMsg}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* CSV */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-sm"
            >
              <DownloadIcon className="h-3.5 w-3.5 text-gray-500" />
              Download CSV
            </button>

            {/* PDF */}
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-sm"
            >
              <FileTextIcon className="h-3.5 w-3.5 text-emerald-600" />
              Download PDF
            </button>

            {/* WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5d] rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-sm shadow-sm shadow-green-100"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="afu flex gap-1.5 sm:gap-2 mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 w-fit">
          <button className={tabClass("raw")} onClick={() => setTab("raw")}>🔵 Raw View</button>
          <button className={tabClass("grouped")} onClick={() => setTab("grouped")}>🟢 Grouped</button>
          <button className={tabClass("summary")} onClick={() => setTab("summary")}>📊 Summary</button>
        </div>

        {/* Hidden file inputs for append feature */}
        <input ref={appendFileRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={(e) => appendHandleFiles(e.target.files)} />
        <input ref={appendCamRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => appendHandleFiles(e.target.files)} />

        {/* ── RAW VIEW ── */}
        {tab === "raw" && (
          <div className="afu space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className="font-bold text-[#1d2226]">Raw Extracted Data</h2>
              <span className="text-xs text-gray-400 ml-auto">Exact extraction · editable</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Original OCR text</p>
              <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-48 overflow-y-auto">
                {data.rawText || "No text extracted"}
              </pre>
            </div>

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
                  <div className="grid grid-cols-12 gap-2 px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">Commodity</div>
                    <div className="col-span-2 text-right">Rate/qtl</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>

                  {entries.map((entry) => (
                    <div key={entry.id} className="entry-row px-4 py-3 sm:px-5">
                      <div className="hidden grid-cols-12 items-center gap-2 sm:grid">
                        <div className="col-span-1">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${entry.uncertain ? "bg-amber-400" : "bg-emerald-500"}`} />
                        </div>
                        <div className="col-span-3 text-sm font-semibold text-[#1d2226]">{displayCommodity(entry.commodity)}</div>
                        <div className="col-span-2 text-right text-sm text-gray-500">{displayMoney(entry.rate)}</div>
                        <div className="col-span-2 text-right text-sm text-gray-500">{displayQty(entry.quantity)}</div>
                        <div className="col-span-2 text-right text-sm font-bold text-emerald-600">{displayMoney(entry.amount)}</div>
                        <div className="col-span-2 flex justify-end">
                          <button onClick={() => startEdit(entry)} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700">
                            Edit
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm sm:hidden"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="mb-2 flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${entry.uncertain ? "bg-amber-400" : "bg-emerald-500"}`} />
                              <p className="text-base font-black text-[#1d2226]">{displayCommodity(entry.commodity)}</p>
                            </div>
                            <p className="text-xs font-semibold text-gray-400">Rate {displayMoney(entry.rate)} · Qty {displayQty(entry.quantity)}</p>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{displayMoney(entry.amount)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                          <span className="text-xs font-semibold text-gray-400">Tap to edit entry</span>
                          <EditIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>

                      {entry.uncertain && editingId !== entry.id && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-500 ml-5">
                          <AlertIcon className="h-3 w-3" /> Review suggested · Original: <span className="font-mono">{entry.rawLine}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="grid grid-cols-12 gap-2 px-5 py-3.5 bg-emerald-50 border-t border-emerald-100">
                    <div className="col-span-4 text-sm font-bold text-[#1d2226]">Total</div>
                    <div className="col-span-2 text-right text-sm font-semibold text-gray-600">—</div>
                    <div className="col-span-2 text-right text-sm font-semibold text-gray-600">{displayQty(totalQty)}</div>
                    <div className="col-span-2 text-right text-sm font-black text-emerald-700">{displayMoney(totalAmount)}</div>
                    <div className="col-span-2" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ADD MORE DATA ── */}
        <div className="afu mt-4">
          {!appendOpen ? (
            <button
              onClick={() => { setAppendOpen(true); setAppendError(null); setAppendStage("idle"); }}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-600 font-semibold text-sm transition-all group"
            >
              <span className="w-7 h-7 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors text-lg font-bold leading-none">+</span>
              Add More Data
              {appendCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  {appendCount} batch{appendCount > 1 ? "es" : ""} added
                </span>
              )}
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between bg-emerald-50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">+</span>
                  <p className="text-sm font-bold text-[#1d2226]">Add More Satti Data</p>
                  <p className="text-xs text-gray-400">New entries will be merged with existing ones</p>
                </div>
                {appendStage === "idle" || appendStage === "error" ? (
                  <button onClick={() => setAppendOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1">✕</button>
                ) : null}
              </div>

              <div className="p-5">
                {appendStage === "idle" || appendStage === "error" ? (
                  <div className="space-y-4">
                    {appendError && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                        <AlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
                        {appendError}
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      Upload the next satti image or PDF. It will be processed by AI and automatically merged with the {entries.length} existing {entries.length === 1 ? "entry" : "entries"}.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => appendFileRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        Upload Photo / PDF
                      </button>
                      <button
                        onClick={() => appendCamRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl border border-emerald-200 transition-all hover:-translate-y-0.5"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        Take Photo
                      </button>
                    </div>
                  </div>
                ) : appendStage === "uploading" ? (
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#1d2226]">
                        {appendIsPdf ? "Converting PDF to image…" : "Preparing image…"}
                      </p>
                      <p className="text-xs text-gray-400">This may take a moment</p>
                    </div>
                  </div>
                ) : appendStage === "processing" ? (
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#1d2226]">AI is reading your satti…</p>
                      <p className="text-xs text-gray-400">Extracting and merging entries</p>
                    </div>
                  </div>
                ) : appendStage === "done" ? (
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Data merged successfully!</p>
                      <p className="text-xs text-gray-400">Table updated · {entries.length} total entries now</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

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
                    <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-black text-[#1d2226] text-base">{displayCommodity(group.displayName)}</h3>
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">{group.entries.length} entries</p>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="text-xs text-gray-400">Total Qty</p>
                          <p className="font-bold text-[#1d2226]">{displayQty(group.totalQty)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total Value</p>
                          <p className="font-black text-emerald-600">{displayMoney(group.totalAmt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {group.entries.map((e, i) => (
                        <div key={i} className="px-5 py-3 flex items-center gap-3 text-sm flex-wrap">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.uncertain ? "bg-amber-400" : "bg-emerald-500"}`} />
                          <span className="text-gray-500 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded">{displayMoney(e.rate)}</span>
                          <span className="text-gray-300">×</span>
                          <span className="text-gray-500 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded">{displayQty(e.quantity)}</span>
                          <span className="text-gray-300">=</span>
                          <span className="font-bold text-[#1d2226]">{displayMoney(e.amount)}</span>
                        </div>
                      ))}
                    </div>

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
          <div className="afu space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <h2 className="font-bold text-[#1d2226]">Summary Intelligence</h2>
              <span className="text-xs text-gray-400 ml-auto">AI-powered analytics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Total Transaction Value</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600">{displayMoney(totalAmount)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Total Quantity</p>
                <p className="text-2xl sm:text-3xl font-black text-[#1d2226]">{displayQty(totalQty)}</p>
                <p className="text-xs text-gray-400 mt-1">preferred unit</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Commodities Traded</p>
                <p className="text-2xl sm:text-3xl font-black text-[#1d2226]">{Object.keys(groupedLive).length}</p>
              </div>
            </div>

            {donutData.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <PieChartIcon className="h-4 w-4 text-violet-500" />
                  <h3 className="font-bold text-[#1d2226] text-sm">Commodity Value Distribution</h3>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-64 h-56 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius="52%" outerRadius="75%" paddingAngle={3} dataKey="value">
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltipPie />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    {donutData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                          <span className="text-sm font-semibold text-[#1d2226] truncate">{displayCommodity(item.name)}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="w-20 sm:w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.fill }} />
                          </div>
                          <span className="text-xs font-bold text-gray-500 w-8 text-right">{item.pct}%</span>
                          <span className="text-xs font-bold text-emerald-600 w-20 text-right hidden sm:block">{displayMoney(item.value)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</span>
                      <span className="text-sm font-black text-emerald-600">{displayMoney(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {barData.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUpIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="font-bold text-[#1d2226] text-sm">Price Range by Commodity (₹/qtl)</h3>
                </div>
                <div className="w-full h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 4, right: 8, left: -8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} width={70} />
                      <Tooltip content={<CustomTooltipBar />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} iconType="circle" iconSize={8} />
                      <Bar dataKey="Min Rate" fill="#6ee7b7" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Avg Rate" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Max Rate" fill="#064e3b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Per-Commodity Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(groupedLive).map(([key, group], colorIdx) => {
                  const minRate = Math.min(...group.rates);
                  const maxRate = Math.max(...group.rates);
                  const avgRate = group.rates.reduce((a, b) => a + b, 0) / group.rates.length;
                  const priceDist: Record<number, number> = {};
                  for (const e of group.entries) { priceDist[e.rate] = (priceDist[e.rate] || 0) + e.quantity; }
                  const topPrice = Object.entries(priceDist).sort((a, b) => b[1] - a[1])[0];
                  const color = CHART_COLORS[colorIdx % CHART_COLORS.length];

                  return (
                    <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <h3 className="font-black text-[#1d2226]">{displayCommodity(group.displayName)}</h3>
                          <span className="text-xs text-gray-400">{group.entries.length} entries</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{displayMoney(group.totalAmt)}</span>
                      </div>

                      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Qty traded</p>
                          <p className="font-bold text-[#1d2226]">{displayQty(group.totalQty)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Avg rate</p>
                          <p className="font-bold text-[#1d2226]">{fmt(Math.round(avgRate))}<span className="text-xs font-normal text-gray-400">/qtl</span></p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Price range</p>
                          <p className="font-bold text-[#1d2226] text-sm">{fmt(minRate)} – {fmt(maxRate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Top price point</p>
                          <p className="font-bold text-violet-600 text-sm">
                            {topPrice ? `${Math.round((topPrice[1] / group.totalQty) * 100)}% @ ${fmt(Number(topPrice[0]))}` : "—"}
                          </p>
                        </div>
                      </div>

                      {Object.entries(priceDist).length > 0 && (
                        <div className="px-5 pb-5">
                          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Purchase probability distribution</p>
                          <div className="space-y-2">
                            {Object.entries(priceDist)
                              .sort((a, b) => b[1] - a[1])
                              .map(([rate, qty]) => {
                                const pct = Math.round((qty / group.totalQty) * 100);
                                return (
                                  <div key={rate} className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-gray-500 w-20 flex-shrink-0">{fmt(Number(rate))}</span>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                                    </div>
                                    <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">{qty} qtl</span>
                                    <span className="text-xs font-bold w-8 text-right flex-shrink-0" style={{ color }}>{pct}%</span>
                                  </div>
                                );
                              })}
                          </div>
                          <p className="text-xs text-gray-300 mt-3">
                            {topPrice ? `${Math.round((topPrice[1] / group.totalQty) * 100)}% of ${group.displayName} purchased at ${fmt(Number(topPrice[0]))}` : ""}
                          </p>
                        </div>
                      )}

                      <div className="px-5 pb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs text-gray-400">Share of total value</p>
                          <span className="text-xs font-bold text-gray-500">
                            {totalAmount > 0 ? Math.round((group.totalAmt / totalAmount) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${totalAmount > 0 ? Math.round((group.totalAmt / totalAmount) * 100) : 0}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {data.summary?.processingNote && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertIcon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">{data.summary.processingNote}</p>
              </div>
            )}

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

      {editingEntry && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-[#f4f8f5] p-4 shadow-2xl sm:rounded-[2rem] sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Edit ledger entry</p>
                <h2 className="mt-1 text-2xl font-black text-[#1d2226]">{displayCommodity(editingEntry.commodity)}</h2>
                <p className="mt-1 text-sm font-medium text-gray-500">Update the extracted values before saving this satti.</p>
              </div>
              <button onClick={cancelEdit} className="rounded-full bg-white p-2 text-gray-400 shadow-sm ring-1 ring-gray-100 hover:text-gray-700" aria-label="Close edit panel">
                ✕
              </button>
            </div>

            <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-emerald-100 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">Commodity</label>
                  <input
                    value={editBuf.commodity ?? editingEntry.commodity}
                    onChange={(e) => setEditBuf((b) => ({ ...b, commodity: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#1d2226] outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">Rate</label>
                  <input
                    type="number"
                    value={editBuf.rate ?? editingEntry.rate}
                    onChange={(e) => setEditBuf((b) => ({ ...b, rate: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#1d2226] outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">Quantity</label>
                  <input
                    type="number"
                    value={editBuf.quantity ?? editingEntry.quantity}
                    onChange={(e) => setEditBuf((b) => ({ ...b, quantity: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#1d2226] outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">Unit</label>
                  <input
                    value={editBuf.unit ?? editingEntry.unit}
                    onChange={(e) => setEditBuf((b) => ({ ...b, unit: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#1d2226] outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">Calculated amount</label>
                  <div className="rounded-2xl bg-[#123f31] px-4 py-3 text-lg font-black text-white">
                    {displayMoney(Number(editBuf.rate ?? editingEntry.rate) * Number(editBuf.quantity ?? editingEntry.quantity))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">Notes / original line</label>
                  <textarea
                    rows={3}
                    value={editBuf.rawLine ?? editingEntry.rawLine}
                    onChange={(e) => setEditBuf((b) => ({ ...b, rawLine: e.target.value }))}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#1d2226] outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button onClick={cancelEdit} className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-500 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={() => saveEdit(editingEntry.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#123f31] px-5 py-3 text-sm font-black text-white hover:bg-[#0d3026]">
                  <CheckIcon className="h-4 w-4" />
                  Save entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
