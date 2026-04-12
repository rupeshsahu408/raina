import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partners — Evara AI",
  description:
    "Discover the trusted partnerships that power Evara AI — including Sendora.me — and learn how we collaborate to build scalable, reliable AI infrastructure.",
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
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

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.16Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.16Z" />
    </svg>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
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

function HandshakeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-1" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </svg>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const partnerBenefits = [
  {
    icon: <ShieldIcon className="h-6 w-6" />,
    title: "Stronger Infrastructure",
    description: "Strategic partnerships allow Evara AI to build on proven, battle-tested infrastructure that ensures reliability, redundancy, and enterprise-grade performance at every layer of the platform.",
    color: "text-emerald-300",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    icon: <ZapIcon className="h-6 w-6" />,
    title: "Better Performance",
    description: "By partnering with specialized technology providers, Evara AI can consistently deliver faster response times, lower latency, higher throughput, and improved resource efficiency across all platform features.",
    color: "text-yellow-300",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: <LayersIcon className="h-6 w-6" />,
    title: "Scalable Solutions",
    description: "Partners contribute critical scalability capabilities that allow the Evara AI platform to grow seamlessly alongside user demand — from early adopters to large enterprise deployments — without compromising quality.",
    color: "text-purple-300",
    bg: "bg-purple-400/10 border-purple-400/20",
  },
  {
    icon: <RocketIcon className="h-6 w-6" />,
    title: "Faster Innovation",
    description: "Collaborative partnerships accelerate the pace of product innovation by giving Evara AI access to cutting-edge technologies, specialized expertise, and complementary capabilities that would take significantly longer to build independently.",
    color: "text-pink-300",
    bg: "bg-pink-400/10 border-pink-400/20",
  },
  {
    icon: <SparklesIcon className="h-6 w-6" />,
    title: "Improved User Experience",
    description: "When infrastructure, services, and APIs work seamlessly together through well-established partnerships, the end result is a smoother, more reliable, and more capable experience for every Evara AI user.",
    color: "text-sky-300",
    bg: "bg-sky-400/10 border-sky-400/20",
  },
  {
    icon: <GlobeIcon className="h-6 w-6" />,
    title: "Expanded Global Reach",
    description: "Technology and service partnerships enable Evara AI to extend its platform reach into new geographies, support more languages and regions, and serve a more diverse global user base than would be possible independently.",
    color: "text-amber-300",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
];

const collaborationAreas = [
  {
    title: "Technology Integration",
    description: "We partner with technology providers to integrate specialized capabilities directly into the Evara AI platform. These integrations expand what our products can do and ensure that users benefit from the best available tools — without needing to manage multiple separate platforms.",
    icon: <LayersIcon className="h-5 w-5 text-purple-300" />,
    items: ["API and SDK integration", "Platform capability extension", "Shared development resources", "Joint technical roadmaps"],
  },
  {
    title: "API and Automation Support",
    description: "Evara AI relies on partner APIs and automation infrastructure to power key platform functions including communication delivery, authentication, messaging, and business process automation. Our partners ensure these services are available, reliable, and performant.",
    icon: <ZapIcon className="h-5 w-5 text-yellow-300" />,
    items: ["RESTful and webhook integrations", "Automated workflow support", "Communication delivery infrastructure", "Real-time data exchange"],
  },
  {
    title: "AI Development and Scaling",
    description: "As the AI capabilities of the Evara AI platform grow, partners contribute the compute resources, model infrastructure, and technical expertise necessary to scale AI services reliably and cost-effectively — ensuring that Evara AI and WhatsApp AI continue to perform as demand grows.",
    icon: <BrainIcon className="h-5 w-5 text-pink-300" />,
    items: ["Model infrastructure support", "Compute and storage resources", "AI performance optimization", "Safety and reliability systems"],
  },
  {
    title: "Business Growth and Expansion",
    description: "Strategic business partnerships help Evara AI enter new markets, build credibility with enterprise customers, and accelerate growth through shared networks, referral relationships, co-marketing efforts, and joint go-to-market initiatives.",
    icon: <RocketIcon className="h-5 w-5 text-sky-300" />,
    items: ["Co-marketing and joint campaigns", "Referral and reseller programs", "Market expansion collaboration", "Enterprise customer introductions"],
  },
];

const trustStats = [
  { value: "99.9%", label: "Platform Uptime", sub: "Backed by partner infrastructure" },
  { value: "24/7", label: "Partner Support", sub: "Round-the-clock reliability" },
  { value: "3+", label: "AI Products", sub: "Powered by trusted partners" },
  { value: "10K+", label: "Users Served", sub: "And growing every day" },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.14),transparent_60%)]" />
        <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-900/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute top-[45%] left-[50%] w-[30%] h-[30%] rounded-full bg-sky-900/10 blur-[100px]" />
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/evara-logo.png" alt="Evara AI" className="h-8 w-8 object-contain" />
            <span className="text-sm font-bold tracking-widest text-zinc-100 uppercase transition group-hover:text-white">Evara AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/about" className="hidden text-sm text-zinc-500 transition hover:text-zinc-300 sm:block">About</Link>
            <Link href="/contact" className="hidden text-sm text-zinc-500 transition hover:text-zinc-300 sm:block">Contact</Link>
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* Hero */}
        <section className="relative flex min-h-[75vh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_65%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300 backdrop-blur-md mb-8">
              <HandshakeIcon className="h-3.5 w-3.5" />
              <span>Trusted Partnerships</span>
            </div>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Partners
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-relaxed text-zinc-400 sm:text-xl">
              Collaborating with innovative companies to build the future of AI — reliably, scalably, and with purpose.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-zinc-500">
              Evara AI is built on a foundation of trusted partnerships. Every collaboration is chosen with care, aligned to our values, and oriented toward delivering the best possible experience for our users.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105 hover:bg-zinc-100">
                Become a Partner
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link href="#featured-partner" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10">
                Meet Our Partners
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trustStats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur-xl">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">{s.value}</p>
                <p className="mt-1 text-sm font-semibold text-zinc-300">{s.label}</p>
                <p className="mt-0.5 text-xs text-zinc-600">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Introduction */}
        <section className="relative border-y border-white/5 bg-white/[0.015] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                  Why Partnerships Matter
                </p>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Built Together.{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    Built Better.
                  </span>
                </h2>
                <div className="mt-6 space-y-5 text-base leading-8 text-zinc-400">
                  <p>
                    Great AI platforms are never built in isolation. Behind every reliable, high-performance, and genuinely useful AI product is a network of trusted partners, technology providers, and collaborative relationships that contribute the infrastructure, services, and capabilities necessary to deliver on ambitious promises.
                  </p>
                  <p>
                    At Evara AI, partnerships are not transactions — they are long-term relationships built on shared values, mutual trust, technical complementarity, and a common commitment to building technology that actually improves people's lives. Every partner we work with is chosen deliberately and evaluated continuously against the standard of how they contribute to the quality, reliability, and growth of the Evara AI platform.
                  </p>
                  <p>
                    Through these partnerships, we are able to deliver infrastructure that is more resilient, services that are more reliable, capabilities that are more advanced, and an overall platform experience that is more polished and capable than any single team could build alone. Our partners are not vendors — they are an extension of the Evara AI team, aligned to our mission and invested in our users' success.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <ShieldIcon className="h-5 w-5 text-emerald-300" />, label: "Reliability First", desc: "Every partner is evaluated for operational reliability and uptime." },
                  { icon: <ZapIcon className="h-5 w-5 text-yellow-300" />, label: "Performance Focused", desc: "Partnerships that contribute directly to platform speed and efficiency." },
                  { icon: <HandshakeIcon className="h-5 w-5 text-indigo-300" />, label: "Long-Term Vision", desc: "We build partnerships with the future in mind, not just today." },
                  { icon: <GlobeIcon className="h-5 w-5 text-sky-300" />, label: "Global Scalability", desc: "Partners that help us reach and serve users everywhere." },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 mb-3">
                      {item.icon}
                    </div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Partner – Sendora.me */}
        <section id="featured-partner" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 scroll-mt-16">
          <div className="text-center mb-14">
            <p className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
              Featured Partner
            </p>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Our Strategic{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Partner
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-zinc-400">
              We are proud to work with an exceptional partner who has been instrumental in shaping the Evara AI platform.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-indigo-500/25 bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-black p-1 shadow-2xl shadow-indigo-950/40">
            <div className="rounded-[2.25rem] border border-white/5 bg-black/50 backdrop-blur-2xl p-8 sm:p-12 lg:p-16">
              <div className="grid gap-12 lg:grid-cols-[auto_1fr] lg:items-start">

                <div className="flex flex-col items-center lg:items-start gap-6">
                  <div className="relative">
                    <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/10 blur-xl" />
                    <div className="relative flex h-44 w-44 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white p-4 shadow-2xl">
                      <img
                        src="/sendora-logo.png"
                        alt="Sendora.me"
                        className="h-full w-full object-contain"
                        draggable={false}
                      />
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-bold text-white">Sendora.me</p>
                    <p className="mt-1 text-sm text-indigo-300">Strategic Technology Partner</p>
                    <div className="mt-3 flex justify-center gap-1 lg:justify-start">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} className="h-3.5 w-3.5 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mt-3 inline-flex rounded-full border border-indigo-400/25 bg-indigo-400/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
                      Powering Innovation Together
                    </p>
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 mb-6">
                    <SparklesIcon className="h-3 w-3" />
                    <span>Partnership Overview</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                    The Infrastructure Behind Evara AI
                  </h3>
                  <div className="mt-6 space-y-5 text-base leading-8 text-zinc-400">
                    <p>
                      Sendora.me is a premier technology and communication platform that serves as one of the most critical infrastructure partners supporting the Evara AI ecosystem. Since the earliest stages of the platform's development, Sendora.me has been instrumental in providing the reliable, scalable, and performance-optimized services that allow Evara AI to serve its users with consistency and quality.
                    </p>
                    <p>
                      The partnership between Evara AI and Sendora.me is built on a shared commitment to technological excellence, operational reliability, and the belief that the best products are built through focused collaboration rather than isolated effort. Sendora.me brings deep technical expertise, a proven track record of platform reliability, and a forward-thinking product philosophy that aligns closely with Evara AI's mission and values.
                    </p>
                    <p>
                      Through this strategic partnership, Evara AI benefits from Sendora.me's robust communication infrastructure, which plays a key role in powering essential platform features including transactional messaging, support routing, notification delivery, and business communication capabilities. This infrastructure layer allows Evara AI to focus its core development efforts on building outstanding AI products, knowing that the critical communication backbone of the platform is in trusted, capable hands.
                    </p>
                    <p>
                      Beyond infrastructure, the Sendora.me partnership represents a long-term vision for what collaborative AI platform development can look like — two teams aligned on quality, invested in each other's success, and moving in the same direction. We are proud to call Sendora.me a partner and look forward to a continued, growing relationship as both platforms evolve.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {[
                      "Strategic infrastructure and communication support",
                      "Reliable service delivery and uptime commitment",
                      "Deep technical alignment and integration quality",
                      "Shared commitment to user privacy and data security",
                      "Long-term vision and collaborative product planning",
                      "Scalable solutions supporting Evara AI's growth trajectory",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2.5 text-sm text-zinc-400">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex flex-wrap gap-3">
                    <a
                      href="https://sendora.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-5 py-2.5 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-400/20"
                    >
                      Visit Sendora.me
                      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Benefits */}
        <section className="relative border-y border-white/5 bg-white/[0.015] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                Partnership Benefits
              </p>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Why Partnerships Make{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Us Stronger
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
                Every partnership within the Evara AI ecosystem delivers concrete, measurable benefits — not just for the platform, but for every user who depends on it.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partnerBenefits.map((b) => (
                <div
                  key={b.title}
                  className={`group rounded-[1.5rem] border p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${b.bg}`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 ${b.color}`}>
                    {b.icon}
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-white">{b.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collaboration Areas */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
              Collaboration Areas
            </p>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              How We Work{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">
                Together
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-zinc-400">
              Our partnerships span four core collaboration areas, each contributing directly to the quality and capability of the Evara AI platform.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {collaborationAreas.map((area) => (
              <div
                key={area.title}
                className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                    {area.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{area.title}</h3>
                </div>
                <p className="text-sm leading-7 text-zinc-400">{area.description}</p>
                <ul className="mt-5 space-y-2">
                  {area.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                      <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* AI Ecosystem */}
        <section className="relative border-y border-white/5 bg-white/[0.015] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                AI Ecosystem
              </p>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Partners Power the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
                  Evara Ecosystem
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
                Every Evara AI product benefits from the contributions of our partner ecosystem. Here is how partnerships directly enhance each service.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  icon: <BrainIcon className="h-7 w-7" />,
                  name: "Evara AI",
                  tagline: "Web / App AI Assistant",
                  color: "text-purple-300",
                  border: "border-purple-500/25",
                  bg: "bg-purple-500/[0.07]",
                  iconBg: "bg-purple-500/15 border-purple-500/20",
                  points: [
                    "AI model infrastructure from specialist providers ensures Evara AI responses are fast, contextually accurate, and reliably available at all times.",
                    "Authentication and identity partner services secure user accounts and sessions, protecting every conversation and user interaction.",
                    "Hosting and CDN partnerships ensure that the Evara AI interface loads quickly and performs smoothly for users across every geography.",
                    "Communication partners power transactional notifications, password resets, account alerts, and support routing for Evara AI users.",
                  ],
                },
                {
                  icon: <MessageIcon className="h-7 w-7" />,
                  name: "WhatsApp AI",
                  tagline: "Business Automation",
                  color: "text-emerald-300",
                  border: "border-emerald-500/25",
                  bg: "bg-emerald-500/[0.07]",
                  iconBg: "bg-emerald-500/15 border-emerald-500/20",
                  points: [
                    "WhatsApp Business API infrastructure from Meta enables message delivery, webhook processing, and automation at business scale.",
                    "Partner communication infrastructure supports the email and notification systems used by business dashboard administrators.",
                    "Cloud and storage partners provide the secure, scalable backend necessary to handle high-volume business message processing.",
                    "Security and compliance partners help ensure that WhatsApp AI operates within required data protection and privacy standards.",
                  ],
                },
                {
                  icon: <LayersIcon className="h-7 w-7" />,
                  name: "Platform Core",
                  tagline: "Infrastructure & Reliability",
                  color: "text-sky-300",
                  border: "border-sky-500/25",
                  bg: "bg-sky-500/[0.07]",
                  iconBg: "bg-sky-500/15 border-sky-500/20",
                  points: [
                    "Sendora.me and other infrastructure partners provide the communication backbone and delivery systems that keep the platform running reliably.",
                    "Monitoring and observability partners give the Evara AI team real-time visibility into platform health, performance, and reliability metrics.",
                    "Database and storage partners ensure that user data, business configurations, and conversation history are stored securely and durably.",
                    "Deployment and DevOps partners enable rapid, safe, and consistent platform updates across all environments without user disruption.",
                  ],
                },
              ].map((product) => (
                <div
                  key={product.name}
                  className={`rounded-[2rem] border p-7 backdrop-blur-xl ${product.border} ${product.bg}`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${product.iconBg} ${product.color} mb-5`}>
                    {product.icon}
                  </div>
                  <div className="mb-5">
                    <p className="text-lg font-semibold text-white">{product.name}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${product.color}`}>{product.tagline}</p>
                  </div>
                  <ul className="space-y-3">
                    {product.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm leading-6 text-zinc-400">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Future Partnerships */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                Future Partnerships
              </p>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Growing Together
              </h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-zinc-400">
                <p>
                  We are continuously looking to collaborate with innovative companies to expand the Evara AI ecosystem. As the platform grows and its products mature, new partnership opportunities emerge across infrastructure, AI capabilities, vertical markets, geographic expansion, and complementary technology domains.
                </p>
                <p>
                  Whether you are a technology company with infrastructure or API capabilities relevant to AI platforms, a regional business with local market expertise, or a startup building complementary tools, we would love to explore how a partnership with Evara AI could be mutually beneficial and contribute to our shared mission of making AI genuinely useful for everyone.
                </p>
                <p>
                  Evara AI evaluates partnership opportunities on the basis of technical complementarity, alignment with our values, reliability track record, and long-term strategic fit. We are selective by design — because the quality of our partnerships directly determines the quality of our platform.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105 hover:bg-zinc-100">
                  Contact Us for Collaboration
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { title: "Technology Partners", desc: "Companies providing infrastructure, APIs, or specialized technical capabilities that complement the Evara AI platform." },
                { title: "Integration Partners", desc: "Businesses with popular tools or platforms whose integration would add significant value to Evara AI users." },
                { title: "Regional Partners", desc: "Organizations with deep expertise in specific geographies, languages, or markets where Evara AI is expanding." },
                { title: "Strategic Alliances", desc: "Established companies interested in co-building, co-marketing, or co-distributing AI-powered products with Evara AI." },
              ].map((item, i) => (
                <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-xs font-bold text-white">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Credibility */}
        <section className="relative border-y border-white/5 bg-white/[0.015] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                Trust & Credibility
              </p>
              <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
                Why Businesses Trust Evara AI
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: <UsersIcon className="h-6 w-6 text-purple-300" />,
                  title: "Trusted by Growing Businesses",
                  desc: "Evara AI is used by thousands of individuals and businesses who rely on the platform for critical communication, AI automation, and productivity workflows.",
                },
                {
                  icon: <ShieldIcon className="h-6 w-6 text-emerald-300" />,
                  title: "Reliable and Secure Platform",
                  desc: "Backed by trusted partner infrastructure, Evara AI maintains high availability, encrypted data handling, and enterprise-grade security practices across all services.",
                },
                {
                  icon: <LayersIcon className="h-6 w-6 text-sky-300" />,
                  title: "Built for Scalability",
                  desc: "Every layer of the Evara AI platform is designed to scale — from individual users to large enterprise deployments — without sacrificing quality, speed, or reliability.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_65%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
              <HandshakeIcon className="h-3.5 w-3.5" />
              Become a Partner
            </p>
            <h2 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Let&apos;s Build the Future{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Together
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              If your company shares our commitment to innovation, reliability, and building technology that makes a genuine difference, we would love to explore what a partnership could look like.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition hover:scale-105 hover:bg-zinc-100 shadow-2xl shadow-indigo-900/30"
              >
                Start a Partnership Conversation
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Learn About Evara AI
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-black/50 px-4 py-10 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© 2026 Raina Jet. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/about" className="transition hover:text-zinc-400">About</Link>
            <Link href="/contact" className="transition hover:text-zinc-400">Contact</Link>
            <Link href="/privacy-policy" className="transition hover:text-zinc-400">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-zinc-400">Terms of Service</Link>
            <Link href="/disclaimer" className="transition hover:text-zinc-400">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
