import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, productKeywords } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Personal AI Chat — Free Emotional & Productive AI Companion",
  description:
    "Chat with Plyndrox Personal AI — your free, private AI companion for thinking out loud, planning your day, learning new things, and getting honest emotional support, anytime.",
  path: "/chat",
  keywords: [...productKeywords.chat],
});

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-chat"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Personal AI", url: "/chat" },
        ])}
      />
      {children}
    </>
  );
}
