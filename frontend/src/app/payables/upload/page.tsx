"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ─── Icons ─── */
function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  );
}
function UploadCloudIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

async function getIdToken() {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  } catch {
    return null;
  }
}

const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_MB = 20;

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!ACCEPT_TYPES.includes(f.type)) {
      setErrorMsg("Only PDF, JPG, PNG, or WEBP files are accepted.");
      setState("error");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrorMsg(`File size must be under ${MAX_MB} MB.`);
      setState("error");
      return;
    }
    setFile(f);
    setState("idle");
    setErrorMsg("");
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setState("uploading");
    try {
      const token = await getIdToken();
      const uid = (() => { try { return getFirebaseAuth().currentUser?.uid; } catch { return null; } })();
      if (!token || !uid) throw new Error("Please sign in first.");

      const form = new FormData();
      form.append("invoice", file);

      const res = await fetch(`${BACKEND}/payables/upload`, {
        method: "POST",
        headers: payablesHeaders({ uid, token }),
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }

      const data = await res.json();
      setInvoiceId(data.invoiceId);
      setState("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setState("error");
    }
  };

  const reset = () => {
    setFile(null);
    setState("idle");
    setErrorMsg("");
    setInvoiceId(null);
  };

  /* ─── Success state ─── */
  if (state === "success") {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
            <Link href="/payables/dashboard" className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1d2226]">
              <ArrowLeftIcon className="h-4 w-4" /> Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Upload Invoice</span>
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-10 text-center shadow-sm">
            <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 shadow-md">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#1d2226]">Invoice uploaded!</h2>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-500">
              The AI is reading your invoice right now. It will be ready in your dashboard within a few seconds.
            </p>

            <div className="mx-auto mt-6 max-w-xs rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-left">
              <p className="text-xs font-semibold text-emerald-700">What happens next</p>
              <ul className="mt-2 space-y-1.5 text-xs text-emerald-600">
                <li>· AI extracts vendor, amount, due date & line items</li>
                <li>· Invoice appears in your dashboard as "Ready for Review"</li>
                <li>· You review, edit if needed, and approve</li>
              </ul>
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <button
                onClick={() => router.push("/payables/dashboard")}
                className="w-full rounded-full bg-[#1d2226] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#2d3238]"
              >
                Go to Dashboard
              </button>
              {invoiceId && (
                <button
                  onClick={() => router.push(`/payables/invoice/${invoiceId}`)}
                  className="w-full rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300"
                >
                  View Invoice
                </button>
              )}
              <button
                onClick={reset}
                className="w-full rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-500 transition hover:border-gray-300"
              >
                Upload another invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main upload state ─── */
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link href="/payables/dashboard" className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[#1d2226]">
            <ArrowLeftIcon className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-black text-[#1d2226]">Upload Invoice</span>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500">
            <ZapIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">Upload Invoice</h1>
          <p className="mt-2 text-sm text-gray-500">
            Drop or select your invoice file. AI will extract all data — vendor, amount, due date, line items — automatically.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all sm:p-16 ${
            dragOver
              ? "border-violet-400 bg-violet-50 scale-[1.01]"
              : file
              ? "border-emerald-300 bg-emerald-50"
              : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/30"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {file ? (
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                <FileIcon className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="max-w-xs truncate text-base font-bold text-[#1d2226]">{file.name}</p>
              <p className="mt-1 text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircleIcon className="h-3.5 w-3.5" /> Ready to upload
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 transition group-hover:bg-violet-100">
                <UploadCloudIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-bold text-[#1d2226]">
                {dragOver ? "Drop it here!" : "Drag your invoice here"}
              </p>
              <p className="mt-1.5 text-sm text-gray-400">or click to browse files</p>
              <p className="mt-3 text-xs text-gray-300">PDF · JPG · PNG · WEBP · up to {MAX_MB} MB</p>
            </div>
          )}
        </div>

        {/* Error message */}
        {state === "error" && errorMsg && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
            <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700">{errorMsg}</p>
            </div>
            <button onClick={() => setState("idle")} className="text-rose-400 hover:text-rose-600">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload button */}
        <button
          disabled={!file || state === "uploading"}
          onClick={handleUpload}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "uploading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Uploading & processing…
            </span>
          ) : (
            "Upload & Extract with AI"
          )}
        </button>

        {/* Tips */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <InfoIcon className="h-4 w-4 text-gray-400" />
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tips for best results</p>
          </div>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
              Use a clear, well-lit photo if scanning a paper invoice
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
              PDFs exported directly from accounting software work best
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
              Make sure text is not blurry or cut off at the edges
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
              Supported currencies: USD, EUR, GBP, INR, and more
            </li>
          </ul>
        </div>

        {/* Supported formats */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {["PDF", "JPG", "PNG", "WEBP"].map((fmt) => (
            <span key={fmt} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500">
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
