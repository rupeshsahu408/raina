"use client";

import Link from "next/link";
import { useState } from "react";

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const FEATURES = [
  { icon: <BrainIcon />, title: "Intent Detection", desc: "Every email is labeled instantly — Lead, Support, Payment, Meeting, FYI. Know what needs attention before you open it.", iconStyle: "text-violet-600 bg-violet-50 border-violet-100" },
  { icon: <ZapIcon />, title: "Smart Reply Generation", desc: "AI reads the full thread and writes a reply in your chosen tone — Formal, Casual, Sales, Empathetic, or Short & Direct.", iconStyle: "text-amber-600 bg-amber-50 border-amber-100" },
  { icon: <MailIcon />, title: "AI Inbox Summaries", desc: "Each email thread shows a one-line AI summary. Understand 50 emails in 2 minutes without opening a single one.", iconStyle: "text-sky-600 bg-sky-50 border-sky-100" },
  { icon: <ClockIcon />, title: "Auto-Reply Rules", desc: "Set conditions once. AI personalizes every response so it never feels robotic.", iconStyle: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { icon: <ShieldIcon />, title: "Secure & Private", desc: "OAuth 2.0 only. We never store your emails. Tokens are encrypted. Incognito mode available.", iconStyle: "text-rose-600 bg-rose-50 border-rose-100" },
  { icon: <SparkIcon />, title: "Multi-language", desc: "Write replies in English, Hindi, or Hinglish. AI matches the language of incoming emails automatically.", iconStyle: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100" },
];

const STEPS = [
  { n: "01", title: "Connect your Gmail", desc: "One-click OAuth. No passwords stored. Takes 15 seconds." },
  { n: "02", title: "AI reads your inbox", desc: "Every thread gets summarized and labeled by intent automatically." },
  { n: "03", title: "Generate smart replies", desc: "Pick a tone, hit generate. Edit if you want, then send." },
  { n: "04", title: "Set auto-reply rules", desc: "Define conditions. AI handles the repetitive emails." },
];

const DEMO_EMAILS = [
  { from: "Rahul Sharma", subject: "Re: Product pricing inquiry", summary: "Asking for final quote before Friday decision", label: "Lead", labelColor: "text-emerald-700 bg-emerald-50 border-emerald-200", time: "9:41 AM", unread: true },
  { from: "Support Team", subject: "Issue with API integration", summary: "Technical blocker — needs urgent reply", label: "Support", labelColor: "text-red-700 bg-red-50 border-red-200", time: "Yesterday", unread: true },
  { from: "Priya Mehta", subject: "Invoice #1042 due", summary: "Payment reminder for last month", label: "Payment", labelColor: "text-amber-700 bg-amber-50 border-amber-200", time: "Mon", unread: false },
  { from: "Ankit Verma", subject: "Can we schedule a call?", summary: "Wants to discuss partnership next week", label: "Meeting", labelColor: "text-sky-700 bg-sky-50 border-sky-200", time: "Mon", unread: false },
  { from: "Newsletter", subject: "Your weekly digest is ready", summary: "Weekly product update from SaaS Tools", label: "FYI", labelColor: "text-gray-600 bg-gray-100 border-gray-200", time: "Sun", unread: false },
];

export default function InboxLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeTone, setActiveTone] = useState("Formal");
  const tones = ["Formal", "Casual", "Sales", "Empathetic", "Short"];

  function handleGenerate() {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1400);
  }

  return (
    <div className="min-h-screen bg-white text-[#1d2226] overflow-x-hidden">

      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 items-center justify-between px-4 max-w-7xl sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/evara-logo.png" alt="Evara" className="h-8 w-8 object-contain" />
            <span className="text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Evara</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-[#1d2226] transition">Features</a>
            <a href="#how-it-works" className="hover:text-[#1d2226] transition">How it works</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-[#1d2226] transition px-3 py-2 rounded-full hover:bg-gray-100">
              Sign in
            </Link>
            <Link href="/inbox/connect" className="rounded-full bg-[#1d2226] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d3238] hover:-translate-y-0.5">
              Connect Gmail
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center bg-gradient-to-b from-gray-50 to-white">
        <div className="premium-grid absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-violet-700 mb-7">
            <SparkIcon />
            <span>Plyndrox Inbox AI — Now in Beta</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#1d2226] leading-[1.05] mb-5 max-w-5xl mx-auto">
            Your inbox,<br />
            <span className="text-violet-600">finally intelligent.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg leading-8 text-gray-500 mb-9">
            Connect your Gmail in one click. Inbox AI reads, summarizes, labels every email by intent, and generates perfect replies in your tone — all without you having to think.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <Link href="/inbox/connect" className="inline-flex items-center gap-2.5 rounded-full bg-[#1d2226] px-8 py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d3238]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Connect Gmail — it's free
            </Link>
            <a href="#demo" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 text-sm font-semibold text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300">
              See it in action
            </a>
          </div>
          <p className="text-xs text-gray-400">No credit card required · OAuth secured · Disconnect anytime</p>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-md">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4">
              <div className="mx-auto w-48 h-5 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <span className="text-[10px] text-gray-400">Plyndrox Inbox AI</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[260px_1fr_280px] min-h-[460px]">
            {/* Thread list */}
            <div className="border-r border-gray-100 p-3 space-y-1 bg-gray-50/50">
              <div className="px-2 py-1.5 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Inbox · 2 unread</p>
              </div>
              {DEMO_EMAILS.map((email, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDemo(i)}
                  className={`w-full text-left rounded-xl px-3 py-2.5 transition border ${
                    activeDemo === i ? "bg-violet-50 border-violet-200" : "hover:bg-gray-50 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold truncate ${email.unread ? "text-[#1d2226]" : "text-gray-400"}`}>
                      {email.from}
                    </span>
                    <span className="text-[9px] text-gray-400 shrink-0 ml-1">{email.time}</span>
                  </div>
                  <p className={`text-[10px] truncate mb-1 ${email.unread ? "text-gray-600" : "text-gray-400"}`}>{email.subject}</p>
                  <p className="text-[9px] text-gray-400 truncate">{email.summary}</p>
                  <div className="mt-1.5">
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${email.labelColor}`}>
                      {email.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Email view */}
            <div className="border-r border-gray-100 p-5 flex flex-col">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#1d2226]">{DEMO_EMAILS[activeDemo].subject}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">from {DEMO_EMAILS[activeDemo].from}</p>
                  </div>
                  <span className={`shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${DEMO_EMAILS[activeDemo].labelColor}`}>
                    {DEMO_EMAILS[activeDemo].label}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-widest">AI Summary</p>
                  <p className="text-xs text-gray-600">{DEMO_EMAILS[activeDemo].summary}</p>
                </div>
              </div>
              <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white">
                    {DEMO_EMAILS[activeDemo].from[0]}
                  </div>
                  <span className="text-xs font-semibold text-[#1d2226]">{DEMO_EMAILS[activeDemo].from}</span>
                </div>
                <p className="text-xs text-gray-500 leading-5">
                  Hi there, I wanted to follow up on our previous discussion. {DEMO_EMAILS[activeDemo].summary.toLowerCase()}. Could you please let me know at your earliest convenience?
                </p>
              </div>
            </div>

            {/* AI Panel */}
            <div className="p-4 flex flex-col gap-3 bg-gray-50/30">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">Reply Tone</p>
                <div className="flex flex-wrap gap-1.5">
                  {tones.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => { setActiveTone(tone); setGenerated(false); }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                        activeTone === tone
                          ? "bg-violet-50 border-violet-300 text-violet-700"
                          : "border-gray-200 text-gray-400 bg-white hover:text-[#1d2226] hover:border-gray-300"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <><div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><SparkIcon /> Generate Reply</>
                )}
              </button>

              {generated && (
                <div className="flex-1 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-gray-600 leading-5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-violet-600 mb-2">AI Draft · {activeTone}</p>
                  <p>Dear {DEMO_EMAILS[activeDemo].from.split(" ")[0]},</p>
                  <br />
                  <p>Thank you for reaching out. I've reviewed your message regarding {DEMO_EMAILS[activeDemo].summary.toLowerCase()}.</p>
                  <br />
                  <p>I will get back to you with a detailed response shortly.</p>
                  <br />
                  <p>Best regards</p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1.5 rounded-lg bg-[#1d2226] text-white text-[10px] font-bold">Send</button>
                    <button className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-[10px] font-bold">Edit</button>
                  </div>
                </div>
              )}

              {!generated && !generating && (
                <div className="flex-1 rounded-xl border border-gray-100 bg-white p-3 flex items-center justify-center">
                  <p className="text-[10px] text-gray-400 text-center">Pick a tone and hit Generate to see the AI reply</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 max-w-full px-4 sm:px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 mb-3">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1d2226]">Built different from day one</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${f.iconStyle}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-[#1d2226] mb-2">{f.title}</h3>
                <p className="text-sm leading-6 text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 mb-3">Simple process</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1d2226]">Up and running in 60 seconds</h2>
        </div>
        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-sm">
                {s.n}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1d2226] text-base">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <svg className="h-4 w-4 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-10 sm:p-14 text-center shadow-sm">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1d2226] mb-4">
            Zero email stress.<br />Starting now.
          </h2>
          <p className="text-gray-500 text-base mb-8 max-w-lg mx-auto leading-7">
            Connect Gmail in one click and let Inbox AI handle the repetitive parts forever.
          </p>
          <Link
            href="/inbox/connect"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#1d2226] px-10 py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d3238]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Get started free
          </Link>
          <p className="text-xs text-gray-400 mt-4">No credit card · Secure OAuth · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-7 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-gray-400 hover:text-[#1d2226] transition">
            <img src="/evara-logo.png" alt="Evara" className="h-5 w-5 object-contain opacity-60" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Plyndrox · Inbox AI</span>
          </Link>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Plyndrox. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-gray-400">
            <Link href="/privacy-policy" className="hover:text-[#1d2226] transition">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1d2226] transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
