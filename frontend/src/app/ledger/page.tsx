"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
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

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  );
}

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m6.08 9.5-3.49 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.49-1.59" />
      <path d="m6.08 14.5-3.49 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.49-1.59" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LanguagesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
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

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
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

const features = [
  {
    icon: <CameraIcon className="h-6 w-6" />,
    title: "Photo Upload + Camera",
    desc: "Take a photo directly from your phone or upload from gallery. Supports messy handwriting, any paper type.",
    color: "emerald",
  },
  {
    icon: <LanguagesIcon className="h-6 w-6" />,
    title: "Hindi + English Mixed",
    desc: "Reads Devanagari script, English text, and mixed formats. Converts Hindi numbers (२४) to standard digits automatically.",
    color: "emerald",
  },
  {
    icon: <LayersIcon className="h-6 w-6" />,
    title: "3-Layer Output",
    desc: "Raw extracted view, grouped commodity analytics, and full summary intelligence — all in one place.",
    color: "emerald",
  },
  {
    icon: <ShieldCheckIcon className="h-6 w-6" />,
    title: "Full Transparency",
    desc: "Every calculation step is shown. Raw data is never hidden. You always know exactly how numbers were reached.",
    color: "emerald",
  },
  {
    icon: <EditIcon className="h-6 w-6" />,
    title: "Editable & Live Recalc",
    desc: "Fix any OCR mistake inline. Totals recalculate instantly. Uncertain entries are flagged for your review.",
    color: "emerald",
  },
  {
    icon: <BarChartIcon className="h-6 w-6" />,
    title: "Smart Price Insights",
    desc: "See min/max/avg rates per commodity. Know that 70% of Gehu was bought at ₹24 — without doing any math.",
    color: "emerald",
  },
];

const steps = [
  {
    number: "01",
    title: "Write your satti as usual",
    desc: "Nothing changes on your end. Write your daily grain entries in Hindi, English, or mixed — exactly as you always have.",
    detail: "Gehu, Chawal, Sarson — any commodity, any format.",
  },
  {
    number: "02",
    title: "Take a photo and upload",
    desc: "Open Smart Ledger on your phone, tap Upload, and take a photo of your satti. That's it.",
    detail: "Camera capture or gallery upload — works on any phone.",
  },
  {
    number: "03",
    title: "Get full analytics instantly",
    desc: "AI reads your satti, groups entries by commodity, calculates totals, and shows price insights — in seconds.",
    detail: "Raw view, grouped view, and summary — all transparent.",
  },
];

const forWhom = [
  { label: "Grain Traders", icon: "🌾" },
  { label: "Commission Agents", icon: "🤝" },
  { label: "Munim / Accountants", icon: "📒" },
  { label: "Mandi Operators", icon: "🏪" },
  { label: "Small Shopkeepers", icon: "🛒" },
  { label: "Rural Businesses", icon: "🏘️" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect to get started",
    features: [
      "10 satti uploads per month",
      "All 3 output views",
      "Hindi + English OCR",
      "Editable entries",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "per month",
    desc: "For active daily traders",
    features: [
      "Unlimited uploads",
      "Full session history",
      "PDF & Excel export",
      "WhatsApp share",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
];

export default function LedgerLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1d2226] overflow-x-hidden">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.7; }
          70% { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .anim-fade-up { animation: fadeUp 0.7s ease-out forwards; }
        .anim-fade-up-2 { animation: fadeUp 0.7s ease-out 0.15s forwards; opacity: 0; }
        .anim-fade-up-3 { animation: fadeUp 0.7s ease-out 0.3s forwards; opacity: 0; }
        .anim-fade-up-4 { animation: fadeUp 0.7s ease-out 0.45s forwards; opacity: 0; }
        .anim-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .shimmer-text {
          background: linear-gradient(90deg, #059669, #10b981, #34d399, #10b981, #059669);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .float { animation: float 4s ease-in-out infinite; }
        .float-delay { animation: float 4s ease-in-out 1s infinite; }
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #10b981;
          animation: pulse-ring 2s ease-out infinite;
        }
        .feature-card { transition: all 0.25s ease; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(16,185,129,0.1); }
        .step-card { transition: all 0.3s ease; }
        .nav-link { transition: color 0.2s ease; }
        .nav-link:hover { color: #059669; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/ledger" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">SL</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-[#1d2226]">Smart Ledger</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/ledger/login" className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors px-3 py-2">
              Log in
            </Link>
            <Link
              href="/ledger/signup"
              className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-5 flex flex-col gap-4 anim-fade-in">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
              <Link href="/ledger/login" className="text-sm font-medium text-center text-gray-600 py-2.5 border border-gray-200 rounded-xl hover:border-emerald-300 transition-colors">Log in</Link>
              <Link href="/ledger/signup" className="text-sm font-semibold text-center bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="anim-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            AI-Powered Accounting for Grain Traders
          </div>

          {/* Headline */}
          <h1 className="anim-fade-up-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Your satti,{" "}
            <br className="hidden sm:block" />
            <span className="shimmer-text">digitized in seconds.</span>
          </h1>

          {/* Subheadline */}
          <p className="anim-fade-up-3 text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload a photo of your handwritten satti. Smart Ledger reads Hindi and English,
            groups entries by commodity, calculates totals, and gives you complete transparent analytics — instantly.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up-4 flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/ledger/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-100"
            >
              Start Free — No Credit Card
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-gray-200 text-gray-600 font-semibold text-base rounded-2xl hover:border-emerald-300 hover:text-emerald-700 transition-all"
            >
              See how it works
            </a>
          </div>

          {/* Mock satti card */}
          <div className="anim-fade-up-4 max-w-sm mx-auto">
            <div className="float relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Card header */}
              <div className="bg-emerald-600 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white font-black text-xs">SL</span>
                  </div>
                  <span className="text-white font-semibold text-sm">Smart Ledger</span>
                </div>
                <span className="text-emerald-100 text-xs">Today, 2:34 PM</span>
              </div>

              {/* Satti preview */}
              <div className="p-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Extracted from photo</div>

                {/* Entry rows */}
                {[
                  { name: "गेहू", rate: "₹2,400", qty: "25 qtl", amt: "₹60,000", conf: "high" },
                  { name: "चावल", rate: "₹3,200", qty: "18 qtl", amt: "₹57,600", conf: "high" },
                  { name: "Sarson", rate: "₹5,100", qty: "12 qtl", amt: "₹61,200", conf: "medium" },
                ].map((entry, i) => (
                  <div key={i} className={`flex items-center justify-between py-2.5 ${i < 2 ? "border-b border-gray-50" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${entry.conf === "high" ? "bg-emerald-500" : "bg-amber-400"}`} />
                      <span className="text-sm font-semibold text-[#1d2226]">{entry.name}</span>
                      <span className="text-xs text-gray-400">{entry.rate} × {entry.qty}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{entry.amt}</span>
                  </div>
                ))}

                {/* Total */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Value</span>
                  <span className="text-base font-black text-[#1d2226]">₹1,78,800</span>
                </div>
              </div>

              {/* Confidence legend */}
              <div className="px-5 pb-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> High confidence
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Review suggested
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            { val: "< 10 sec", label: "Average processing time" },
            { val: "Hindi + English", label: "Mixed language support" },
            { val: "3 views", label: "Raw · Grouped · Summary" },
            { val: "100%", label: "Transparent calculations" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">{stat.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
              <ClockIcon className="h-3.5 w-3.5" /> Under 10 seconds
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Three steps. That&apos;s all.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              We designed Smart Ledger so grain traders never have to change how they work. Your satti process stays exactly the same.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                className={`step-card relative p-6 rounded-2xl border cursor-pointer ${
                  activeStep === i
                    ? "border-emerald-200 bg-emerald-50 shadow-md shadow-emerald-100"
                    : "border-gray-100 bg-white hover:border-emerald-100"
                }`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm mb-4 ${
                  activeStep === i ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {step.number}
                </div>
                <h3 className="text-base font-bold text-[#1d2226] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{step.desc}</p>
                <p className={`text-xs font-medium ${activeStep === i ? "text-emerald-600" : "text-gray-400"}`}>
                  {step.detail}
                </p>
                {activeStep === i && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-b-2xl" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
              <SparklesIcon className="h-3.5 w-3.5" /> Powered by Gemini AI
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Everything a munim needs.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Built specifically for the grain trade. Not a generic spreadsheet. Not a heavy ERP. Just what you actually need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="feature-card bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#1d2226] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-layer output visual ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              One upload. Three layers of clarity.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              We never hide anything. Every number, every step, every calculation is visible and editable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                label: "View 1",
                color: "blue",
                title: "Raw Transparency",
                subtitle: "Exact extraction",
                desc: "Exactly what was written in your satti. Same order, no modification. You verify first.",
                items: ["गेहू 2400 × 25", "चावल 3200 × 18", "Sarson 5100 × 12"],
                badge: "bg-blue-50 text-blue-700 border-blue-100",
                accent: "bg-blue-500",
                border: "border-blue-100",
              },
              {
                label: "View 2",
                color: "emerald",
                title: "Grouped Analytics",
                subtitle: "Commodity-wise breakdown",
                desc: "Entries grouped by commodity with full calculation steps. Rate × Qty = Amount shown clearly.",
                items: ["गेहू: ₹2,400 × 25 = ₹60,000", "चावल: ₹3,200 × 18 = ₹57,600", "Sarson: ₹5,100 × 12 = ₹61,200"],
                badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
                accent: "bg-emerald-500",
                border: "border-emerald-100",
              },
              {
                label: "View 3",
                color: "violet",
                title: "Summary Intelligence",
                subtitle: "Business insights",
                desc: "Total value, commodity distribution, price ranges, and probability insights — automatically.",
                items: ["Total: ₹1,78,800", "Gehu avg rate: ₹2,400", "70% bought at ₹2,400"],
                badge: "bg-violet-50 text-violet-700 border-violet-100",
                accent: "bg-violet-500",
                border: "border-violet-100",
              },
            ].map((view, i) => (
              <div key={i} className={`rounded-2xl border ${view.border} bg-white p-6 shadow-sm`}>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border mb-4 ${view.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${view.accent}`} />
                  {view.label}
                </div>
                <h3 className="font-black text-[#1d2226] text-base mb-0.5">{view.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{view.subtitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{view.desc}</p>
                <div className="space-y-2">
                  {view.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${view.accent}`} />
                      <span className="font-mono text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="py-20 px-4 sm:px-6 bg-[#1d2226]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
            Built for the people who run<br className="hidden sm:block" /> India&apos;s grain trade.
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base mb-12">
            From rural mandis to city warehouses — if you write a satti, Smart Ledger is for you.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {forWhom.map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-semibold text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Simple pricing. Start free.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              No contracts. No hidden fees. Upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-7 ${
                  plan.highlight
                    ? "border-emerald-200 bg-emerald-50 shadow-lg shadow-emerald-100"
                    : "border-gray-100 bg-white shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-[#1d2226]">{plan.price}</span>
                    <span className="text-sm text-gray-400 mb-1">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/ledger/signup"
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:-translate-y-0.5"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 sm:px-6 bg-emerald-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
            Your satti. Digitized. Analyzed. Done.
          </h2>
          <p className="text-emerald-100 text-base sm:text-lg mb-10 max-w-xl mx-auto">
            Join the traders who have stopped doing manual math. Upload your first satti free — no credit card, no setup, no learning required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/ledger/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold text-base rounded-2xl hover:bg-emerald-50 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              Get Started — It&apos;s Free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/ledger/login"
              className="w-full sm:w-auto px-8 py-4 border border-emerald-400 text-white font-semibold text-base rounded-2xl hover:bg-emerald-500 transition-all text-center"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#1d2226] py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-black text-xs">SL</span>
              </div>
              <span className="font-bold text-white">Smart Ledger</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-300 transition-colors">Terms</a>
              <a href="/contact" className="hover:text-gray-300 transition-colors">Contact</a>
            </div>

            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Smart Ledger. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
