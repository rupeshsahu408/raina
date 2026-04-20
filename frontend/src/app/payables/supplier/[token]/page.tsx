"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_MB = 20;

type PortalProfile = {
  companyName?: string;
  brandName?: string;
  brandDescription?: string;
  logoBase64?: string;
  logoMimeType?: string;
  companyAddress?: string;
  gstNumber?: string;
  websiteUrl?: string;
  supportEmail?: string;
  businessCity?: string;
  businessType?: string;
};

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function SupplierUploadPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const inputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSent, setLeadSent] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`${BACKEND}/payables/supplier-portal/${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "This upload link is not available.");
        if (alive) setProfile(data);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "This upload link is not available.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (token) load();
    return () => { alive = false; };
  }, [token]);

  const selectFile = (nextFile: File | null) => {
    if (!nextFile) return;
    if (!ACCEPT_TYPES.includes(nextFile.type)) {
      setError("Please upload a PDF, JPG, PNG, or WEBP invoice file.");
      return;
    }
    if (nextFile.size > MAX_MB * 1024 * 1024) {
      setError(`File size must be under ${MAX_MB} MB.`);
      return;
    }
    setFile(nextFile);
    setError("");
  };

  const submitInvoice = async () => {
    if (!file || !token) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("invoice", file);
      form.append("supplierName", supplierName);
      form.append("supplierEmail", supplierEmail);
      const res = await fetch(`${BACKEND}/payables/supplier-portal/${encodeURIComponent(token)}/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed. Please try again.");
      setSuccess(true);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const submitLead = async () => {
    if (!token) return;
    setError("");
    try {
      const res = await fetch(`${BACKEND}/payables/supplier-portal/${encodeURIComponent(token)}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierName, supplierEmail, supplierPhone: leadPhone, message: leadMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit details.");
      setLeadSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit details.");
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-sm font-semibold text-gray-500">Loading supplier upload page…</div>;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 text-center">
        <div className="max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-black text-[#1d2226]">Upload link unavailable</h1>
          <p className="mt-2 text-sm text-gray-500">{error || "Please ask the business to share the latest invoice upload link."}</p>
        </div>
      </div>
    );
  }

  const brand = profile.brandName || profile.companyName || "this business";

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {profile.logoBase64 ? (
              <img src={`data:${profile.logoMimeType ?? "image/png"};base64,${profile.logoBase64}`} alt={`${brand} logo`} className="h-16 w-16 rounded-2xl object-contain ring-1 ring-gray-100" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-black text-white">{brand.slice(0, 1).toUpperCase()}</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-violet-500">Supplier invoice portal</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">Hello Sir, welcome to {brand}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Please upload your invoice below. The finance team will receive it instantly and AI will extract the invoice details automatically.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-bold text-gray-400">Business name</p><p className="mt-1 font-bold text-[#1d2226]">{profile.companyName || brand}</p></div>
            <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-bold text-gray-400">GSTIN</p><p className="mt-1 font-bold text-[#1d2226]">{profile.gstNumber || "Not provided"}</p></div>
            <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-bold text-gray-400">Contact</p><p className="mt-1 truncate font-bold text-[#1d2226]">{profile.supportEmail || profile.websiteUrl || "Finance team"}</p></div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            {success ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white"><CheckIcon className="h-5 w-5" /></div>
                <h2 className="mt-5 text-2xl font-black text-[#1d2226]">Invoice submitted successfully</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Thank you. The invoice has been sent to {brand} and AI processing has already started.</p>
                <button onClick={() => setSuccess(false)} className="mt-6 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300">Upload another invoice</button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black text-[#1d2226]">Upload invoice document</h2>
                <p className="mt-2 text-sm text-gray-500">PDF, JPG, PNG or WEBP files are accepted up to {MAX_MB} MB.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Your company / supplier name" className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
                  <input value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)} placeholder="Email for follow-up" type="email" className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
                </div>
                <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files[0]); }} className="mt-5 cursor-pointer rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center transition hover:border-violet-300 hover:bg-violet-50/40">
                  <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => selectFile(e.target.files?.[0] ?? null)} />
                  <UploadIcon className="mx-auto h-5 w-5 text-gray-300" />
                  <p className="mt-3 text-sm font-bold text-[#1d2226]">{file ? file.name : "Drag invoice here or click to browse"}</p>
                  <p className="mt-1 text-xs text-gray-400">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : "Clear invoice photos and original PDFs work best"}</p>
                </div>
                {error && <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
                <button onClick={submitInvoice} disabled={!file || uploading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
                  {uploading ? <Spinner /> : <UploadIcon className="h-4 w-4" />}
                  {uploading ? "Uploading & starting AI…" : "Submit invoice to finance team"}
                </button>
              </>
            )}
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-[#1d2226]">Do you want to become our customer?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">Share your details and {brand} can connect with you for onboarding, services, or future business.</p>
            {leadSent ? (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Thanks. Your details have been shared.</div>
            ) : leadOpen ? (
              <div className="mt-5 space-y-3">
                <input value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} placeholder="Phone / WhatsApp" className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300" />
                <textarea value={leadMessage} onChange={(e) => setLeadMessage(e.target.value)} placeholder="Tell us what you need" rows={4} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-300" />
                <button onClick={submitLead} className="w-full rounded-full bg-[#1d2226] py-3 text-sm font-bold text-white transition hover:bg-[#2d3238]">Send details</button>
              </div>
            ) : (
              <button onClick={() => setLeadOpen(true)} className="mt-5 w-full rounded-full border border-violet-100 bg-violet-50 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-100">Yes, I’m interested</button>
            )}
            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-xs leading-5 text-gray-500">
              Your invoice will be submitted securely to {brand}. No login is required for suppliers.
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">Powered by <Link href="/payables" className="font-bold text-gray-500">Plyndrox Payables</Link></p>
      </div>
    </div>
  );
}
