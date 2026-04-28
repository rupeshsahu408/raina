import type { Metadata } from "next";
import { LedgerAuthProvider } from "@/contexts/LedgerAuthContext";
import { buildMetadata, breadcrumbJsonLd, productAppJsonLd, faqJsonLd, productKeywords } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const ledgerFaqs = [
  {
    question: "What is Smart Ledger?",
    answer:
      "Smart Ledger is an AI tool by Plyndrox that turns handwritten satti (account books) into a structured digital ledger. It uses Google Vision OCR plus Gemini AI to extract entries, group them by commodity, calculate totals, and produce business summaries.",
  },
  {
    question: "Is Smart Ledger free?",
    answer:
      "Yes. Smart Ledger is free for grain traders and small businesses. There are no per-page or per-month charges.",
  },
  {
    question: "Can I export my ledger?",
    answer:
      "Yes. Each session can be exported as CSV or branded PDF, and shared by WhatsApp directly from the dashboard.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Smart Ledger — AI-Powered Satti Accounting for Grain Traders",
  description:
    "Upload your handwritten satti (account book). Smart Ledger by Plyndrox extracts, groups, and analyzes your grain trading records instantly using AI — free for traders.",
  path: "/ledger",
  keywords: [...productKeywords.ledger],
});

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  return (
    <LedgerAuthProvider>
      <JsonLd
        id="ld-breadcrumb-ledger"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Smart Ledger", url: "/ledger" },
        ])}
      />
      <JsonLd id="ld-faq-ledger" data={faqJsonLd(ledgerFaqs)} />
      <JsonLd
        id="ld-app-ledger"
        data={productAppJsonLd({
          id: "ledger",
          name: "Plyndrox Smart Ledger",
          url: "/ledger",
          description:
            "AI-powered satti accounting for grain traders. Upload handwritten ledgers and Smart Ledger extracts, groups, and analyzes records using Google Vision and Gemini.",
          subCategory: "AI Accounting and Bookkeeping",
          features: [
            "Image OCR for handwritten satti",
            "AI commodity grouping and totals",
            "Inline edit with live recalculation",
            "Daily, monthly, yearly business summaries",
            "Branded PDF and CSV export",
            "WhatsApp share for clients and partners",
          ],
          rating: { value: "4.8", count: "147" },
        })}
      />
      {children}
    </LedgerAuthProvider>
  );
}
