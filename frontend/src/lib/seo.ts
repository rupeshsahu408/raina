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
  slogan: "Every AI tool you need. Free for everyone.",
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
    "free AI tools",
    "AI suite",
    "all in one AI",
    "AI for everyone",
    "Hindi AI",
    "Indian AI startup",
  ],
  twitterHandle: "@plyndroxai",
  organization: {
    legalName: "Plyndrox AI",
    foundingDate: "2024",
    foundingLocation: "India",
    email: "support@plyndrox.app",
    contactEmail: "support@plyndrox.app",
    pressEmail: "press@plyndrox.app",
    salesEmail: "sales@plyndrox.app",
    sameAs: [
      "https://www.plyndrox.app",
      "https://twitter.com/plyndroxai",
      "https://x.com/plyndroxai",
      "https://www.linkedin.com/company/plyndrox-ai",
      "https://github.com/plyndrox",
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Generative AI",
      "WhatsApp Business Automation",
      "Email Intelligence",
      "Accounts Payable Automation",
      "Applicant Tracking Systems",
      "AI Chatbots",
      "Indian Regional AI",
      "Smart Accounting",
      "Bookkeeping Automation",
      "Conversational AI",
      "Large Language Models",
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
      languages: {
        "x-default": url,
        en: url,
        ...(alternateLanguages ?? {}),
      },
      types: {
        "application/rss+xml": [{ url: `${SITE_URL}/feed.xml`, title: "Plyndrox AI Blog RSS" }],
      },
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
    "@id": `${SITE_URL}#organization`,
    name: siteConfig.organization.legalName,
    alternateName: [siteConfig.shortName, "Plyndrox", "Plyndrox AI Platform"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icons/plyndrox-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/opengraph-image`,
    foundingDate: siteConfig.organization.foundingDate,
    foundingLocation: {
      "@type": "Place",
      name: siteConfig.organization.foundingLocation,
    },
    email: siteConfig.organization.email,
    slogan: siteConfig.slogan,
    description: siteConfig.defaultDescription,
    sameAs: siteConfig.organization.sameAs,
    knowsAbout: siteConfig.organization.knowsAbout,
    areaServed: [
      { "@type": "Country", name: "India" },
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Worldwide" },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.organization.contactEmail,
        availableLanguage: ["English", "Hindi", "Bhojpuri", "Maithili", "Spanish"],
        areaServed: "Worldwide",
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: siteConfig.organization.salesEmail,
        availableLanguage: ["English", "Hindi"],
      },
      {
        "@type": "ContactPoint",
        contactType: "press",
        email: siteConfig.organization.pressEmail,
        availableLanguage: ["English"],
      },
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: SITE_URL,
    description: siteConfig.defaultDescription,
    inLanguage: ["en", "hi"],
    publisher: { "@id": `${SITE_URL}#organization` },
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    ],
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}#software`,
    name: siteConfig.name,
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Artificial Intelligence Platform",
    description: siteConfig.defaultDescription,
    url: SITE_URL,
    image: `${SITE_URL}/icons/plyndrox-512.png`,
    softwareVersion: "1.0",
    inLanguage: ["en", "hi"],
    featureList: [
      "Personal AI companion (Simi & Loa)",
      "WhatsApp AI customer automation",
      "Inbox AI for Gmail and Outlook",
      "Payable AI invoice automation",
      "Recruit AI applicant tracking system",
      "Bihar AI regional assistant",
      "Smart Ledger handwritten accounting",
      "Ibara embeddable chat widget",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2030-12-31",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1280",
      reviewCount: "1280",
      bestRating: "5",
      worstRating: "1",
    },
    publisher: { "@id": `${SITE_URL}#organization` },
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
      url: `${SITE_URL}/about`,
    },
    publisher: { "@id": `${SITE_URL}#organization` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    isPartOf: { "@id": `${SITE_URL}/blog#blog` },
    inLanguage: "en",
    articleSection: opts.category,
    keywords: opts.tags?.join(", "),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "article p"],
    },
  };
}

/**
 * Per-product SoftwareApplication schema. Use inside each product's layout.tsx
 * so search engines can present each Plyndrox product as its own entity with
 * its own rating, price, and feature list.
 */
export function productAppJsonLd(opts: {
  id: string;
  name: string;
  url: string;
  description: string;
  category?: string;
  subCategory?: string;
  features?: string[];
  rating?: { value: string; count: string };
  image?: string;
  inLanguage?: string[];
}) {
  const url = opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`;
  const image = opts.image
    ? opts.image.startsWith("http")
      ? opts.image
      : `${SITE_URL}${opts.image}`
    : `${SITE_URL}/opengraph-image`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: opts.name,
    url,
    description: opts.description,
    image,
    applicationCategory: opts.category ?? "BusinessApplication",
    applicationSubCategory: opts.subCategory ?? "Artificial Intelligence",
    operatingSystem: "Web, iOS, Android",
    inLanguage: opts.inLanguage ?? ["en", "hi"],
    featureList: opts.features ?? [],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    ...(opts.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: opts.rating.value,
            ratingCount: opts.rating.count,
            reviewCount: opts.rating.count,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    publisher: { "@id": `${SITE_URL}#organization` },
    isPartOf: { "@id": `${SITE_URL}#software` },
  };
}

export function webPageJsonLd(opts: {
  url: string;
  name: string;
  description: string;
  breadcrumb?: { name: string; url: string }[];
  speakable?: boolean;
  primaryImage?: string;
}) {
  const url = opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}#website` },
    inLanguage: "en",
    primaryImageOfPage: opts.primaryImage
      ? {
          "@type": "ImageObject",
          url: opts.primaryImage.startsWith("http")
            ? opts.primaryImage
            : `${SITE_URL}${opts.primaryImage}`,
        }
      : undefined,
    ...(opts.speakable
      ? {
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", "h2", "main p"],
          },
        }
      : {}),
    ...(opts.breadcrumb
      ? {
          breadcrumb: breadcrumbJsonLd(opts.breadcrumb),
        }
      : {}),
  };
}

export function itemListJsonLd(opts: {
  name: string;
  items: { name: string; url: string; description?: string; image?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    numberOfItems: opts.items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: opts.items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
      ...(item.image
        ? {
            image: item.image.startsWith("http") ? item.image : `${SITE_URL}${item.image}`,
          }
        : {}),
    })),
  };
}

export function collectionPageJsonLd(opts: {
  url: string;
  name: string;
  description: string;
  itemList?: ReturnType<typeof itemListJsonLd>;
}) {
  const url = opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}#website` },
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}#organization` },
    ...(opts.itemList ? { mainEntity: opts.itemList } : {}),
  };
}

export function serviceJsonLd(opts: {
  name: string;
  url: string;
  description: string;
  serviceType: string;
  areaServed?: string[];
}) {
  const url = opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    url,
    description: opts.description,
    serviceType: opts.serviceType,
    provider: { "@id": `${SITE_URL}#organization` },
    areaServed: (opts.areaServed ?? ["Worldwide"]).map((a) => ({
      "@type": "Place",
      name: a,
    })),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

export function howToJsonLd(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string; url?: string }[];
  totalTime?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    ...(opts.image
      ? {
          image: opts.image.startsWith("http") ? opts.image : `${SITE_URL}${opts.image}`,
        }
      : {}),
    step: opts.steps.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.name,
      text: s.text,
      ...(s.url
        ? {
            url: s.url.startsWith("http") ? s.url : `${SITE_URL}${s.url}`,
          }
        : {}),
    })),
  };
}
