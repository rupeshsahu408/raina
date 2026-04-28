import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SOLUTIONS,
  TOOLS,
  INDUSTRIES,
  getSolutionBySlug,
  getAllSolutionSlugs,
  getSolutionsByTool,
} from "@/lib/solutions";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, SITE_URL, siteConfig } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllSolutionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sol = getSolutionBySlug(slug);
  if (!sol)
    return buildMetadata({
      title: "Solution not found",
      description: "This Plyndrox AI solution could not be found.",
      path: `/solutions/${slug}`,
      noIndex: true,
    });
  const tool = TOOLS[sol.toolId];
  const industry = INDUSTRIES[sol.industryId];
  return buildMetadata({
    title: sol.title,
    description: sol.metaDescription,
    path: `/solutions/${sol.slug}`,
    keywords: [
      `${tool.name} for ${industry.name}`,
      `${tool.name} for ${industry.shortName}`,
      `free ${tool.name.toLowerCase()} for ${industry.shortName}`,
      `${industry.name} AI`,
      `${industry.shortName} AI software`,
      `Plyndrox ${tool.name}`,
      "free AI",
    ],
  });
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 6 9 17l-5-5" />
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

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sol = getSolutionBySlug(slug);
  if (!sol) notFound();

  const tool = TOOLS[sol.toolId];
  const industry = INDUSTRIES[sol.industryId];

  const related = getSolutionsByTool(sol.toolId)
    .filter((s) => s.slug !== sol.slug)
    .slice(0, 4);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: sol.title,
    description: sol.metaDescription,
    url: `${SITE_URL}/solutions/${sol.slug}`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.organization.legalName,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/plyndrox-512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/solutions/${sol.slug}` },
    about: { "@type": "Thing", name: `${tool.name} for ${industry.name}` },
  };

  return (
    <div className="relative min-h-screen bg-white text-zinc-950 font-sans">
      <JsonLd id={`ld-sol-article-${sol.slug}`} data={articleJsonLd} />
      <JsonLd id={`ld-sol-faq-${sol.slug}`} data={faqJsonLd(sol.faqs.map((f) => ({ question: f.q, answer: f.a })))} />
      <JsonLd
        id={`ld-sol-bc-${sol.slug}`}
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Solutions", url: "/solutions" },
          { name: industry.name, url: `/solutions/${sol.slug}` },
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

      {/* Breadcrumb */}
      <div className="pt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-zinc-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-zinc-900">Home</Link>
            <span>/</span>
            <Link href="/solutions" className="transition hover:text-zinc-900">Solutions</Link>
            <span>/</span>
            <span className="text-zinc-700">{tool.name} for {industry.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <header className="relative overflow-hidden pt-10 pb-14 sm:pt-14 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className={`absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br ${tool.gradient} opacity-20 blur-[140px]`} />
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className={`mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${tool.gradient} px-3 py-1 text-xs font-bold uppercase tracking-wider text-white`}>
            {industry.emoji} {tool.name} · for {industry.name}
          </div>
          <h1 className="text-balance text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl md:text-6xl">
            {sol.heroHeadline}
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-lg text-zinc-600 sm:text-xl">
            {sol.heroSubheadline}
          </p>
          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-zinc-950/20 transition hover:bg-zinc-800">
              Get started — free <ArrowRightIcon />
            </Link>
            <Link href={tool.productHref} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-base font-semibold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50">
              See how {tool.name} works
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:grid-cols-3 sm:p-8">
            {sol.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className={`bg-gradient-to-br ${tool.gradient} bg-clip-text text-3xl font-black text-transparent sm:text-4xl`}>
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-zinc-600 sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            What's slowing {industry.shortName} down today
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Most {industry.shortName} we talk to are stuck in the same loop. {tool.name} is built to break it.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {sol.painPoints.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-800">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-zinc-50 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            How {tool.name} works for {industry.name.toLowerCase()}
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">{tool.shortDescription}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {sol.useCases.map((u, i) => (
              <div key={u} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
                <span className={`mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gradient-to-br ${tool.gradient} text-xs font-black text-white`}>
                  {i + 1}
                </span>
                <span className="text-sm text-zinc-800">{u}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenario */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            See it in action
          </h2>
          <p className="mt-3 text-center text-zinc-600">
            A typical {industry.shortName} conversation, automated.
          </p>
          <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
            {sol.scenario.channel && (
              <div className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {sol.scenario.channel}
              </div>
            )}
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-zinc-100 px-4 py-3 text-sm text-zinc-900">
                  {sol.scenario.customer}
                </div>
              </div>
              <div className="flex justify-start">
                <div className={`max-w-[85%] rounded-2xl rounded-tl-md bg-gradient-to-br ${tool.gradient} px-4 py-3 text-sm text-white shadow-md`}>
                  {sol.scenario.ai}
                </div>
              </div>
            </div>
            <div className="mt-5 text-center text-xs text-zinc-500">
              Auto-generated by {tool.name} in under 2 seconds.
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-zinc-950 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-black tracking-tight sm:text-4xl">
            Everything {tool.name} includes — free
          </h2>
          <p className="mt-3 max-w-2xl text-white/70">
            No paywall. No upgrade nag. No per-message fees from Plyndrox.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {tool.capabilities.map((c) => (
              <div key={c} className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-emerald-400" />
                {c}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100">
              Create free account <ArrowRightIcon />
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              See full pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            FAQs — {tool.name} for {industry.name.toLowerCase()}
          </h2>
          <div className="mt-8 space-y-3">
            {sol.faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-left text-base font-semibold text-zinc-950">
                  {f.q}
                  <span className="ml-2 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition group-open:rotate-45 group-open:bg-zinc-950 group-open:text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14" /><path d="M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related solutions */}
      {related.length > 0 && (
        <section className="bg-zinc-50 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-balance text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
              {tool.name} for other industries
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => {
                const ind = INDUSTRIES[r.industryId];
                return (
                  <Link
                    key={r.slug}
                    href={`/solutions/${r.slug}`}
                    className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                  >
                    <div className="text-2xl">{ind.emoji}</div>
                    <div className="mt-2 text-sm font-bold text-zinc-950">For {ind.name}</div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 transition group-hover:gap-2">
                      Read more <ArrowRightIcon />
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <Link href="/solutions" className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100">
                Browse all {SOLUTIONS.length} solutions <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Ready to put {tool.name} to work for {industry.shortName}?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
            Sign up in 30 seconds. No credit card. No upgrades. Free forever.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-zinc-950/20 transition hover:bg-zinc-800">
              Create free account <ArrowRightIcon />
            </Link>
            <Link href={tool.productHref} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-base font-semibold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50">
              Explore {tool.name}
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
