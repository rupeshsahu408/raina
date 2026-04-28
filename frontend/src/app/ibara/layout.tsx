import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

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
      {children}
    </>
  );
}
