import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getCategory, posts, categories, formatDate } from "@/lib/blog";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return buildMetadata({
      title: "Post Not Found",
      description: "This blog post could not be found on Plyndrox AI.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
    ogType: "article",
    publishedTime: post.publishedAt,
    authors: [post.author],
    ogImage: post.image ?? "/opengraph-image",
  });
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
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

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="mt-10 mb-4 text-xl font-semibold text-white sm:text-2xl scroll-mt-6">
          {line.slice(3)}
        </h2>
      );
      i++;
    } else if (line.startsWith("**") && line.endsWith("**") && !line.slice(2, -2).includes("**")) {
      elements.push(
        <p key={key++} className="mt-5 font-semibold text-[#1d2226]">
          {line.slice(2, -2)}
        </p>
      );
      i++;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="mt-4 space-y-2 pl-5 list-disc">
          {items.map((item, idx) => {
            const boldMatch = item.match(/^\*\*(.+?)\*\*:(.*)$/);
            if (boldMatch) {
              return (
                <li key={idx} className="text-gray-500 text-sm leading-7">
                  <strong className="text-[#1d2226]">{boldMatch[1]}:</strong>
                  {boldMatch[2]}
                </li>
              );
            }
            return <li key={idx} className="text-gray-500 text-sm leading-7">{item}</li>;
          })}
        </ul>
      );
    } else {
      const boldRegex = /\*\*(.+?)\*\*/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      let hasMatch = false;
      const lineKey = key++;
      while ((match = boldRegex.exec(line)) !== null) {
        hasMatch = true;
        if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
        parts.push(<strong key={match.index} className="text-[#1d2226]">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (hasMatch) {
        if (lastIndex < line.length) parts.push(line.slice(lastIndex));
        elements.push(<p key={lineKey} className="mt-4 text-sm leading-8 text-gray-500">{parts}</p>);
      } else {
        elements.push(<p key={lineKey} className="mt-4 text-sm leading-8 text-gray-500">{line}</p>);
      }
      i++;
    }
  }

  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const cat = getCategory(post.category);
  const related = posts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-[#1d2226] ">
      <JsonLd
        id="ld-article"
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          slug: post.slug,
          publishedAt: post.publishedAt,
          author: post.author,
          image: post.image,
          category: cat?.label,
          tags: post.tags,
        })}
      />
      <JsonLd
        id="ld-breadcrumb-post"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ])}
      />
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.10),transparent_55%)]" />
        <div className="absolute top-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] rounded-full bg-sky-900/10 blur-[110px]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/plyndrox-logo.svg" alt="Plyndrox AI" className="h-10 w-10 object-contain plyndrox-logo-img" />
            <span className="text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Plyndrox AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="hidden text-sm text-gray-400 transition hover:text-gray-600 sm:block">Blog</Link>
            <Link href="/" className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d3238]">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start">

          {/* Article */}
          <div>
            <Link href="/blog" className="group mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-gray-600">
              <ArrowLeftIcon className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              Back to Blog
            </Link>

            <header className="mt-6">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {cat && (
                  <Link href={`/blog/category/${cat.slug}`} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cat.bg} ${cat.border} ${cat.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                    {cat.label}
                  </Link>
                )}
                {post.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300">
                    ★ Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-gray-500">{post.excerpt}</p>

              <div className="mt-6 flex flex-wrap items-center gap-5 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold ${post.authorGradient}`}>
                    {post.authorInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{post.author}</p>
                    <p className="text-xs text-gray-400">{post.authorRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {post.readingTime} min read
                  </span>
                </div>
              </div>
            </header>

            {/* Article Content */}
            <div className="mt-8 [&_h2]:scroll-mt-20">
              {renderContent(post.content)}
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Tags</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs text-gray-500 transition hover:border-gray-300 hover:text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Card */}
            <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white text-lg font-bold ${post.authorGradient}`}>
                  {post.authorInitials}
                </div>
                <div>
                  <p className="font-semibold text-white">{post.author}</p>
                  <p className="text-sm text-gray-400">{post.authorRole}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {post.author === "Riley Parker"
                      ? "Riley is the Founder of Plyndrox AI, leading the company's vision for making AI genuinely useful, accessible, and beautifully designed for every user and business."
                      : "Rupesh is the Co-Founder and CTO of Plyndrox AI, responsible for the platform's technical architecture and the engineering team that builds every product feature."}
                  </p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Share</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent("https://www.plyndrox.app/blog/" + post.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 transition hover:bg-white/10 hover:text-white"
              >
                <ShareIcon className="h-3.5 w-3.5" />
                Share on X
              </a>
              <Link href="/blog" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 transition hover:bg-white/10 hover:text-white">
                More Articles
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Browse Categories</p>
              <div className="space-y-2">
                {categories.map((c) => {
                  const count = posts.filter((p) => p.category === c.slug).length;
                  return (
                    <Link
                      key={c.slug}
                      href={`/blog/category/${c.slug}`}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-gray-50 ${c.slug === post.category ? `${c.bg} ${c.color} font-semibold` : "text-gray-500 hover:text-white"}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                        {c.label}
                      </span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {related.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Related Articles</p>
                <div className="space-y-4">
                  {related.map((rp) => {
                    const rc = categories.find((c) => c.slug === rp.category);
                    return (
                      <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block">
                        <p className="text-sm font-semibold text-gray-600 group-hover:text-white transition-colors leading-snug">
                          {rp.title}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
                          {rc && <span className={rc.color}>{rc.label}</span>}
                          <span>·</span>
                          <span className="flex items-center gap-1"><ClockIcon className="h-2.5 w-2.5" />{rp.readingTime} min</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.07] p-5 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 mb-3">Try Plyndrox AI</p>
              <p className="text-sm text-gray-500 leading-6">
                Put the ideas from this article into practice with Plyndrox AI and Plyndrox WhatsApp AI.
              </p>
              <Link href="/signup" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:bg-zinc-100">
                Start Free
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>

        {/* More Posts */}
        {posts.filter((p) => p.slug !== post.slug).length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">More from the Blog</h2>
              <Link href="/blog" className="text-xs text-purple-400 hover:text-violet-600 transition flex items-center gap-1">
                View all <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.filter((p) => p.slug !== post.slug).slice(0, 3).map((rp) => {
                const rc = categories.find((c) => c.slug === rp.category);
                return (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group rounded-2xl border border-gray-200 bg-white p-5 backdrop-blur-xl transition hover:border-gray-300 hover:bg-gray-50">
                    {rc && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold mb-3 ${rc.bg} ${rc.border} ${rc.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${rc.dot}`} />
                        {rc.label}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-[#1d2226] group-hover:text-white transition-colors leading-snug">{rp.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-gray-400 line-clamp-2">{rp.excerpt}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                      <ClockIcon className="h-3 w-3" />
                      {rp.readingTime} min read
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-gray-100 bg-gray-50 px-4 py-10 backdrop-blur-xl sm:px-6 lg:px-8 mt-10">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© 2026 Plyndrox AI. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/blog" className="transition hover:text-gray-500">Blog</Link>
            <Link href="/about" className="transition hover:text-gray-500">About</Link>
            <Link href="/privacy-policy" className="transition hover:text-gray-500">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
