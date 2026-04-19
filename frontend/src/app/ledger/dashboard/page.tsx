"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLedgerAuth } from "@/contexts/LedgerAuthContext";

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function LogOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function FileImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <circle cx="10" cy="12" r="2" />
      <path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

const steps = [
  { icon: "📸", title: "Take a photo", desc: "Photograph your handwritten satti — any paper, any lighting." },
  { icon: "🤖", title: "AI reads it", desc: "Google Vision extracts the text. Gemini structures it by commodity." },
  { icon: "📊", title: "Get analytics", desc: "See raw entries, grouped totals, and price insights instantly." },
];

export default function LedgerDashboard() {
  const { user, loading, signOutFromLedger } = useLedgerAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/ledger/login");
    }
  }, [user, loading, router]);

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

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    // Phase 3 will wire this to the OCR pipeline
    alert("Upload ready! OCR pipeline coming in Phase 3.");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fadeUp 0.5s ease-out forwards; }
        .anim-fade-up-2 { animation: fadeUp 0.5s ease-out 0.1s forwards; opacity: 0; }
        .anim-fade-up-3 { animation: fadeUp 0.5s ease-out 0.2s forwards; opacity: 0; }
        .upload-zone {
          border: 2px dashed #d1fae5;
          transition: all 0.2s ease;
        }
        .upload-zone:hover, .upload-zone.dragging {
          border-color: #059669;
          background-color: #f0fdf4;
        }
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

          {/* Desktop right */}
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

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
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
            <button
              onClick={signOutFromLedger}
              className="flex items-center gap-1.5 text-sm text-red-500 font-medium"
            >
              <LogOutIcon className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Greeting */}
        <div className="anim-fade-up mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1d2226] mb-1">
            Good to see you, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm">Upload your satti to get started. It takes less than 10 seconds.</p>
        </div>

        {/* Upload zone */}
        <div className="anim-fade-up-2 mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <div
            className={`upload-zone rounded-3xl bg-white p-8 sm:p-12 text-center cursor-pointer ${dragging ? "dragging" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Icon cluster */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <UploadIcon className="h-7 w-7 text-emerald-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-600 border-2 border-white flex items-center justify-center">
                  <CameraIcon className="h-3.5 w-3.5 text-white" />
                </div>
              </div>

              <div>
                <p className="text-base font-bold text-[#1d2226] mb-1">
                  Upload your satti photo
                </p>
                <p className="text-sm text-gray-400">
                  Tap to choose from gallery or{" "}
                  <span className="text-emerald-600 font-semibold">take a photo</span>
                </p>
                <p className="text-xs text-gray-300 mt-1">or drag and drop here</p>
              </div>

              {/* Supported formats */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {["JPG", "PNG", "HEIC", "WebP"].map((fmt) => (
                  <span key={fmt} className="text-xs font-medium bg-gray-50 border border-gray-100 text-gray-400 px-2.5 py-1 rounded-lg">
                    {fmt}
                  </span>
                ))}
              </div>

              {/* CTA button */}
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="mt-2 flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 shadow-sm shadow-emerald-100"
              >
                <CameraIcon className="h-4 w-4" />
                Upload Satti
              </button>
            </div>
          </div>
        </div>

        {/* Usage counter */}
        <div className="anim-fade-up-2 mb-8 bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Free uploads used</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-[#1d2226]">0</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-400 font-semibold">10</span>
              <span className="text-xs text-gray-400">this month</span>
            </div>
          </div>
          <div className="text-right">
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "0%" }} />
            </div>
            <span className="text-xs text-emerald-600 font-semibold">10 remaining</span>
          </div>
        </div>

        {/* Empty state — recent uploads */}
        <div className="anim-fade-up-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1d2226]">Recent uploads</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Empty state */}
            <div className="py-16 px-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <FileImageIcon className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400 mb-1">No uploads yet</p>
              <p className="text-xs text-gray-300 max-w-xs">
                Your uploaded sattis will appear here. Upload your first one above to get started.
              </p>
            </div>
          </div>
        </div>

        {/* How it works reminder */}
        <div className="mt-10 anim-fade-up-3">
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
