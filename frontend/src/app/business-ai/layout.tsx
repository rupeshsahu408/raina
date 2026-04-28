import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Business AI Suite — Free AI for Sales, Support & Operations",
  description:
    "Plyndrox Business AI brings WhatsApp automation, AI email triage, invoice processing, AI hiring, and a smart ledger into one free platform built for small and medium businesses.",
  path: "/business-ai",
  keywords: [
    "AI for business",
    "small business AI",
    "AI suite",
    "free business automation",
    "AI sales",
    "AI customer support",
    "AI operations",
  ],
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
      {children}
    </>
  );
}
