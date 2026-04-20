"use client";

import Link from "next/link";
import { useState, useRef } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://raina-1.onrender.com";

/* ─── Icons ─── */
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
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
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function WebhookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
      <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
      <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
    </svg>
  );
}
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  );
}
function ApiIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m4 4V7" />
    </svg>
  );
}

/* ─── API Access Request Form ─── */
function ApiAccessForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", companyName: "", email: "", website: "",
    useCase: "", integrationType: "", monthlyVolume: "", techStack: "",
  });

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/payables/api-access-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckIcon className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <p className="text-lg font-black text-[#1d2226]">Request Submitted!</p>
          <p className="mt-1 text-sm text-gray-500">We've received your request and will review it shortly. You'll hear from us within 1–2 business days.</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#1d2226] placeholder-gray-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100";
  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500";

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Full Name <span className="text-rose-500">*</span></label>
          <input required className={inputClass} placeholder="Rahul Sharma" value={form.fullName} onChange={set("fullName")} />
        </div>
        <div>
          <label className={labelClass}>Company / Startup Name</label>
          <input className={inputClass} placeholder="Acme Technologies" value={form.companyName} onChange={set("companyName")} />
        </div>
        <div>
          <label className={labelClass}>Work Email <span className="text-rose-500">*</span></label>
          <input required type="email" className={inputClass} placeholder="you@company.com" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label className={labelClass}>Website / Product URL</label>
          <input className={inputClass} placeholder="https://yourproduct.com" value={form.website} onChange={set("website")} />
        </div>
        <div>
          <label className={labelClass}>Integration Type</label>
          <select className={inputClass} value={form.integrationType} onChange={set("integrationType")}>
            <option value="">Select one</option>
            <option value="REST API">REST API (read/write invoices)</option>
            <option value="Webhooks">Webhooks (event notifications)</option>
            <option value="Both">Both REST API + Webhooks</option>
            <option value="Embedded">Embedded / White-label</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Monthly Invoice Volume</label>
          <select className={inputClass} value={form.monthlyVolume} onChange={set("monthlyVolume")}>
            <option value="">Select range</option>
            <option value="<50">Less than 50</option>
            <option value="50-200">50 – 200</option>
            <option value="200-1000">200 – 1,000</option>
            <option value="1000+">1,000+</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Tech Stack / Languages</label>
        <input className={inputClass} placeholder="e.g. Node.js, Python, React, SAP" value={form.techStack} onChange={set("techStack")} />
      </div>
      <div>
        <label className={labelClass}>What are you building? <span className="text-rose-500">*</span></label>
        <textarea
          required
          rows={4}
          className={inputClass}
          placeholder="Describe your use case — e.g. We want to auto-import approved invoices from Plyndrox into our ERP system, and trigger payment workflows when an invoice is approved..."
          value={form.useCase}
          onChange={set("useCase")}
        />
      </div>
      {error && (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:translate-y-0"
      >
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            Submitting…
          </>
        ) : (
          <>
            <SendIcon className="h-4 w-4" />
            Submit API Access Request
          </>
        )}
      </button>
      <p className="text-center text-xs text-gray-400">Your request goes directly to our team for review. No auto-approval — we personally evaluate every request.</p>
    </form>
  );
}

const steps = [
  {
    num: "01",
    title: "Connect or Upload",
    desc: "Link Gmail to auto-import invoice emails, or drag and drop a PDF/image. Under 30 seconds.",
    color: "from-violet-500 to-indigo-500",
  },
  {
    num: "02",
    title: "AI Reads Everything",
    desc: "Our AI extracts vendor, amount, due date, line items, invoice number — with high accuracy, no typing.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    num: "03",
    title: "Review & Approve",
    desc: "Everything lands in a clean dashboard. Review, edit if needed, and approve with one tap.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    num: "04",
    title: "Stay in Control",
    desc: "See every invoice organized by status and due date. Pay when you're ready — no surprises.",
    color: "from-cyan-500 to-emerald-500",
  },
];

const features = [
  { icon: MailIcon, title: "Gmail auto-import", desc: "Invoice emails detected and pulled in automatically. No forwarding, no copy-paste.", color: "bg-violet-50 text-violet-600" },
  { icon: UploadIcon, title: "Drag & drop upload", desc: "PDFs, JPGs, PNGs — just upload and let the AI do the reading.", color: "bg-indigo-50 text-indigo-600" },
  { icon: ZapIcon, title: "AI data extraction", desc: "Vendor, amount, due date, line items — extracted in seconds with AI precision.", color: "bg-amber-50 text-amber-600" },
  { icon: CheckIcon, title: "One-click approval", desc: "Review the AI's reading, make edits if needed, and approve in one clean screen.", color: "bg-emerald-50 text-emerald-600" },
  { icon: ClockIcon, title: "Due date tracking", desc: "Never miss a payment — see what's due this week, next week, or overdue.", color: "bg-rose-50 text-rose-600" },
  { icon: ChartIcon, title: "Spend analytics", desc: "Understand your vendor spend, monthly totals, and payment history at a glance.", color: "bg-sky-50 text-sky-600" },
];

const testimonials = [
  {
    quote: "We used to spend 4+ hours a week manually entering invoices. Payables AI cut that to near zero.",
    name: "Riya M.",
    role: "Finance Lead, SaaS startup",
  },
  {
    quote: "The Gmail integration is magical. Invoices just appear, already read and categorized. It's exactly what we needed.",
    name: "Arjun K.",
    role: "Founder, Construction firm",
  },
  {
    quote: "Our accountant loves that everything is already organized. Approval trails, amounts, vendors — all in one place.",
    name: "Priya S.",
    role: "Operations Manager",
  },
];

export default function PayablesLanding() {
  return (
    <div className="min-h-screen bg-white text-[#1d2226]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">Evara</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-black tracking-tight text-[#1d2226]">Payables AI</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#api" className="hidden text-sm font-semibold text-gray-500 transition hover:text-[#1d2226] sm:block">
              API & Webhooks
            </a>
            <Link href="/payables/dashboard" className="hidden text-sm font-semibold text-gray-500 transition hover:text-[#1d2226] sm:block">
              Dashboard
            </Link>
            <Link
              href="/payables/onboarding"
              className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:text-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pt-32 lg:px-8">
        {/* Bg glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-100/70 via-indigo-50/40 to-transparent blur-3xl" />
          <div className="absolute -right-32 top-32 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="absolute -left-32 top-64 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-bold text-violet-700">
            <SparklesIcon className="h-3.5 w-3.5" />
            AI-Powered Accounts Payable · Built for growing businesses
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1d2226] sm:text-6xl lg:text-7xl">
            Stop chasing<br />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              invoices.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-500 sm:text-xl">
            Payables AI reads your invoices automatically — from Gmail or uploaded files — extracts all the data, and presents everything in one organized dashboard.
            <strong className="text-[#1d2226]"> You just review and pay.</strong>
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/payables/onboarding"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:w-auto"
            >
              Start for free <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/payables/upload"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:w-auto"
            >
              <UploadIcon className="h-4 w-4" /> Try with an invoice
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">No credit card needed · Setup in under 2 minutes</p>
        </div>

        {/* Stats bar */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {[
              { num: "$3T+", label: "Invoices processed globally each year" },
              { num: "80%", label: "Less time spent on manual entry" },
              { num: "< 10s", label: "Average AI extraction time" },
            ].map(({ num, label }) => (
              <div key={label} className="px-4 text-center first:pl-0 last:pr-0">
                <div className="text-2xl font-black text-[#1d2226] sm:text-3xl">{num}</div>
                <div className="mt-1 text-xs leading-4 text-gray-400 sm:text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-2xl shadow-violet-100/40">
            {/* Mock browser bar */}
            <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-rose-300" />
              <div className="h-3 w-3 rounded-full bg-amber-300" />
              <div className="h-3 w-3 rounded-full bg-emerald-300" />
              <div className="mx-4 flex-1 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-400">
                plyndrox.app/payables/dashboard
              </div>
            </div>
            {/* Mock content */}
            <div className="p-5 sm:p-8">
              {/* Mock stats */}
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Total Invoices", val: "24", color: "text-[#1d2226]" },
                  { label: "Pending Approval", val: "6", color: "text-amber-600" },
                  { label: "Approved", val: "16", color: "text-emerald-600" },
                  { label: "Processing", val: "2", color: "text-blue-600" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className={`mt-1 text-2xl font-black ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
              {/* Mock invoice rows */}
              <div className="space-y-2">
                {[
                  { vendor: "Adobe Inc.", amount: "$299", due: "Apr 25", status: "Ready for Review", statusColor: "bg-blue-50 text-blue-700" },
                  { vendor: "AWS / Amazon", amount: "$1,840", due: "Apr 30", status: "Pending Approval", statusColor: "bg-violet-50 text-violet-700" },
                  { vendor: "Figma", amount: "$150", due: "May 5", status: "Approved", statusColor: "bg-emerald-50 text-emerald-700" },
                  { vendor: "Slack Technologies", amount: "$420", due: "May 12", status: "Processing", statusColor: "bg-amber-50 text-amber-700" },
                ].map((row) => (
                  <div key={row.vendor} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                      <MailIcon className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="flex-1 text-sm font-semibold text-[#1d2226]">{row.vendor}</div>
                    <div className="hidden text-xs text-gray-400 sm:block">Due {row.due}</div>
                    <div className="text-sm font-black text-[#1d2226]">{row.amount}</div>
                    <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#f8f9fb] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">How it works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1d2226] sm:text-5xl">
              Four steps. That's it.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
              No learning curve. No accounting background needed. Just calm, organized payables.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ num, title, desc, color }) => (
              <div key={num} className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
                <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-sm font-black text-white shadow-sm`}>
                  {num}
                </div>
                <h3 className="mb-2 text-base font-black text-[#1d2226]">{title}</h3>
                <p className="text-sm leading-6 text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Everything included</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1d2226] sm:text-5xl">
              Built for the way you work
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
              Every feature you need to stop chasing invoices and start getting ahead.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-gray-200 hover:shadow-md">
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold text-[#1d2226]">{title}</h3>
                <p className="text-sm leading-6 text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#f8f9fb] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">What people say</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1d2226] sm:text-4xl">
              Teams love Payables AI
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {testimonials.map(({ quote, name, role }) => (
              <div key={name} className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                <div className="mb-4 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-7 text-gray-600">"{quote}"</p>
                <div className="mt-5">
                  <p className="text-sm font-bold text-[#1d2226]">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's in Phase 1 — transparent roadmap */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">What's included right now</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[#1d2226] sm:text-3xl">
              Solid foundation. More coming.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Gmail auto-import of invoice emails",
              "PDF & image invoice upload",
              "AI extraction of all invoice fields",
              "Invoice inbox with status tracking",
              "Detailed invoice view with confidence score",
              "Approve & reject workflow",
              "Edit & correct extracted data",
              "Due date tracking & overdue alerts",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm font-semibold text-[#1d2226]">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-400">
            Duplicate detection, team approvals, payment queue, and QuickBooks sync are coming in upcoming releases.
          </p>
        </div>
      </section>

      {/* ── Developer API & Webhooks ── */}
      <section id="api" className="px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#f7f8fc]">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-700">
              <CodeIcon className="h-3.5 w-3.5" />
              Developer Platform
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[#1d2226] sm:text-4xl lg:text-5xl">
              Build on top of Plyndrox
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-500">
              Embed our invoice intelligence into your own ERP, accounting software, or product using our REST APIs and real-time webhooks. Turn Plyndrox into the AP backbone of your platform.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <CodeIcon className="h-5 w-5" />,
                color: "bg-violet-50 text-violet-600",
                border: "border-violet-100",
                title: "REST API",
                desc: "Full read/write access to invoices, vendors, approval status, and payment records. Paginated, filterable, and JSON-native.",
                tags: ["GET /invoices", "POST /approve", "GET /vendors"],
              },
              {
                icon: <WebhookIcon className="h-5 w-5" />,
                color: "bg-indigo-50 text-indigo-600",
                border: "border-indigo-100",
                title: "Webhooks",
                desc: "Get real-time HTTP callbacks when events happen — invoice approved, payment marked, vendor flagged. Trigger your ERP instantly.",
                tags: ["invoice.approved", "invoice.paid", "vendor.flagged"],
              },
              {
                icon: <LockIcon className="h-5 w-5" />,
                color: "bg-emerald-50 text-emerald-600",
                border: "border-emerald-100",
                title: "Gated Access",
                desc: "API keys are issued only after manual review. We evaluate every integration to ensure security, quality, and responsible use.",
                tags: ["Reviewed & approved", "Rate limited", "Secure by default"],
              },
            ].map((card) => (
              <div key={card.title} className={`rounded-2xl border ${card.border} bg-white p-7 shadow-sm`}>
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                  {card.icon}
                </div>
                <h3 className="mb-2 text-base font-black text-[#1d2226]">{card.title}</h3>
                <p className="mb-4 text-sm leading-6 text-gray-500">{card.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((t) => (
                    <span key={t} className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 font-mono text-[11px] font-semibold text-gray-500">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* How it works timeline */}
          <div className="mb-16 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-12">
            <h3 className="mb-8 text-center text-xl font-black text-[#1d2226]">How API access works</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "01", title: "Submit Request", desc: "Fill in your details and describe what you're building. Takes 2 minutes.", color: "from-violet-500 to-indigo-500" },
                { step: "02", title: "We Review", desc: "Your request lands in our inbox. We personally evaluate every integration.", color: "from-indigo-500 to-blue-500" },
                { step: "03", title: "Approval via Email", desc: "Once approved, you get a confirmation email with next steps.", color: "from-blue-500 to-cyan-500" },
                { step: "04", title: "Receive API Credentials", desc: "We send your API key and documentation. You start building.", color: "from-cyan-500 to-emerald-500" },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-sm font-black text-white shadow-md`}>
                    {s.step}
                  </div>
                  <p className="mb-1.5 text-sm font-black text-[#1d2226]">{s.title}</p>
                  <p className="text-xs leading-5 text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Request form */}
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-black text-[#1d2226]">Request API Access</h3>
              <p className="mt-2 text-sm text-gray-500">Tell us about your integration. All requests are reviewed personally — expect a reply within 1–2 business days.</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
              <ApiAccessForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-10 text-center shadow-sm sm:p-20">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
            <ShieldIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#1d2226] sm:text-4xl">
            Ready to take control of your payables?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-500">
            Set up your workspace in 2 minutes. Upload one invoice and watch the AI extract everything instantly.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/payables/onboarding"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-10 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
            >
              Get started free <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/payables/dashboard"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-gray-200 bg-white px-10 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:w-auto"
            >
              Open Dashboard
            </Link>
          </div>
          <p className="mt-5 text-xs text-gray-400">No credit card · Free to start · Upgrade anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-[#1d2226] hover:underline">Evara AI</Link>
            <span>·</span>
            <span>Payables AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/payables/dashboard" className="hover:text-[#1d2226]">Dashboard</Link>
            <Link href="/payables/upload" className="hover:text-[#1d2226]">Upload</Link>
            <Link href="/privacy-policy" className="hover:text-[#1d2226]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
