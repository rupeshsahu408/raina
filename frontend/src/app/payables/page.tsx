"use client";

import Link from "next/link";

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

const steps = [
  {
    num: "01",
    title: "Connect or Upload",
    desc: "Link your Gmail to auto-import invoice emails, or simply drag and drop a PDF / image. Takes under 30 seconds.",
    color: "from-violet-500 to-indigo-500",
  },
  {
    num: "02",
    title: "AI Reads the Invoice",
    desc: "Our AI instantly extracts vendor, amount, due date, line items, and more — with high accuracy, no manual typing.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    num: "03",
    title: "Review & Approve",
    desc: "Everything lands in a clean dashboard. You review, edit if needed, and approve with one tap.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    num: "04",
    title: "Stay in Control",
    desc: "You see every invoice organized by status, amount, and due date. Pay when you're ready — no surprises.",
    color: "from-cyan-500 to-emerald-500",
  },
];

const features = [
  { icon: MailIcon, title: "Gmail auto-import", desc: "Invoice emails detected and pulled in automatically. No forwarding, no copy-paste.", color: "bg-violet-50 text-violet-600" },
  { icon: UploadIcon, title: "Drag & drop upload", desc: "Support for PDFs, JPGs, PNGs. Just upload and let AI do the reading.", color: "bg-indigo-50 text-indigo-600" },
  { icon: ZapIcon, title: "AI extraction", desc: "Vendor, amount, due date, line items — extracted in seconds with AI precision.", color: "bg-amber-50 text-amber-600" },
  { icon: CheckIcon, title: "One-click approval", desc: "Review the AI's reading and approve or edit in one clean screen.", color: "bg-emerald-50 text-emerald-600" },
  { icon: ClockIcon, title: "Due date tracking", desc: "Never miss a payment — see what's due this week, next week, or overdue.", color: "bg-rose-50 text-rose-600" },
  { icon: ChartIcon, title: "Spend analytics", desc: "Understand your vendor spend, monthly totals, and payment history at a glance.", color: "bg-sky-50 text-sky-600" },
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
            <Link
              href="/payables/dashboard"
              className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d3238] sm:px-5 sm:text-sm"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-50 to-transparent opacity-60 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-1.5 text-xs font-bold text-violet-700">
            <ZapIcon className="h-3.5 w-3.5" />
            AI-Powered · Built for Small Businesses
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1d2226] sm:text-6xl lg:text-7xl">
            Stop chasing<br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">invoices.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-500 sm:text-xl">
            Payables AI reads your invoices automatically — from Gmail or uploaded files — extracts all the data, and presents everything in one calm, organized dashboard. You just review and pay.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/payables/dashboard"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
            >
              Go to Dashboard <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/payables/upload"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 sm:w-auto"
            >
              <UploadIcon className="h-4 w-4" /> Upload an invoice
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:gap-8">
            {[
              { num: "$3T+", label: "Annual invoices globally" },
              { num: "80%", label: "Less manual work" },
              { num: "< 10s", label: "AI extraction time" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-[#1d2226] sm:text-3xl">{num}</div>
                <div className="mt-1 text-xs text-gray-400 sm:text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">How it works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1d2226] sm:text-4xl">Four steps. That's it.</h2>
            <p className="mt-4 text-base text-gray-500">No learning curve. No setup nightmare. Just calm, clear accounts payable.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ num, title, desc, color }) => (
              <div key={num} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-sm font-black text-white shadow-sm`}>
                  {num}
                </div>
                <h3 className="mb-2 text-base font-black text-[#1d2226]">{title}</h3>
                <p className="text-sm leading-6 text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Everything included</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1d2226] sm:text-4xl">Built for the way you actually work</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md">
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold text-[#1d2226]">{title}</h3>
                <p className="text-sm leading-6 text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-10 text-center shadow-sm sm:p-16">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md">
            <ShieldIcon className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#1d2226] sm:text-4xl">
            Ready to take control of your payables?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-500">
            Start with one invoice. Upload it right now and watch the AI extract everything in seconds.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/payables/dashboard"
              className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#1d2226] px-8 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d3238] sm:w-auto"
            >
              Open Dashboard <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/payables/upload"
              className="inline-flex min-h-13 w-full items-center justify-center rounded-full border border-gray-200 bg-white px-8 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 sm:w-auto"
            >
              Upload invoice
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-8 text-center text-xs text-gray-400">
        <Link href="/" className="font-bold hover:text-[#1d2226]">Evara AI</Link>
        {" · "}Payables AI · Part of the Evara platform
      </footer>
    </div>
  );
}
