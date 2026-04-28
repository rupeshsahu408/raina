import type { MetadataRoute } from "next";
import { posts, categories } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/features", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.95, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.9, changeFrequency: "daily" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/partners", priority: 0.6, changeFrequency: "monthly" },
  { path: "/help", priority: 0.6, changeFrequency: "monthly" },
  // Product / marketing pages
  { path: "/chat", priority: 0.9, changeFrequency: "weekly" },
  { path: "/business-ai", priority: 0.9, changeFrequency: "weekly" },
  { path: "/whatsapp-ai", priority: 0.9, changeFrequency: "weekly" },
  { path: "/bihar-ai", priority: 0.85, changeFrequency: "weekly" },
  { path: "/ibara", priority: 0.85, changeFrequency: "weekly" },
  { path: "/inbox", priority: 0.85, changeFrequency: "weekly" },
  { path: "/payables", priority: 0.85, changeFrequency: "weekly" },
  { path: "/recruit", priority: 0.85, changeFrequency: "weekly" },
  { path: "/ledger", priority: 0.8, changeFrequency: "weekly" },
  { path: "/translate", priority: 0.7, changeFrequency: "monthly" },
  // Legal
  { path: "/privacy-policy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.4, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" },
  { path: "/data-deletion", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: post.featured ? 0.85 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/blog?category=${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...blogEntries, ...categoryEntries];
}
