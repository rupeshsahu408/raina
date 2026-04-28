import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

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
      {children}
    </>
  );
}
