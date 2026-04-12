import { InstallPrompt } from "@/components/InstallPrompt";
import { DemoChatWidget } from "@/components/DemoChatWidget";
import { ThreeBackground } from "@/components/ThreeBackground";
import Link from "next/link";

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function SmartphoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-13h4v2" />
      <path d="M2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4l16 16" />
      <path d="M20 4 4 20" />
    </svg>
  );
}

function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 12s0-3.4-.44-5.02a2.82 2.82 0 0 0-1.98-1.98C17.96 4.56 12 4.56 12 4.56s-5.96 0-7.58.44a2.82 2.82 0 0 0-1.98 1.98C2 8.6 2 12 2 12s0 3.4.44 5.02a2.82 2.82 0 0 0 1.98 1.98c1.62.44 7.58.44 7.58.44s5.96 0 7.58-.44a2.82 2.82 0 0 0 1.98-1.98C22 15.4 22 12 22 12Z" />
      <path d="m10 15 5-3-5-3v6Z" />
    </svg>
  );
}

const footerColumns = [
  {
    title: "Product",
    links: [
      ["Home", "/"],
      ["Features", "/features"],
      ["App", "/app"],
      ["Pricing", "/pricing"],
      ["Try AI / Demo", "/demo"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Blog", "/blog"],
      ["Help Center", "/help"],
      ["API Docs", "/docs"],
      ["Tutorials / Guides", "/guides"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about"],
      ["Partners", "/partners"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy-policy"],
      ["Terms of Service", "/terms"],
      ["Cookie Policy", "/cookies"],
      ["Disclaimer", "/disclaimer"],
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/", Icon: LinkedInIcon },
  { label: "Twitter X", href: "https://x.com/", Icon: XIcon },
  { label: "YouTube", href: "https://www.youtube.com/", Icon: YouTubeIcon },
];

export default function Home() {
  return (
    <div className="evara-premium-landing relative min-h-screen bg-black text-zinc-100 selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-600/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/evara-logo.png" alt="Evara" className="h-8 w-8 object-contain" />
            <span className="text-sm font-bold tracking-widest text-zinc-100 uppercase">Evara</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-zinc-400 transition hover:text-white sm:block">
              Sign In
            </Link>
            <InstallPrompt label="Install App" className="hidden sm:block rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20" />
            <Link href="/signup" className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:scale-105 hover:bg-zinc-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col">
        {/* Hero Section */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-24 text-center sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-0 opacity-60 [mask-image:linear-gradient(to_bottom,white,transparent)]">
             <ThreeBackground />
          </div>
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center" aria-hidden="true">
            <div className="evara-orbital-stage">
              <div className="evara-orbit-ring" />
              <div className="evara-orbit-ring" />
              <div className="evara-orbit-ring" />
              <div className="evara-core" />
              <div className="evara-glass-tile evara-tile-a">
                <span>emotional signal</span>
              </div>
              <div className="evara-glass-tile evara-tile-b">
                <span>business agent</span>
              </div>
              <div className="evara-glass-tile evara-tile-c">
                <span>regional intelligence</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md mb-8 shadow-2xl">
              <SparklesIcon className="h-3.5 w-3.5 text-purple-400" />
              <span>Intelligence with a soul.</span>
            </div>
            
            <h1 className="text-balance text-5xl font-medium tracking-tight text-white sm:text-7xl lg:text-8xl">
              The next generation of <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400">
                personal AI.
              </span>
            </h1>
            
            <p className="mt-8 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-xl">
              Evara blends emotional intelligence with elegant product design. Experience supportive conversations, regional knowledge, and business automation in one unified platform.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link href="/signup" className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50">
                  Start Chatting
                </Link>
                <Link href="/whatsapp-ai" className="w-full sm:w-auto rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50">
                  Explore Business Solutions
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                <Link
                  href="/app"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                >
                  <SmartphoneIcon className="h-4 w-4" />
                  Install App — Free
                </Link>
                <InstallPrompt
                  label="⚡ Install Now"
                  className="w-full sm:w-auto rounded-full border border-purple-500/30 bg-purple-500/10 px-8 py-4 text-sm font-semibold text-purple-200 backdrop-blur-md transition hover:bg-purple-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
          
        </section>

        {/* Evara Personal Showcase */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-medium tracking-tight text-white sm:text-5xl text-balance">
                  A companion that actually listens.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-zinc-400 text-balance">
                  Meet Simi and Loa. Two distinct personalities designed to hold space for your thoughts. Whether you need gentle grounding or analytical clarity, Evara adapts to your emotional state.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Real-time emotional state detection",
                    "Persistent memory across sessions",
                    "Voice-first mobile experience",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-transparent blur-2xl" />
                <div className="relative rounded-[2rem] border border-white/10 bg-black/40 p-4 sm:p-8 backdrop-blur-2xl shadow-2xl">
                   <div className="mb-6 flex items-center justify-between">
                     <div>
                       <h3 className="text-sm font-semibold text-white">Live Demo</h3>
                       <p className="text-xs text-zinc-500">Experience the emotional engine</p>
                     </div>
                   </div>
                   <DemoChatWidget />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Ecosystem Grid */}
        <section className="relative py-24 sm:py-32 bg-zinc-950/50 border-y border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-medium tracking-tight text-white sm:text-5xl text-balance">
                One platform. <br/> Three dimensions of intelligence.
              </h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {/* Evara Personal Card */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04]">
                <div className="absolute top-0 right-0 p-8 opacity-20 transition-opacity group-hover:opacity-100">
                  <MessageCircleIcon className="h-24 w-24 text-purple-400" />
                </div>
                <div className="relative z-10 mb-20">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
                    <MessageCircleIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Personal AI</h3>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">Your emotional companion. Available 24/7 on iOS, Android, and Web with native-level performance.</p>
                </div>
                <Link href="/login" className="relative z-10 inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300">
                  Open App <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {/* WhatsApp AI Card */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 mb-20">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">WhatsApp Business</h3>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">Automate your customer support. Connect your business knowledge base and let our agents handle inquiries in 10+ languages.</p>
                </div>
                <Link href="/whatsapp-ai" className="relative z-10 inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300">
                  Build Assistant <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {/* Bihar AI Card */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04]">
                <div className="absolute top-0 right-0 p-8 opacity-20 transition-opacity group-hover:opacity-100">
                  <GlobeIcon className="h-24 w-24 text-sky-400" />
                </div>
                <div className="relative z-10 mb-20">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
                    <GlobeIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Bihar AI</h3>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">Deep regional intelligence. Access specialized knowledge, cultural context, and localized data with native understanding.</p>
                </div>
                <Link href="/bihar-ai" className="relative z-10 inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300">
                  Access Knowledge <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-600/20 blur-[100px]" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-medium tracking-tight text-white sm:text-6xl text-balance">
              Ready to experience the difference?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">
              Join thousands of users who have found a smarter, more empathetic way to interact with AI.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-transform hover:scale-105">
                Create Free Account
              </Link>
              <InstallPrompt label="Install PWA" className="w-full sm:w-auto rounded-full border border-white/10 bg-black/50 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10" />
            </div>
          </div>
        </section>

      </main>

      <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.18),transparent_34%),radial-gradient(circle_at_90%_15%,rgba(56,189,248,0.12),transparent_30%),linear-gradient(180deg,rgba(24,24,27,0.78),rgba(0,0,0,1))]" />
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1.65fr_1fr]">
              <div className="space-y-6">
                <Link href="/" className="group inline-flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg shadow-purple-500/10 transition group-hover:scale-105 group-hover:border-purple-300/50">
                    <img src="/evara-logo.png" alt="Raina Jet" className="h-7 w-7 object-contain" />
                  </span>
                  <span>
                    <span className="block text-base font-bold tracking-[0.22em] text-white uppercase">Raina Jet</span>
                    <span className="mt-1 block text-xs font-medium text-purple-200">Smart AI Automation Platform</span>
                  </span>
                </Link>
                <p className="max-w-sm text-sm leading-6 text-zinc-400">
                  AI automation for smarter workflows, faster customer support, and intelligent business growth.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <Link href="/signup" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black shadow-lg shadow-white/10 transition hover:-translate-y-0.5 hover:bg-zinc-200">
                    🚀 Start Free
                  </Link>
                  <Link href="/chat" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-purple-300/40 hover:bg-white/10">
                    💬 Chat with AI
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Secure", "Fast", "Reliable"].map((badge) => (
                    <span key={badge} className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-100">{column.title}</h3>
                    <ul className="mt-4 space-y-3">
                      {column.links.map(([label, href]) => (
                        <li key={href}>
                          <Link href={href} className="group inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:translate-x-1 hover:text-white">
                            <span className="h-px w-0 bg-purple-300 transition-all group-hover:w-3" />
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-white">Get latest AI updates & features</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Product updates, automation ideas, and practical AI workflows.
                </p>
                <form className="mt-5 flex flex-col gap-3">
                  <label htmlFor="footer-email" className="sr-only">Email address</label>
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="you@example.com"
                    className="vercal-footer-input min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-300/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-purple-500/10"
                  />
                  <button type="button" className="min-h-12 rounded-2xl bg-gradient-to-r from-purple-300 via-fuchsia-300 to-sky-300 px-5 text-sm font-bold text-black shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/30">
                    Subscribe
                  </button>
                </form>
                <div className="mt-6 flex items-center gap-3">
                  {socialLinks.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:-translate-y-1 hover:border-purple-300/50 hover:bg-white/10 hover:text-white"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Raina Jet</p>
              <a
                href="https://vercal.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-zinc-200"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white p-0.5">
                  <img src="/vercal-logo.png" alt="Vercal" className="h-full w-full rounded-full object-contain" />
                </span>
                Powered by Vercal
              </a>
              <p>
                Built by <span className="font-semibold text-zinc-300">Riley Parker &amp; Rupesh Sahu</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
