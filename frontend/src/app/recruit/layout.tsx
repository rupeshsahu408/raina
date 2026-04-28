import type { Metadata } from "next";
import { RecruitAuthProvider } from "@/contexts/RecruitAuthContext";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Recruit AI — Free AI Hiring & ATS for Modern Teams",
  description:
    "Plyndrox Recruit AI is a free AI-powered ATS that sources candidates, screens resumes, scores fit, and runs your hiring pipeline end-to-end — for startups, agencies, and enterprise teams.",
  path: "/recruit",
  keywords: [
    "AI recruiting",
    "AI ATS",
    "free recruiting software",
    "AI resume screening",
    "AI hiring platform",
    "talent pool AI",
    "Plyndrox Recruit",
  ],
});

export default function RecruitLayout({ children }: { children: React.ReactNode }) {
  return (
    <RecruitAuthProvider>
      <JsonLd
        id="ld-breadcrumb-recruit"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Recruit AI", url: "/recruit" },
        ])}
      />
      {children}
    </RecruitAuthProvider>
  );
}
