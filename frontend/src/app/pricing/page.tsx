import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, SITE_URL, siteConfig, productKeywords } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Pricing — Plyndrox AI is Free Forever for Everyone",
  description:
    "Plyndrox AI pricing is simple: every workspace — Personal AI, WhatsApp AI, Inbox AI, Payable AI, Recruit AI, Bihar AI, Smart Ledger, Translate, and Ibara — is free forever. No credit card, no per-message fees, no caps.",
  path: "/pricing",
  keywords: [...productKeywords.pricing],
});

const pricingFaqs = [
  {
    question: "Is Plyndrox AI really free forever?",
    answer:
      "Yes. Every workspace inside Plyndrox AI — Personal AI, WhatsApp AI, Inbox AI, Payable AI, Recruit AI, Bihar AI, Smart Ledger, Translate, and the Ibara website widget — is free for individuals and businesses, with no time limit and no required upgrade.",
  },
  {
    question: "Do I need a credit card to sign up?",
    answer:
      "No. Plyndrox does not ask for a credit card at any point during signup or use. There is no trial period that converts into a paid plan.",
  },
  {
    question: "Are there any hidden per-message or per-invoice fees?",
    answer:
      "No. Plyndrox does not charge per WhatsApp message, per email, per invoice, per candidate, per translation, or per chatbot conversation. Underlying provider fees (such as Meta's WhatsApp Business Platform conversation fees) are billed by those providers directly, never by Plyndrox.",
  },
  {
    question: "How does Plyndrox stay free?",
    answer:
      "Plyndrox is funded so that core AI tools remain free for everyone. Future revenue will come from optional enterprise services such as managed onboarding, dedicated infrastructure, custom integrations, and white-label deployments — never from charging individuals for access to the core product.",
  },
  {
    question: "What are the usage limits on the free plan?",
    answer:
      "Plyndrox applies fair-use limits to prevent abuse but does not impose hard caps that block normal personal or business use. Most users — including high-volume teams — never encounter a limit.",
  },
  {
    question: "Will my data be sold or used to train AI models?",
    answer:
      "No. Plyndrox does not sell user data, and your private content (chats, emails, invoices, candidate data, translations) is not used to train any AI model.",
  },
  {
    question: "Can I export my data and leave any time?",
    answer:
      "Yes. You can export your data from any workspace, and you can request full deletion of your account and data at plyndrox.app/data-deletion at any time.",
  },
  {
    question: "Will Plyndrox add a paid plan in the future?",
    answer:
      "Plyndrox may launch optional paid services for enterprises (such as SSO, custom contracts, on-premise deployment, and dedicated support). The current free workspaces will remain free for individuals and small businesses.",
  },
];

const products = [
  {
    name: "Personal AI",
    href: "/chat",
    tagline: "Private, emotionally aware AI companion",
    bullets: ["Unlimited conversations", "Voice in & out", "Memory across sessions", "100+ languages"],
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "WhatsApp AI",
    href: "/whatsapp-ai",
    tagline: "AI customer support on WhatsApp Business",
    bullets: ["Unlimited messages", "Lead capture & CRM export", "Smart human handoff", "Multilingual replies"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Inbox AI",
    href: "/inbox",
    tagline: "AI email assistant for Gmail & Outlook",
    bullets: ["Daily 7am digest", "AI-drafted replies", "Lead detection", "OAuth — never stores passwords"],
    color: "from-sky-500 to-indigo-500",
  },
  {
    name: "Payable AI",
    href: "/payables",
    tagline: "AI invoice & accounts payable automation",
    bullets: ["Unlimited invoices", "PO matching", "Slack/WhatsApp approvals", "Two-way accounting sync"],
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Recruit AI",
    href: "/recruit",
    tagline: "Free AI hiring & ATS for any team",
    bullets: ["Unlimited jobs & candidates", "AI resume scoring", "Open-web sourcing", "Talent pool CRM"],
    color: "from-rose-500 to-red-500",
  },
  {
    name: "Bihar AI",
    href: "/bihar-ai",
    tagline: "Regional AI in Hindi, Bhojpuri & Maithili",
    bullets: ["Local schemes & jobs", "Voice support", "Cultural context", "Free for everyone"],
    color: "from-yellow-500 to-amber-500",
  },
  {
    name: "Smart Ledger",
    href: "/ledger",
    tagline: "AI accounting from handwritten satti",
    bullets: ["Unlimited uploads", "AI extraction & grouping", "Trader-friendly reports", "Mobile-first"],
    color: "from-lime-500 to-emerald-500",
  },
  {
    name: "Plyndrox Translate",
    href: "/translate",
    tagline: "Human-sounding AI translator",
    bullets: ["100+ languages", "Tone & formality control", "No signup required", "No history saved"],
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Ibara Widget",
    href: "/ibara",
    tagline: "Embeddable AI chat for any website",
    bullets: ["1-line install", "Custom branding", "Lead capture", "100+ languages"],
    color: "from-fuchsia-500 to-purple-500",
  },
];

const offerJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Plyndrox AI Platform",
  description: siteConfig.defaultDescription,
  brand: { "@type": "Brand", name: siteConfig.name },
  url: `${SITE_URL}/pricing`,
  image: `${SITE_URL}/icons/plyndrox-512.png`,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/pricing`,
    priceValidUntil: "2099-12-31",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1280",
    bestRating: "5",
    worstRating: "1",
  },
};

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrossIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-white text-zinc-950 font-sans">
      <JsonLd id="ld-pricing-product" data={offerJsonLd} />
      <JsonLd id="ld-pricing-faq" data={faqJsonLd(pricingFaqs)} />
      <JsonLd
        id="ld-breadcrumb-pricing"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" },
        ])}
      />

      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 transition-transform group-hover:scale-105">
              <img src="/plyndrox-logo.svg" alt="Plyndrox AI" className="h-9 w-9 object-contain" width="36" height="36" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-950">Plyndrox AI</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-zinc-500 md:flex">
            <Link href="/features" className="transition hover:text-zinc-950">Features</Link>
            <Link href="/pricing" className="text-zinc-950">Pricing</Link>
            <Link href="/blog" className="transition hover:text-zinc-950">Blog</Link>
            <Link href="/about" className="transition hover:text-zinc-950">About</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:text-zinc-950">
              Log in
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800">
              Start free <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.10),transparent_55%)]" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-purple-300/20 blur-[140px]" />
          <div className="absolute top-40 -left-32 h-96 w-96 rounded-full bg-sky-300/20 blur-[140px]" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free forever — no credit card, no upgrades
          </div>
          <h1 className="text-balance text-5xl font-black tracking-tight text-zinc-950 sm:text-6xl md:text-7xl">
            Pricing? <span className="bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">It is $0.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-zinc-600 sm:text-xl">
            Every Plyndrox AI workspace — Personal, WhatsApp, Inbox, Payable, Recruit, Bihar, Ledger, Translate, and the Ibara website widget — is free for individuals and businesses, with no credit card and no usage caps designed to push you into a paid tier.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-zinc-950/20 transition hover:bg-zinc-800">
              Create free account <ArrowRightIcon />
            </Link>
            <Link href="/features" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-base font-semibold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50">
              Explore all features
            </Link>
          </div>
        </div>
      </header>

      {/* Plan card */}
      <section className="relative -mt-4 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-8 shadow-xl shadow-zinc-200/40 sm:p-12">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-purple-300/40 blur-3xl" />
            <div className="relative flex flex-col items-center text-center">
              <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">The only plan</span>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">Plyndrox Free</h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-7xl font-black text-zinc-950">$0</span>
                <span className="text-lg font-medium text-zinc-500">/ forever</span>
              </div>
              <p className="mt-4 max-w-xl text-zinc-600">
                Get every workspace, every AI feature, unlimited usage — for individuals, freelancers, startups, agencies, and growing teams.
              </p>
              <Link href="/signup" className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-zinc-950/20 transition hover:bg-zinc-800">
                Get started in 30 seconds <ArrowRightIcon />
              </Link>
              <p className="mt-3 text-xs text-zinc-500">No credit card required · Sign up with email or Google</p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                "All 9 workspaces unlocked",
                "Unlimited AI usage (fair-use)",
                "100+ languages everywhere",
                "Lead capture & CRM exports",
                "Webhooks & API access",
                "Mobile apps (iOS & Android)",
                "Email & in-app support",
                "GDPR-aligned data handling",
                "Export & delete your data anytime",
                "No watermark on the Ibara widget",
                "Smart human escalation",
                "Priority access to new AI workspaces",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-zinc-700">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* Workspace grid */}
      <section className="relative bg-zinc-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              9 workspaces. One free plan.
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              Pick whichever workspace solves your problem. Use one. Use all nine. The price never changes.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.name}
                href={p.href}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r ${p.color} px-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm`}>
                  Free
                </div>
                <h3 className="text-lg font-bold text-zinc-950">{p.name}</h3>
                <p className="mt-1 text-sm text-zinc-600">{p.tagline}</p>
                <ul className="mt-4 space-y-2">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-zinc-700">
                      <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-950 transition group-hover:gap-2.5">
                  Open workspace <ArrowRightIcon />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              How Plyndrox compares
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              The same capabilities you would assemble from 6+ paid tools, in one free platform.
            </p>
          </div>
          <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-6 py-4">Capability</th>
                    <th className="px-6 py-4">Typical paid stack</th>
                    <th className="px-6 py-4 text-emerald-700">Plyndrox AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800">
                  {[
                    ["WhatsApp AI chatbot", "$49–$299 / mo", "$0"],
                    ["AI email assistant", "$20–$60 / mo per user", "$0"],
                    ["AI invoice & AP automation", "$200–$1,500 / mo", "$0"],
                    ["AI ATS & resume screening", "$99–$499 / mo per user", "$0"],
                    ["Embeddable AI website widget", "$29–$199 / mo", "$0"],
                    ["AI translator (no caps)", "$10–$30 / mo", "$0"],
                    ["Personal AI assistant", "$20 / mo per user", "$0"],
                    ["Regional language AI (Hindi, Bhojpuri)", "Not commonly offered", "$0"],
                    ["Smart accounting (handwritten ledger OCR)", "Not commonly offered", "$0"],
                  ].map((row) => (
                    <tr key={row[0]} className="transition hover:bg-zinc-50/50">
                      <td className="px-6 py-4 font-medium">{row[0]}</td>
                      <td className="px-6 py-4 text-zinc-600">{row[1]}</td>
                      <td className="px-6 py-4 font-bold text-emerald-700">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-zinc-50">
                  <tr>
                    <td className="px-6 py-4 font-bold text-zinc-950">Total monthly cost</td>
                    <td className="px-6 py-4 font-bold text-zinc-700">$427 – $2,608+</td>
                    <td className="px-6 py-4 text-lg font-black text-emerald-700">$0</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* What's NOT in the plan */}
      <section className="bg-zinc-50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-white p-8">
              <h3 className="flex items-center gap-2 text-xl font-bold text-zinc-950">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckIcon className="h-4 w-4" />
                </span>
                What you get
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-zinc-700">
                {[
                  "All workspaces, fully unlocked",
                  "Real generative AI (not keyword rules)",
                  "Unlimited messages, invoices, candidates, translations",
                  "Mobile + web + PWA installs",
                  "100+ languages — including regional Indian languages",
                  "Email & in-app support from the Plyndrox team",
                  "Privacy-first defaults (no training on your data)",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <h3 className="flex items-center gap-2 text-xl font-bold text-zinc-950">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-300 text-zinc-700">
                  <CrossIcon className="h-4 w-4" />
                </span>
                What you will never see
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-zinc-700">
                {[
                  "Hidden trial-to-paid conversions",
                  "Credit card asked at signup",
                  "Per-message or per-invoice fees from Plyndrox",
                  "Forced upgrade pop-ups",
                  "Watermarks on the embeddable widget",
                  "Your data sold or used to train AI",
                  "Surprise renewal emails",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CrossIcon className="mt-0.5 h-4 w-4 flex-none text-zinc-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-950 to-zinc-800 p-10 text-white sm:p-14">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">For large organizations</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Enterprise services (optional)</h2>
            <p className="mt-3 max-w-2xl text-white/70">
              Plyndrox stays free for individuals and businesses. Large organizations that need additional services can talk to us about:
            </p>
            <div className="mt-6 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
              {[
                "SSO / SAML & SCIM provisioning",
                "Dedicated infrastructure & data residency",
                "Custom SLAs & 24/7 support",
                "On-premise / private cloud deployment",
                "White-label & reseller licensing",
                "Custom integrations & migrations",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-emerald-400" />
                  {t}
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100">
                Contact sales <ArrowRightIcon />
              </Link>
              <Link href="/partners" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Become a partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-50 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Pricing FAQ
            </h2>
            <p className="mt-4 text-lg text-zinc-600">Honest answers about how Plyndrox stays free.</p>
          </div>
          <div className="mt-12 space-y-3">
            {pricingFaqs.map((f) => (
              <details key={f.question} className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-left text-base font-semibold text-zinc-950">
                  {f.question}
                  <span className="ml-2 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition group-open:rotate-45 group-open:bg-zinc-950 group-open:text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14" /><path d="M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Stop paying for what should be free.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
            Sign up in 30 seconds and start using all nine AI workspaces today. No credit card. No upgrades. No surprises.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-zinc-950/20 transition hover:bg-zinc-800">
              Create free account <ArrowRightIcon />
            </Link>
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-base font-semibold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50">
              Read the blog
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <img src="/plyndrox-logo.svg" alt="Plyndrox AI" className="h-6 w-6" />
            <span className="font-semibold text-zinc-700">Plyndrox AI</span>
            <span>· © {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy-policy" className="transition hover:text-zinc-900">Privacy</Link>
            <Link href="/terms" className="transition hover:text-zinc-900">Terms</Link>
            <Link href="/cookies" className="transition hover:text-zinc-900">Cookies</Link>
            <Link href="/data-deletion" className="transition hover:text-zinc-900">Data deletion</Link>
            <Link href="/contact" className="transition hover:text-zinc-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
