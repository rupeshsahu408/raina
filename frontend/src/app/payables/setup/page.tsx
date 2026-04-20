"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

const EXPENSE_CATEGORIES = [
  "Logistics & Freight", "Raw Materials", "Professional Services",
  "Utilities & Bills", "Software & Subscriptions", "Marketing & Ads",
  "Office & Admin", "Travel & Accommodation", "Manufacturing", "Other",
];

const BUSINESS_TYPES = ["Sole Proprietor", "Partnership", "Private Limited (Pvt Ltd)", "LLP", "Public Limited", "Trust / NGO", "Other"];
const TEAM_SIZES = ["Just me", "2–5", "6–15", "16–50", "51–200", "200+"];
const VENDOR_RANGES = ["1–10", "11–50", "51–200", "200+"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD"];
const PAYMENT_METHODS = ["UPI", "NEFT", "RTGS", "IMPS", "Cheque", "Cash", "International Wire"];
const FISCAL_YEARS = [{ value: "april-march", label: "April – March (India Standard)" }, { value: "jan-dec", label: "January – December" }, { value: "jul-jun", label: "July – June" }];
const LANGUAGES = [{ value: "english", label: "English" }, { value: "hindi", label: "Hindi" }, { value: "mixed", label: "English + Hindi" }];
const AI_TONES = [{ value: "formal", label: "Formal" }, { value: "professional", label: "Professional" }, { value: "friendly", label: "Friendly" }];
const ALERT_MODES = [{ value: "realtime", label: "Real-time" }, { value: "daily", label: "Daily Digest" }, { value: "weekly", label: "Weekly Summary" }];
const APPROVAL_HIERARCHIES = [{ value: "flat", label: "Flat — anyone can approve" }, { value: "hierarchical", label: "Hierarchical — manager must approve above threshold" }];

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function CheckIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5" /></svg>;
}
function MailIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
}
function SparklesIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>;
}
function ArrowRightIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
}
function ArrowLeftIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>;
}
function XIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
}
function BuildingIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>;
}
function UploadIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
}

const STEPS = [
  { num: 1, label: "Brand" },
  { num: 2, label: "Business" },
  { num: 3, label: "Finance" },
  { num: 4, label: "Workflow" },
  { num: 5, label: "AI Setup" },
];

interface PersonalizationData {
  brandName: string;
  brandDescription: string;
  ownerName: string;
  teamSize: string;
  logoBase64: string;
  logoMimeType: string;
  gstNumber: string;
  businessType: string;
  businessCity: string;
  websiteUrl: string;
  defaultCurrency: string;
  preferredPaymentMethod: string;
  autoApprovalThreshold: string;
  fiscalYear: string;
  expenseCategories: string[];
  vendorCountRange: string;
  hasInternationalInvoices: boolean;
  preferredLanguage: string;
  aiTone: string;
  alertMode: string;
  financeContactEmail: string;
  approvalHierarchy: string;
}

const DEFAULT_DATA: PersonalizationData = {
  brandName: "", brandDescription: "", ownerName: "", teamSize: "",
  logoBase64: "", logoMimeType: "", gstNumber: "", businessType: "",
  businessCity: "", websiteUrl: "", defaultCurrency: "INR",
  preferredPaymentMethod: "", autoApprovalThreshold: "", fiscalYear: "april-march",
  expenseCategories: [], vendorCountRange: "", hasInternationalInvoices: false,
  preferredLanguage: "english", aiTone: "professional", alertMode: "realtime",
  financeContactEmail: "", approvalHierarchy: "flat",
};

export default function PayablesSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [personalizationDone, setPersonalizationDone] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<PersonalizationData>(DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (u) { const token = await u.getIdToken(); setUser({ uid: u.uid, token }); }
        else { setUser(null); setPageLoading(false); }
      });
      return unsub;
    } catch { setUser(null); setPageLoading(false); return undefined; }
  }, []);

  const loadStatus = useCallback(async () => {
    if (!user) return;
    try {
      const headers = payablesHeaders(user);
      const [gmailRes, personRes, companyRes] = await Promise.all([
        fetch(`${BACKEND}/payables/gmail/status`, { headers }),
        fetch(`${BACKEND}/payables/personalization`, { headers }),
        fetch(`${BACKEND}/payables/company`, { headers }),
      ]);
      if (gmailRes.ok) { const d = await gmailRes.json(); setGmailConnected(d.connected); setGmailEmail(d.email ?? null); }
      if (personRes.ok) {
        const d = await personRes.json();
        setPersonalizationDone(d.personalizationDone ?? false);
        if (d.personalizationDone) {
          setData({
            brandName: d.brandName ?? "", brandDescription: d.brandDescription ?? "",
            ownerName: d.ownerName ?? "", teamSize: d.teamSize ?? "",
            logoBase64: d.logoBase64 ?? "", logoMimeType: d.logoMimeType ?? "",
            gstNumber: d.gstNumber ?? "", businessType: d.businessType ?? "",
            businessCity: d.businessCity ?? "", websiteUrl: d.websiteUrl ?? "",
            defaultCurrency: d.defaultCurrency ?? "INR",
            preferredPaymentMethod: d.preferredPaymentMethod ?? "",
            autoApprovalThreshold: d.autoApprovalThreshold != null ? String(d.autoApprovalThreshold) : "",
            fiscalYear: d.fiscalYear ?? "april-march",
            expenseCategories: d.expenseCategories ?? [], vendorCountRange: d.vendorCountRange ?? "",
            hasInternationalInvoices: d.hasInternationalInvoices ?? false,
            preferredLanguage: d.preferredLanguage ?? "english", aiTone: d.aiTone ?? "professional",
            alertMode: d.alertMode ?? "realtime", financeContactEmail: d.financeContactEmail ?? "",
            approvalHierarchy: d.approvalHierarchy ?? "flat",
          });
          if (d.logoBase64) setLogoPreview(`data:${d.logoMimeType ?? "image/png"};base64,${d.logoBase64}`);
        }
      }
      if (companyRes.ok) { const d = await companyRes.json(); setCompanyName(d.companyName ?? ""); }
    } catch { }
    finally { setPageLoading(false); }
  }, [user]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Logo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(",")[1];
      setLogoPreview(result);
      setData(prev => ({ ...prev, logoBase64: base64, logoMimeType: file.type }));
    };
    reader.readAsDataURL(file);
  };

  const toggleCategory = (cat: string) => {
    setData(prev => ({
      ...prev,
      expenseCategories: prev.expenseCategories.includes(cat)
        ? prev.expenseCategories.filter(c => c !== cat)
        : [...prev.expenseCategories, cat],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError("");
    try {
      const payload = { ...data, autoApprovalThreshold: data.autoApprovalThreshold ? Number(data.autoApprovalThreshold) : null };
      const res = await fetch(`${BACKEND}/payables/personalization`, {
        method: "PUT",
        headers: { ...payablesHeaders(user), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to save");
      setPersonalizationDone(true);
      setShowModal(false);
      setStep(1);
    } catch (e: any) {
      setSaveError(e.message ?? "Failed to save personalization");
    } finally {
      setSaving(false);
    }
  };

  const connectGmail = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${BACKEND}/payables/gmail/auth-url`, { headers: payablesHeaders(user) });
      if (res.ok) { const d = await res.json(); window.location.href = d.url; }
    } catch { }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-gray-400">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white px-4 text-center">
        <h2 className="text-xl font-black text-[#1d2226]">Sign in to access your workspace</h2>
        <Link href="/login" className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/payables" className="flex items-center gap-1.5 text-sm font-black text-violet-600">
              <SparklesIcon className="h-4 w-4" />
              Plyndrox Payables
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-500">Workspace Setup</span>
          </div>
          <Link href="/payables/dashboard" className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
            Go to Dashboard
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Page heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-[#1d2226] sm:text-4xl">Workspace Setup</h1>
          <p className="mt-2 text-base text-gray-500">Configure your workspace so Plyndrox AI can work the way your business works.</p>
        </div>

        {/* Status Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {/* Gmail Status */}
          <div className={`relative overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-sm transition ${gmailConnected ? "border-emerald-200" : "border-amber-200"}`}>
            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${gmailConnected ? "bg-emerald-50" : "bg-amber-50"}`}>
              <MailIcon className={`h-5 w-5 ${gmailConnected ? "text-emerald-600" : "text-amber-500"}`} />
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Gmail Integration</p>
                <h3 className="mt-1 text-lg font-black text-[#1d2226]">
                  {gmailConnected ? "Connected" : "Not Connected"}
                </h3>
                {gmailConnected && gmailEmail && (
                  <p className="mt-0.5 text-xs text-gray-400">{gmailEmail}</p>
                )}
                {!gmailConnected && (
                  <p className="mt-1 text-xs text-gray-500">Connect Gmail so Plyndrox can auto-import invoice emails.</p>
                )}
              </div>
              <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ${gmailConnected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {gmailConnected ? "Active" : "Pending"}
              </span>
            </div>
            {!gmailConnected && (
              <button onClick={connectGmail} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <MailIcon className="h-4 w-4" />
                Connect Gmail
              </button>
            )}
            {gmailConnected && (
              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckIcon className="h-3.5 w-3.5" />
                Invoice emails will be imported automatically
              </div>
            )}
            {/* Decorative */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 ${gmailConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
          </div>

          {/* Personalization Status */}
          <div className={`relative overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-sm transition ${personalizationDone ? "border-violet-200" : "border-gray-200"}`}>
            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${personalizationDone ? "bg-violet-50" : "bg-gray-50"}`}>
              <SparklesIcon className={`h-5 w-5 ${personalizationDone ? "text-violet-600" : "text-gray-400"}`} />
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">AI Personalization</p>
                <h3 className="mt-1 text-lg font-black text-[#1d2226]">
                  {personalizationDone ? "Configured" : "Not Set Up"}
                </h3>
                {personalizationDone && data.brandName && (
                  <p className="mt-0.5 text-xs text-gray-400">Brand: {data.brandName}</p>
                )}
                {!personalizationDone && (
                  <p className="mt-1 text-xs text-gray-500">Help AI understand your business for smarter invoice handling.</p>
                )}
              </div>
              <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ${personalizationDone ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"}`}>
                {personalizationDone ? "Done" : "Pending"}
              </span>
            </div>
            <button
              onClick={() => { setShowModal(true); setStep(1); }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-[#1d2226] shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
            >
              <SparklesIcon className="h-4 w-4" />
              {personalizationDone ? "Edit Personalization" : "Set Up Personalization"}
            </button>
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-400 opacity-10" />
          </div>
        </div>

        {/* Dashboard Wireframe */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Dashboard Preview</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Fake navbar */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
              <div className="flex items-center gap-3">
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" className="h-5 w-5 rounded-lg object-cover" />
                ) : (
                  <div className="h-5 w-5 animate-pulse rounded-lg bg-gray-100" />
                )}
                <div className="h-3.5 w-24 animate-pulse rounded bg-gray-100" />
                <span className="text-gray-200">/</span>
                <div className="h-3.5 w-20 animate-pulse rounded bg-violet-100" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
                <div className="h-7 w-16 animate-pulse rounded-full bg-violet-100" />
                <div className="h-5 w-5 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
              {[
                { label: "Total Invoices", color: "bg-violet-50", bar: "bg-violet-200" },
                { label: "Pending Review", color: "bg-amber-50", bar: "bg-amber-200" },
                { label: "Approved", color: "bg-emerald-50", bar: "bg-emerald-200" },
                { label: "Processing", color: "bg-blue-50", bar: "bg-blue-200" },
              ].map(({ label, color, bar }) => (
                <div key={label} className={`rounded-xl ${color} p-4`}>
                  <div className="mb-2 h-3 w-14 animate-pulse rounded bg-gray-200" />
                  <div className="mb-3 h-6 w-10 animate-pulse rounded bg-gray-200" />
                  <div className={`h-1.5 w-full rounded-full ${bar}`} />
                </div>
              ))}
            </div>
            {/* Invoice list skeleton */}
            <div className="border-t border-gray-100 px-5 pb-5 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="flex gap-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />)}
                </div>
              </div>
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 border-b border-gray-50 py-3 last:border-0">
                  <div className="h-6 w-6 animate-pulse rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-50" />
                  </div>
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-violet-50" />
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">This is a preview of your dashboard. Complete personalization to see your branding here.</p>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-4 text-center">
          <button
            onClick={() => { setShowModal(true); setStep(1); }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <SparklesIcon className="h-4 w-4" />
            {personalizationDone ? "Update Personalization" : "Begin Personalization"}
          </button>
          <Link href="/payables/dashboard" className="text-sm text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline">
            Skip for now, go to dashboard
          </Link>
        </div>
      </div>

      {/* ─── Personalization Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-black text-[#1d2226]">Personalization</h2>
                <p className="text-xs text-gray-400">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-0 border-b border-gray-100 px-6 py-3">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <button
                    onClick={() => { if (s.num < step || personalizationDone) setStep(s.num); }}
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition ${step === s.num ? "bg-violet-600 text-white" : s.num < step ? "bg-emerald-100 text-emerald-700 cursor-pointer" : "bg-gray-100 text-gray-400"}`}
                  >
                    {s.num < step ? <CheckIcon className="h-3.5 w-3.5" /> : s.num}
                  </button>
                  <span className={`ml-1.5 mr-1 hidden text-xs font-medium sm:inline ${step === s.num ? "text-violet-700" : "text-gray-400"}`}>{s.label}</span>
                  {i < STEPS.length - 1 && <div className="mx-2 h-px w-4 bg-gray-200 sm:w-6" />}
                </div>
              ))}
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Step 1: Brand Identity */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Brand Name <span className="text-violet-500">*</span></label>
                    <input
                      type="text"
                      value={data.brandName}
                      onChange={e => setData(prev => ({ ...prev, brandName: e.target.value }))}
                      placeholder={companyName || "e.g. Acme Corp"}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#1d2226] outline-none ring-0 transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                    <p className="mt-1 text-xs text-gray-400">This will appear on your dashboard, emails, and reports.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Brand Logo</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 transition hover:border-violet-300 hover:bg-violet-50"
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="logo preview" className="h-16 w-16 rounded-xl object-contain" />
                      ) : (
                        <>
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                            <UploadIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-500">Click to upload your logo</p>
                        </>
                      )}
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP — max 2MB</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} />
                    {logoPreview && (
                      <button onClick={() => { setLogoPreview(null); setData(prev => ({ ...prev, logoBase64: "", logoMimeType: "" })); }} className="mt-2 text-xs text-rose-500 hover:underline">Remove logo</button>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Brand Description</label>
                    <textarea
                      value={data.brandDescription}
                      onChange={e => setData(prev => ({ ...prev, brandDescription: e.target.value }))}
                      rows={3}
                      placeholder="Briefly describe what your business does. This helps the AI understand your context."
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#1d2226] outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Business Details */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Your Name (Owner / Contact)</label>
                      <input
                        type="text"
                        value={data.ownerName}
                        onChange={e => setData(prev => ({ ...prev, ownerName: e.target.value }))}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Team Size</label>
                      <select
                        value={data.teamSize}
                        onChange={e => setData(prev => ({ ...prev, teamSize: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="">Select team size</option>
                        {TEAM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Business Type</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {BUSINESS_TYPES.map(bt => (
                        <button
                          key={bt}
                          type="button"
                          onClick={() => setData(prev => ({ ...prev, businessType: bt }))}
                          className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${data.businessType === bt ? "border-violet-400 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">GST Number <span className="font-normal text-gray-400">(optional)</span></label>
                      <input
                        type="text"
                        value={data.gstNumber}
                        onChange={e => setData(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                      <p className="mt-1 text-xs text-gray-400">AI will validate vendor GSTINs against yours.</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Business City</label>
                      <input
                        type="text"
                        value={data.businessCity}
                        onChange={e => setData(prev => ({ ...prev, businessCity: e.target.value }))}
                        placeholder="e.g. Mumbai"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Website URL <span className="font-normal text-gray-400">(optional)</span></label>
                    <input
                      type="url"
                      value={data.websiteUrl}
                      onChange={e => setData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      placeholder="https://yourcompany.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Financial Preferences */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Default Currency</label>
                      <select
                        value={data.defaultCurrency}
                        onChange={e => setData(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Preferred Payment Method</label>
                      <select
                        value={data.preferredPaymentMethod}
                        onChange={e => setData(prev => ({ ...prev, preferredPaymentMethod: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        <option value="">Select method</option>
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <p className="mt-1 text-xs text-gray-400">AI will flag invoices with mismatched payment details.</p>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Auto-Approval Threshold <span className="font-normal text-gray-400">(optional)</span></label>
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">{data.defaultCurrency}</span>
                      <input
                        type="number"
                        value={data.autoApprovalThreshold}
                        onChange={e => setData(prev => ({ ...prev, autoApprovalThreshold: e.target.value }))}
                        placeholder="e.g. 5000"
                        min={0}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Invoices below this amount will be marked ready for auto-approval. Leave blank to disable.</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Fiscal Year</label>
                    <div className="space-y-2">
                      {FISCAL_YEARS.map(fy => (
                        <button
                          key={fy.value}
                          type="button"
                          onClick={() => setData(prev => ({ ...prev, fiscalYear: fy.value }))}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${data.fiscalYear === fy.value ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${data.fiscalYear === fy.value ? "border-violet-600 bg-violet-600" : "border-gray-300"}`}>
                            {data.fiscalYear === fy.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`font-medium ${data.fiscalYear === fy.value ? "text-violet-700" : "text-gray-700"}`}>{fy.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Used for cash forecasting and annual reporting.</p>
                  </div>
                </div>
              )}

              {/* Step 4: Invoice Workflow */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Primary Expense Categories</label>
                    <p className="mb-2 text-xs text-gray-400">Select all that apply. AI will auto-tag invoices using these categories.</p>
                    <div className="flex flex-wrap gap-2">
                      {EXPENSE_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${data.expenseCategories.includes(cat) ? "border-violet-400 bg-violet-100 text-violet-700" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`}
                        >
                          {data.expenseCategories.includes(cat) && "✓ "}{cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">How many vendors do you work with?</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {VENDOR_RANGES.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setData(prev => ({ ...prev, vendorCountRange: r }))}
                          className={`rounded-xl border py-2.5 text-sm font-semibold transition ${data.vendorCountRange === r ? "border-violet-400 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">Calibrates how sensitive the anomaly detection is for new vendors.</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1d2226]">Do you receive international invoices?</label>
                    <div className="flex gap-3">
                      {[{ label: "Yes, we work with international vendors", value: true }, { label: "No, domestic only", value: false }].map(opt => (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => setData(prev => ({ ...prev, hasInternationalInvoices: opt.value }))}
                          className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${data.hasInternationalInvoices === opt.value ? "border-violet-400 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">Enables multi-currency intelligence and USD/EUR/GBP detection.</p>
                  </div>
                </div>
              )}

              {/* Step 5: AI Preferences */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Notification Language</label>
                      <div className="space-y-1.5">
                        {LANGUAGES.map(l => (
                          <button key={l.value} type="button" onClick={() => setData(prev => ({ ...prev, preferredLanguage: l.value }))}
                            className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${data.preferredLanguage === l.value ? "border-violet-400 bg-violet-50 text-violet-700 font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                            <div className={`h-3 w-3 rounded-full border-2 ${data.preferredLanguage === l.value ? "border-violet-600 bg-violet-600" : "border-gray-300"}`} />
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">AI Communication Tone</label>
                      <div className="space-y-1.5">
                        {AI_TONES.map(t => (
                          <button key={t.value} type="button" onClick={() => setData(prev => ({ ...prev, aiTone: t.value }))}
                            className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${data.aiTone === t.value ? "border-violet-400 bg-violet-50 text-violet-700 font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                            <div className={`h-3 w-3 rounded-full border-2 ${data.aiTone === t.value ? "border-violet-600 bg-violet-600" : "border-gray-300"}`} />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Alert Mode</label>
                      <div className="space-y-1.5">
                        {ALERT_MODES.map(a => (
                          <button key={a.value} type="button" onClick={() => setData(prev => ({ ...prev, alertMode: a.value }))}
                            className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${data.alertMode === a.value ? "border-violet-400 bg-violet-50 text-violet-700 font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                            <div className={`h-3 w-3 rounded-full border-2 ${data.alertMode === a.value ? "border-violet-600 bg-violet-600" : "border-gray-300"}`} />
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Finance Team Contact <span className="font-normal text-gray-400">(optional)</span></label>
                    <input
                      type="email"
                      value={data.financeContactEmail}
                      onChange={e => setData(prev => ({ ...prev, financeContactEmail: e.target.value }))}
                      placeholder="finance@yourcompany.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                    <p className="mt-1 text-xs text-gray-400">Escalations and exception alerts will be routed here.</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1d2226]">Approval Hierarchy</label>
                    <div className="space-y-2">
                      {APPROVAL_HIERARCHIES.map(ah => (
                        <button
                          key={ah.value}
                          type="button"
                          onClick={() => setData(prev => ({ ...prev, approvalHierarchy: ah.value }))}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${data.approvalHierarchy === ah.value ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${data.approvalHierarchy === ah.value ? "border-violet-600 bg-violet-600" : "border-gray-300"}`}>
                            {data.approvalHierarchy === ah.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`font-medium ${data.approvalHierarchy === ah.value ? "text-violet-700" : "text-gray-700"}`}>{ah.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {saveError && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600">{saveError}</p>}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => step === 1 ? setShowModal(false) : setStep(s => s - 1)}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                {step === 1 ? "Cancel" : "Back"}
              </button>
              <div className="flex gap-1">
                {STEPS.map(s => (
                  <div key={s.num} className={`h-1.5 w-6 rounded-full transition ${step === s.num ? "bg-violet-600" : step > s.num ? "bg-emerald-400" : "bg-gray-200"}`} />
                ))}
              </div>
              {step < STEPS.length ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {saving ? <Spinner /> : <CheckIcon className="h-4 w-4" />}
                  {saving ? "Saving…" : "Save Personalization"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
