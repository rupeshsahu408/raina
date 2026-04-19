import type { Metadata } from "next";
import { LedgerAuthProvider } from "@/contexts/LedgerAuthContext";

export const metadata: Metadata = {
  title: "Smart Ledger — AI-Powered Satti Accounting for Grain Traders",
  description:
    "Upload your handwritten satti. Smart Ledger extracts, groups, and analyzes your grain trading records instantly using AI.",
};

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  return <LedgerAuthProvider>{children}</LedgerAuthProvider>;
}
