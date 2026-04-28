import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, productAppJsonLd, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const ibaraFaqs = [
  {
    question: "What is Ibara?",
    answer:
      "Ibara is the embeddable AI chat widget by Plyndrox. Paste one script tag on any website and your visitors get an AI assistant that answers questions, captures leads, and works in 100+ languages.",
  },
  {
    question: "How long does it take to install Ibara?",
    answer:
      "About 60 seconds. Copy the Ibara script tag from your dashboard, paste it before the closing body tag of your website, and the widget is live.",
  },
  {
    question: "Is Ibara free?",
    answer: "Yes. Ibara is free for personal websites and business websites worldwide.",
  },
  {
    question: "Can Ibara learn from my website content?",
    answer:
      "Yes. You can train Ibara from your URL, FAQ files, PDFs, or pasted text so it answers in your brand voice.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Ibara — Free Embeddable AI Chat Widget for Any Website",
  description:
    "Add a powerful AI chat widget to your website in 60 seconds. Ibara by Plyndrox answers visitor questions, captures leads, and works in 100+ languages — completely free.",
  path: "/ibara",
  keywords: [
    "Ibara",
    "AI chat widget",
    "embeddable AI chatbot",
    "free chatbot for website",
    "AI website assistant",
    "chatbot widget",
    "lead capture chatbot",
  ],
});

export default function IbaraLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-ibara"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Ibara", url: "/ibara" },
        ])}
      />
      <JsonLd id="ld-faq-ibara" data={faqJsonLd(ibaraFaqs)} />
      <JsonLd
        id="ld-app-ibara"
        data={productAppJsonLd({
          id: "ibara",
          name: "Ibara — Plyndrox AI Chat Widget",
          url: "/ibara",
          description:
            "Free embeddable AI chat widget for any website. Add a multilingual AI assistant that answers visitors and captures leads in under 60 seconds.",
          subCategory: "Website Chat Widget",
          features: [
            "One-tag install on any website",
            "Multilingual replies in 100+ languages",
            "Train from URL, FAQ, PDF, or text",
            "Lead capture with email and phone",
            "Customizable colors, position, and avatar",
            "Live conversation analytics",
          ],
          rating: { value: "4.9", count: "186" },
        })}
      />
      {children}
    </>
  );
}
