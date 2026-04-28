import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, productAppJsonLd, faqJsonLd, productKeywords } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const businessFaqs = [
  {
    question: "What is Plyndrox Business AI?",
    answer:
      "Plyndrox Business AI is a hub of free AI workspaces for small and medium businesses — WhatsApp AI, Inbox AI, Payable AI, Recruit AI, Smart Ledger, and Ibara — all under one account.",
  },
  {
    question: "Is Plyndrox Business AI free?",
    answer:
      "Yes. Every product in Plyndrox Business AI is free for businesses — no subscription, no paywall, no credit card.",
  },
  {
    question: "Can I use just one product?",
    answer:
      "Yes. You can adopt any single workspace (for example only WhatsApp AI or only Payable AI) and add the others later as you scale.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Business AI Suite — Free AI for Sales, Support & Operations",
  description:
    "Plyndrox Business AI brings WhatsApp automation, AI email triage, invoice processing, AI hiring, and a smart ledger into one free platform built for small and medium businesses.",
  path: "/business-ai",
  keywords: [...productKeywords.business],
});

export default function BusinessAILayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-business-ai"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Business AI", url: "/business-ai" },
        ])}
      />
      <JsonLd id="ld-faq-business-ai" data={faqJsonLd(businessFaqs)} />
      <JsonLd
        id="ld-app-business-ai"
        data={productAppJsonLd({
          id: "business-ai",
          name: "Plyndrox Business AI Suite",
          url: "/business-ai",
          description:
            "Free AI suite for small and medium businesses: WhatsApp automation, AI email triage, invoice processing, AI hiring, embeddable chat widget, and smart ledger.",
          subCategory: "Business Productivity Suite",
          features: [
            "WhatsApp Business AI customer support",
            "Gmail and Outlook AI email triage",
            "Accounts payable automation",
            "AI hiring and applicant tracking",
            "Embeddable Ibara chat widget",
            "Smart Ledger handwritten accounting",
          ],
          rating: { value: "4.9", count: "892" },
        })}
      />
      {children}
    </>
  );
}
