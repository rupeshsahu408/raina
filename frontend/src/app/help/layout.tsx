import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Help Center — Plyndrox AI Support, Guides & FAQs",
  description:
    "Get help with Plyndrox AI. Browse guides, FAQs, and tutorials for WhatsApp AI, Inbox AI, Payable AI, Recruit AI, Smart Ledger, and more.",
  path: "/help",
  keywords: ["Plyndrox help", "Plyndrox support", "AI tutorials", "Plyndrox FAQ", "AI guides"],
});

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-help"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Help Center", url: "/help" },
        ])}
      />
      {children}
    </>
  );
}
