"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { payablesHeaders } from "@/lib/payablesApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

const INDUSTRIES = [
  "Retail & E-commerce",
  "Construction & Contracting",
  "Healthcare & Medical",
  "Technology & Software",
  "Manufacturing",
  "Professional Services",
  "Hospitality & Food",
  "Real Estate",
  "Logistics & Transport",
  "Other",
];

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const STEPS = [
  { num: 1, label: "Company" },
  { num: 2, label: "Gmail" },
  { num: 3, label: "Ready" },
];

export default function PayablesOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<{ uid: string; token: string } | null>(null);
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [checkingGmail, setCheckingGmail] = useState(false);
  const [gmailMessage, setGmailMessage] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [monthlyInvoices, setMonthlyInvoices] = useState("");
  const [companyError, setCompanyError] = useState("");

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (u) {
          const token = await u.getIdToken();
          setUser({ uid: u.uid, token });
        }
      });
      return unsub;
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`${BACKEND}/payables/company`, {
      headers: payablesHeaders(user),
    })
      .then((res) => res.ok ? res.json() : null)
      .then((profile) => {
        if (!profile) return;
        if (profile.onboarded && profile.companyName) {
          router.replace("/payables/dashboard");
          return;
        }
        setCompanyName(profile.companyName ?? "");
        setIndustry(profile.industry ?? "");
        setMonthlyInvoices(profile.monthlyInvoices ?? "");
      })
      .catch(() => {});
  }, [user, router]);

  const checkGmailStatus = async () => {
    if (!user) return;
    setCheckingGmail(true);
    try {
      const res = await fetch(`${BACKEND}/payables/gmail/status`, {
        headers: payablesHeaders(user),
      });
      const data = await res.json();
      setGmailConnected(data.connected);
    } catch {
      setGmailConnected(false);
    } finally {
      setCheckingGmail(false);
    }
  };

  useEffect(() => {
    if (step === 2 && user) {
      checkGmailStatus();
    }
  }, [step, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const result = new URLSearchParams(window.location.search).get("gmail");
    if (result === "connected") {
      setStep(2);
      setGmailConnected(true);
      setGmailMessage("Gmail connected successfully. Plyndrox Payable AI can now import invoice emails.");
      window.history.replaceState({}, "", "/payables/onboarding");
    }
    if (result === "oauth_failed") {
      setStep(2);
      setGmailConnected(false);
      setGmailMessage("Gmail connection failed. Please try again or contact support if it repeats.");
      window.history.replaceState({}, "", "/payables/onboarding");
    }
  }, []);

  const connectGmail = async () => {
    if (!user) return;
    setCheckingGmail(true);
    setGmailMessage("");
    try {
      const res = await fetch(`${BACKEND}/payables/gmail/auth-url?returnTo=${encodeURIComponent("/payables/onboarding?gmail=connected")}`, {
        headers: payablesHeaders(user),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start Gmail connection.");
      window.location.href = data.url;
    } catch (err) {
      setGmailConnected(false);
      setGmailMessage(err instanceof Error ? err.message : "Could not start Gmail connection.");
      setCheckingGmail(false);
    }
  };

  const handleCompanyNext = async () => {
    if (!companyName.trim()) {
      setCompanyError("Please enter your company name.");
      return;
    }
    if (!user) {
      setCompanyError("Please sign in first.");
      return;
    }
    setCompanyError("");
    setSavingCompany(true);
    try {
      const res = await fetch(`${BACKEND}/payables/company`, {
        method: "PUT",
        headers: payablesHeaders(user, true),
        body: JSON.stringify({ companyName, industry, monthlyInvoices }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save company profile.");
      localStorage.setItem("payables_company", JSON.stringify({ companyName, industry, monthlyInvoices }));
      localStorage.setItem("payables_onboarded", "true");
      setStep(2);
    } catch (err) {
      setCompanyError(err instanceof Error ? err.message : "Could not save company profile.");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("payables_onboarded", "true");
    router.push("/payables/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Top bar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">Plyndrox</span>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black text-[#1d2226]">Plyndrox Payable AI</span>
          </Link>
          <span className="text-xs text-gray-400">Setup · Step {step} of 3</span>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Progress stepper */}
        <div className="mb-10 flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                step > s.num
                  ? "bg-emerald-500 text-white"
                  : step === s.num
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {step > s.num ? <CheckIcon className="h-3.5 w-3.5" /> : s.num}
              </div>
              <span className={`ml-2 text-xs font-semibold ${step === s.num ? "text-[#1d2226]" : "text-gray-400"}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`mx-3 h-px w-10 transition-all sm:w-16 ${step > s.num ? "bg-emerald-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Company info */}
        {step === 1 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-md">
              <BuildingIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">
              Tell us about your company
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              This helps us personalize your payables experience. Takes 30 seconds.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); setCompanyError(""); }}
                  placeholder="e.g. Acme Corp"
                  className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-semibold text-[#1d2226] outline-none transition focus:ring-2 ${
                    companyError
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-gray-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />
                {companyError && <p className="mt-1.5 text-xs text-rose-500">{companyError}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Industry <span className="text-gray-300">(optional)</span>
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#1d2226] outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="">Select your industry…</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Monthly invoices received <span className="text-gray-300">(optional)</span>
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {["1–10", "11–50", "51–200", "200+"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setMonthlyInvoices(opt)}
                      className={`rounded-xl border py-3 text-sm font-semibold transition ${
                        monthlyInvoices === opt
                          ? "border-violet-300 bg-violet-50 text-violet-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-[#1d2226]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCompanyNext}
              disabled={savingCompany}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {savingCompany ? "Saving…" : "Continue"} <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2 — Gmail */}
        {step === 2 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-md">
              <MailIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">
              Connect your Gmail
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Plyndrox Payable AI will automatically detect invoice emails and extract data — no manual forwarding needed.
            </p>
            {gmailMessage && (
              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm font-semibold text-violet-700">
                {gmailMessage}
              </div>
            )}

            <div className="mt-7">
              {checkingGmail ? (
                <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-violet-500" />
                  <span className="text-sm text-gray-500">Checking Gmail connection…</span>
                </div>
              ) : gmailConnected ? (
                <div className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
                    <CheckIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Gmail connected</p>
                    <p className="mt-0.5 text-xs text-emerald-600">
                      Invoice emails will be automatically imported and read by AI.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                    <p className="text-sm font-semibold text-amber-800">Gmail not connected yet</p>
                    <p className="mt-1 text-xs text-amber-600">
                      Connect your Gmail so Plyndrox Payable AI can automatically find and import invoice emails.
                    </p>
                  </div>
                  <button
                    onClick={connectGmail}
                    disabled={checkingGmail}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-4 text-sm font-semibold text-[#1d2226] shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="m2 6 10 7 10-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {checkingGmail ? "Opening Google…" : "Connect Gmail Account"}
                  </button>
                  <button
                    onClick={checkGmailStatus}
                    className="w-full py-2 text-xs text-gray-400 underline transition hover:text-gray-600"
                  >
                    I've connected — check again
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">What Plyndrox Payable AI reads</p>
              <ul className="space-y-2">
                {[
                  "Emails with invoice attachments (PDF/image)",
                  "Emails with subject lines like 'Invoice', 'Bill', 'Payment due'",
                  "Only from the last 30 days, nothing older",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-xs text-gray-500">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-400">
                We only read invoice-related emails. Other emails are never accessed.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {gmailConnected ? "Continue" : "Skip for now"} <ChevronRightIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setStep(1)}
                className="rounded-full border border-gray-200 px-5 py-4 text-sm font-semibold text-gray-500 transition hover:border-gray-300"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Ready */}
        {step === 3 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">
              You're all set, {companyName || "there"}!
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              Your Plyndrox Payable AI workspace is ready. Upload your first invoice or fetch from Gmail to see the AI in action.
            </p>

            <div className="mx-auto mt-8 max-w-sm space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left">
                <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm text-emerald-700">Company profile saved</span>
              </div>
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left ${gmailConnected ? "border-emerald-100 bg-emerald-50" : "border-gray-100 bg-gray-50"}`}>
                {gmailConnected ? (
                  <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-300" />
                )}
                <span className={`text-sm ${gmailConnected ? "text-emerald-700" : "text-gray-400"}`}>
                  {gmailConnected ? "Gmail connected" : "Gmail — connect later"}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left">
                <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm text-emerald-700">AI extraction ready</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleFinish}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Go to Dashboard <ArrowRightIcon className="h-4 w-4" />
              </button>
              <Link
                href="/payables/upload"
                onClick={() => localStorage.setItem("payables_onboarded", "true")}
                className="flex items-center justify-center rounded-full border border-gray-200 bg-white px-8 py-4 text-sm font-semibold text-gray-700 transition hover:border-gray-300"
              >
                Upload first invoice
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-400">
              You can always change these settings from your dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
