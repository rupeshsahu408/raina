import type { Metadata } from "next";

export const SITE_URL = "https://www.plyndrox.app";

export const siteConfig = {
  name: "Plyndrox AI",
  shortName: "Plyndrox",
  url: SITE_URL,
  locale: "en_US",
  defaultTitle: "Plyndrox AI — Every AI Tool You Need. Free for Everyone.",
  titleTemplate: "%s | Plyndrox AI",
  defaultDescription:
    "Plyndrox AI is the free all-in-one AI platform: personal companion, WhatsApp AI, email intelligence, invoice automation, AI hiring, regional AI, and a smart ledger — built for individuals and businesses worldwide.",
  defaultKeywords: [
    "Plyndrox",
    "Plyndrox AI",
    "free AI platform",
    "AI tools",
    "WhatsApp AI",
    "WhatsApp business AI",
    "AI email assistant",
    "AI invoice automation",
    "AI for recruiters",
    "AI hiring",
    "AI smart ledger",
    "regional AI",
    "Bihar AI",
    "AI for small business",
    "personal AI assistant",
    "Ibara",
    "AI chatbot",
    "business automation",
  ],
  twitterHandle: "@plyndroxai",
  organization: {
    legalName: "Plyndrox AI",
    foundingDate: "2024",
    email: "support@plyndrox.app",
    sameAs: [
      "https://www.plyndrox.app",
      "https://twitter.com/plyndroxai",
      "https://www.linkedin.com/company/plyndrox-ai",
      "https://github.com/plyndrox",
    ],
  },
} as const;

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
  alternateLanguages?: Record<string, string>;
};

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  ogImage = "/opengraph-image",
  ogType = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex,
  alternateLanguages,
}: BuildMetadataInput): Metadata {
  const fullTitle = title.includes("Plyndrox") ? title : `${title} | Plyndrox AI`;
  const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const finalKeywords = [...siteConfig.defaultKeywords, ...(keywords ?? [])].join(", ");

  return {
    title: fullTitle,
    description,
    keywords: finalKeywords,
    alternates: {
      canonical: url,
      languages: alternateLanguages,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors && ogType === "article" ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      images: [ogImage],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.organization.legalName,
    alternateName: siteConfig.shortName,
    url: SITE_URL,
    logo: `${SITE_URL}/icons/plyndrox-512.png`,
    foundingDate: siteConfig.organization.foundingDate,
    email: siteConfig.organization.email,
    sameAs: siteConfig.organization.sameAs,
    description: siteConfig.defaultDescription,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: SITE_URL,
    description: siteConfig.defaultDescription,
    publisher: {
      "@type": "Organization",
      name: siteConfig.organization.legalName,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icons/plyndrox-512.png`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "BusinessApplication",
    description: siteConfig.defaultDescription,
    url: SITE_URL,
    image: `${SITE_URL}/icons/plyndrox-512.png`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1280",
      bestRating: "5",
      worstRating: "1",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.organization.legalName,
      url: SITE_URL,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  author: string;
  image?: string;
  category?: string;
  tags?: string[];
}) {
  const url = `${SITE_URL}/blog/${opts.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    image: opts.image
      ? opts.image.startsWith("http")
        ? opts.image
        : `${SITE_URL}${opts.image}`
      : `${SITE_URL}/opengraph-image`,
    datePublished: opts.publishedAt,
    dateModified: opts.modifiedAt ?? opts.publishedAt,
    author: {
      "@type": "Person",
      name: opts.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.organization.legalName,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icons/plyndrox-512.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    articleSection: opts.category,
    keywords: opts.tags?.join(", "),
  };
}
