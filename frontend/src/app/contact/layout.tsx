import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Contact Plyndrox AI — Talk to Our Team",
  description:
    "Get in touch with Plyndrox AI for product questions, partnerships, support, or press inquiries. We reply to every message within 24 hours.",
  path: "/contact",
  keywords: ["contact Plyndrox", "Plyndrox support", "AI platform support", "Plyndrox partnerships"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-contact"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />
      {children}
    </>
  );
}
