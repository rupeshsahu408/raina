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

export default function BusinessAIPage() {
  return (
    <div className="min-h-screen bg-[#04030a] text-zinc-100 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(52,211,153,0.10),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(124,58,237,0.12),transparent_40%),radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.06),transparent_50%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/evara-logo.png" alt="Evara" className="h-8 w-8 object-contain" />
          <span className="text-sm font-black uppercase tracking-[0.28em] text-white">Evara</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition px-4 py-2 rounded-full hover:bg-white/8">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-full bg-white px-5 py-2 text-sm font-black text-black transition hover:bg-zinc-200 hover:-translate-y-0.5">
            Get started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Business AI Suite
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.06em] text-white leading-[0.95] mb-6">
            AI tools built<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
              for your business
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-base sm:text-lg leading-7 text-zinc-400">
            Choose how you want to automate. Whether it's customer support on WhatsApp or an AI chatbot on your website — we've got you covered.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          <Link
            href="/whatsapp-ai"
            className="group relative rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 sm:p-10 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/30 hover:bg-emerald-950/20 hover:shadow-2xl hover:shadow-emerald-950/40"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.08),transparent_60%)]" />

            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 border border-emerald-400/20">
                  <WhatsAppIcon className="h-7 w-7 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </div>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white mb-3">
                WhatsApp AI
              </h2>
              <p className="text-zinc-400 text-sm leading-7 mb-8">
                Automate customer support, bookings, and inquiries directly on WhatsApp. Connect your Cloud API and let AI handle the conversations — 24/7, in multiple languages.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "Multilingual support",
                  "Instant replies",
                  "Custom knowledge",
                  "Cloud API ready",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:gap-3 transition-all">
                Get started
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>
          </Link>

          <Link
            href="/ibara"
            className="group relative rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 sm:p-10 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/30 hover:bg-violet-950/20 hover:shadow-2xl hover:shadow-violet-950/40"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_70%_20%,rgba(124,58,237,0.10),transparent_60%)]" />

            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
                  <GlobeIcon className="h-7 w-7 text-violet-400" />
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/8 px-3 py-1 text-xs font-semibold text-violet-300">
                  <span className="text-[10px] font-black">NEW</span>
                </div>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white mb-3">
                Website AI
              </h2>
              <p className="text-zinc-400 text-sm leading-7 mb-8">
                Embed an intelligent AI chatbot on any website — WordPress, Shopify, Wix, or custom. Train it on your business and go live in minutes. No code required.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "No code needed",
                  "DNS verified",
                  "Custom training",
                  "Any platform",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-1 h-1 rounded-full bg-violet-400 shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-violet-400 group-hover:gap-3 transition-all">
                Get started
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-20 max-w-4xl mx-auto rounded-[2rem] border border-white/8 bg-white/[0.025] p-8 sm:p-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 mb-3">Not sure which to pick?</p>
          <h3 className="text-2xl font-black text-white mb-3">Use both together</h3>
          <p className="text-zinc-400 text-sm leading-7 max-w-lg mx-auto">
            Many businesses run WhatsApp AI for customer conversations and Website AI for their site visitors. They work independently and complement each other perfectly.
          </p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/8 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-zinc-500 hover:text-white transition">
            <img src="/evara-logo.png" alt="Evara" className="h-5 w-5 object-contain opacity-60" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Evara AI</span>
          </Link>
          <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Evara AI. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-zinc-600">
            <Link href="/privacy-policy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
