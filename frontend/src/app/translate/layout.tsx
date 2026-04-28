import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, productKeywords } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Plyndrox Translate — Free AI Translator in 100+ Languages",
  description:
    "Translate text naturally into 100+ world languages with AI. Auto-corrects typos, sounds human, and offers simple explanations. Free, no signup, no chat history saved.",
  path: "/translate",
  keywords: [...productKeywords.translate],
});

export default function TranslateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-translate"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Translate", url: "/translate" },
        ])}
      />
      {children}
    </>
  );
}
