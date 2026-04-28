import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, productAppJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "WhatsApp AI — Free AI Chatbot for WhatsApp Business",
  description:
    "Automate customer conversations on WhatsApp with Plyndrox WhatsApp AI. 24/7 multilingual replies, lead capture, smart routing, and zero monthly fees — set up in minutes.",
  path: "/whatsapp-ai",
  keywords: [
    "WhatsApp AI",
    "WhatsApp chatbot",
    "WhatsApp Business API",
    "free WhatsApp automation",
    "WhatsApp AI agent",
    "AI for WhatsApp business",
    "WhatsApp customer support AI",
  ],
});

const faqs = [
  {
    question: "Is Plyndrox WhatsApp AI free to use?",
    answer:
      "Yes. Plyndrox WhatsApp AI is free for individuals and businesses worldwide. There are no monthly subscription fees or paywalls.",
  },
  {
    question: "How long does it take to set up WhatsApp AI?",
    answer:
      "Most businesses connect their WhatsApp number, train the AI on their FAQs, and go live within 10 minutes.",
  },
  {
    question: "Which languages does Plyndrox WhatsApp AI support?",
    answer:
      "Plyndrox WhatsApp AI replies in over 100 languages and dialects, including Hindi, English, Spanish, Arabic, Portuguese, and regional Indian languages.",
  },
  {
    question: "Can it handle lead capture and customer support?",
    answer:
      "Yes. The AI captures leads, qualifies prospects, answers FAQs, and routes complex conversations to a human agent when required.",
  },
];

export default function WhatsAppAILayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-whatsapp"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "WhatsApp AI", url: "/whatsapp-ai" },
        ])}
      />
      <JsonLd id="ld-faq-whatsapp" data={faqJsonLd(faqs)} />
      <JsonLd
        id="ld-app-whatsapp"
        data={productAppJsonLd({
          id: "whatsapp-ai",
          name: "Plyndrox WhatsApp AI",
          url: "/whatsapp-ai",
          description:
            "Free AI customer support that replies to every WhatsApp Business message in under 2 seconds — in 100+ languages, with lead capture and analytics.",
          subCategory: "WhatsApp Business Automation",
          features: [
            "Unlimited AI replies on WhatsApp Business",
            "Lead capture with name, phone, and intent",
            "Smart escalation to a human agent",
            "Multilingual replies in 100+ languages",
            "Knowledge base from FAQs, PDFs, or URL",
            "Analytics for top questions, conversions, drop-offs",
          ],
          rating: { value: "4.9", count: "412" },
        })}
      />
      {children}
    </>
  );
}
