import type { Metadata } from "next";
import { LedgerAuthProvider } from "@/contexts/LedgerAuthContext";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Smart Ledger — AI-Powered Satti Accounting for Grain Traders",
  description:
    "Upload your handwritten satti (account book). Smart Ledger by Plyndrox extracts, groups, and analyzes your grain trading records instantly using AI — free for traders.",
  path: "/ledger",
  keywords: [
    "smart ledger",
    "AI accounting",
    "grain trader accounting",
    "satti AI",
    "handwritten ledger OCR",
    "AI bookkeeping India",
    "free accounting AI",
  ],
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
      {children}
    </LedgerAuthProvider>
  );
}
