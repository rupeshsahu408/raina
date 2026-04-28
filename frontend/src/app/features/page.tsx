import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Features — All 7 Plyndrox AI Workspaces in One Free Platform",
  description:
    "Explore every capability of the Plyndrox AI platform — Personal AI, WhatsApp AI, Inbox AI, Payable AI, Recruit AI, Bihar regional AI, Smart Ledger, voice interaction, and more.",
  path: "/features",
  keywords: ["Plyndrox features", "AI features", "AI capabilities", "Plyndrox AI tools list"],
});

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

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
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

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen bg-white text-[#1d2226]">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 object-contain plyndrox-logo-img" />
            <span className="text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Plyndrox</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-gray-500 transition hover:text-[#1d2226] sm:block">
              Sign In
            </Link>
            <Link href="/signup" className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d3238]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-20 text-center sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="premium-grid absolute inset-0 opacity-50" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-medium text-violet-700">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>Everything the platform can do</span>
            </div>
            <h1 className="mt-7 max-w-4xl text-balance text-4xl font-black tracking-tight text-[#1d2226] sm:text-6xl">
              Built to think, feel, and automate.
            </h1>
            <p className="mt-5 max-w-2xl text-balance text-base leading-relaxed text-gray-500 sm:text-lg">
              Plyndrox AI combines emotional intelligence, business automation, and regional knowledge into one cohesive platform — available on web, mobile, and WhatsApp.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/signup" className="w-full rounded-full bg-[#1d2226] px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d3238] sm:w-auto">
                Start for Free
              </Link>
              <Link href="/business-ai" className="w-full rounded-full border border-gray-200 bg-white px-8 py-3.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 sm:w-auto">
                Explore Plyndrox Business AI
              </Link>
            </div>
          </div>
        </section>

        {/* Product Pillars */}
        <section className="border-y border-gray-100 bg-gray-50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Three dimensions of intelligence</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#1d2226] sm:text-5xl">One platform, every context.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: <HeartIcon className="h-6 w-6" />,
                  iconStyle: "text-violet-600 bg-violet-50 border-violet-100",
                  title: "Plyndrox AI — Personal Companion",
                  description: "An emotionally aware AI with two distinct personalities — Simi and Loa. It listens, remembers, and responds in a way that feels genuinely human.",
                  href: "/chat",
                  cta: "Open Chat",
                  ctaStyle: "text-violet-600 hover:text-violet-700",
                },
                {
                  icon: <WhatsAppIcon className="h-6 w-6" />,
                  iconStyle: "text-emerald-600 bg-emerald-50 border-emerald-100",
                  title: "Plyndrox WhatsApp AI — Business Automation",
                  description: "Plug your WhatsApp Cloud API into Plyndrox's multilingual engine. Automate customer support, inquiries, and bookings — 24/7, without lifting a finger.",
                  href: "/whatsapp-ai",
                  cta: "Explore Plyndrox Business AI",
                  ctaStyle: "text-emerald-600 hover:text-emerald-700",
                },
                {
                  icon: <GlobeIcon className="h-6 w-6" />,
                  iconStyle: "text-sky-600 bg-sky-50 border-sky-100",
                  title: "Bihar AI — Regional Intelligence",
                  description: "Deep expertise in Bihar's education, jobs, politics, culture, and agriculture. A knowledge base built for users who need answers that matter locally.",
                  href: "/bihar-ai",
                  cta: "Access Knowledge",
                  ctaStyle: "text-sky-600 hover:text-sky-700",
                },
              ].map((card) => (
                <div key={card.title} className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
                  <div>
                    <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${card.iconStyle}`}>
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-bold text-[#1d2226]">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">{card.description}</p>
                  </div>
                  <Link href={card.href} className={`mt-7 inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3 ${card.ctaStyle}`}>
                    {card.cta} <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Personal AI Deep Dive */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  <HeartIcon className="h-3.5 w-3.5" /> Personal AI
                </span>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-[#1d2226] sm:text-5xl text-balance">
                  AI that understands how you feel.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-gray-500">
                  Plyndrox AI isn't just a chatbot. It reads the emotional tone behind your words, tracks your state over time, and responds with genuine care — switching between Simi's calm warmth and Loa's confident energy based on what you need.
                </p>
                <ul className="mt-7 space-y-4">
                  {[
                    { icon: <HeartIcon className="h-3.5 w-3.5" />, text: "Dual personality engine — Simi (calm & caring) and Loa (confident & playful)" },
                    { icon: <BrainIcon className="h-3.5 w-3.5" />, text: "Real-time emotional mood detection from conversation context" },
                    { icon: <DatabaseIcon className="h-3.5 w-3.5" />, text: "Persistent memory — short-term context and long-term profile recall" },
                    { icon: <LayersIcon className="h-3.5 w-3.5" />, text: "Five conversation modes: Personal, Education, Study, Thinking, and Business" },
                    { icon: <SearchIcon className="h-3.5 w-3.5" />, text: "Live web search integrated directly into responses" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#1d2226]">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-100 bg-violet-50 text-violet-600">
                        {item.icon}
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <Link href="/chat" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#1d2226] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d3238]">
                  Try Plyndrox AI <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <HeartIcon className="h-5 w-5" />, title: "Emotional Detection", desc: "Senses tone and sentiment in real time", style: "text-pink-600 bg-pink-50 border-pink-100" },
                  { icon: <BrainIcon className="h-5 w-5" />, title: "Adaptive Memory", desc: "Remembers preferences across every session", style: "text-violet-600 bg-violet-50 border-violet-100" },
                  { icon: <MicIcon className="h-5 w-5" />, title: "Voice Input", desc: "Speak naturally — AI transcribes and responds", style: "text-indigo-600 bg-indigo-50 border-indigo-100" },
                  { icon: <LayersIcon className="h-5 w-5" />, title: "Mode Switching", desc: "Education, business, personal in one click", style: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100" },
                  { icon: <SearchIcon className="h-5 w-5" />, title: "Real-Time Search", desc: "Answers backed by current web data", style: "text-sky-600 bg-sky-50 border-sky-100" },
                  { icon: <SmartphoneIcon className="h-5 w-5" />, title: "PWA + Android", desc: "Native app feel on every device", style: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                ].map((card) => (
                  <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
                    <div className={`mb-3 inline-flex h-6 w-6 items-center justify-center rounded-xl border ${card.style}`}>
                      {card.icon}
                    </div>
                    <h4 className="text-sm font-bold text-[#1d2226]">{card.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Plyndrox WhatsApp AI Deep Dive */}
        <section className="border-y border-gray-100 bg-gray-50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <WhatsAppIcon className="h-5 w-5" />, title: "WhatsApp Cloud API", desc: "Secure, direct integration with Meta's platform", style: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { icon: <GlobeIcon className="h-5 w-5" />, title: "10+ Languages", desc: "Hindi, English, Hinglish, and more out of the box", style: "text-teal-600 bg-teal-50 border-teal-100" },
                  { icon: <BookOpenIcon className="h-5 w-5" />, title: "Knowledge Book", desc: "Train the AI entirely on your business content", style: "text-green-600 bg-green-50 border-green-100" },
                  { icon: <ShieldIcon className="h-5 w-5" />, title: "Encrypted Credentials", desc: "Your API keys are stored with AES encryption", style: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { icon: <DatabaseIcon className="h-5 w-5" />, title: "Chat Logs", desc: "Full conversation history in your dashboard", style: "text-cyan-600 bg-cyan-50 border-cyan-100" },
                  { icon: <UsersIcon className="h-5 w-5" />, title: "24/7 Automation", desc: "Never miss a customer message, day or night", style: "text-lime-600 bg-lime-50 border-lime-100" },
                ].map((card) => (
                  <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className={`mb-3 inline-flex h-6 w-6 items-center justify-center rounded-xl border ${card.style}`}>
                      {card.icon}
                    </div>
                    <h4 className="text-sm font-bold text-[#1d2226]">{card.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{card.desc}</p>
                  </div>
                ))}
              </div>

              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <WhatsAppIcon className="h-3.5 w-3.5" /> Plyndrox WhatsApp AI
                </span>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-[#1d2226] sm:text-5xl text-balance">
                  Customer support that never sleeps.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-gray-500">
                  Connect your WhatsApp Business number to Plyndrox in minutes. Upload your knowledge book, and our AI handles inquiries, bookings, and FAQs — in any language — with responses that feel human, not robotic.
                </p>
                <ul className="mt-7 space-y-3">
                  {[
                    "Instant setup with your WhatsApp Cloud API credentials",
                    "Brand-aligned responses trained on your exact business data",
                    "Supports multilingual conversations seamlessly",
                    "Full chat history and analytics in one secure dashboard",
                    "Meta WhatsApp Business API compliant",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[#1d2226]">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/whatsapp-ai" className="mt-9 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700">
                  Build Your Assistant <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bihar AI Deep Dive */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  <GlobeIcon className="h-3.5 w-3.5" /> Bihar AI
                </span>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-[#1d2226] sm:text-5xl text-balance">
                  Knowledge built for Bihar.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-gray-500">
                  Bihar AI is trained on regional data — from education boards and local news to politics, culture, agriculture, and job markets. It answers questions that generic AI can't.
                </p>
                <ul className="mt-7 space-y-3">
                  {[
                    "Education: board exams, colleges, scholarships, and admissions",
                    "Jobs: government jobs, BPSC, railways, and private placements",
                    "Agriculture: mandi prices, crop guidance, and weather",
                    "Politics & culture: local news, festivals, and history",
                    "Auto-select category or lock to one topic",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[#1d2226]">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-600">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/bihar-ai" className="mt-9 inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-700">
                  Open Bihar AI <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Education", emoji: "🎓", desc: "Exams, colleges, scholarships" },
                  { title: "News", emoji: "📰", desc: "Local Bihar news, daily updates" },
                  { title: "Politics", emoji: "🏛️", desc: "State government, policies" },
                  { title: "Culture", emoji: "🎭", desc: "Festivals, history, heritage" },
                  { title: "Jobs", emoji: "💼", desc: "Govt jobs, BPSC, private" },
                  { title: "Agriculture", emoji: "🌾", desc: "Crops, mandi prices, weather" },
                ].map((c) => (
                  <div key={c.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="text-3xl mb-2">{c.emoji}</div>
                    <h4 className="text-sm font-bold text-[#1d2226]">{c.title}</h4>
                    <p className="mt-1 text-xs text-gray-500">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-50 py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#1d2226] sm:text-5xl">
              Ready to get started?
            </h2>
            <p className="mt-5 text-base text-gray-500 max-w-xl mx-auto leading-7">
              Join thousands of users using Plyndrox AI for personal support, business automation, and regional intelligence.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="w-full sm:w-auto rounded-full bg-[#1d2226] px-9 py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d3238]">
                Start free today
              </Link>
              <Link href="/business-ai" className="w-full sm:w-auto rounded-full border border-gray-200 bg-white px-9 py-4 text-sm font-semibold text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300">
                See Plyndrox Business AI
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-7 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-gray-400 hover:text-[#1d2226] transition">
            <img src="/plyndrox-logo.svg" alt="Plyndrox" className="h-10 w-10 object-contain plyndrox-logo-img" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Plyndrox AI</span>
          </Link>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Plyndrox AI. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-gray-400">
            <Link href="/privacy-policy" className="hover:text-[#1d2226] transition">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1d2226] transition">Terms</Link>
            <Link href="/contact" className="hover:text-[#1d2226] transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
