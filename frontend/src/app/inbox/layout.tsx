import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Inbox AI — Free AI Email Assistant for Gmail & Outlook",
  description:
    "Plyndrox Inbox AI reads, summarizes, prioritizes, and replies to your emails for you. Auto-detect leads, draft follow-ups, and clear your inbox in minutes — free forever.",
  path: "/inbox",
  keywords: [
    "AI email assistant",
    "Inbox AI",
    "Gmail AI",
    "AI email automation",
    "AI email reply",
    "AI inbox zero",
    "lead detection email",
  ],
});

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-inbox"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Inbox AI", url: "/inbox" },
        ])}
      />
      {children}
    </>
  );
}
