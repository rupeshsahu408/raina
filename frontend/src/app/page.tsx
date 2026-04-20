import { InstallPrompt } from "@/components/InstallPrompt";
import { DemoChatWidget } from "@/components/DemoChatWidget";
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
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
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
      ["Plyndrox Business AI", "/business-ai"],
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
    <div className="relative min-h-screen bg-white text-[#1d2226]">
      <AuthRedirect />

      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/evara-logo.png" alt="Plyndrox" className="h-8 w-8 object-contain" />
            <span className="text-sm font-black uppercase tracking-[0.28em] text-[#1d2226]">Plyndrox</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-gray-500 md:flex">
            <Link href="/features" className="transition hover:text-[#1d2226]">Features</Link>
            <Link href="/bihar-ai" className="transition hover:text-[#1d2226]">Bihar AI</Link>
            <Link href="/business-ai" className="transition hover:text-[#1d2226]">Business</Link>
            <Link href="/inbox" className="transition hover:text-[#1d2226]">Plyndrox Inbox AI</Link>
            <Link href="/payables" className="font-semibold text-violet-600 transition hover:text-violet-700">Plyndrox Payable AI</Link>
            <Link href="/blog" className="transition hover:text-[#1d2226]">Blog</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 sm:block">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d3238] sm:px-5 sm:text-sm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex flex-col">

        {/* Hero */}
        <section className="relative flex min-h-[100svh] items-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-white">
          <div className="absolute inset-0 premium-grid opacity-60" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300/40 to-transparent" />

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col items-start text-left">
              <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-700 shadow-sm">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  <span>Mobile-first personal intelligence</span>
                </div>
                <a
                  href="https://sendora.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-4 text-xs font-bold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow"
                  aria-label="Powered by Sendora"
                >
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-white">
                    <img src="/sendora-logo.png" alt="Sendora logo" className="h-7 w-7 object-contain" />
                  </span>
                  <span className="tracking-[0.1em]">Powered by Sendora</span>
                </a>
              </div>

              <h1 className="max-w-3xl text-balance text-5xl font-black leading-[1.0] tracking-[-0.04em] text-[#1d2226] sm:text-6xl lg:text-7xl">
                An AI companion that feels calm, capable, and human.
              </h1>

              <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-gray-500 sm:text-lg">
                Plyndrox brings supportive conversations, regional knowledge, and business automation into one refined platform built to feel effortless on your phone first.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/signup" className="inline-flex min-h-13 w-full items-center justify-center rounded-full bg-[#1d2226] px-7 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d3238] hover:shadow-md sm:w-auto">
                  Start free
                </Link>
                <Link href="/chat" className="inline-flex min-h-13 w-full items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow sm:w-auto">
                  Open chat
                </Link>
                <Link
                  href="/app"
                  className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-7 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
                >
                  <SmartphoneIcon className="h-4 w-4" />
                  Install app
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-gray-400">
                {["Free to start", "No credit card", "Works on all devices"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid w-full max-w-sm grid-cols-3 gap-3">
                {[
                  ["24/7", "companion"],
                  ["10+", "languages"],
                  ["PWA", "ready"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xl font-black text-[#1d2226] sm:text-2xl">{value}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat preview */}
            <div className="relative mx-auto w-full max-w-sm lg:ml-auto lg:max-w-md">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-violet-100/80 via-indigo-50/60 to-sky-100/60 blur-2xl" />
              <div className="relative rounded-[2rem] border border-gray-200 bg-white p-3 shadow-xl">
                <div className="rounded-[1.6rem] border border-gray-100 bg-gray-50/80 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
                        <img src="/evara-logo.png" alt="Plyndrox" className="h-7 w-7 object-contain" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-[#1d2226]">Plyndrox AI</span>
                        <span className="text-xs text-emerald-600">Ready to listen</span>
                      </span>
                    </div>
                    <InstallPrompt label="Install" className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 shadow-sm transition hover:bg-gray-50" />
                  </div>
                  <DemoChatWidget />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product cards */}
        <section className="relative px-4 py-16 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Everything you need</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1d2226] sm:text-4xl">Four intelligent tools, one platform</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Personal AI", body: "A gentle daily companion that adapts to your emotional state and remembers what matters.", href: "/chat", accent: "violet", dot: "bg-violet-500" },
                { title: "Bihar AI", body: "Regional intelligence with cultural context for education, jobs, news, and local knowledge.", href: "/bihar-ai", accent: "sky", dot: "bg-sky-500" },
                { title: "Plyndrox Business AI", body: "Customer support automation for WhatsApp and website chatbots — pick the tools that fit your business.", href: "/business-ai", accent: "emerald", dot: "bg-emerald-500" },
                { title: "Plyndrox Payable AI", body: "AI reads your invoices automatically, extracts all data, and organizes everything in one calm dashboard. You review and pay.", href: "/payables", accent: "indigo", dot: "bg-indigo-500" },
              ].map(({ title, body, href, dot }) => (
                <Link key={title} href={href} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
                  <div className={`mb-4 h-1.5 w-10 rounded-full ${dot} transition-all group-hover:w-16`} />
                  <h2 className="text-xl font-black tracking-tight text-[#1d2226]">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-gray-500">{body}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-gray-400 transition group-hover:text-[#1d2226] group-hover:gap-2.5">
                    Explore <ArrowRightIcon className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Designed for real use */}
        <section className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8 bg-gray-50">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-600">Designed for real use</p>
              <h2 className="mt-4 max-w-xl text-balance text-3xl font-black tracking-tight text-[#1d2226] sm:text-5xl">
                Clean enough for daily focus. Rich enough to feel alive.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-gray-500">
                The experience is shaped around fast mobile access, thumb-friendly actions, calm surfaces, and clear pathways into personal chat, Bihar AI, and business automation.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Mobile-first", "Large touch targets, compact sections, and clean vertical flow for small screens."],
                ["Emotion-aware", "The visual language feels supportive without becoming childish or cluttered."],
                ["Professional", "Consistent branding, stronger hierarchy, and fewer distracting dead-end links."],
                ["Expandable", "Landing, chat, PWA, and business surfaces feel like one connected product."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-[#1d2226]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8 bg-white">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-8 shadow-sm sm:p-12 lg:p-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-600">Start in seconds</p>
                <h2 className="mt-4 text-balance text-3xl font-black tracking-tight text-[#1d2226] sm:text-5xl">
                  One platform. Three ways to use it.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-gray-500">
                  Chat for personal support, explore Bihar-focused knowledge, or automate your business conversations — all in one place.
                </p>
              </div>
              <div className="grid gap-3">
                <Link href="/signup" className="group flex items-center justify-between rounded-2xl bg-[#1d2226] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d3238]">
                  Create account <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link href="/bihar-ai" className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300">
                  Explore Bihar AI <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link href="/business-ai" className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300">
                  Explore Plyndrox Business AI <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1.8fr_1fr]">
            <div className="space-y-5">
              <Link href="/" className="group inline-flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition group-hover:border-violet-200">
                  <img src="/evara-logo.png" alt="Plyndrox AI" className="h-6 w-6 object-contain" />
                </span>
                <span>
                  <span className="block text-sm font-black uppercase tracking-[0.2em] text-[#1d2226]">Plyndrox AI</span>
                  <span className="mt-0.5 block text-xs font-medium text-gray-400">Personal, regional, and business AI</span>
                </span>
              </Link>
              <p className="max-w-sm text-sm leading-6 text-gray-500">
                A polished AI platform for supportive conversations, local knowledge, and smarter customer workflows.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link href="/signup" className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#1d2226] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d3238]">
                  Start free
                </Link>
                <Link href="/chat" className="inline-flex min-h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300">
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
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#1d2226]">{column.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {column.links.map(([label, href]) => (
                      <li key={href}>
                        <Link href={href} className="text-sm text-gray-500 transition hover:text-[#1d2226]">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="text-sm font-bold text-[#1d2226]">Get latest AI updates</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Product updates, automation ideas, and practical AI workflows.
              </p>
              <form className="mt-4 flex flex-col gap-3">
                <label htmlFor="footer-email" className="sr-only">Email address</label>
                <input
                  id="footer-email"
                  type="email"
                  placeholder="you@example.com"
                  className="min-h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1d2226] outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <button type="button" className="min-h-11 rounded-xl bg-[#1d2226] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d3238]">
                  Subscribe
                </button>
              </form>
              <div className="mt-5 flex items-center gap-2.5">
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:text-[#1d2226]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Plyndrox AI. All rights reserved.</p>
            <div className="flex gap-5 text-xs text-gray-400">
              <Link href="/privacy-policy" className="hover:text-[#1d2226] transition">Privacy</Link>
              <Link href="/terms" className="hover:text-[#1d2226] transition">Terms</Link>
              <Link href="/cookies" className="hover:text-[#1d2226] transition">Cookies</Link>
              <Link href="/contact" className="hover:text-[#1d2226] transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
