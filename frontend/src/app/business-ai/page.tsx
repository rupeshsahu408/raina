"use client";

import Link from "next/link";

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LedgerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

function TranslateIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

function PayablesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h2" />
      <path d="M10 15h4" />
    </svg>
  );
}

const products = [
  {
    href: "/whatsapp-ai",
    icon: <WhatsAppIcon className="h-5 w-5" />,
    iconBg: "bg-emerald-50 text-emerald-600",
    iconBorder: "border-emerald-100",
    badge: "Live",
    badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badgeDot: "bg-emerald-500",
    title: "Plyndrox WhatsApp AI",
    description: "Automate customer support, bookings, and inquiries directly on WhatsApp. Connect your Cloud API and let AI handle the conversations — 24/7, in multiple languages.",
    features: ["Multilingual support", "Instant replies", "Custom knowledge", "Cloud API ready"],
    featureDot: "bg-emerald-500",
    cta: "text-emerald-700 hover:text-emerald-800",
    hoverBorder: "hover:border-emerald-200",
    hoverBg: "hover:bg-emerald-50/30",
  },
  {
    href: "/ibara",
    icon: <GlobeIcon className="h-5 w-5" />,
    iconBg: "bg-violet-50 text-violet-600",
    iconBorder: "border-violet-100",
    badge: "New",
    badgeColor: "text-violet-700 bg-violet-50 border-violet-200",
    badgeDot: null,
    title: "Plyndrox Web AI",
    description: "Embed an intelligent AI chatbot on any website — WordPress, Shopify, Wix, or custom. Train it on your business and go live in minutes. No code required.",
    features: ["No code needed", "DNS verified", "Custom training", "Any platform"],
    featureDot: "bg-violet-500",
    cta: "text-violet-700 hover:text-violet-800",
    hoverBorder: "hover:border-violet-200",
    hoverBg: "hover:bg-violet-50/30",
  },
  {
    href: "/inbox",
    icon: <MailIcon className="h-5 w-5" />,
    iconBg: "bg-fuchsia-50 text-fuchsia-600",
    iconBorder: "border-fuchsia-100",
    badge: "Beta",
    badgeColor: "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200",
    badgeDot: "bg-fuchsia-500",
    title: "Plyndrox Inbox AI",
    description: "Connect Gmail and let AI summarize every email, detect intent, and generate perfect replies in your tone — Formal, Casual, Sales, or Short.",
    features: ["Intent detection", "Smart replies", "AI summaries", "Auto-reply rules"],
    featureDot: "bg-fuchsia-500",
    cta: "text-fuchsia-700 hover:text-fuchsia-800",
    hoverBorder: "hover:border-fuchsia-200",
    hoverBg: "hover:bg-fuchsia-50/30",
  },
  {
    href: "/recruit/dashboard",
    icon: <UsersIcon className="h-5 w-5" />,
    iconBg: "bg-indigo-50 text-indigo-600",
    iconBorder: "border-indigo-100",
    badge: "New",
    badgeColor: "text-indigo-700 bg-indigo-50 border-indigo-200",
    badgeDot: null,
    title: "Plyndrox Recruit AI",
    description: "AI-powered hiring from job description to final decision. Score resumes, send smart assessments, and get AI hiring recommendations — all in one pipeline.",
    features: ["AI resume scoring", "Smart assessments", "Hiring decisions", "Candidate pipeline"],
    featureDot: "bg-indigo-500",
    cta: "text-indigo-700 hover:text-indigo-800",
    hoverBorder: "hover:border-indigo-200",
    hoverBg: "hover:bg-indigo-50/30",
  },
  {
    href: "/ledger",
    icon: <LedgerIcon className="h-5 w-5" />,
    iconBg: "bg-teal-50 text-teal-600",
    iconBorder: "border-teal-100",
    badge: "New",
    badgeColor: "text-teal-700 bg-teal-50 border-teal-200",
    badgeDot: null,
    title: "Smart Ledger",
    description: "Digitize handwritten satti records in seconds. Photograph your grain register — AI reads Hindi and English, groups entries by commodity, calculates totals, and gives you full analytics.",
    features: ["Hindi + English OCR", "Gemini AI parsing", "PDF & CSV export", "Session history"],
    featureDot: "bg-teal-500",
    cta: "text-teal-700 hover:text-teal-800",
    hoverBorder: "hover:border-teal-200",
    hoverBg: "hover:bg-teal-50/30",
  },
  {
    href: "/translate",
    icon: <TranslateIcon className="h-5 w-5" />,
    iconBg: "bg-sky-50 text-sky-600",
    iconBorder: "border-sky-100",
    badge: "New",
    badgeColor: "text-sky-700 bg-sky-50 border-sky-200",
    badgeDot: null,
    title: "Plyndrox Translate AI",
    description: "Translate documents, messages, and entire conversations across 100+ languages with AI-grade accuracy. Built for businesses working with global customers and partners.",
    features: ["100+ languages", "Document translation", "Context-aware", "Instant results"],
    featureDot: "bg-sky-500",
    cta: "text-sky-700 hover:text-sky-800",
    hoverBorder: "hover:border-sky-200",
    hoverBg: "hover:bg-sky-50/30",
  },
  {
    href: "/payables",
    icon: <PayablesIcon className="h-5 w-5" />,
    iconBg: "bg-orange-50 text-orange-600",
    iconBorder: "border-orange-100",
    badge: "Beta",
    badgeColor: "text-orange-700 bg-orange-50 border-orange-200",
    badgeDot: "bg-orange-500",
    title: "Plyndrox Payable AI",
    description: "AI-powered accounts payable automation. Upload invoices or connect Gmail — AI extracts every field, routes for approval, and tracks payments end-to-end.",
    features: ["AI invoice extraction", "Approval workflows", "Gmail integration", "Due date alerts"],
    featureDot: "bg-orange-500",
    cta: "text-orange-700 hover:text-orange-800",
    hoverBorder: "hover:border-orange-200",
    hoverBg: "hover:bg-orange-50/30",
  },
];

export default function BusinessAIPage() {
  return (
    <div className="min-h-screen bg-white text-[#1d2226]">

      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 object-contain plyndrox-logo-img" />
            <span className="text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Plyndrox</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-[#1d2226] transition px-3 py-2 rounded-full hover:bg-gray-100">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-full bg-[#1d2226] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d3238] hover:-translate-y-0.5">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-24">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gray-500 mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Plyndrox Business AI Suite
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1d2226] leading-[1.05] mb-5">
            AI tools built for<br />
            <span className="text-violet-600">your business</span>
          </h1>
          <p className="max-w-xl mx-auto text-base sm:text-lg leading-7 text-gray-500">
            Choose how you want to automate. Whether it's customer support on WhatsApp or an AI chatbot on your website — we've got you covered.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {products.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className={`group relative rounded-2xl border border-gray-200 bg-white p-7 sm:p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${p.hoverBorder} ${p.hoverBg}`}
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-7">
                  <div className={`flex h-13 w-13 items-center justify-center rounded-2xl border ${p.iconBorder} ${p.iconBg}`}>
                    {p.icon}
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${p.badgeColor}`}>
                    {p.badgeDot && <span className={`w-1.5 h-1.5 rounded-full ${p.badgeDot} animate-pulse`} />}
                    {p.badge}
                  </div>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-[#1d2226] mb-3">{p.title}</h2>
                <p className="text-gray-500 text-sm leading-7 mb-7">{p.description}</p>
                <div className="grid grid-cols-2 gap-2.5 mb-7">
                  {p.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.featureDot} shrink-0`} />
                      {feat}
                    </div>
                  ))}
                </div>
                <div className={`flex items-center gap-2 text-sm font-bold transition-all ${p.cta} group-hover:gap-3`}>
                  Get started
                  <ArrowRightIcon className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-14 max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-2">Not sure which to pick?</p>
          <h3 className="text-xl font-black text-[#1d2226] mb-3">Use both together</h3>
          <p className="text-gray-500 text-sm leading-7 max-w-lg mx-auto">
            Many businesses run Plyndrox WhatsApp AI for customer conversations and Plyndrox Web AI for their site visitors. They work independently and complement each other perfectly.
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-7 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-gray-400 hover:text-[#1d2226] transition">
            <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 object-contain plyndrox-logo-img" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Plyndrox AI</span>
          </Link>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Plyndrox AI. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-gray-400">
            <Link href="/privacy-policy" className="hover:text-[#1d2226] transition">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1d2226] transition">Terms</Link>
            <Link href="/contact" className="hover:text-[#1d2226] transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
