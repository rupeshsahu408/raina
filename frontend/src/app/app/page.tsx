"use client";

import Link from "next/link";
import { InstallPrompt } from "@/components/InstallPrompt";

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none" {...props}>
      <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SmartphoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    </svg>
  );
}

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.16Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.16Z" />
    </svg>
  );
}

function PlusCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
    </svg>
  );
}

const footerColumns = [
  { title: "Product", links: [["Home", "/"], ["Features", "/features"], ["App", "/app"], ["Pricing", "/pricing"]] },
  { title: "Resources", links: [["Blog", "/blog"], ["Help Center", "/help"], ["API Docs", "/docs"], ["Guides", "/guides"]] },
  { title: "Company", links: [["About Us", "/about"], ["Partners", "/partners"], ["Careers", "/careers"], ["Contact", "/contact"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms"], ["Cookie Policy", "/cookies"], ["Disclaimer", "/disclaimer"]] },
];

const androidSteps = [
  { icon: <GlobeIcon className="h-5 w-5" />, title: "Open in Chrome", desc: "Visit evara.app in Google Chrome on your Android phone." },
  { icon: <span className="text-base font-bold">⋮</span>, title: "Tap the Menu", desc: "Tap the three-dot menu in the top-right corner of Chrome." },
  { icon: <DownloadIcon className="h-5 w-5" />, title: 'Select "Install App"', desc: 'Tap "Install App" or "Add to Home Screen" from the menu.' },
  { icon: <SmartphoneIcon className="h-5 w-5" />, title: "Launch Like Native", desc: "Find the Plyndrox icon in your app drawer and open it anytime." },
];

const iosSteps = [
  { icon: <GlobeIcon className="h-5 w-5" />, title: "Open in Safari", desc: "Visit evara.app in Apple Safari — this only works in Safari." },
  { icon: <ShareIcon className="h-5 w-5" />, title: "Tap Share", desc: 'Tap the Share icon (box with an arrow) at the bottom of the screen.' },
  { icon: <PlusCircleIcon className="h-5 w-5" />, title: "Add to Home Screen", desc: 'Scroll down and tap "Add to Home Screen" from the share sheet.' },
  { icon: <SmartphoneIcon className="h-5 w-5" />, title: "Tap Add & Launch", desc: "Confirm by tapping Add — Plyndrox will appear on your home screen." },
];

export default function AppPage() {
  return (
    <div className="relative min-h-screen bg-white text-[#1d2226] ">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0" />

      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-gray-50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 object-contain plyndrox-logo-img" />
            <span className="text-sm font-bold uppercase tracking-widest text-[#1d2226]">Plyndrox</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-gray-500 transition hover:text-white sm:block">Sign In</Link>
            <Link href="/signup" className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:scale-105 hover:bg-zinc-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 text-center sm:px-6 lg:px-8">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="mx-auto max-w-6xl w-full grid gap-12 lg:grid-cols-2 lg:items-center pt-24 pb-12 text-left">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-md">
                <SparklesIcon className="h-3.5 w-3.5 text-purple-400" />
                <span>Available on Android, iOS & Web</span>
              </div>
              <h1 className="mt-8 text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-7xl text-balance">
                Plyndrox AI{" "}
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
                  App
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-500">
                Experience powerful AI on your mobile device. Fast, lightweight, and always accessible — install once, use everywhere.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Fast", "Lightweight", "Always Accessible"].map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-violet-600">
                    <CheckIcon className="h-3 w-3" /> {badge}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <InstallPrompt
                  label="📲 Install App Now"
                  className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black shadow-lg transition hover:scale-105 hover:bg-zinc-100"
                />
                <Link href="/chat" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10">
                  Already installed? Open App <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-sky-500/20 blur-3xl" />
                {/* Phone body */}
                <div className="relative w-64 overflow-hidden rounded-[2.5rem] border-2 border-gray-200 bg-gray-50 shadow-2xl sm:w-72">
                  {/* Status bar */}
                  <div className="flex items-center justify-between bg-white px-5 py-2">
                    <span className="text-[10px] font-semibold text-gray-500">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-4 rounded-sm border border-zinc-500">
                        <div className="h-full w-3/4 rounded-sm bg-zinc-400" />
                      </div>
                    </div>
                  </div>
                  {/* Notch */}
                  <div className="mx-auto mb-1 h-5 w-24 rounded-b-2xl bg-white" />
                  {/* App content preview */}
                  <div className="flex flex-col bg-gray-50 px-4 pb-6">
                    {/* App header */}
                    <div className="flex items-center gap-2 py-3 border-b border-gray-100">
                      <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 object-contain plyndrox-logo-img" />
                      <span className="text-xs font-bold tracking-widest uppercase text-white">Plyndrox AI</span>
                    </div>
                    {/* Chat bubbles */}
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-800 px-3 py-2">
                          <p className="text-[11px] leading-relaxed text-gray-600">Hey! How are you feeling today?</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-purple-600 to-pink-600 px-3 py-2">
                          <p className="text-[11px] leading-relaxed text-white">I'm great! Can you help me study?</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-800 px-3 py-2">
                          <p className="text-[11px] leading-relaxed text-gray-600">Of course! Let's switch to Study Mode. What subject?</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-purple-600 to-pink-600 px-3 py-2">
                          <p className="text-[11px] leading-relaxed text-white">Physics please!</p>
                        </div>
                      </div>
                    </div>
                    {/* Input bar */}
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
                      <span className="flex-1 text-[11px] text-gray-400">Type a message...</span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500">
                        <ArrowRightIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                  {/* Home indicator */}
                  <div className="flex justify-center bg-gray-50 pb-3 pt-1">
                    <div className="h-1 w-20 rounded-full bg-zinc-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Store Availability ── */}
        <section className="relative border-y border-gray-100 bg-gray-50/50 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Store availability</p>
            <h2 className="mt-4 text-3xl font-medium text-white sm:text-4xl">Available everywhere, soon.</h2>
            <p className="mt-4 text-base text-gray-500">App Store and Google Play listings are on the way. For now, install instantly as a PWA — no store needed.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-xl mx-auto">
              {/* Google Play */}
              <div className="group relative flex items-center gap-4 rounded-[1.5rem] border border-gray-100 bg-white/[0.02] p-5 transition hover:bg-white">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-800">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                    <path d="M3 3.5 13.5 14 3 20.5V3.5Z" fill="#4CAF50" />
                    <path d="M16 11 3 3.5l10 10.5L16 11Z" fill="#8BC34A" />
                    <path d="M16 13 13 14 3 20.5 16 13Z" fill="#F44336" />
                    <path d="M16 11v2L3 20.5l13-7.5Z" fill="#FF9800" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-medium text-gray-400">Coming Soon</p>
                  <p className="text-sm font-semibold text-white">Google Play Store</p>
                </div>
                <span className="ml-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400">🚧 Soon</span>
              </div>
              {/* App Store */}
              <div className="group relative flex items-center gap-4 rounded-[1.5rem] border border-gray-100 bg-white/[0.02] p-5 transition hover:bg-white">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-800">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-sky-400" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-medium text-gray-400">Coming Soon</p>
                  <p className="text-sm font-semibold text-white">Apple App Store</p>
                </div>
                <span className="ml-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400">🚧 Soon</span>
              </div>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              Already available right now as a <span className="text-purple-400 font-semibold">Progressive Web App</span> — no store, no waiting. Install below.
            </p>
          </div>
        </section>

        {/* ── Android PWA Install ── */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                    <path d="M3 3.5 13.5 14 3 20.5V3.5Z" fill="#4CAF50" />
                    <path d="M16 11 3 3.5l10 10.5L16 11Z" fill="#8BC34A" />
                    <path d="M16 13 13 14 3 20.5 16 13Z" fill="#F44336" />
                    <path d="M16 11v2L3 20.5l13-7.5Z" fill="#FF9800" />
                  </svg>
                  Android Users
                </span>
                <h2 className="mt-6 text-3xl font-medium tracking-tight text-white sm:text-5xl text-balance">
                  Install on Android in seconds.
                </h2>
                <p className="mt-6 text-base leading-relaxed text-gray-500">
                  Plyndrox AI is available as a Progressive Web App (PWA) on Android. It installs like a native app — no Play Store needed, no large download, no wait.
                </p>
                <div className="mt-10 space-y-4">
                  {androidSteps.map((step, i) => (
                    <div
                      key={i}
                      className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white/[0.02] p-4 transition-all hover:bg-gray-50 hover:border-emerald-500/20"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                        {step.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400">Step {i + 1}</span>
                          <span className="text-sm font-semibold text-white">{step.title}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <InstallPrompt
                    label="📲 Download App (Android)"
                    className="rounded-full bg-emerald-400 px-7 py-3.5 text-sm font-bold text-black transition hover:scale-105 hover:bg-emerald-300"
                  />
                </div>
              </div>

              {/* Android mockup */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-emerald-500/15 via-green-500/10 to-transparent blur-3xl" />
                  <div className="relative w-60 overflow-hidden rounded-[2.5rem] border-2 border-gray-200 bg-gray-50 shadow-2xl sm:w-64">
                    <div className="flex items-center justify-between bg-white px-5 py-2">
                      <span className="text-[10px] font-semibold text-gray-500">9:41</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-3 rounded-sm border border-zinc-600"><div className="h-full w-3/4 rounded-sm bg-zinc-500" /></div>
                      </div>
                    </div>
                    <div className="mx-auto mb-1 h-4 w-16 rounded-b-xl bg-white" />
                    <div className="px-4 pb-6">
                      {/* Chrome-style URL bar */}
                      <div className="mt-2 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-gray-400 flex-1">evara.app</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400">⋮</span>
                        </div>
                      </div>
                      {/* Install banner */}
                      <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                        <div className="flex items-center gap-2">
                          <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 object-contain rounded-xl plyndrox-logo-img" />
                          <div>
                            <p className="text-[10px] font-bold text-white">Plyndrox AI</p>
                            <p className="text-[9px] text-gray-500">Add to Home Screen</p>
                          </div>
                          <button className="ml-auto rounded-full bg-emerald-400 px-2.5 py-1 text-[9px] font-bold text-black">Install</button>
                        </div>
                      </div>
                      {/* App grid */}
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {["🤖","📱","💬","🎵","📷","🗓","⚙️","🌐"].map((em, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className={`h-5 w-5 rounded-xl flex items-center justify-center text-base ${i === 0 ? "bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30" : "bg-zinc-800"}`}>
                              {em}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center bg-gray-50 pb-3 pt-1">
                      <div className="h-1 w-16 rounded-full bg-zinc-700" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── iOS Install ── */}
        <section className="relative border-y border-gray-100 bg-gray-50/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              {/* iOS mockup */}
              <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-sky-500/15 via-blue-500/10 to-transparent blur-3xl" />
                  <div className="relative w-60 overflow-hidden rounded-[2.5rem] border-2 border-gray-200 bg-gray-50 shadow-2xl sm:w-64">
                    <div className="flex items-center justify-between bg-white px-5 py-2">
                      <span className="text-[10px] font-semibold text-gray-500">9:41</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-3 rounded-sm border border-zinc-600"><div className="h-full w-3/4 rounded-sm bg-zinc-500" /></div>
                      </div>
                    </div>
                    {/* iOS dynamic island */}
                    <div className="mx-auto mb-2 h-6 w-28 rounded-full bg-white" />
                    <div className="px-4 pb-6">
                      {/* Safari URL bar */}
                      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                        <span className="text-[10px] text-gray-400 flex-1">evara.app</span>
                        <ShareIcon className="h-3.5 w-3.5 text-sky-400" />
                      </div>
                      {/* Share sheet */}
                      <div className="mt-3 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-sky-400 mb-2">Share</p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { icon: <PlusCircleIcon className="h-4 w-4 text-sky-400" />, label: "Add" },
                            { icon: <MessageCircleIcon className="h-4 w-4 text-gray-500" />, label: "Message" },
                            { icon: <DownloadIcon className="h-4 w-4 text-gray-500" />, label: "Save" },
                            { icon: <GlobeIcon className="h-4 w-4 text-gray-500" />, label: "Open" },
                          ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div className={`h-5 w-5 rounded-xl flex items-center justify-center ${i === 0 ? "bg-sky-500/20 border border-sky-500/30" : "bg-gray-50"}`}>
                                {item.icon}
                              </div>
                              <span className="text-[8px] text-gray-400">{item.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-2 py-1.5 text-center">
                          <p className="text-[9px] font-bold text-sky-300">Add to Home Screen</p>
                        </div>
                      </div>
                      {/* Home screen preview */}
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {["📧","🗺","🎵","📸","📰","📅","⚙","🌤"].map((em, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className={`h-5 w-5 rounded-[14px] flex items-center justify-center text-sm ${i === 6 ? "bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30" : "bg-zinc-800"}`}>
                              {i === 6 ? <img src="/plyndrox-logo.svg" alt="" className="h-10 w-10 object-contain plyndrox-logo-img" /> : em}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center bg-gray-50 pb-3 pt-1">
                      <div className="h-1 w-20 rounded-full bg-zinc-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* iOS text */}
              <div className="order-1 lg:order-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-sky-400" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
                  </svg>
                  iPhone & iPad Users
                </span>
                <h2 className="mt-6 text-3xl font-medium tracking-tight text-white sm:text-5xl text-balance">
                  Add to your Home Screen on iOS.
                </h2>
                <p className="mt-6 text-base leading-relaxed text-gray-500">
                  iPhone and iPad users can add Plyndrox AI directly to their Home Screen using Safari. It opens full-screen with no browser bar — exactly like a native iOS app.
                </p>
                <div className="mt-10 space-y-4">
                  {iosSteps.map((step, i) => (
                    <div
                      key={i}
                      className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white/[0.02] p-4 transition-all hover:bg-gray-50 hover:border-sky-500/20"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-sky-500/10 text-sky-400">
                        {step.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sky-400">Step {i + 1}</span>
                          <span className="text-sm font-semibold text-white">{step.title}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 rounded-2xl border border-sky-500/10 bg-sky-500/5 px-4 py-3 text-sm text-sky-300">
                  <span className="font-semibold">Important:</span> This must be done in Safari — it will not work in Chrome or Firefox on iPhone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Use the App ── */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Why install</p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight text-white sm:text-5xl">
                More than a website.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-gray-500">
                Installing Plyndrox AI gives you a richer, faster, native-feeling experience compared to opening it in a browser tab every time.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <ZapIcon className="h-5 w-5" />, color: "text-amber-400 bg-amber-500/10", title: "Instant Access", desc: "Open Plyndrox from your home screen in one tap — no browser, no URL bar, no delay." },
                { icon: <SmartphoneIcon className="h-5 w-5" />, color: "text-purple-400 bg-purple-500/10", title: "App-Like Experience", desc: "Full-screen layout, smooth animations, and native-style navigation across all devices." },
                { icon: <DownloadIcon className="h-5 w-5" />, color: "text-emerald-400 bg-emerald-500/10", title: "No Store Required", desc: "Install directly from your browser — no App Store or Play Store account needed." },
                { icon: <GlobeIcon className="h-5 w-5" />, color: "text-sky-400 bg-sky-500/10", title: "Works on All Devices", desc: "Android, iPhone, iPad, and desktop — one install works everywhere you need it." },
                { icon: <ShieldIcon className="h-5 w-5" />, color: "text-pink-400 bg-pink-500/10", title: "Lightweight & Secure", desc: "Tiny footprint with no unnecessary background processes. Your data is always protected." },
                { icon: <BrainIcon className="h-5 w-5" />, color: "text-violet-400 bg-violet-500/10", title: "Always Updated", desc: "PWA updates automatically — you always have the latest version without manual updates." },
              ].map((item) => (
                <div key={item.title} className="group flex flex-col gap-4 rounded-[1.5rem] border border-gray-100 bg-white/[0.02] p-6 transition-all hover:bg-white">
                  <div className={`inline-flex h-5 w-5 items-center justify-center rounded-xl ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Highlights ── */}
        <section className="relative border-y border-gray-100 bg-gray-50/50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">What's inside</p>
              <h2 className="mt-4 text-3xl font-medium text-white sm:text-4xl">All your AI, in one app.</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: <MessageCircleIcon className="h-6 w-6" />,
                  gradient: "from-pink-500/20 via-purple-500/10",
                  text: "text-purple-400",
                  bg: "bg-purple-500/15",
                  title: "Plyndrox AI Chat",
                  desc: "Emotional companion with dual personalities, persistent memory, and 5 conversation modes.",
                  badge: "Personal",
                },
                {
                  icon: <WhatsAppIcon className="h-6 w-6" />,
                  gradient: "from-emerald-500/20 via-green-500/10",
                  text: "text-emerald-400",
                  bg: "bg-emerald-500/15",
                  title: "WhatsApp Automation",
                  desc: "Manage your business AI assistant from your phone — monitor chats and update knowledge on the go.",
                  badge: "Business",
                },
                {
                  icon: <GlobeIcon className="h-6 w-6" />,
                  gradient: "from-sky-500/20 via-blue-500/10",
                  text: "text-sky-400",
                  bg: "bg-sky-500/15",
                  title: "Bihar AI Knowledge",
                  desc: "Hyperlocal regional intelligence for education, jobs, culture, and agriculture — always in your pocket.",
                  badge: "Regional",
                },
              ].map((card) => (
                <div key={card.title} className={`group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white/[0.02] p-7 transition-all hover:bg-white`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />
                  <div className="relative z-10">
                    <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.text}`}>
                      {card.icon}
                    </div>
                    <span className={`inline-block rounded-full border border-current/20 bg-current/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${card.text} mb-3`}>
                      {card.badge}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 z-0">
            <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[100px]" />
          </div>
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <SparklesIcon className="mx-auto h-5 w-5 text-purple-400 mb-6" />
            <h2 className="text-4xl font-medium tracking-tight text-white sm:text-6xl text-balance">
              Your AI, always in your pocket.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-500">
              Install the Plyndrox AI app in seconds and get instant access to personal AI, business automation, and regional intelligence — all from your home screen.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <InstallPrompt
                label="🚀 Install App Now"
                className="rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-transform hover:scale-105"
              />
              <Link href="/chat" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10">
                Already installed? Open App <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 overflow-hidden border-t border-gray-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.18),transparent_34%),radial-gradient(circle_at_90%_15%,rgba(56,189,248,0.12),transparent_30%),linear-gradient(180deg,rgba(24,24,27,0.78),rgba(0,0,0,1))]" />
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="rounded-[2rem] border border-gray-200 bg-white/[0.035] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1.65fr_1fr]">
              <div className="space-y-6">
                <Link href="/" className="group inline-flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white/10 shadow-lg shadow-purple-500/10 transition group-hover:scale-105 group-hover:border-purple-300/50">
                    <img src="/plyndrox-logo.svg" alt="Plyndrox AI" className="h-10 w-10 object-contain plyndrox-logo-img" />
                  </span>
                  <span>
                    <span className="block text-base font-bold uppercase tracking-[0.22em] text-white">Plyndrox AI</span>
                    <span className="mt-1 block text-xs font-medium text-violet-700">Smart AI Automation Platform</span>
                  </span>
                </Link>
                <p className="max-w-sm text-sm leading-6 text-gray-500">
                  AI automation for smarter workflows, faster customer support, and intelligent business growth.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <Link href="/signup" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black shadow-lg shadow-white/10 transition hover:-translate-y-0.5 hover:bg-zinc-200">
                    Start Free
                  </Link>
                  <Link href="/chat" className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-purple-300/40 hover:bg-white/10">
                    Chat with AI
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Secure", "Fast", "Reliable"].map((badge) => (
                    <span key={badge} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[#1d2226]">{column.title}</h3>
                    <ul className="mt-4 space-y-3">
                      {column.links.map(([label, href]) => (
                        <li key={href}>
                          <Link href={href} className="group inline-flex items-center gap-1 text-sm text-gray-500 transition hover:translate-x-1 hover:text-white">
                            <span className="h-px w-0 bg-purple-300 transition-all group-hover:w-3" />
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-5 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-white">Get latest AI updates</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">Product updates, automation ideas, and practical AI workflows.</p>
                <form className="mt-5 flex flex-col gap-3">
                  <label htmlFor="footer-email-app" className="sr-only">Email address</label>
                  <input
                    id="footer-email-app"
                    type="email"
                    placeholder="you@example.com"
                    className="min-h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm text-white outline-none transition placeholder:text-gray-400 focus:border-purple-300/50 focus:bg-gray-50 focus:ring-4 focus:ring-purple-500/10"
                  />
                  <button type="button" className="min-h-12 rounded-2xl bg-gradient-to-r from-purple-300 via-fuchsia-300 to-sky-300 px-5 text-sm font-bold text-black shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
            <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Plyndrox AI</p>
              <p>Built by <span className="font-semibold text-gray-600">Riley Parker &amp; Rupesh Sahu</span></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
