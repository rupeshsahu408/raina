import { AuthRedirect } from "@/components/AuthRedirect";
import Link from "next/link";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { DemoChatWidgetLazy, IntroVideoSectionLazy, FeedbackReportSectionLazy, PlyndroxAssistantLazy } from "@/components/LandingDynamicSections";
import MarketingShowcase from "@/components/MarketingShowcase";
import MarketingShowcaseLaptop from "@/components/MarketingShowcaseLaptop";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";

const homepageFaqs = [
  {
    question: "What is Plyndrox AI?",
    answer:
      "Plyndrox AI is a free all-in-one AI platform that combines seven workspaces — Personal AI, WhatsApp AI, Inbox AI, Payable AI, Recruit AI, Bihar regional AI, and Smart Ledger — for individuals and businesses worldwide.",
  },
  {
    question: "Is Plyndrox AI really free?",
    answer:
      "Yes. Every workspace inside Plyndrox AI is free for individuals and businesses. There are no subscriptions, no paywalls, and no credit card required to start.",
  },
  {
    question: "Which AI tools are included?",
    answer:
      "Personal AI for chat and emotional support, WhatsApp AI for customer automation, Inbox AI for email triage, Payable AI for invoice and accounts payable, Recruit AI for hiring and ATS, Bihar AI for regional Indian languages, and Smart Ledger for handwritten satti accounting.",
  },
  {
    question: "Does Plyndrox AI work on mobile?",
    answer:
      "Yes. Plyndrox AI is a Progressive Web App (PWA) that installs on iOS and Android, plus native Android and iOS builds via Capacitor.",
  },
  {
    question: "Is my data secure on Plyndrox AI?",
    answer:
      "Plyndrox uses Firebase Authentication, encrypted data transit, and stores conversations only with your permission. You can request full data deletion at any time from /data-deletion.",
  },
  {
    question: "Can I add the Plyndrox chat widget to my website?",
    answer:
      "Yes. Ibara is the embeddable Plyndrox AI chat widget — paste a single script tag and you have a multilingual AI assistant on your site in under 60 seconds.",
  },
];

const DemoChatWidget = DemoChatWidgetLazy;
const IntroVideoSection = IntroVideoSectionLazy;
const FeedbackReportSection = FeedbackReportSectionLazy;
const PlyndroxAssistant = PlyndroxAssistantLazy;

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const footerColumns = [
  {
    title: "Platform",
    links: [
      ["Personal AI", "/chat"],
      ["Bihar AI", "/bihar-ai"],
      ["Business AI Suite", "/business-ai"],
      ["Inbox AI", "/inbox"],
      ["Payable AI", "/payables"],
      ["Recruit AI", "/recruit"],
      ["Smart Ledger", "/ledger"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about"],
      ["Features", "/features"],
      ["Pricing", "/pricing"],
      ["Blog", "/blog"],
      ["Partners", "/partners"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy-policy"],
      ["Terms of Service", "/terms"],
      ["Cookie Policy", "/cookies"],
      ["Trust & Safety", "/disclaimer"],
    ],
  },
];


export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-zinc-950 font-sans">
      <JsonLd id="ld-home-faq" data={faqJsonLd(homepageFaqs)} />
      <AuthRedirect />

      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 glass-nav transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 transition-transform group-hover:scale-105">
              <img src="/plyndrox-logo.svg" alt="Plyndrox AI" className="h-9 w-9 object-contain plyndrox-logo-img" width="36" height="36" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-950">Plyndrox AI</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-zinc-500 md:flex">
            <Link href="/chat" className="transition hover:text-zinc-950">Personal</Link>
            <Link href="/business-ai" className="transition hover:text-zinc-950">Business</Link>
            <Link href="/payables" className="transition hover:text-zinc-950">Finance</Link>
            <Link href="/recruit" className="transition hover:text-zinc-950">Recruiting</Link>
            <Link href="/bihar-ai" className="transition hover:text-zinc-950">Regional</Link>
            <Link href="/translate" className="transition hover:text-zinc-950 inline-flex items-center gap-1">
              Translate
              <span className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <Link href="/login" className="hidden text-sm font-semibold text-zinc-600 transition hover:text-zinc-950 sm:block">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary px-5 py-2 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex flex-col">

        {/* ── Hero ── */}
        <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-[0.35]" aria-hidden="true" />
          <div className="hero-glow" aria-hidden="true" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                All tools — completely free
              </div>

              <h1 className="text-5xl font-black tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl leading-[1.04] mb-7">
                Every AI tool you need.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                  Free — for everyone, everywhere.
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl mb-10">
                7 powerful AI workspaces in one platform. Personal companion, business automation, email intelligence, invoice processing, hiring pipeline, regional AI, and smart ledger — all free, forever, for individuals and businesses across the world.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link href="/signup" className="btn-primary flex items-center gap-2 w-full sm:w-auto px-8 py-3.5 text-base font-bold">
                  Start Free — No signup required <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link href="/business-ai" className="btn-secondary flex items-center gap-2 w-full sm:w-auto px-8 py-3.5 text-base">
                  Explore AI tools
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 mb-14">
                {["No credit card", "No hidden fees", "No expiry", "Works in Hindi, English & Hinglish"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 font-medium">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>

              {/* Quick stat pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {[
                  { stat: "7", label: "AI Workspaces" },
                  { stat: "Free", label: "Always, forever" },
                  { stat: "24/7", label: "Always available" },
                  { stat: "3+", label: "Languages supported" },
                ].map(({ stat, label }) => (
                  <div key={label} className="rounded-2xl border border-zinc-100 bg-white/80 px-4 py-4 text-center shadow-sm backdrop-blur-sm">
                    <p className="text-2xl font-black text-zinc-950 tracking-tight">{stat}</p>
                    <p className="text-xs font-medium text-zinc-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <FeedbackReportSection />
        <IntroVideoSection />

        <MarketingShowcase />

        {/* ── Product Suite ── */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 mb-3">The full suite</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl mb-4">
                One platform.<br />Every workflow you'll ever need.
              </h2>
              <p className="text-lg text-zinc-500 leading-7">
                We didn't build a single chatbot. We built 7 focused AI workspaces — each solving a specific problem, each completely free, all connected under one login.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-12 gap-4 auto-rows-auto">

              {/* Personal AI — large hero card */}
              <Link href="/chat" className="col-span-12 lg:col-span-7 group rounded-3xl border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50/90 hover:border-indigo-200 p-8 sm:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[280px]">
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200/60 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-bold">Free forever</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Personal AI</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 mb-3 group-hover:text-indigo-700 transition-colors">Your personal AI companion.</h3>
                  <p className="text-zinc-600 text-base leading-7 max-w-lg">
                    Understands you deeply, remembers your context, and supports you through daily life — work, study, stress, and everything in between. Available 24/7 in Hindi, English, and Hinglish. No other AI gets this personal.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">
                  Start chatting free <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Link>

              {/* Bihar AI */}
              <Link href="/bihar-ai" className="col-span-12 sm:col-span-6 lg:col-span-5 group rounded-3xl border bg-zinc-950 border-zinc-800 text-white hover:border-zinc-700 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-10 w-10 rounded-xl bg-zinc-800 text-amber-400 flex items-center justify-center border border-zinc-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    </div>
                    <span className="rounded-full bg-zinc-800 text-zinc-300 px-3 py-1 text-xs font-bold border border-zinc-700">Regional AI</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Bihar AI</p>
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">Built for 130 million people.</h3>
                  <p className="text-zinc-400 text-sm leading-6">
                    Local news, education, jobs, culture — AI that speaks your language and understands your world.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all">
                  Explore Bihar AI <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Link>

              {/* Business AI */}
              <Link href="/business-ai" className="col-span-12 sm:col-span-6 lg:col-span-4 group rounded-3xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-50/90 hover:border-emerald-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">Live</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Business AI Suite</p>
                  <h3 className="text-lg font-black text-zinc-950 mb-2 group-hover:text-emerald-700 transition-colors">Automate customer conversations.</h3>
                  <p className="text-zinc-600 text-sm leading-6">WhatsApp, website chatbots, and email agents — 24/7, multilingual, zero hires.</p>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:gap-3 transition-all">
                  Explore Business AI <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Link>

              {/* Payable AI */}
              <Link href="/payables" className="col-span-12 sm:col-span-6 lg:col-span-4 group rounded-3xl border border-sky-100 bg-sky-50/60 hover:bg-sky-50/90 hover:border-sky-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center border border-sky-200/60">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/><path d="M10 15h4"/></svg>
                    </div>
                    <span className="rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-xs font-bold">Beta</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-2">Payable AI</p>
                  <h3 className="text-lg font-black text-zinc-950 mb-2 group-hover:text-sky-700 transition-colors">Invoices that process themselves.</h3>
                  <p className="text-zinc-600 text-sm leading-6">Upload or connect Gmail. AI extracts every field, routes approvals, and tracks payments automatically.</p>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-sky-600 group-hover:gap-3 transition-all">
                  Automate finance <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Link>

              {/* Smart Ledger */}
              <Link href="/ledger" className="col-span-12 sm:col-span-6 lg:col-span-4 group rounded-3xl border border-amber-100 bg-amber-50/60 hover:bg-amber-50/90 hover:border-amber-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200/60">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
                    </div>
                    <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold">New</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Smart Ledger</p>
                  <h3 className="text-lg font-black text-zinc-950 mb-2 group-hover:text-amber-700 transition-colors">Satti records in seconds.</h3>
                  <p className="text-zinc-600 text-sm leading-6">Photograph your grain register — AI reads Hindi and English, groups by commodity, and exports full analytics.</p>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-amber-600 group-hover:gap-3 transition-all">
                  Digitize your ledger <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Link>

              {/* Recruit AI */}
              <Link href="/recruit" className="col-span-12 sm:col-span-6 group rounded-3xl border border-purple-100 bg-purple-50/60 hover:bg-purple-50/90 hover:border-purple-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[200px]">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200/60">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <span className="rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-xs font-bold">New</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">Recruit AI</p>
                  <h3 className="text-xl font-black text-zinc-950 mb-2 group-hover:text-purple-700 transition-colors">Hire right. Hire faster.</h3>
                  <p className="text-zinc-600 text-sm leading-6 max-w-sm">AI scores every resume, sends smart assessments, and surfaces the best candidates. End resume fatigue once and for all.</p>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-purple-600 group-hover:gap-3 transition-all">
                  Transform hiring <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Link>

              {/* Inbox AI */}
              <Link href="/inbox" className="col-span-12 sm:col-span-6 group rounded-3xl border border-rose-100 bg-rose-50/60 hover:bg-rose-50/90 hover:border-rose-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[200px]">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200/60">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <span className="rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-bold">Beta</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">Inbox AI</p>
                  <h3 className="text-xl font-black text-zinc-950 mb-2 group-hover:text-rose-700 transition-colors">Zero email stress. Starting now.</h3>
                  <p className="text-zinc-600 text-sm leading-6 max-w-sm">Connect Gmail. AI labels every email by intent, writes replies in your tone, and sets auto-reply rules — your inbox runs itself.</p>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-rose-600 group-hover:gap-3 transition-all">
                  Master your inbox <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        <MarketingShowcaseLaptop />

        {/* ── Why Plyndrox — Value pillars ── */}
        <section className="border-y border-zinc-100 bg-zinc-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 mb-3">Why Plyndrox</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl mb-4">
                Built different. For everyone.
              </h2>
              <p className="max-w-xl mx-auto text-zinc-500 text-base leading-7">
                There are thousands of AI tools. Most are expensive, complicated, or only useful if you speak English and live in a major city. Plyndrox was built for the rest of the world.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: "💸",
                  title: "Free for everyone, always",
                  desc: "No subscription. No trial. No credit card. Every workspace in Plyndrox is free to use, forever. We believe powerful AI shouldn't be a privilege.",
                  highlight: "indigo",
                },
                {
                  icon: "🌍",
                  title: "Works anywhere in the world",
                  desc: "From a village in Bihar to a business in Mumbai to a startup in Nairobi — Plyndrox is built for global access on any device, any connection speed.",
                  highlight: "emerald",
                },
                {
                  icon: "🗣️",
                  title: "Hindi, English & Hinglish",
                  desc: "Speak however is natural for you. Our AI understands and responds in Hindi, English, Hinglish, and regional mix — no forced language switches.",
                  highlight: "amber",
                },
                {
                  icon: "📱",
                  title: "Mobile-first, PWA-ready",
                  desc: "Install it like an app. Works offline. Loads in under a second on 3G. Designed for the way most of the world actually uses the internet.",
                  highlight: "rose",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="text-base font-black text-zinc-950 mb-2">{title}</h3>
                  <p className="text-sm leading-6 text-zinc-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Deep Dive — dark section ── */}
        <section className="py-28 bg-zinc-950 text-zinc-50 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-semibold text-zinc-300 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Enterprise-grade, zero enterprise price
                </div>
                <h2 className="text-4xl font-black sm:text-5xl tracking-tight mb-6 text-white leading-[1.05]">
                  Serious AI power.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Serious simplicity.</span>
                </h2>
                <p className="text-zinc-400 text-lg mb-10 leading-relaxed max-w-xl">
                  Under the surface, Plyndrox runs on top AI models, real-time integrations, and encrypted infrastructure. On the surface, it just works — no technical setup, no long onboarding, no learning curve.
                </p>

                <div className="space-y-7">
                  {[
                    {
                      title: "One login. Seven workspaces.",
                      desc: "Sign in once and access every AI tool. Personal companion, business automation, invoice AI, recruit AI, inbox AI, regional AI, and smart ledger — all connected, all free.",
                    },
                    {
                      title: "Privacy at the center.",
                      desc: "Sensitive data stays in focused, authenticated workspaces. No ad-based monetisation. No data sold. We earn when you grow — not before.",
                    },
                    {
                      title: "Grows with you.",
                      desc: "Start with one tool today. As your needs evolve, your other workspaces are already waiting. No migration, no extra accounts, no new learning curve.",
                    },
                  ].map(({ title, desc }, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="flex-shrink-0 mt-1 h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 font-black text-sm">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base mb-1">{title}</h4>
                        <p className="text-sm text-zinc-400 leading-6">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Demo Widget */}
              <div className="relative lg:ml-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl transform rotate-1 scale-105" aria-hidden="true" />
                <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5 border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      Plyndrox Personal AI
                    </div>
                    <div className="text-xs text-zinc-600">Live demo</div>
                  </div>
                  <DemoChatWidget />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof / credibility ── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400 mb-10">Used by people across India and beyond</p>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  quote: "I use the WhatsApp AI for my shop — it replies to customer questions while I'm sleeping. My sales went up and I didn't spend a single rupee.",
                  name: "Ravi Kumar",
                  role: "Small business owner, Patna",
                },
                {
                  quote: "The Inbox AI changed everything. I used to spend 2 hours a day on emails. Now it's 20 minutes. The tone detection is scarily accurate.",
                  name: "Priya Singh",
                  role: "Freelance consultant, Delhi",
                },
                {
                  quote: "Smart Ledger saved my grain business. I just photograph the satti register and the AI does everything — Hindi, numbers, groupings, export. Perfect.",
                  name: "Mohan Yadav",
                  role: "Grain trader, Muzaffarpur",
                },
              ].map(({ quote, name, role }) => (
                <div key={name} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-7 text-left shadow-sm">
                  <div className="mb-4 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm leading-7 text-zinc-700 mb-5">"{quote}"</p>
                  <div>
                    <p className="text-sm font-bold text-zinc-950">{name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-zinc-50 border-t border-zinc-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-16 text-center sm:px-16 shadow-2xl shadow-indigo-600/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 to-purple-700 opacity-90" aria-hidden="true" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white/80 mb-6 uppercase tracking-wider backdrop-blur-sm">
                  Free. No credit card. No limits.
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight sm:text-5xl mb-4">
                  Start using Plyndrox today.
                </h2>
                <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Join thousands of people and businesses who use Plyndrox AI every day — for free. Start with one workspace, or explore all seven. No setup, no payment, no catch.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-indigo-700 hover:text-indigo-800 hover:bg-zinc-50 px-8 py-4 text-base font-black shadow-xl shadow-black/10 transition hover:-translate-y-0.5">
                    Create Free Account <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link href="/business-ai" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20 px-8 py-4 text-base font-semibold backdrop-blur-sm transition hover:-translate-y-0.5">
                    Explore Business AI
                  </Link>
                </div>
                <p className="mt-5 text-xs text-indigo-200 font-medium">No credit card · No expiry · No hidden costs · Works anywhere in the world</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white pt-16 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-14">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 transition-transform group-hover:scale-105">
                  <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-9 w-9 object-contain plyndrox-logo-img" width="36" height="36" />
                </div>
                <span className="text-lg font-bold tracking-tight text-zinc-950">Plyndrox AI</span>
              </Link>
              <p className="text-sm text-zinc-500 max-w-xs mb-2 leading-6">
                7 AI workspaces in one platform. Free for individuals and businesses across the world.
              </p>
              <p className="text-xs text-zinc-400">Built in India · Serving the world · Free forever</p>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-bold text-zinc-950 mb-5 uppercase tracking-wider">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-zinc-500 hover:text-indigo-600 transition-colors font-medium">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">
              © {new Date().getFullYear()} Plyndrox AI. All rights reserved. Built with ♥ in India.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>

      <PlyndroxAssistant />
    </div>
  );
}
