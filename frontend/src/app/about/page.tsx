import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Raina Jet",
  description:
    "Learn about Raina Jet — our story, mission, vision, AI products, founders, and the team building the future of intelligent automation.",
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

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
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

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const products = [
  {
    name: "Evara AI",
    tagline: "Your Intelligent Web & App AI Assistant",
    description:
      "Evara AI is the flagship conversational AI assistant within the Raina Jet platform. Designed for both individuals and professionals, Ivana delivers context-aware responses, smart automation, and deep productivity support through natural language interaction. Whether you need help with drafting content, answering complex questions, summarizing information, or navigating technical challenges, Evara AI is built to think alongside you — intelligently, efficiently, and at scale.",
    capabilities: [
      "Natural language conversations with deep context awareness",
      "Productivity automation for content, research, and problem-solving",
      "Multi-turn dialogue with persistent session continuity",
      "Personalized response tone and style preferences",
      "Progressive web application with offline support",
    ],
    gradient: "from-purple-500 to-pink-500",
    border: "border-purple-500/20",
    bg: "bg-purple-500/[0.06]",
    icon: <BrainIcon className="h-7 w-7" />,
    iconBg: "bg-purple-500/15 border-purple-500/20",
    iconColor: "text-purple-300",
    badge: "bg-purple-500/15 border-purple-400/20 text-purple-300",
  },
  {
    name: "Bihar AI",
    tagline: "Regional Intelligence, Local Impact",
    description:
      "Bihar AI is a purpose-built regional AI initiative designed to serve the unique linguistic, cultural, and economic context of Bihar and its surrounding communities. Recognizing that AI should not be a privilege of only English-speaking or metropolitan users, Bihar AI brings the power of intelligent automation to regional users in their own language and context. It is Raina Jet's commitment to inclusive innovation — ensuring that AI tools are equally accessible, relevant, and empowering for users across every geography and background.",
    capabilities: [
      "Regional language understanding and interaction support",
      "Local knowledge base covering culture, governance, and commerce",
      "Accessibility-first design for diverse user demographics",
      "Empowering small businesses with AI-driven guidance",
      "Bridging the gap between technology and regional communities",
    ],
    gradient: "from-amber-400 to-orange-500",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.06]",
    icon: <GlobeIcon className="h-7 w-7" />,
    iconBg: "bg-amber-500/15 border-amber-500/20",
    iconColor: "text-amber-300",
    badge: "bg-amber-500/15 border-amber-400/20 text-amber-300",
  },
  {
    name: "WhatsApp AI",
    tagline: "Business Automation at Conversational Scale",
    description:
      "WhatsApp AI transforms the way businesses communicate with their customers by bringing the power of artificial intelligence directly into the world's most widely used messaging platform. Through deep integration with the WhatsApp Business API, Raina Jet enables businesses to automate responses, manage customer queries at scale, deliver personalized support, and operate intelligent communication workflows — all without compromising the human feel of genuine conversation. It is AI-powered customer engagement, built for modern business.",
    capabilities: [
      "Automated AI responses via WhatsApp Business API",
      "Custom business knowledge base and FAQ automation",
      "Intelligent message routing, classification, and escalation",
      "Multi-agent team dashboard for conversation management",
      "Seamless integration with existing business workflows",
    ],
    gradient: "from-emerald-400 to-teal-500",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.06]",
    icon: <MessageIcon className="h-7 w-7" />,
    iconBg: "bg-emerald-500/15 border-emerald-500/20",
    iconColor: "text-emerald-300",
    badge: "bg-emerald-500/15 border-emerald-400/20 text-emerald-300",
  },
];

const founders = [
  {
    name: "Riley Parker",
    title: "Founder & Chief Executive Officer",
    description:
      "Riley Parker is a forward-thinking technology leader whose vision for accessible, intelligent, and beautifully designed AI tools has been the driving force behind Raina Jet. With a deep belief that the future of productivity lies at the intersection of artificial intelligence and human creativity, Riley has built Raina Jet from the ground up with an unwavering focus on user experience, scalable architecture, and purposeful design. Riley brings a rare combination of strategic leadership, product intuition, and a genuine passion for building technology that improves lives. As the visionary architect of the Raina Jet platform, Riley continues to guide the company toward its mission of democratizing AI access for individuals and businesses globally — ensuring that intelligent automation is not a luxury, but a universal tool.",
    traits: ["Visionary Leadership", "Product Strategy", "AI Innovation", "User-Centric Design", "Global Thinking"],
    avatar: "RP",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    ring: "ring-purple-500/30",
  },
  {
    name: "Rupesh Sahu",
    title: "Co-Founder & Chief Technology Officer",
    description:
      "Rupesh Sahu is the technical backbone of Raina Jet — a dedicated engineer, builder, and problem-solver who transforms ambitious ideas into production-ready, high-performance AI systems. With an exceptional command of modern software architecture, API integrations, and AI product development, Rupesh has designed and built the core infrastructure that powers every feature within the Raina Jet platform. Known for his relentless work ethic, systematic approach to engineering, and unwavering commitment to quality, Rupesh ensures that the platform not only delivers on its promises but continuously evolves to meet the growing expectations of users and businesses. His deep-rooted belief in building tools that are both technically powerful and genuinely accessible to everyday users drives every technical decision at Raina Jet.",
    traits: ["Full-Stack Engineering", "AI Architecture", "Product Development", "Technical Leadership", "Growth Mindset"],
    avatar: "RS",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    ring: "ring-sky-500/30",
  },
];

const whyChooseItems = [
  {
    icon: <ZapIcon className="h-6 w-6" />,
    title: "Smart Automation",
    description: "Raina Jet's intelligent automation eliminates repetitive tasks, accelerates workflows, and enables both individuals and businesses to focus on what truly matters — creative thinking, strategic decisions, and meaningful human interaction.",
    color: "text-yellow-300",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: <RocketIcon className="h-6 w-6" />,
    title: "Scalable Solutions",
    description: "Whether you are a solo entrepreneur or a large enterprise, Raina Jet scales with your needs. Our platform is engineered to handle growing demands without sacrificing performance, reliability, or response quality.",
    color: "text-purple-300",
    bg: "bg-purple-400/10 border-purple-400/20",
  },
  {
    icon: <ShieldIcon className="h-6 w-6" />,
    title: "Secure and Reliable",
    description: "Data security and platform reliability are foundational commitments at Raina Jet. We implement rigorous security practices, encrypted data transmission, and resilient infrastructure to protect user information and maintain consistent service availability.",
    color: "text-emerald-300",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    icon: <SparklesIcon className="h-6 w-6" />,
    title: "Easy to Use",
    description: "Advanced AI should not require a technical background to access and benefit from. Raina Jet is designed with simplicity and clarity at its core, delivering powerful capabilities through interfaces that feel natural, intuitive, and effortless to use.",
    color: "text-pink-300",
    bg: "bg-pink-400/10 border-pink-400/20",
  },
  {
    icon: <UsersIcon className="h-6 w-6" />,
    title: "Built for Modern Businesses",
    description: "From automated customer communication to AI-assisted content generation and regional market intelligence, Raina Jet is purpose-built to address the real and evolving challenges of modern businesses operating in a fast-paced, digital-first world.",
    color: "text-sky-300",
    bg: "bg-sky-400/10 border-sky-400/20",
  },
  {
    icon: <GlobeIcon className="h-6 w-6" />,
    title: "Globally Accessible",
    description: "Raina Jet is designed without geographic boundaries. With multilingual capability, regional AI initiatives like Bihar AI, and universal platform accessibility, we are committed to making intelligent technology available to every user, everywhere.",
    color: "text-amber-300",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
];

const futureGoals = [
  "Expanding AI model capabilities with multimodal support including voice, image, and document intelligence.",
  "Launching advanced third-party integrations with popular CRMs, e-commerce platforms, and productivity tools.",
  "Extending regional AI coverage beyond Bihar to additional underserved linguistic and cultural communities.",
  "Introducing enterprise-grade analytics dashboards and AI performance reporting for business customers.",
  "Building a public developer API to enable third-party builders to extend and customize the Raina Jet platform.",
  "Achieving global reach across emerging markets in South Asia, Southeast Asia, Africa, and Latin America.",
  "Developing AI-powered voice automation for phone and call-center-based business communication.",
  "Establishing strategic partnerships with educational institutions and NGOs to drive AI literacy programs.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_60%)]" />
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-900/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-pink-900/10 blur-[100px]" />
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/evara-logo.png" alt="Raina Jet" className="h-8 w-8 object-contain" />
            <span className="text-sm font-bold tracking-widest text-zinc-100 uppercase transition group-hover:text-white">Raina Jet</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/cookies" className="hidden text-sm text-zinc-500 transition hover:text-zinc-300 sm:block">Cookie Policy</Link>
            <Link href="/privacy-policy" className="hidden text-sm text-zinc-500 transition hover:text-zinc-300 sm:block">Privacy</Link>
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 backdrop-blur-md mb-8">
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>About Raina Jet</span>
          </div>
          <h1 className="max-w-5xl text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Building the Future{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400">
              with AI
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Raina Jet is an AI-powered SaaS platform on a singular mission — to make intelligent automation accessible, powerful, and genuinely useful for every person and business on the planet.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-500">
            From individual productivity to enterprise-scale automation, from regional communities to global markets, we are building AI tools that make a real difference.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105 hover:bg-zinc-100">
              Start for Free
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/whatsapp-ai" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10">
              Explore Products
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-3xl mx-auto">
            {[
              { value: "3+", label: "AI Products" },
              { value: "10K+", label: "Users Served" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "AI Availability" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl text-center">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">{stat.value}</p>
                <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                Our Story
              </p>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                From an Idea to a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Platform
                </span>
              </h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-zinc-400">
                <p>
                  Raina Jet began as a bold question: why should intelligent AI tools only be available to those with technical expertise or enterprise budgets? The founders of Raina Jet saw a world where artificial intelligence was transforming industries at a rapid pace, yet the vast majority of individuals and small businesses were left behind — unable to access, understand, or benefit from these powerful technologies.
                </p>
                <p>
                  The idea was simple in concept but ambitious in execution: build a platform that makes AI genuinely useful, approachable, and scalable for everyone. From the earliest prototypes to the full-featured platform it is today, Raina Jet has been built with a singular focus on the people it serves — their needs, their challenges, and their aspirations.
                </p>
                <p>
                  What started as a vision between two passionate builders has grown into a multi-product AI platform serving users across India and beyond, with a roadmap that points toward global reach and transformative impact. The journey from idea to platform has not been without challenges, but every obstacle has only deepened the commitment to the mission.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
                <div className="space-y-6">
                  {[
                    { year: "2023", event: "Concept & ideation — identifying the gap in accessible AI tools for everyday users and businesses." },
                    { year: "2024", event: "Platform development begins — building core AI infrastructure, Evara AI assistant, and WhatsApp AI integration framework." },
                    { year: "Early 2025", event: "Beta launch — first users onboarded, real-world feedback shapes product direction and feature priorities." },
                    { year: "Mid 2025", event: "Bihar AI initiative launched — expanding AI access to regional communities with localized intelligence." },
                    { year: "2026", event: "Full platform release — Raina Jet goes live with all three products, growing user base, and global expansion underway." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-400/30 bg-purple-400/10 text-xs font-bold text-purple-300">
                          {i + 1}
                        </div>
                        {i < 4 && <div className="mt-1 h-full w-px bg-white/10" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-400">{item.year}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-400">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-purple-500/20 bg-purple-500/[0.06] p-8 backdrop-blur-xl">
                <p className="inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                  Our Mission
                </p>
                <h3 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">
                  Simplify AI for Everyone
                </h3>
                <p className="mt-5 text-base leading-8 text-zinc-400">
                  Our mission is to dismantle the barriers that separate everyday users from the transformative power of artificial intelligence. We believe that AI should not be complex, exclusive, or intimidating. It should be approachable, intuitive, and empowering — a tool that every person, whether a student, a small business owner, or a global enterprise, can pick up, use, and benefit from immediately.
                </p>
                <p className="mt-4 text-base leading-8 text-zinc-400">
                  Every product, every feature, and every design decision at Raina Jet is evaluated through this mission lens: does it make AI simpler, more useful, and more accessible? If the answer is yes, we build it.
                </p>
              </div>
              <div className="rounded-[2rem] border border-sky-500/20 bg-sky-500/[0.06] p-8 backdrop-blur-xl">
                <p className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                  Our Vision
                </p>
                <h3 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">
                  Powerful AI for Businesses Globally
                </h3>
                <p className="mt-5 text-base leading-8 text-zinc-400">
                  We envision a world where AI-powered tools are the standard operating environment for businesses of all sizes — where intelligent automation handles routine work, enabling humans to focus on creativity, strategy, and relationships. Raina Jet is building toward that world, one product, one integration, and one user at a time.
                </p>
                <p className="mt-4 text-base leading-8 text-zinc-400">
                  Our vision extends beyond product features. We see a global community of AI-enabled businesses and individuals, from metropolitan enterprises to rural entrepreneurs, all equipped with the same quality of intelligence and the same opportunity to thrive.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
              The Platform
            </p>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              What Raina Jet Does
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400">
              Raina Jet is more than a single product — it is a unified ecosystem of AI tools designed to address the diverse needs of modern users and businesses. At its core, the platform connects three powerful services under one intelligent infrastructure.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              { icon: <BrainIcon className="h-6 w-6 text-purple-300" />, title: "AI-Powered Conversations", desc: "Deliver human-quality responses across personal and business contexts through advanced language models.", bg: "bg-purple-500/10 border-purple-500/20" },
              { icon: <ZapIcon className="h-6 w-6 text-yellow-300" />, title: "Intelligent Automation", desc: "Automate repetitive communication, customer support, and business workflows with precision and reliability.", bg: "bg-yellow-500/10 border-yellow-500/20" },
              { icon: <RocketIcon className="h-6 w-6 text-sky-300" />, title: "Scalable Infrastructure", desc: "Handle growing usage, multiple channels, and concurrent workloads without compromising speed or quality.", bg: "bg-sky-500/10 border-sky-500/20" },
            ].map((item) => (
              <div key={item.title} className={`rounded-[1.5rem] border p-6 backdrop-blur-xl ${item.bg}`}>
                <div className="h-10 w-10 rounded-xl border border-white/10 bg-black/30 flex items-center justify-center">{item.icon}</div>
                <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative border-y border-white/5 bg-white/[0.015] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                Our AI Products
              </p>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Three Products.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
                  One Platform.
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400">
                Each product within the Raina Jet ecosystem is purpose-built for a distinct use case, audience, and context — yet all share the same foundational commitment to intelligence, reliability, and accessibility.
              </p>
            </div>

            <div className="mt-16 space-y-8">
              {products.map((product, i) => (
                <div
                  key={product.name}
                  className={`group rounded-[2rem] border p-8 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ${product.border} ${product.bg} ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                >
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <div className="shrink-0">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${product.iconBg} ${product.iconColor}`}>
                        {product.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-semibold text-white">{product.name}</h3>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${product.badge}`}>
                          {product.tagline}
                        </span>
                      </div>
                      <p className="mt-4 text-base leading-8 text-zinc-400">{product.description}</p>
                      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                        {product.capabilities.map((cap) => (
                          <li key={cap} className="flex items-start gap-2 text-sm text-zinc-400">
                            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
              The Founders
            </p>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              The People Behind{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">
                the Vision
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400">
              Raina Jet was founded by two passionate individuals who share a deep conviction that AI can and should be a democratizing force — empowering individuals and businesses of every size, background, and geography.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {founders.map((founder) => (
              <div
                key={founder.name}
                className={`group rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl ring-1 ring-transparent transition-all duration-300 hover:ring-1 ${founder.ring} hover:border-white/20 hover:bg-white/[0.06]`}
              >
                <div className="flex items-start gap-5">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white font-bold text-lg ${founder.gradient}`}>
                    {founder.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{founder.name}</h3>
                    <p className="mt-0.5 text-sm text-zinc-500">{founder.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {founder.traits.map((trait) => (
                        <span key={trait} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-7 text-zinc-400">{founder.description}</p>
                <div className="mt-6 flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} className="h-3.5 w-3.5 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative border-y border-white/5 bg-white/[0.015] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
                  Team & Development
                </p>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Driven by People Who Care
                </h2>
                <div className="mt-6 space-y-5 text-base leading-8 text-zinc-400">
                  <p>
                    Behind every feature, every interface, and every AI capability within the Raina Jet platform is a team of skilled, passionate professionals dedicated to crafting software that is reliable, elegant, and genuinely useful. Our development team brings together expertise in artificial intelligence, full-stack engineering, mobile development, UX design, and product strategy.
                  </p>
                  <p>
                    We operate as a culture of continuous improvement — rigorously evaluating every aspect of the platform, gathering user feedback with care, iterating on design and functionality, and pushing the boundaries of what is possible with today's AI technologies. Every release reflects a collective commitment to doing the work properly, not just quickly.
                  </p>
                  <p>
                    Our team believes in open collaboration, intellectual curiosity, and the idea that the best tools are built by people who use and care deeply about them. This philosophy permeates every layer of the Raina Jet platform.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "AI Engineers", value: "Specialists in LLM integration, prompt engineering, and AI product design." },
                  { label: "Full-Stack Developers", value: "Building the robust, scalable infrastructure that powers every feature." },
                  { label: "UX & Product Designers", value: "Crafting interfaces that are intuitive, beautiful, and user-first." },
                  { label: "QA & Reliability", value: "Ensuring every release meets the highest standards of performance and quality." },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
              Why Raina Jet
            </p>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Why Businesses Choose{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">
                Raina Jet
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400">
              In a crowded landscape of AI tools and automation platforms, Raina Jet stands apart through its combination of depth, accessibility, reliability, and purpose-driven design.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseItems.map((item) => (
              <div
                key={item.title}
                className={`group rounded-[1.5rem] border p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${item.bg}`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative border-y border-white/5 bg-white/[0.015] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                  Future Goals
                </p>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Where We Are Going
                </h2>
                <p className="mt-5 text-base leading-8 text-zinc-400">
                  The work we have done so far is just the beginning. Raina Jet has an ambitious roadmap built around expanding capabilities, deepening integrations, and broadening access to intelligent automation for users and businesses across the globe. Our future is defined by continuous innovation and an unrelenting commitment to the people we serve.
                </p>
              </div>
              <div className="space-y-4">
                {futureGoals.map((goal, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-6 text-zinc-400">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.18),transparent_65%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
              <SparklesIcon className="h-3.5 w-3.5" />
              Start Your Journey
            </p>
            <h2 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Start Your AI Journey{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400">
                Today
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Join thousands of users and businesses who are already using Raina Jet to work smarter, communicate better, and grow faster. The future of intelligent automation is here — and it is built for you.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition hover:scale-105 hover:bg-zinc-100 shadow-2xl shadow-purple-900/30"
              >
                Try Raina Jet Now
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/whatsapp-ai"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-8 py-4 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/15"
              >
                Explore WhatsApp AI
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-600">
              {["No credit card required", "Free to start", "Cancel anytime", "24/7 AI support"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-black/50 px-4 py-10 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© 2026 Raina Jet. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy-policy" className="transition hover:text-zinc-400">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-zinc-400">Terms of Service</Link>
            <Link href="/cookies" className="transition hover:text-zinc-400">Cookie Policy</Link>
            <Link href="/" className="transition hover:text-zinc-400">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
