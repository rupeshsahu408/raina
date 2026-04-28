import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Bihar AI — Regional AI Assistant for Bihar in Hindi & Bhojpuri",
  description:
    "Bihar AI is the first AI assistant built for Bihar — fluent in Hindi, Bhojpuri, Maithili, and Magahi. Get answers about local schemes, jobs, education, agriculture, and culture.",
  path: "/bihar-ai",
  keywords: [
    "Bihar AI",
    "Hindi AI assistant",
    "Bhojpuri AI",
    "Maithili AI",
    "regional AI India",
    "AI for Bihar",
    "AI in Hindi",
    "Bihar government schemes AI",
  ],
});

export default function BiharAILayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-bihar"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Bihar AI", url: "/bihar-ai" },
        ])}
      />
      {children}
    </>
  );
}
