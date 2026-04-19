"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLedgerAuth } from "@/contexts/LedgerAuthContext";

/* ── Icons ── */
function CameraIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
}
function UploadIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
}
function LogOutIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
}
function SparklesIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
}
function MenuIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
}
function XIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
}
function SearchIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function TrashIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function ChevronRightIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 18 6-6-6-6"/></svg>;
}
function PenLineIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>;
}
function ChevronDownIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6"/></svg>;
}
function CalendarIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
}
function FileImageIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="10" cy="12" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/></svg>;
}
function HistoryIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
}

type SessionSummary = {
  _id: string;
  summary: {
    totalAmount: number;
    totalQuantity: number;
    commodityCount: number;
    topCommodity: string;
    totalEntries: number;
  };
  meta: { processedAt: string; fileSizeKb: number };
  createdAt: string;
};

type ProcessingStage = "idle" | "uploading" | "ocr" | "ai" | "done" | "error";

const steps = [
  { icon: "📸", title: "Take a photo", desc: "Photograph your handwritten satti — any paper, any lighting." },
  { icon: "🤖", title: "AI reads it", desc: "AI reads the image and structures it by commodity." },
  { icon: "📊", title: "Get analytics", desc: "See raw entries, grouped totals, and price insights instantly." },
];

function fmt(n: number) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function LedgerDashboard() {
  const { user, loading, signOutFromLedger } = useLedgerAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  /* Session history state */
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  /* Manual text entry state */
  const [showTextEntry, setShowTextEntry] = useState(false);
  const [sattiText, setSattiText] = useState("");
  const [textStage, setTextStage] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/ledger/login");
  }, [user, loading, router]);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setSessionsLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (searchQ) params.set("q", searchQ);
      if (filterFrom) params.set("from", filterFrom);
      if (filterTo) params.set("to", filterTo);
      const qs = params.toString() ? "?" + params.toString() : "";
      const res = await fetch(`/backend/ledger/sessions${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      /* silently fail */
    } finally {
      setSessionsLoading(false);
    }
  }, [user, searchQ, filterFrom, filterTo]);

  useEffect(() => {
    if (user && !loading) fetchSessions();
  }, [user, loading, fetchSessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">SL</span>
          </div>
          <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.displayName?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";

  /* Resize + convert any image to a small JPEG before uploading.
     NVIDIA vision API requires the base64 payload to be well under 180 KB,
     so we adaptively compress until the blob is ≤ 70 KB. */
  const prepareImage = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const drawCanvas = (maxDim: number): HTMLCanvasElement => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas not supported.");
          ctx.drawImage(img, 0, 0, w, h);
          return canvas;
        };

        const tryCompress = (
          canvas: HTMLCanvasElement,
          qualities: number[],
          onDone: (blob: Blob) => void
        ) => {
          const [quality, ...rest] = qualities;
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Image conversion failed."));
              // Target ≤ 70 KB so base64 stays under ~95 KB (NVIDIA's safe zone)
              if (blob.size <= 70 * 1024 || rest.length === 0) {
                onDone(blob);
              } else {
                tryCompress(canvas, rest, onDone);
              }
            },
            "image/jpeg",
            quality
          );
        };

        try {
          // First pass: 1024 px, descending quality
          const canvas1024 = drawCanvas(1024);
          tryCompress(canvas1024, [0.85, 0.7, 0.55, 0.4], (blob) => {
            if (blob.size <= 70 * 1024) return resolve(blob);
            // Second pass: drop to 800 px if still too large
            const canvas800 = drawCanvas(800);
            tryCompress(canvas800, [0.7, 0.5, 0.35], resolve);
          });
        } catch (e: any) {
          reject(e);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not load image. Please try a different photo."));
      };

      img.src = objectUrl;
    });

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, HEIC, WebP).");
      return;
    }
    setError(null);
    setStage("uploading");
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      setStage("ocr");
      /* Convert & resize on the client — ensures a clean JPEG reaches the server */
      let uploadBlob: Blob;
      try {
        uploadBlob = await prepareImage(file);
      } catch {
        uploadBlob = file; // fallback: send original if canvas fails
      }
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("satti", uploadBlob, "satti.jpg");
      setStage("ai");
      const res = await fetch(`/backend/ledger/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed. Please try again.");
      sessionStorage.setItem("ledger_session", JSON.stringify(data));
      setStage("done");
      setTimeout(() => router.push("/ledger/session"), 400);
    } catch (err: any) {
      setStage("error");
      setError(err.message || "Something went wrong. Please try again.");
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
    }
  };

  const processText = async () => {
    if (!sattiText.trim()) return;
    setTextError(null);
    setTextStage("processing");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/backend/ledger/text", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: sattiText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed. Please try again.");
      sessionStorage.setItem("ledger_session", JSON.stringify(data));
      setTextStage("done");
      setTimeout(() => router.push("/ledger/session"), 300);
    } catch (err: any) {
      setTextStage("error");
      setTextError(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    processFile(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openSession = async (id: string) => {
    if (!user) return;
    setOpeningId(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/backend/ledger/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load session.");
      const data = await res.json();
      sessionStorage.setItem("ledger_session", JSON.stringify(data));
      router.push("/ledger/session");
    } catch (err: any) {
      setError(err.message || "Could not load session.");
    } finally {
      setOpeningId(null);
    }
  };

  const deleteSession = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/backend/ledger/sessions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed.");
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      setError(err.message || "Could not delete session.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const isProcessing = stage === "uploading" || stage === "ocr" || stage === "ai";

  const stageLabel: Record<ProcessingStage, string> = {
    idle: "",
    uploading: "Preparing image…",
    ocr: "AI is reading your satti…",
    ai: "Structuring the entries…",
    done: "Done! Opening results…",
    error: "",
  };

  const stageProgress: Record<ProcessingStage, number> = {
    idle: 0, uploading: 15, ocr: 45, ai: 80, done: 100, error: 0,
  };

  /* Filtered sessions list */
  const filteredSessions = sessions.filter((s) => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return (
      (s.summary?.topCommodity || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .afu { animation: fadeUp 0.5s ease-out forwards; }
        .afu-2 { animation: fadeUp 0.5s ease-out 0.1s forwards; opacity: 0; }
        .afu-3 { animation: fadeUp 0.5s ease-out 0.2s forwards; opacity: 0; }
        .upload-zone { border: 2px dashed #d1fae5; transition: all 0.2s ease; }
        .upload-zone:hover, .upload-zone.dragging { border-color: #059669; background-color: #f0fdf4; }
        .upload-zone.processing { border-color: #6ee7b7; background-color: #f0fdf4; cursor: not-allowed; }
        .session-card { transition: all 0.2s ease; }
        .session-card:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
      `}</style>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/ledger" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-xs">SL</span>
            </div>
            <span className="font-bold text-[#1d2226] text-sm">Smart Ledger</span>
          </Link>

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-xs uppercase">
                  {(user.displayName?.[0] ?? user.email?.[0] ?? "U")}
                </span>
              </div>
              <span className="text-sm text-gray-600 font-medium">{firstName}</span>
            </div>
            <button
              onClick={signOutFromLedger}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOutIcon className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>

          <button className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-xs uppercase">
                  {(user.displayName?.[0] ?? user.email?.[0] ?? "U")}
                </span>
              </div>
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
            <button onClick={signOutFromLedger} className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
              <LogOutIcon className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Greeting */}
        <div className="afu mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1d2226] mb-1">
            Good to see you, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm">Upload your satti to get started. It takes less than 10 seconds.</p>
        </div>

        {/* Upload zone */}
        <div className="afu-2 mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={isProcessing}
          />

          <div
            className={`upload-zone rounded-3xl bg-white p-8 sm:p-12 text-center ${isProcessing ? "processing" : "cursor-pointer"} ${dragging ? "dragging" : ""}`}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); if (!isProcessing) setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {isProcessing || stage === "done" ? (
              <div className="flex flex-col items-center gap-5">
                {preview && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-sm">
                    <img src={preview} alt="Uploading" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="w-full max-w-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1d2226]">{stageLabel[stage]}</span>
                    <span className="text-xs text-emerald-600 font-bold">{stageProgress[stage]}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${stageProgress[stage]}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                  Processing your satti…
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <UploadIcon className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-600 border-2 border-white flex items-center justify-center">
                    <CameraIcon className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-base font-bold text-[#1d2226] mb-1">Upload your satti photo</p>
                  <p className="text-sm text-gray-400">
                    Tap to choose from gallery or{" "}
                    <span className="text-emerald-600 font-semibold">take a photo</span>
                  </p>
                  <p className="text-xs text-gray-300 mt-1">or drag and drop here</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {["JPG", "PNG", "HEIC", "WebP"].map((fmt) => (
                    <span key={fmt} className="text-xs font-medium bg-gray-50 border border-gray-100 text-gray-400 px-2.5 py-1 rounded-lg">{fmt}</span>
                  ))}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="mt-2 flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 shadow-sm shadow-emerald-100"
                >
                  <CameraIcon className="h-4 w-4" />
                  Upload Satti
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠</span>
              <div>
                <p className="text-sm text-red-600 font-medium">{error}</p>
                <button onClick={() => { setError(null); setStage("idle"); }} className="text-xs text-red-400 hover:text-red-600 mt-1">Dismiss</button>
              </div>
            </div>
          )}

          {/* Manual text entry toggle */}
          {!isProcessing && stage !== "done" && (
            <div className="mt-4">
              <button
                onClick={() => { setShowTextEntry(!showTextEntry); setTextError(null); setTextStage("idle"); }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-600 transition-colors mx-auto"
              >
                <PenLineIcon className="h-3.5 w-3.5" />
                <span>or type your satti manually</span>
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${showTextEntry ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}
        </div>

        {/* Manual text entry panel */}
        {showTextEntry && !isProcessing && stage !== "done" && (
          <div className="afu-2 mb-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-2 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-0.5">
                <PenLineIcon className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#1d2226]">Type satti manually</h3>
              </div>
              <p className="text-xs text-gray-400">Type one entry per line. Include commodity name, rate, and quantity.</p>
            </div>

            <div className="px-6 py-4">
              {/* Example hint */}
              <div className="mb-3 bg-gray-50 rounded-xl px-4 py-3 font-mono text-xs text-gray-400 leading-relaxed select-none">
                <span className="text-gray-300 block mb-1">Example format:</span>
                गेहू 2450 20 qtl<br />
                Chawal 3200 15 qtl<br />
                Sarson 5800 8 qtl
              </div>

              <textarea
                value={sattiText}
                onChange={(e) => setSattiText(e.target.value)}
                placeholder={"गेहू 2450 20 qtl\nChawal 3200 15 qtl\n..."}
                rows={6}
                disabled={textStage === "processing" || textStage === "done"}
                className="w-full px-4 py-3 text-sm font-mono text-[#1d2226] bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all placeholder:text-gray-300 resize-none disabled:opacity-60"
              />

              {textError && (
                <div className="mt-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 text-xs">⚠</span>
                  <div>
                    <p className="text-xs text-red-600 font-medium">{textError}</p>
                    <button onClick={() => { setTextError(null); setTextStage("idle"); }} className="text-xs text-red-400 hover:text-red-600 mt-0.5">Dismiss</button>
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-300">{sattiText.length} / 5000 chars</span>
                <button
                  onClick={processText}
                  disabled={!sattiText.trim() || textStage === "processing" || textStage === "done"}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 disabled:translate-y-0 shadow-sm shadow-emerald-100 disabled:shadow-none"
                >
                  {textStage === "processing" ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : textStage === "done" ? (
                    <>Opening results…</>
                  ) : (
                    <>
                      <SparklesIcon className="h-3.5 w-3.5" />
                      Process satti
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Usage counter */}
        <div className="afu-2 mb-8 bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Uploads this month</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-[#1d2226]">{sessions.length}</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-400 font-semibold">10</span>
              <span className="text-xs text-gray-400">free plan</span>
            </div>
          </div>
          <div className="text-right">
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min((sessions.length / 10) * 100, 100)}%` }} />
            </div>
            <span className="text-xs text-emerald-600 font-semibold">
              {Math.max(10 - sessions.length, 0)} remaining
            </span>
          </div>
        </div>

        {/* ── Session History ── */}
        <div className="afu-3">
          {/* Section header */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4 text-gray-400" />
              <h2 className="text-base font-bold text-[#1d2226]">Upload History</h2>
              {sessions.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                  {sessions.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                showFilters ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "text-gray-500 border-gray-200 hover:border-emerald-200 hover:text-emerald-600"
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>

          {/* Search + date filter */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by commodity…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all placeholder:text-gray-300"
              />
              {searchQ && (
                <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {showFilters && (
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs text-gray-400 font-semibold block mb-1">From date</label>
                  <input
                    type="date"
                    value={filterFrom}
                    onChange={(e) => setFilterFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-400 transition-all"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs text-gray-400 font-semibold block mb-1">To date</label>
                  <input
                    type="date"
                    value={filterTo}
                    onChange={(e) => setFilterTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-400 transition-all"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={fetchSessions}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Apply
                  </button>
                  {(filterFrom || filterTo) && (
                    <button
                      onClick={() => { setFilterFrom(""); setFilterTo(""); }}
                      className="px-4 py-2 text-xs font-semibold text-gray-400 border border-gray-200 rounded-xl hover:border-red-200 hover:text-red-500 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sessions list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {sessionsLoading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Loading history…</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="py-16 px-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                  <FileImageIcon className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400 mb-1">
                  {searchQ || filterFrom || filterTo ? "No matching sessions" : "No uploads yet"}
                </p>
                <p className="text-xs text-gray-300 max-w-xs">
                  {searchQ || filterFrom || filterTo
                    ? "Try adjusting your search or date filter."
                    : "Your uploaded sattis will appear here. Upload your first one above."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredSessions.map((session) => (
                  <div key={session._id} className="session-card relative px-4 sm:px-5 py-4">

                    {/* Delete confirm overlay */}
                    {confirmDeleteId === session._id && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-none px-6">
                        <div className="text-center">
                          <p className="text-sm font-bold text-[#1d2226] mb-1">Delete this session?</p>
                          <p className="text-xs text-gray-400 mb-4">This action cannot be undone.</p>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => deleteSession(session._id)}
                              disabled={deletingId === session._id}
                              className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
                            >
                              {deletingId === session._id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {/* Date block */}
                      <div className="flex-shrink-0 w-12 text-center">
                        <p className="text-lg font-black text-emerald-600 leading-none">
                          {new Date(session.createdAt).getDate()}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {new Date(session.createdAt).toLocaleString("en-IN", { month: "short" })}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-10 bg-gray-100 flex-shrink-0" />

                      {/* Session info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#1d2226] truncate">
                            {session.summary?.topCommodity
                              ? `${session.summary.topCommodity}${session.summary.commodityCount > 1 ? ` +${session.summary.commodityCount - 1} more` : ""}`
                              : `${session.summary?.commodityCount || 0} commodities`}
                          </span>
                          <span className="text-xs text-gray-400">{fmtTime(session.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400">
                            {session.summary?.totalEntries || 0} entries
                          </span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">
                            {session.summary?.totalQuantity
                              ? `${Number(session.summary.totalQuantity).toLocaleString("en-IN")} qtl`
                              : "—"}
                          </span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs font-bold text-emerald-600">
                            {fmt(session.summary?.totalAmount || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setConfirmDeleteId(session._id)}
                          className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                          title="Delete session"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openSession(session._id)}
                          disabled={openingId === session._id}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all disabled:opacity-50"
                        >
                          {openingId === session._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                          ) : (
                            <>Open <ChevronRightIcon className="h-3.5 w-3.5" /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Refresh button */}
          {sessions.length > 0 && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={fetchSessions}
                disabled={sessionsLoading}
                className="text-xs text-gray-400 hover:text-emerald-600 transition-colors font-medium"
              >
                {sessionsLoading ? "Refreshing…" : "Refresh history"}
              </button>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-10 afu-3">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">How Smart Ledger works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[#1d2226] mb-0.5">{s.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
