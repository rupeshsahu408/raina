"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function UploadCloudIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

async function getIdToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [state, setState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setErrorMsg("Only PDF, JPG, PNG, or WEBP files are accepted.");
      setState("error");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setErrorMsg("File size must be under 20 MB.");
      setState("error");
      return;
    }
    setFile(f);
    setState("idle");
    setErrorMsg("");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setState("uploading");

    try {
      const token = await getIdToken();
      const auth = getAuth();
      const uid = auth.currentUser?.uid;
      if (!token || !uid) throw new Error("Please sign in first.");

      const form = new FormData();
      form.append("invoice", file);

      const res = await fetch(`${BACKEND}/payables/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "x-uid": uid },
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
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setState("error");
    } finally {
      setUploading(false);
    }
  };

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

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {state === "success" ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-10 text-center">
            <CheckCircleIcon className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
            <h2 className="text-2xl font-black text-[#1d2226]">Invoice uploaded!</h2>
            <p className="mt-3 text-base text-gray-500">
              The AI is reading your invoice right now. It will be ready in your dashboard within a few seconds.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => router.push("/payables/dashboard")}
                className="rounded-full bg-[#1d2226] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2d3238]"
              >
                Go to Dashboard
              </button>
              {invoiceId && (
                <button
                  onClick={() => router.push(`/payables/invoice/${invoiceId}`)}
                  className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300"
                >
                  View Invoice
                </button>
              )}
              <button
                onClick={() => { setFile(null); setState("idle"); setErrorMsg(""); setInvoiceId(null); }}
                className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
              >
                Upload another
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-[#1d2226]">Upload Invoice</h1>
              <p className="mt-2 text-base text-gray-500">
                Drop or select your invoice file. The AI will extract all the data automatically.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition ${
                dragOver
                  ? "border-violet-400 bg-violet-50"
                  : file
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
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
                <>
                  <FileIcon className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
                  <p className="text-base font-bold text-[#1d2226]">{file.name}</p>
                  <p className="mt-1 text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="mt-3 text-xs text-gray-400">Click or drop to replace</p>
                </>
              ) : (
                <>
                  <UploadCloudIcon className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                  <p className="text-base font-semibold text-[#1d2226]">
                    Drag your invoice here, or click to browse
                  </p>
                  <p className="mt-2 text-sm text-gray-400">PDF, JPG, PNG, WEBP — up to 20 MB</p>
                </>
              )}
            </div>

            {/* Error */}
            {state === "error" && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
                <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                <p className="text-sm text-rose-700">{errorMsg}</p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Tips for best results</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Use a clear, well-lit photo if scanning a paper invoice</li>
                <li>• PDFs exported directly from software work best</li>
                <li>• Make sure text is not blurry or cut off at edges</li>
              </ul>
            </div>

            {/* Upload button */}
            <button
              disabled={!file || uploading}
              onClick={handleUpload}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? (
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
          </>
        )}
      </div>
    </div>
  );
}
