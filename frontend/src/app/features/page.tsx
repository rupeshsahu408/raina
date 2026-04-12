import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features — Evara AI",
  description:
    "Explore every capability of the Evara AI platform — emotional personal AI, WhatsApp business automation, Bihar regional intelligence, voice interaction, and more.",
};

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

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.16Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.16Z" />
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

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function MicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
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

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
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

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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

const footerColumns = [
  {
    title: "Product",
    links: [
      ["Home", "/"],
      ["Features", "/features"],
      ["Pricing", "/pricing"],
      ["Try Demo", "/demo"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Blog", "/blog"],
      ["Help Center", "/help"],
      ["API Docs", "/docs"],
      ["Guides", "/guides"],
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

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen bg-black text-zinc-100 selection:bg-purple-500/30">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-sky-600/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/evara-logo.png" alt="Evara" className="h-8 w-8 object-contain" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-100">Evara</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-zinc-400 transition hover:text-white sm:block">
              Sign In
            </Link>
            <Link href="/signup" className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:scale-105 hover:bg-zinc-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-40 text-center sm:px-6 lg:px-8">
          <div className="absolute inset-x-0 top-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-purple-400" />
            <span>Everything the platform can do</span>
          </div>
          <h1 className="mt-8 max-w-4xl text-balance text-5xl font-medium tracking-tight text-white sm:text-7xl">
            Built to think,{" "}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
              feel, and automate.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg">
            Evara AI combines emotional intelligence, business automation, and regional knowledge into one cohesive platform — available on web, mobile, and WhatsApp.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/signup" className="w-full rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-transform hover:scale-105 sm:w-auto">
              Start for Free
            </Link>
            <Link href="/whatsapp-ai" className="w-full rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10 sm:w-auto">
              Explore Business AI
            </Link>
          </div>
        </section>

        {/* ── Product Pillars ── */}
        <section className="relative border-y border-white/5 bg-zinc-950/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">Three dimensions of intelligence</p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight text-white sm:text-5xl">
                One platform, every context.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <HeartIcon className="h-6 w-6" />,
                  color: "purple",
                  bg: "bg-purple-500/20",
                  text: "text-purple-400",
                  border: "hover:border-purple-500/30",
                  glow: "from-purple-500/10",
                  title: "Evara AI — Personal Companion",
                  description: "An emotionally aware AI with two distinct personalities — Simi and Loa. It listens, remembers, and responds in a way that feels genuinely human.",
                  href: "/chat",
                  cta: "Open Chat",
                },
                {
                  icon: <WhatsAppIcon className="h-6 w-6" />,
                  color: "emerald",
                  bg: "bg-emerald-500/20",
                  text: "text-emerald-400",
                  border: "hover:border-emerald-500/30",
                  glow: "from-emerald-500/10",
                  title: "WhatsApp AI — Business Automation",
                  description: "Plug your WhatsApp Cloud API into Evara's multilingual engine. Automate customer support, inquiries, and bookings — 24/7, without lifting a finger.",
                  href: "/whatsapp-ai",
                  cta: "Explore Business AI",
                },
                {
                  icon: <GlobeIcon className="h-6 w-6" />,
                  color: "sky",
                  bg: "bg-sky-500/20",
                  text: "text-sky-400",
                  border: "hover:border-sky-500/30",
                  glow: "from-sky-500/10",
                  title: "Bihar AI — Regional Intelligence",
                  description: "Deep expertise in Bihar's education, jobs, politics, culture, and agriculture. A knowledge base built for users who need answers that matter locally.",
                  href: "/bihar-ai",
                  cta: "Access Knowledge",
                },
              ].map((card) => (
                <div key={card.title} className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:bg-white/[0.04] ${card.border}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.glow} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  <div className="relative z-10">
                    <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.text}`}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-400">{card.description}</p>
                  </div>
                  <Link href={card.href} className={`relative z-10 mt-8 inline-flex items-center gap-2 text-sm font-medium ${card.text} transition hover:gap-3`}>
                    {card.cta} <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Evara Personal AI Deep Dive ── */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                  <HeartIcon className="h-3.5 w-3.5" /> Personal AI
                </span>
                <h2 className="mt-6 text-3xl font-medium tracking-tight text-white sm:text-5xl text-balance">
                  AI that understands how you feel.
                </h2>
                <p className="mt-6 text-base leading-relaxed text-zinc-400">
                  Evara AI isn't just a chatbot. It reads the emotional tone behind your words, tracks your state over time, and responds with genuine care — switching between Simi's calm warmth and Loa's confident energy based on what you need.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    { icon: <HeartIcon className="h-3.5 w-3.5" />, text: "Dual personality engine — Simi (calm & caring) and Loa (confident & playful)" },
                    { icon: <BrainIcon className="h-3.5 w-3.5" />, text: "Real-time emotional mood detection from conversation context" },
                    { icon: <DatabaseIcon className="h-3.5 w-3.5" />, text: "Persistent memory — short-term context and long-term profile recall" },
                    { icon: <LayersIcon className="h-3.5 w-3.5" />, text: "Five conversation modes: Personal, Education, Study, Thinking, and Business" },
                    { icon: <SearchIcon className="h-3.5 w-3.5" />, text: "Live web search integrated directly into responses" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                        {item.icon}
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <Link href="/chat" className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105">
                  Try Evara AI <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <HeartIcon className="h-5 w-5" />, title: "Emotional Detection", desc: "Senses tone and sentiment in real time", color: "text-pink-400 bg-pink-500/10" },
                  { icon: <BrainIcon className="h-5 w-5" />, title: "Adaptive Memory", desc: "Remembers preferences across every session", color: "text-purple-400 bg-purple-500/10" },
                  { icon: <MicIcon className="h-5 w-5" />, title: "Voice Input", desc: "Speak naturally — AI transcribes and responds", color: "text-violet-400 bg-violet-500/10" },
                  { icon: <LayersIcon className="h-5 w-5" />, title: "Mode Switching", desc: "Education, business, personal in one click", color: "text-fuchsia-400 bg-fuchsia-500/10" },
                  { icon: <SearchIcon className="h-5 w-5" />, title: "Real-Time Search", desc: "Answers backed by current web data", color: "text-indigo-400 bg-indigo-500/10" },
                  { icon: <SmartphoneIcon className="h-5 w-5" />, title: "PWA + Android", desc: "Native app feel on every device", color: "text-sky-400 bg-sky-500/10" },
                ].map((card) => (
                  <div key={card.title} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05]">
                    <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
                      {card.icon}
                    </div>
                    <h4 className="text-sm font-semibold text-white">{card.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WhatsApp Business AI Deep Dive ── */}
        <section className="relative border-y border-white/5 bg-zinc-950/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <WhatsAppIcon className="h-5 w-5" />, title: "WhatsApp Cloud API", desc: "Secure, direct integration with Meta's platform", color: "text-emerald-400 bg-emerald-500/10" },
                  { icon: <GlobeIcon className="h-5 w-5" />, title: "10+ Languages", desc: "Hindi, English, Hinglish, and more out of the box", color: "text-teal-400 bg-teal-500/10" },
                  { icon: <BookOpenIcon className="h-5 w-5" />, title: "Knowledge Book", desc: "Train the AI entirely on your business content", color: "text-green-400 bg-green-500/10" },
                  { icon: <ShieldIcon className="h-5 w-5" />, title: "Encrypted Credentials", desc: "Your API keys are stored with AES encryption", color: "text-emerald-400 bg-emerald-500/10" },
                  { icon: <DatabaseIcon className="h-5 w-5" />, title: "Chat Logs", desc: "Full conversation history in your dashboard", color: "text-cyan-400 bg-cyan-500/10" },
                  { icon: <UsersIcon className="h-5 w-5" />, title: "24/7 Automation", desc: "Never miss a customer message, day or night", color: "text-lime-400 bg-lime-500/10" },
                ].map((card) => (
                  <div key={card.title} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05]">
                    <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
                      {card.icon}
                    </div>
                    <h4 className="text-sm font-semibold text-white">{card.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{card.desc}</p>
                  </div>
                ))}
              </div>

              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp Business AI
                </span>
                <h2 className="mt-6 text-3xl font-medium tracking-tight text-white sm:text-5xl text-balance">
                  Customer support that never sleeps.
                </h2>
                <p className="mt-6 text-base leading-relaxed text-zinc-400">
                  Connect your WhatsApp Business number to Evara in minutes. Upload your knowledge book, and our AI handles inquiries, bookings, and FAQs — in any language — with responses that feel human, not robotic.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Instant setup with your WhatsApp Cloud API credentials",
                    "Brand-aligned responses trained on your exact business data",
                    "Supports multilingual conversations seamlessly",
                    "Full chat history and analytics in one secure dashboard",
                    "Meta WhatsApp Business API compliant",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/whatsapp-ai" className="mt-10 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-bold text-black transition hover:scale-105 hover:bg-emerald-300">
                  Build Your Assistant <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bihar AI Deep Dive ── */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                  <GlobeIcon className="h-3.5 w-3.5" /> Bihar AI
                </span>
                <h2 className="mt-6 text-3xl font-medium tracking-tight text-white sm:text-5xl text-balance">
                  Hyperlocal knowledge, deeply understood.
                </h2>
                <p className="mt-6 text-base leading-relaxed text-zinc-400">
                  Bihar AI is not a generic chatbot with a search engine. It is a purpose-built intelligence layer trained on Bihar's unique educational, governmental, cultural, and agricultural landscape — giving users answers they can actually act on.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { label: "Education", detail: "BSEB, OFSS, board results, admission guidance" },
                    { label: "Government Jobs", detail: "BPSC updates, exam schedules, eligibility" },
                    { label: "Politics", detail: "Local governance, representatives, policies" },
                    { label: "Culture", detail: "Festivals, traditions, history, and heritage" },
                    { label: "Agriculture", detail: "Crops, seasons, schemes, and farm support" },
                    { label: "Local Services", detail: "Utilities, districts, and civic information" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
                      <p className="text-sm font-semibold text-sky-300">{item.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <Link href="/bihar-ai" className="mt-10 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-6 py-3 text-sm font-bold text-sky-300 transition hover:bg-sky-500/20">
                  Explore Bihar AI <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {/* Visual stat/info block */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-500/20 via-blue-500/10 to-transparent blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 p-8 backdrop-blur-2xl">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-sky-400">Coverage Areas</h3>
                  <div className="mt-6 space-y-4">
                    {[
                      { label: "Education & Admissions", pct: 95 },
                      { label: "Government & Jobs", pct: 90 },
                      { label: "Culture & Festivals", pct: 85 },
                      { label: "Agriculture & Farming", pct: 80 },
                      { label: "Local Governance", pct: 75 },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-zinc-300">{stat.label}</span>
                          <span className="text-zinc-500">{stat.pct}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-400"
                            style={{ width: `${stat.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-8 text-xs leading-relaxed text-zinc-500">
                    Bihar AI is continuously updated with the latest educational notifications, government circulars, and local events to keep responses accurate and timely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Platform & Infrastructure ── */}
        <section className="relative border-y border-white/5 bg-zinc-950/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Under the hood</p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight text-white sm:text-5xl">
                A platform built to scale.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-zinc-400">
                From Firebase authentication to MongoDB Atlas storage and NVIDIA-powered voice transcription, every layer of Evara is engineered for reliability, speed, and security.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <ShieldIcon className="h-6 w-6" />,
                  bg: "bg-purple-500/15",
                  text: "text-purple-400",
                  title: "Secure Auth",
                  desc: "Firebase Authentication with Email/Password and Google Sign-In. Session management handled securely server-side.",
                },
                {
                  icon: <DatabaseIcon className="h-6 w-6" />,
                  bg: "bg-sky-500/15",
                  text: "text-sky-400",
                  title: "Persistent Storage",
                  desc: "MongoDB Atlas stores every conversation, user profile, and business credential with encrypted security at rest.",
                },
                {
                  icon: <MicIcon className="h-6 w-6" />,
                  bg: "bg-violet-500/15",
                  text: "text-violet-400",
                  title: "NVIDIA Voice AI",
                  desc: "Voice messages are transcribed using NVIDIA Canary-1b — one of the fastest and most accurate speech models available.",
                },
                {
                  icon: <ZapIcon className="h-6 w-6" />,
                  bg: "bg-amber-500/15",
                  text: "text-amber-400",
                  title: "Real-Time Search",
                  desc: "Integrated Serper API delivers live web search results directly into AI responses for always-current answers.",
                },
                {
                  icon: <SmartphoneIcon className="h-6 w-6" />,
                  bg: "bg-emerald-500/15",
                  text: "text-emerald-400",
                  title: "PWA + Android",
                  desc: "Installable Progressive Web App and a Capacitor-powered Android build — native performance across every platform.",
                },
                {
                  icon: <BrainIcon className="h-6 w-6" />,
                  bg: "bg-pink-500/15",
                  text: "text-pink-400",
                  title: "NVIDIA LLM Engine",
                  desc: "Chat completions powered by NVIDIA's GPT-OSS-20B model — fast, intelligent, and optimized for nuanced conversation.",
                },
                {
                  icon: <LayersIcon className="h-6 w-6" />,
                  bg: "bg-fuchsia-500/15",
                  text: "text-fuchsia-400",
                  title: "Modular Architecture",
                  desc: "A clean frontend/backend split with Next.js App Router and Express API — built for speed and future scalability.",
                },
                {
                  icon: <SearchIcon className="h-6 w-6" />,
                  bg: "bg-teal-500/15",
                  text: "text-teal-400",
                  title: "Proxy API Layer",
                  desc: "Next.js rewrites seamlessly proxy frontend requests to the backend — no CORS issues, cleaner credentials management.",
                },
              ].map((item) => (
                <div key={item.title} className="group relative flex flex-col gap-4 overflow-hidden rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.bg} ${item.text}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Voice & Accessibility ── */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 z-0">
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[100px]" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                  <MicIcon className="h-3.5 w-3.5" /> Voice-First Experience
                </span>
                <h2 className="mt-6 text-3xl font-medium tracking-tight text-white sm:text-5xl text-balance">
                  Just speak. Evara listens.
                </h2>
                <p className="mt-6 text-base leading-relaxed text-zinc-400">
                  Whether you are on your phone during a commute or at your desk, Evara's voice interface lets you have a full conversation without touching your keyboard. Powered by NVIDIA Canary-1b for industry-leading accuracy.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Hold-to-record voice input on iOS, Android, and Web",
                    "NVIDIA Canary-1b transcription — fast and accurate",
                    "Full conversational response after every voice message",
                    "Seamlessly integrated into the existing chat interface",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="relative flex flex-col items-center gap-6">
                  {/* Animated voice bars illustration */}
                  <div className="flex h-28 items-end justify-center gap-1.5">
                    {[40, 70, 55, 90, 60, 85, 45, 75, 50, 95, 65, 80, 40, 70, 55].map((h, i) => (
                      <div
                        key={i}
                        className="w-2 rounded-full bg-gradient-to-t from-violet-600 to-purple-400"
                        style={{
                          height: `${h}%`,
                          opacity: 0.7 + (i % 3) * 0.1,
                          animation: `typingDot ${0.8 + (i % 5) * 0.15}s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.07}s`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                    <MicIcon className="h-7 w-7 text-violet-300" />
                  </div>
                  <p className="text-sm font-medium text-zinc-400">Hold to speak</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Comparison / Why Evara ── */}
        <section className="relative border-t border-white/5 bg-zinc-950/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Why Evara</p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight text-white sm:text-5xl">
                Not just another AI app.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <HeartIcon className="h-5 w-5" />,
                  color: "text-pink-400 bg-pink-500/10",
                  title: "Emotional Intelligence",
                  desc: "Most AI tools respond to what you say. Evara responds to how you feel.",
                },
                {
                  icon: <GlobeIcon className="h-5 w-5" />,
                  color: "text-sky-400 bg-sky-500/10",
                  title: "Regional Depth",
                  desc: "A knowledge layer that genuinely understands the Bihar region — not a generic India model.",
                },
                {
                  icon: <WhatsAppIcon className="h-5 w-5" />,
                  color: "text-emerald-400 bg-emerald-500/10",
                  title: "Business Automation",
                  desc: "Turn WhatsApp into a 24/7 sales and support channel without hiring additional staff.",
                },
                {
                  icon: <ShieldIcon className="h-5 w-5" />,
                  color: "text-purple-400 bg-purple-500/10",
                  title: "Privacy First",
                  desc: "Credentials are encrypted. Conversations are private. Your data is never sold.",
                },
                {
                  icon: <ZapIcon className="h-5 w-5" />,
                  color: "text-amber-400 bg-amber-500/10",
                  title: "Lightning Performance",
                  desc: "NVIDIA-powered models ensure fast, accurate responses even for complex multi-part queries.",
                },
                {
                  icon: <SmartphoneIcon className="h-5 w-5" />,
                  color: "text-violet-400 bg-violet-500/10",
                  title: "Truly Cross-Platform",
                  desc: "One account works on web, Android, and WhatsApp — no fragmented experience.",
                },
              ].map((item) => (
                <div key={item.title} className="group flex flex-col gap-4 rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
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
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-medium tracking-tight text-white sm:text-6xl text-balance">
              Ready to experience the difference?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">
              Join thousands of users who chose a smarter, more empathetic AI platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="w-full rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-transform hover:scale-105 sm:w-auto">
                Create Free Account
              </Link>
              <Link href="/whatsapp-ai" className="w-full rounded-full border border-white/10 bg-black/50 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10 sm:w-auto">
                Explore Business AI
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.18),transparent_34%),radial-gradient(circle_at_90%_15%,rgba(56,189,248,0.12),transparent_30%),linear-gradient(180deg,rgba(24,24,27,0.78),rgba(0,0,0,1))]" />
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1.65fr_1fr]">
              <div className="space-y-6">
                <Link href="/" className="group inline-flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg shadow-purple-500/10 transition group-hover:scale-105 group-hover:border-purple-300/50">
                    <img src="/evara-logo.png" alt="Evara AI" className="h-7 w-7 object-contain" />
                  </span>
                  <span>
                    <span className="block text-base font-bold uppercase tracking-[0.22em] text-white">Evara AI</span>
                    <span className="mt-1 block text-xs font-medium text-purple-200">Smart AI Automation Platform</span>
                  </span>
                </Link>
                <p className="max-w-sm text-sm leading-6 text-zinc-400">
                  AI automation for smarter workflows, faster customer support, and intelligent business growth.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <Link href="/signup" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black shadow-lg shadow-white/10 transition hover:-translate-y-0.5 hover:bg-zinc-200">
                    Start Free
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
                <h3 className="text-sm font-bold text-white">Get latest AI updates</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Product updates, automation ideas, and practical AI workflows.
                </p>
                <form className="mt-5 flex flex-col gap-3">
                  <label htmlFor="footer-email" className="sr-only">Email address</label>
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="you@example.com"
                    className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-300/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-purple-500/10"
                  />
                  <button type="button" className="min-h-12 rounded-2xl bg-gradient-to-r from-purple-300 via-fuchsia-300 to-sky-300 px-5 text-sm font-bold text-black shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/30">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Raina Jet</p>
              <p>Built by <span className="font-semibold text-zinc-300">Riley Parker &amp; Rupesh Sahu</span></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
