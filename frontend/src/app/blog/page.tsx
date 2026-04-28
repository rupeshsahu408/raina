import type { Metadata } from "next";
import Link from "next/link";
import { posts, categories, getFeaturedPost, formatDate } from "@/lib/blog";
import {
  buildMetadata,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Blog — AI Guides, WhatsApp Automation & Business Growth",
  description:
    "Expert guides, tutorials, and insights from the Plyndrox AI team — covering AI automation, WhatsApp Business API, regional AI, prompt engineering, and strategies to grow your business with AI.",
  path: "/blog",
  keywords: [
    "AI blog",
    "Plyndrox blog",
    "WhatsApp AI guides",
    "AI tutorials",
    "AI automation tips",
    "AI prompt guides",
    "business AI strategies",
  ],
});

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
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

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function RssIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
    </svg>
  );
}

const featuredPost = getFeaturedPost();
const regularPosts = posts.filter((p) => !p.featured);

export default function BlogPage() {
  const blogList = itemListJsonLd({
    name: "Plyndrox AI Blog Posts",
    items: posts.map((p) => ({
      name: p.title,
      url: `/blog/${p.slug}`,
      description: p.excerpt,
      image: p.image,
    })),
  });
  const blogCollection = collectionPageJsonLd({
    url: "/blog",
    name: "Plyndrox AI Blog",
    description:
      "Expert guides, tutorials, and insights from the Plyndrox AI team — AI automation, WhatsApp Business API, regional AI, prompt engineering, and AI strategies for business.",
    itemList: blogList,
  });
  return (
    <div className="min-h-screen bg-white text-[#1d2226] ">
      <JsonLd id="ld-blog-collection" data={blogCollection} />
      <JsonLd id="ld-blog-list" data={blogList} />
      <JsonLd
        id="ld-breadcrumb-blog"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ])}
      />
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.12),transparent_55%)]" />
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-sky-900/10 blur-[120px]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/plyndrox-logo.svg" alt="Plyndrox AI" className="h-10 w-10 object-contain plyndrox-logo-img" />
            <span className="text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Plyndrox AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/about" className="hidden text-sm text-gray-400 transition hover:text-gray-600 sm:block">About</Link>
            <Link href="/contact" className="hidden text-sm text-gray-400 transition hover:text-gray-600 sm:block">Contact</Link>
            <Link href="/" className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d3238]">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-6">
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>Plyndrox AI Blog</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Insights on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400">
              AI, Automation & Growth
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-500">
            Practical guides, product updates, and strategic perspectives to help you harness the power of AI for your work and business.
          </p>

          {/* Category Nav */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition hover:scale-105 ${cat.bg} ${cat.border} ${cat.color}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <article className="group mb-14 overflow-hidden rounded-[2rem] border border-gray-200 bg-white backdrop-blur-xl transition-all hover:border-gray-300 hover:bg-gray-50">
            <div className="grid lg:grid-cols-[1fr_420px]">
              <div className="p-8 sm:p-10 lg:p-12">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
                    <SparklesIcon className="h-2.5 w-2.5" />
                    Featured
                  </span>
                  {(() => {
                    const cat = categories.find((c) => c.slug === featuredPost.category);
                    return cat ? (
                      <Link href={`/blog/category/${cat.slug}`} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cat.bg} ${cat.border} ${cat.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                        {cat.label}
                      </Link>
                    ) : null;
                  })()}
                </div>
                <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl group-hover:text-purple-100 transition-colors">
                  <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>
                <p className="mt-4 text-base leading-8 text-gray-500 max-w-2xl">{featuredPost.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-white text-[10px] font-bold ${featuredPost.authorGradient}`}>
                      {featuredPost.authorInitials}
                    </div>
                    <span className="text-gray-500">{featuredPost.author}</span>
                  </div>
                  <span>·</span>
                  <span>{formatDate(featuredPost.publishedAt)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {featuredPost.readingTime} min read
                  </span>
                </div>
                <div className="mt-8">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="group/btn inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:scale-105 hover:bg-zinc-100"
                  >
                    Read Article
                    <ArrowRightIcon className="h-4 w-4 transition group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center border-t border-gray-100 bg-white/[0.02] p-8 lg:border-t-0 lg:border-l">
                <div className="space-y-3 w-full">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {featuredPost.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Author</p>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold ${featuredPost.authorGradient}`}>
                        {featuredPost.authorInitials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{featuredPost.author}</p>
                        <p className="text-xs text-gray-400">{featuredPost.authorRole}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Post Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Latest Articles</h2>
          <span className="text-xs text-gray-400">{regularPosts.length} articles</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {regularPosts.map((post) => {
            const cat = categories.find((c) => c.slug === post.category);
            return (
              <article
                key={post.slug}
                className="group flex flex-col rounded-[1.5rem] border border-gray-200 bg-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-50 hover:shadow-xl"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    {cat && (
                      <Link href={`/blog/category/${cat.slug}`} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${cat.bg} ${cat.border} ${cat.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                        {cat.label}
                      </Link>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <ClockIcon className="h-3 w-3" />
                      {post.readingTime} min
                    </span>
                  </div>

                  <h3 className="text-base font-semibold leading-tight text-white group-hover:text-purple-100 transition-colors flex-1">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500 line-clamp-3">{post.excerpt}</p>

                  <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-white text-[10px] font-bold ${post.authorGradient}`}>
                        {post.authorInitials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">{post.author}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(post.publishedAt)}</p>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center gap-1 text-xs text-purple-400 transition hover:text-violet-600 font-semibold"
                    >
                      Read
                      <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Categories Section */}
        <div className="mt-20 mb-6">
          <h2 className="text-lg font-semibold text-white">Browse by Topic</h2>
          <p className="mt-1 text-sm text-gray-400">Find articles specific to your interests and use case</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const count = posts.filter((p) => p.category === cat.slug).length;
            return (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className={`group rounded-2xl border p-5 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-lg ${cat.bg} ${cat.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
                  <span className="text-xs text-gray-400">{count} article{count !== 1 ? "s" : ""}</span>
                </div>
                <p className={`font-semibold text-sm ${cat.color}`}>{cat.label}</p>
                <p className="mt-1 text-xs leading-5 text-gray-400">{cat.description}</p>
                <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${cat.color} transition group-hover:gap-2`}>
                  Browse
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 relative overflow-hidden rounded-[2rem] border border-purple-500/20 bg-purple-500/[0.06] p-10 backdrop-blur-xl text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.12),transparent_70%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-violet-600 mb-5">
              <RssIcon className="h-3.5 w-3.5" />
              Stay Updated
            </div>
            <h3 className="text-2xl font-semibold text-white sm:text-3xl">
              Get the latest from Plyndrox AI
            </h3>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-500">
              New articles on AI automation, Plyndrox WhatsApp AI tips, and product updates — delivered to the people building with Plyndrox AI.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105 hover:bg-zinc-100">
                Get in Touch
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Try Plyndrox AI Free
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-gray-100 bg-gray-50 px-4 py-10 backdrop-blur-xl sm:px-6 lg:px-8 mt-10">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© 2026 Plyndrox AI. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/about" className="transition hover:text-gray-500">About</Link>
            <Link href="/partners" className="transition hover:text-gray-500">Partners</Link>
            <Link href="/privacy-policy" className="transition hover:text-gray-500">Privacy</Link>
            <Link href="/terms" className="transition hover:text-gray-500">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
