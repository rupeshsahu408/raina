import type { Metadata } from "next";
import Link from "next/link";
import { SOLUTIONS, TOOLS, INDUSTRIES, getSolutionsByTool } from "@/lib/solutions";
import { buildMetadata, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Solutions — Free AI for Every Industry",
  description:
    "Plyndrox AI for restaurants, e-commerce, real estate, salons, clinics, agencies, recruiters, founders, and more. Free, ready-made AI workflows for every business.",
  path: "/solutions",
  keywords: [
    "AI for business",
    "AI for restaurants",
    "AI for e-commerce",
    "AI for real estate",
    "AI for clinics",
    "AI for salons",
    "AI for recruiters",
    "AI for founders",
    "free AI by industry",
    "Plyndrox solutions",
  ],
});

const toolOrder = ["whatsapp", "inbox", "payable", "recruit", "ibara", "translate", "ledger", "chat", "bihar"];

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: SOLUTIONS.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE_URL}/solutions/${s.slug}`,
    name: s.title,
  })),
};

export default function SolutionsIndexPage() {
  return (
    <div className="relative min-h-screen bg-white text-zinc-950 font-sans">
      <JsonLd id="ld-solutions-list" data={itemListJsonLd} />
      <JsonLd
        id="ld-solutions-bc"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Solutions", url: "/solutions" },
        ])}
      />

      {/* Nav */}
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
            <Link href="/solutions" className="text-zinc-950">Solutions</Link>
            <Link href="/pricing" className="transition hover:text-zinc-950">Pricing</Link>
            <Link href="/blog" className="transition hover:text-zinc-950">Blog</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:text-zinc-950">Log in</Link>
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
          <div className="absolute top-40 -left-32 h-96 w-96 rounded-full bg-emerald-300/20 blur-[140px]" />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {SOLUTIONS.length} ready-made AI solutions — all free
          </div>
          <h1 className="text-balance text-5xl font-black tracking-tight text-zinc-950 sm:text-6xl md:text-7xl">
            AI for <span className="bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">every business</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-zinc-600 sm:text-xl">
            Pick your tool. Pick your industry. Plyndrox AI is already configured for you — restaurants, e-commerce, real estate, clinics, salons, agencies, founders, and more.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-zinc-950/20 transition hover:bg-zinc-800">
              Get started — free <ArrowRightIcon />
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-base font-semibold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50">
              See pricing
            </Link>
          </div>
        </div>
      </header>

      {/* Solutions grouped by tool */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {toolOrder.map((toolId) => {
              const tool = TOOLS[toolId];
              const list = getSolutionsByTool(toolId);
              if (!tool || list.length === 0) return null;
              return (
                <div key={toolId} id={toolId}>
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className={`mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${tool.gradient} px-3 py-1 text-xs font-bold uppercase tracking-wider text-white`}>
                        {tool.name}
                      </div>
                      <h2 className="text-balance text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                        {tool.name} for {list.length} industries
                      </h2>
                      <p className="mt-2 max-w-2xl text-zinc-600">{tool.shortDescription}</p>
                    </div>
                    <Link href={tool.productHref} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50">
                      Open {tool.name} <ArrowRightIcon />
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {list.map((s) => {
                      const ind = INDUSTRIES[s.industryId];
                      return (
                        <Link
                          key={s.slug}
                          href={`/solutions/${s.slug}`}
                          className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{ind.emoji}</div>
                            <div>
                              <div className="text-sm font-bold text-zinc-950">For {ind.name}</div>
                              <div className="mt-1 line-clamp-2 text-xs text-zinc-600">{s.metaDescription}</div>
                            </div>
                          </div>
                          <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 transition group-hover:gap-2">
                            Read solution <ArrowRightIcon />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-50 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Don't see your industry?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
            Plyndrox AI works for any business. Sign up free and tell us your use case — we'll configure it with you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-zinc-950/20 transition hover:bg-zinc-800">
              Create free account <ArrowRightIcon />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-base font-semibold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50">
              Talk to us
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
            <Link href="/solutions" className="transition hover:text-zinc-900">Solutions</Link>
            <Link href="/pricing" className="transition hover:text-zinc-900">Pricing</Link>
            <Link href="/blog" className="transition hover:text-zinc-900">Blog</Link>
            <Link href="/privacy-policy" className="transition hover:text-zinc-900">Privacy</Link>
            <Link href="/contact" className="transition hover:text-zinc-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
