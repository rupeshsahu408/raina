import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getPostsByCategory, categories, formatDate } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return { title: "Category Not Found — Evara AI Blog" };
  return {
    title: `${cat.label} — Evara AI Blog`,
    description: `${cat.description}. Browse all ${cat.label} articles on the Evara AI blog.`,
  };
}

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
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

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const catPosts = getPostsByCategory(slug);

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.09),transparent_55%)]" />
        <div className="absolute top-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-purple-900/10 blur-[130px]" />
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/evara-logo.png" alt="Evara AI" className="h-8 w-8 object-contain" />
            <span className="text-sm font-bold tracking-widest text-zinc-100 uppercase">Evara AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="hidden text-sm text-zinc-500 transition hover:text-zinc-300 sm:block">Blog</Link>
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <Link href="/blog" className="group mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300">
          <ArrowLeftIcon className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          All Articles
        </Link>

        <div className="mt-6 mb-12">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold mb-4 ${cat.bg} ${cat.border} ${cat.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
            {cat.label}
          </span>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl mt-4">
            {cat.label}
          </h1>
          <p className="mt-4 text-base text-zinc-400 max-w-xl">{cat.description}</p>
          <p className="mt-2 text-sm text-zinc-600">{catPosts.length} article{catPosts.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Other Categories */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.filter((c) => c.slug !== slug).map((c) => (
            <Link
              key={c.slug}
              href={`/blog/category/${c.slug}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 bg-white/[0.03] border-white/10 text-zinc-400`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
              {c.label}
            </Link>
          ))}
        </div>

        {catPosts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-zinc-400">No articles in this category yet. Check back soon.</p>
            <Link href="/blog" className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition">
              Browse all articles <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catPosts.map((post) => (
              <article key={post.slug} className="group flex flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.06] hover:shadow-xl">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cat.bg} ${cat.border} ${cat.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                      {cat.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-600">
                      <ClockIcon className="h-3 w-3" />
                      {post.readingTime} min
                    </span>
                  </div>
                  <h2 className="text-base font-semibold leading-tight text-white group-hover:text-purple-100 transition-colors flex-1">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-white text-[10px] font-bold ${post.authorGradient}`}>
                        {post.authorInitials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-300">{post.author}</p>
                        <p className="text-[10px] text-zinc-600">{formatDate(post.publishedAt)}</p>
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold transition">
                      Read <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-black/50 px-4 py-10 backdrop-blur-xl sm:px-6 lg:px-8 mt-10">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© 2026 Raina Jet. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/blog" className="transition hover:text-zinc-400">Blog</Link>
            <Link href="/about" className="transition hover:text-zinc-400">About</Link>
            <Link href="/privacy-policy" className="transition hover:text-zinc-400">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
