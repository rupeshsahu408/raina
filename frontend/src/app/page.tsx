import { AuthRedirect } from "@/components/AuthRedirect";
import Link from "next/link";
import { DemoChatWidget } from "@/components/DemoChatWidget";
import { IntroVideoSection } from "@/components/IntroVideoSection";
import { FeedbackReportSection } from "@/components/FeedbackReportSection";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
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

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SmartphoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function CalculatorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
      <line x1="16" y1="10" x2="16" y2="10.01" />
      <line x1="16" y1="18" x2="16" y2="18.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="12" y1="10" x2="12" y2="10.01" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="8" y1="10" x2="8" y2="10.01" />
      <line x1="8" y1="18" x2="8" y2="18.01" />
    </svg>
  );
}

function NetworkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}

const footerColumns = [
  {
    title: "Platform",
    links: [
      ["Personal AI", "/chat"],
      ["Bihar AI", "/bihar-ai"],
      ["Plyndrox Business AI", "/business-ai"],
      ["Plyndrox Inbox AI", "/inbox"],
      ["Plyndrox Payable AI", "/payables"],
      ["Plyndrox Recruit AI", "/recruit"],
      ["Smart Ledger", "/ledger"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about"],
      ["Features", "/features"],
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
    <div className="relative min-h-screen bg-white text-zinc-950 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <AuthRedirect />

      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 glass-nav transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white transition-transform group-hover:scale-105">
              <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 object-contain plyndrox-logo-img" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-950">Plyndrox AI</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
            <Link href="/chat" className="transition hover:text-zinc-950">Personal</Link>
            <Link href="/business-ai" className="transition hover:text-zinc-950">Business</Link>
            <Link href="/payables" className="transition hover:text-zinc-950">Finance</Link>
            <Link href="/recruit" className="transition hover:text-zinc-950">Recruiting</Link>
            <Link href="/bihar-ai" className="transition hover:text-zinc-950">Regional</Link>
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
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-[0.4]" />
          <div className="hero-glow" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Introducing Plyndrox Intelligence Suite
              </div>
              
              <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold tracking-tight text-zinc-950 sm:text-7xl lg:text-[5rem] leading-[1.05]">
                Intelligence built for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">life and work.</span>
              </h1>
              
              <p className="animate-fade-in-up delay-200 mt-8 max-w-2xl mx-auto text-lg leading-relaxed text-zinc-600 sm:text-xl">
                Plyndrox AI brings personal assistance, regional intelligence, and professional automation into one polished platform for modern individuals, teams, and growing businesses.
              </p>
              
              <div className="animate-fade-in-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 text-base">
                  Start Free <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link href="/features" className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 text-base">
                  Explore Platform
                </Link>
              </div>

              <div className="animate-fade-in-up delay-300 mt-5 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
                <Link href="#feedback-report" className="rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-indigo-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50">
                  Give feedback
                </Link>
                <Link href="#feedback-report" className="rounded-full border border-rose-100 bg-white/80 px-4 py-2 text-rose-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50">
                  Report an error
                </Link>
              </div>

              <div className="mt-16 animate-fade-in delay-300 border-t border-zinc-100 pt-10">
                <div className="mx-auto grid max-w-3xl gap-3 text-left sm:grid-cols-3">
                  {[
                    ["7 AI workspaces", "Personal, regional, business, finance, hiring, email, and ledger workflows."],
                    ["Mobile-first", "Designed to feel fast and focused from phone to desktop."],
                    ["Human-in-loop", "Automation that keeps people in control of important decisions."],
                  ].map(([title, body]) => (
                    <div key={title} className="rounded-2xl border border-zinc-100 bg-white/80 p-4 shadow-sm">
                      <p className="text-sm font-bold text-zinc-950">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <FeedbackReportSection />

        <IntroVideoSection />

        {/* Core Product Suite - Bento Grid */}
        <section className="py-24 bg-white relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
                A unified ecosystem. <br/> Tailored for your specific needs.
              </h2>
              <p className="mt-4 text-lg text-zinc-600 max-w-2xl">
                We didn't build just one tool. We built an entire intelligence layer that integrates seamlessly into how you live, work, and operate.
              </p>
            </div>

            <div className="bento-grid">
              {/* Personal AI (Large) */}
              <Link href="/chat" className="bento-item col-span-8 group flex flex-col justify-between bg-zinc-50/50 hover:bg-zinc-50 border-indigo-100">
                <div className="mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm border border-indigo-200/50">
                    <SmartphoneIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-950 mb-3 group-hover:text-indigo-600 transition-colors">Plyndrox Personal Companion</h3>
                  <p className="text-zinc-600 leading-relaxed max-w-lg text-base">
                    An emotionally intelligent AI that remembers context, provides gentle support, and acts as your daily sounding board. Available instantly on mobile.
                  </p>
                </div>
                <div className="mt-auto flex items-center text-sm font-bold text-indigo-600 uppercase tracking-wide">
                  Try Personal AI <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Bihar AI */}
              <Link href="/bihar-ai" className="bento-item col-span-4 group bg-zinc-950 border-zinc-800 text-white hover:border-zinc-700">
                <div className="mb-8">
                  <div className="h-5 w-5 rounded-xl bg-zinc-800 text-white flex items-center justify-center mb-6 border border-zinc-700">
                    <GlobeIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Bihar AI</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Deep regional intelligence. Rooted in local culture, news, education, and career opportunities specific to Bihar.
                  </p>
                </div>
                <div className="mt-auto flex items-center text-sm font-semibold text-white">
                  Explore Region <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Payables */}
              <Link href="/payables" className="bento-item col-span-4 group bg-sky-50/30 border-sky-100 hover:border-sky-200">
                <div className="mb-8">
                  <div className="h-5 w-5 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-6">
                    <FileTextIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-2">Plyndrox Payable AI</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    Automate invoice processing. Extract data, manage approvals, and schedule payments without touching a spreadsheet.
                  </p>
                </div>
                <div className="mt-auto flex items-center text-sm font-semibold text-sky-600">
                  Automate Finance <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Ledger */}
              <Link href="/ledger" className="bento-item col-span-4 group bg-amber-50/30 border-amber-100 hover:border-amber-200">
                <div className="mb-8">
                  <div className="h-5 w-5 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                    <CalculatorIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-2">Smart Ledger</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    Smart ledger workflows for small businesses. Track cash flow, manage expenses, and generate reports automatically.
                  </p>
                </div>
                <div className="mt-auto flex items-center text-sm font-semibold text-amber-600">
                  Manage Ledger <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Business/WhatsApp */}
              <Link href="/business-ai" className="bento-item col-span-4 group bg-emerald-50/30 border-emerald-100 hover:border-emerald-200">
                <div className="mb-8">
                  <div className="h-5 w-5 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                    <ZapIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-2">Plyndrox Business AI</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    Deploy intelligent agents on WhatsApp and your website. Handle routine questions, capture leads, and create cleaner handoff paths.
                  </p>
                </div>
                <div className="mt-auto flex items-center text-sm font-semibold text-emerald-600">
                  Connect Customers <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Recruit */}
              <Link href="/recruit" className="bento-item col-span-6 group bg-purple-50/30 border-purple-100 hover:border-purple-200">
                <div className="mb-8">
                  <div className="h-5 w-5 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                    <BriefcaseIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-2">Plyndrox Recruit AI</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    AI-powered candidate screening and matching. Find the right talent faster while eliminating resume fatigue. Automate your hiring pipeline end-to-end.
                  </p>
                </div>
                <div className="mt-auto flex items-center text-sm font-semibold text-purple-600">
                  Hire Smarter <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Inbox */}
              <Link href="/inbox" className="bento-item col-span-6 group bg-rose-50/30 border-rose-100 hover:border-rose-200">
                <div className="mb-8">
                  <div className="h-5 w-5 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                    <InboxIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-2">Plyndrox Inbox AI</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    Intelligent email management. Triage inbox noise, extract action items, and draft responses based on your writing style.
                  </p>
                </div>
                <div className="mt-auto flex items-center text-sm font-semibold text-rose-600">
                  Master Email <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-zinc-100 bg-zinc-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="stat-card text-center sm:text-left sm:pl-8">
                <p className="text-4xl font-black text-zinc-950 tracking-tight">7</p>
                <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-wider">AI Workspaces</p>
              </div>
              <div className="stat-card text-center sm:text-left sm:pl-8">
                <p className="text-4xl font-black text-zinc-950 tracking-tight">1</p>
                <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-wider">Unified Platform</p>
              </div>
              <div className="stat-card text-center sm:text-left sm:pl-8">
                <p className="text-4xl font-black text-zinc-950 tracking-tight">24/7</p>
                <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-wider">AI Availability</p>
              </div>
              <div className="stat-card text-center sm:text-left sm:pl-8">
                <p className="text-4xl font-black text-zinc-950 tracking-tight">PWA</p>
                <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-wider">Installable App</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Deep Dive */}
        <section className="py-32 bg-zinc-950 text-zinc-50 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-semibold text-zinc-300 mb-6">
                  <ShieldIcon className="h-3.5 w-3.5 text-indigo-400" /> Production-minded
                </div>
                <h2 className="text-4xl font-extrabold sm:text-5xl tracking-tight mb-6 text-white leading-tight">
                  Engineered for reliability. <br/> Designed for simplicity.
                </h2>
                <p className="text-zinc-400 text-lg mb-10 leading-relaxed max-w-xl">
                  Plyndrox is organized around clear product boundaries, focused workflows, and human review where it matters. The experience stays simple on the surface while supporting serious personal and business use cases underneath.
                </p>

                <div className="space-y-8">
                  {[
                    { title: "Privacy-aware flows", desc: "Sensitive actions stay inside focused, authenticated product areas with clear user intent.", icon: ShieldIcon },
                    { title: "Fast, practical automation", desc: "Each workspace is shaped around real tasks such as replies, invoices, candidates, and ledgers.", icon: ZapIcon },
                    { title: "Cross-product continuity", desc: "Start with one use case and expand into the broader Plyndrox AI suite as your needs grow.", icon: NetworkIcon }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="flex-shrink-0 mt-1 h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shadow-inner">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{item.title}</h4>
                        <p className="text-base text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* UI Mockup / Visual */}
              <div className="relative lg:ml-10">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl transform rotate-2 scale-105" />
                <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-zinc-700 hover:bg-red-500 transition-colors" />
                      <div className="h-3 w-3 rounded-full bg-zinc-700 hover:bg-amber-500 transition-colors" />
                      <div className="h-3 w-3 rounded-full bg-zinc-700 hover:bg-green-500 transition-colors" />
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">live-preview.tsx</div>
                  </div>
                  
                  {/* Interactive Demo Widget representing the capability */}
                  <DemoChatWidget />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-[0.08] pointer-events-none" />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="rounded-3xl bg-indigo-600 px-8 py-20 text-center sm:px-16 shadow-2xl shadow-indigo-600/20 border border-indigo-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700 opacity-90" />
              <div className="relative z-10">
                <h2 className="text-4xl font-black text-white tracking-tight sm:text-5xl mb-6">
                  Ready to elevate your intelligence layer?
                </h2>
                <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Start with the workspace that fits today, then expand into the full Plyndrox AI suite as your personal and business workflows grow.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/signup" className="btn-secondary bg-white text-indigo-600 hover:text-indigo-700 hover:bg-zinc-50 px-8 py-4 text-base border-transparent font-bold shadow-xl shadow-black/10">
                    Create Free Account
                  </Link>
                  <Link href="/contact" className="btn-primary bg-indigo-900/50 hover:bg-indigo-900 border border-indigo-400 text-white px-8 py-4 text-base shadow-none backdrop-blur-sm">
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-2 pr-8">
              <Link href="/" className="flex items-center gap-2 mb-6 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white transition-transform group-hover:scale-105 shadow-sm">
              <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 object-contain plyndrox-logo-img" />
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-950">Plyndrox AI</span>
              </Link>
              <p className="text-base text-zinc-500 max-w-xs mb-8 leading-relaxed">
                A unified AI ecosystem built for individuals and businesses. Premium intelligence, seamlessly integrated into your workflows.
              </p>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-bold text-zinc-950 mb-6 uppercase tracking-wider">{col.title}</h3>
                <ul className="space-y-4">
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-base text-zinc-500 hover:text-indigo-600 transition-colors font-medium">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-zinc-400">
              © {new Date().getFullYear()} Plyndrox AI, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Plyndrox AI platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
