import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, productAppJsonLd, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const payablesFaqs = [
  {
    question: "What does Plyndrox Payable AI do?",
    answer:
      "Payable AI extracts invoice data with AI OCR, detects duplicates and fraud, schedules payments, exports to Tally, Zoho Books, and QuickBooks, and gives a daily AP health score — all from your Gmail or uploads.",
  },
  {
    question: "Is Plyndrox Payable AI free?",
    answer:
      "Yes. Payable AI is free for individuals and businesses. There are no per-invoice or per-vendor fees.",
  },
  {
    question: "Does it support Indian invoices and GSTIN?",
    answer:
      "Yes. Payable AI normalizes Indian currency formats (₹, lakhs, crores), parses comma-grouped amounts like 1,74,500.00, and captures supplier GSTIN, buyer GSTIN, and HSN codes.",
  },
  {
    question: "Can I import invoices directly from Gmail?",
    answer:
      "Yes. Connect a Gmail account once and Payable AI automatically scans for invoice emails every two hours, processes attachments, and adds them to your dashboard.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Payable AI — Free AI Invoice & Accounts Payable Automation",
  description:
    "Plyndrox Payable AI extracts invoice data, matches POs, schedules payments, and tracks vendor performance — automating your accounts payable workflow end-to-end.",
  path: "/payables",
  keywords: [
    "AI invoice processing",
    "accounts payable automation",
    "AP automation",
    "invoice OCR",
    "AI vendor management",
    "free invoice AI",
    "payables AI",
  ],
});

export default function PayablesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-payables"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Payable AI", url: "/payables" },
        ])}
      />
      <JsonLd id="ld-faq-payables" data={faqJsonLd(payablesFaqs)} />
      <JsonLd
        id="ld-app-payables"
        data={productAppJsonLd({
          id: "payables",
          name: "Plyndrox Payable AI",
          url: "/payables",
          description:
            "Free AI accounts payable automation: invoice OCR, duplicate detection, payment scheduling, vendor intelligence, and accounting export to Tally, Zoho, and QuickBooks.",
          subCategory: "Accounts Payable Automation",
          features: [
            "AI invoice OCR and field extraction",
            "Duplicate invoice and fraud detection",
            "Approval rules and team workflows",
            "Smart payment scheduler with urgency buckets",
            "Vendor intelligence and spend analytics",
            "Export to Tally Prime, Zoho Books, and QuickBooks",
            "Email-based supplier upload portal",
            "Daily AP health score and action plan",
          ],
          rating: { value: "4.9", count: "318" },
        })}
      />
      {children}
    </>
  );
}
