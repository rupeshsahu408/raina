import { InstallPrompt } from "@/components/InstallPrompt";
import { DemoChatWidget } from "@/components/DemoChatWidget";
import { ThreeBackground } from "@/components/ThreeBackground";
import { AuthRedirect } from "@/components/AuthRedirect";
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
      ["Chat", "/chat"],
      ["Business AI", "/business-ai"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Blog", "/blog"],
      ["Help Center", "/help"],
      ["Bihar AI", "/bihar-ai"],
      ["Settings", "/settings"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about"],
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
    <div className="evara-premium-landing relative min-h-screen overflow-hidden bg-[#04030a] text-zinc-100 selection:bg-violet-400/30">
      <AuthRedirect />
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(244,114,182,0.22),transparent_32%),radial-gradient(circle_at_92%_12%,rgba(56,189,248,0.2),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(124,58,237,0.24),transparent_36%),linear-gradient(180deg,#05030b_0%,#090713_48%,#030207_100%)]" />
        <div className="premium-grid absolute inset-0 opacity-45" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/12 blur-[130px]" />
      </div>

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#05030a]/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/evara-logo.png" alt="Evara" className="h-8 w-8 object-contain" />
            <span className="text-sm font-black uppercase tracking-[0.32em] text-white">Evara</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-zinc-400 md:flex">
            <Link href="/features" className="transition hover:text-white">Features</Link>
            <Link href="/bihar-ai" className="transition hover:text-white">Bihar AI</Link>
            <Link href="/business-ai" className="transition hover:text-white">Business</Link>
            <Link href="/inbox" className="transition hover:text-white">Inbox AI</Link>
            <Link href="/blog" className="transition hover:text-white">Blog</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white sm:block">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-full bg-white px-4 py-2 text-xs font-black text-black shadow-lg shadow-white/10 transition hover:-translate-y-0.5 hover:bg-zinc-200 sm:px-5 sm:text-sm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col">
        <section className="relative flex min-h-[100svh] items-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-0 opacity-55 [mask-image:linear-gradient(to_bottom,white,transparent_76%)]">
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

          <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col items-start text-left">
            <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-100 shadow-2xl backdrop-blur-md">
                <SparklesIcon className="h-3.5 w-3.5 text-purple-400" />
                <span>Mobile-first personal intelligence</span>
              </div>
              <a
                href="https://sendora.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.09] py-1.5 pl-1.5 pr-4 text-xs font-black text-white shadow-2xl shadow-black/20 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-white/[0.14]"
                aria-label="Powered by Sendora"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
                  <img src="/sendora-logo.png" alt="Sendora logo" className="h-7 w-7 object-contain" />
                </span>
                <span className="tracking-[0.14em]">Powered by Sendora</span>
              </a>
            </div>

            <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.92] tracking-[-0.075em] text-white sm:text-7xl lg:text-8xl">
              An AI companion that feels calm, capable, and human.
            </h1>

            <p className="mt-7 max-w-2xl text-pretty text-base leading-8 text-zinc-300 sm:text-xl">
              Evara brings supportive conversations, regional knowledge, and business automation into one refined platform built to feel effortless on your phone first.
            </p>

            <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/signup" className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-white px-8 text-sm font-black text-black shadow-2xl shadow-white/10 transition hover:-translate-y-1 hover:bg-zinc-200 sm:w-auto">
                  Start free
                </Link>
                <Link href="/chat" className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-white/12 bg-white/8 px-8 text-sm font-bold text-white shadow-xl shadow-black/20 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/12 sm:w-auto">
                  Open chat
                </Link>
                <Link
                  href="/app"
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-400 px-8 text-sm font-black text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-1 sm:w-auto"
                >
                  <SmartphoneIcon className="h-4 w-4" />
                Install app
                </Link>
              </div>

              <div className="mt-9 grid w-full max-w-xl grid-cols-3 gap-2 sm:gap-3">
                {[
                  ["24/7", "companion"],
                  ["10+", "languages"],
                  ["PWA", "ready"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
                    <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm lg:ml-auto lg:max-w-md">
              <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-fuchsia-500/25 via-violet-500/15 to-sky-400/20 blur-3xl" />
              <div className="relative rounded-[2.6rem] border border-white/12 bg-white/[0.075] p-3 shadow-2xl shadow-black/50 backdrop-blur-2xl">
                <div className="rounded-[2.15rem] border border-white/10 bg-[#06040b]/85 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-400 via-violet-500 to-sky-400 shadow-lg shadow-violet-500/25">
                        <img src="/evara-logo.png" alt="Evara" className="h-7 w-7 object-contain" />
                      </span>
                      <span>
                        <span className="block text-sm font-black text-white">Evara AI</span>
                        <span className="text-xs text-emerald-300">Ready to listen</span>
                      </span>
                    </div>
                    <InstallPrompt label="Install" className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/15" />
                  </div>
                  <DemoChatWidget />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              { title: "Personal AI", body: "A gentle daily companion that adapts to your emotional state and remembers what matters.", href: "/chat", gradient: "from-fuchsia-400 via-violet-400 to-sky-300" },
              { title: "Bihar AI", body: "Regional intelligence with cultural context for education, jobs, news, and local knowledge.", href: "/bihar-ai", gradient: "from-sky-400 via-blue-400 to-violet-400" },
              { title: "Business AI", body: "Customer support automation for WhatsApp and website chatbots — pick the tools that fit your business.", href: "/business-ai", gradient: "from-emerald-400 via-teal-400 to-sky-400" },
            ].map(({ title, body, href, gradient }) => (
              <Link key={title} href={href} className="group rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.07]">
                <div className={`mb-7 h-1.5 w-16 rounded-full bg-gradient-to-r ${gradient} transition group-hover:w-24`} />
                <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">{body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">Designed for real use</p>
              <h2 className="mt-4 max-w-xl text-balance text-4xl font-black tracking-[-0.055em] text-white sm:text-6xl">
                Clean enough for daily focus. Rich enough to feel alive.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">
                The experience is shaped around fast mobile access, thumb-friendly actions, calm surfaces, and clear pathways into personal chat, Bihar AI, and business automation.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Mobile-first", "Large touch targets, compact sections, and clean vertical flow for small screens."],
                ["Emotion-aware", "The visual language feels supportive without becoming childish or cluttered."],
                ["Professional", "Consistent branding, stronger hierarchy, and fewer distracting dead-end links."],
                ["Expandable", "Landing, chat, PWA, and business surfaces now feel like one connected product."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[1.75rem] border border-white/10 bg-[#0d0a16]/75 p-6 shadow-xl shadow-black/20">
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(244,114,182,0.16),rgba(124,58,237,0.16)_42%,rgba(14,165,233,0.14))] p-6 shadow-2xl shadow-violet-950/30 backdrop-blur-xl sm:p-10 lg:p-14">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-100">Start in seconds</p>
                <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.055em] text-white sm:text-6xl">
                  One platform. Three ways to use it.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-200">
                  Chat for personal support, explore Bihar-focused knowledge, or automate your business conversations — all in one place.
                </p>
              </div>
              <div className="grid gap-3">
                <Link href="/signup" className="group flex items-center justify-between rounded-3xl bg-white px-5 py-4 text-sm font-black text-black transition hover:-translate-y-1 hover:bg-zinc-200">
                  Create account <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link href="/bihar-ai" className="group flex items-center justify-between rounded-3xl border border-white/12 bg-white/10 px-5 py-4 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-white/15">
                  Explore Bihar AI <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link href="/business-ai" className="group flex items-center justify-between rounded-3xl border border-white/12 bg-white/10 px-5 py-4 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-white/15">
                  Explore Business AI <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-[#030207]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.18),transparent_34%),radial-gradient(circle_at_90%_15%,rgba(56,189,248,0.12),transparent_30%)]" />
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_1.65fr_1fr]">
              <div className="space-y-6">
                <Link href="/" className="group inline-flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg shadow-purple-500/10 transition group-hover:scale-105 group-hover:border-purple-300/50">
                    <img src="/evara-logo.png" alt="Evara AI" className="h-7 w-7 object-contain" />
                  </span>
                  <span>
                    <span className="block text-base font-black uppercase tracking-[0.22em] text-white">Evara AI</span>
                    <span className="mt-1 block text-xs font-medium text-purple-200">Personal, regional, and business AI</span>
                  </span>
                </Link>
                <p className="max-w-sm text-sm leading-6 text-zinc-400">
                  A polished AI platform for supportive conversations, local knowledge, and smarter customer workflows.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <Link href="/signup" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black shadow-lg shadow-white/10 transition hover:-translate-y-0.5 hover:bg-zinc-200">
                    Start free
                  </Link>
                  <Link href="/chat" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-purple-300/40 hover:bg-white/10">
                    Chat with AI
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
              <p>© 2026 Evara AI</p>
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
