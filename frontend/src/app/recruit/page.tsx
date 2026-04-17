"use client";

import Link from "next/link";

function BriefcaseIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function SparkIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function UsersIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ZapIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function ShieldCheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function FileTextIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
  );
}

function ChartIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function ArrowRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: <FileTextIcon />,
    title: "AI Job Description Generator",
    desc: "Answer 6 simple questions. Get a fully formatted, bias-reduced job description and scoring rubric in seconds — ready to post anywhere.",
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/15",
    accent: "text-indigo-400",
  },
  {
    icon: <UsersIcon />,
    title: "Intelligent Resume Screening",
    desc: "Paste or upload any resume. The AI scores every candidate against your custom rubric and ranks them — so you only read the ones that matter.",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/15",
    accent: "text-violet-400",
  },
  {
    icon: <ShieldCheckIcon />,
    title: "Red Flag Detection",
    desc: "Automatically flags unexplained gaps, inflated titles, skill mismatches, and suspicious patterns — before you waste an interview slot.",
    color: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/15",
    accent: "text-rose-400",
  },
  {
    icon: <ZapIcon />,
    title: "Kanban Pipeline Dashboard",
    desc: "Drag candidates through Applied → Screened → Interview → Offer → Hired. Full visibility over every role and every applicant in one place.",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/15",
    accent: "text-amber-400",
  },
  {
    icon: <SparkIcon />,
    title: "AI Interview Brief",
    desc: "Before every interview, get a personalized prep brief — questions to probe, weaknesses to test, and skills to verify based on the resume.",
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/15",
    accent: "text-sky-400",
  },
  {
    icon: <ChartIcon />,
    title: "Score Breakdown & Reasoning",
    desc: "Every candidate gets a transparent score with per-criterion reasoning — not just a number, but an explanation you can act on.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/15",
    accent: "text-emerald-400",
  },
];

const STEPS = [
  { number: "01", title: "Create a Job", desc: "Answer a few questions about the role. The AI writes the JD and builds the scoring rubric automatically." },
  { number: "02", title: "Add Candidates", desc: "Paste resume text for each applicant. The AI scores, ranks, and flags every candidate instantly." },
  { number: "03", title: "Work the Pipeline", desc: "Move top candidates through your Kanban stages. Get AI interview briefs before each conversation." },
  { number: "04", title: "Make the Hire", desc: "Generate the offer letter in one click and close the role — with the full history saved for compliance." },
];

export default function RecruitLandingPage() {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(99,102,241,0.22),transparent_36%),radial-gradient(circle_at_85%_10%,rgba(139,92,246,0.14),transparent_30%),linear-gradient(180deg,#050506,#07070a_50%,#030304)]" />

      <header className="relative z-10 border-b border-white/[0.07] bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/8 transition group-hover:border-indigo-400/40">
              <img src="/evara-logo.png" alt="Plyndrox" className="h-6 w-6 object-contain" draggable={false} />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[0.2em] text-white uppercase">Plyndrox</span>
              <span className="block text-[10px] text-zinc-500 tracking-wide">Recruit AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/recruit/dashboard" className="rounded-full border border-indigo-400/25 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20">
              Dashboard
            </Link>
            <Link href="/recruit/jobs/new" className="rounded-full bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400">
              Post a Job
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-24 text-center sm:px-6 sm:pt-32 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/8 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-8">
            <SparkIcon size={13} />
            AI-Powered Recruitment · Phase 1 — Core Hiring Loop
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
            Hire smarter.<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Not harder.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            Plyndrox Recruit AI writes your job descriptions, scores every resume against a custom rubric, flags red flags automatically, and keeps your entire pipeline in one clean dashboard — so you stop drowning in CVs and start having better conversations.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/recruit/jobs/new" className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition hover:bg-indigo-400 hover:shadow-indigo-400/30">
              Create Your First Job <ArrowRightIcon />
            </Link>
            <Link href="/recruit/dashboard" className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]">
              View Dashboard
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-4 sm:grid-cols-3 max-w-lg mx-auto">
            {[["< 30 sec", "JD Generated"], ["100%", "AI Scored"], ["0", "CVs to Read Manually"]].map(([stat, label]) => (
              <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-xl font-bold text-white">{stat}</p>
                <p className="mt-1 text-[11px] text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-400">Features</p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Everything you need to hire well</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className={`rounded-3xl border ${f.border} bg-gradient-to-b ${f.color} p-6`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/30 ${f.accent}`}>
                  {f.icon}
                </span>
                <h3 className="mt-5 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-8 sm:p-12">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-400">How It Works</p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">From job to hire in 4 steps</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.number} className="relative">
                  <span className="text-4xl font-black text-indigo-500/20">{s.number}</span>
                  <h3 className="mt-3 text-base font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-white sm:text-4xl">
            Your next great hire is buried in a pile of CVs.<br />
            <span className="text-indigo-400">Let AI find them for you.</span>
          </h2>
          <p className="mt-5 text-zinc-500 text-sm leading-8">Start for free. No credit card required. Create your first job posting in under two minutes.</p>
          <Link href="/recruit/jobs/new" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition hover:bg-indigo-400">
            Get Started Free <ArrowRightIcon />
          </Link>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-black/40 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Plyndrox · Recruit AI</p>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-zinc-400 transition">Home</Link>
            <Link href="/recruit/dashboard" className="hover:text-zinc-400 transition">Dashboard</Link>
            <Link href="/privacy-policy" className="hover:text-zinc-400 transition">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-400 transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
