import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, productAppJsonLd, faqJsonLd, productKeywords } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const inboxFaqs = [
  {
    question: "What does Plyndrox Inbox AI do?",
    answer:
      "Inbox AI connects to your Gmail or Outlook, triages and summarizes new emails, drafts replies in your tone, detects sales leads, and sends a daily 7am priority digest — so you reach inbox zero faster.",
  },
  {
    question: "Is Inbox AI free?",
    answer: "Yes. Inbox AI is free for personal and business email accounts.",
  },
  {
    question: "Does it work with Gmail and Outlook?",
    answer:
      "Yes. Inbox AI connects through secure OAuth to Gmail and Outlook, with read-only and reply scopes you can control.",
  },
  {
    question: "Can it write replies in my tone?",
    answer:
      "Yes. Inbox AI learns from your past sent messages to draft replies that sound like you, with options for short, friendly, or formal tone.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Inbox AI — Free AI Email Assistant for Gmail & Outlook",
  description:
    "Plyndrox Inbox AI reads, summarizes, prioritizes, and replies to your emails for you. Auto-detect leads, draft follow-ups, and clear your inbox in minutes — free forever.",
  path: "/inbox",
  keywords: [...productKeywords.inbox],
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
      <JsonLd id="ld-faq-inbox" data={faqJsonLd(inboxFaqs)} />
      <JsonLd
        id="ld-app-inbox"
        data={productAppJsonLd({
          id: "inbox",
          name: "Plyndrox Inbox AI",
          url: "/inbox",
          description:
            "Free AI email assistant for Gmail and Outlook — triage, summarize, draft replies, detect leads, and clear your inbox in minutes.",
          subCategory: "Email Productivity",
          features: [
            "Daily 7am priority digest",
            "AI-drafted replies in your tone",
            "Lead detection inside the inbox",
            "Smart follow-up reminders",
            "One-click summaries of long threads",
            "Inbox health score and trends",
          ],
          rating: { value: "4.8", count: "274" },
        })}
      />
      {children}
    </>
  );
}
