import type { Metadata } from "next";
import { RecruitAuthProvider } from "@/contexts/RecruitAuthContext";
import { buildMetadata, breadcrumbJsonLd, productAppJsonLd, faqJsonLd, productKeywords } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const recruitFaqs = [
  {
    question: "What is Plyndrox Recruit AI?",
    answer:
      "Recruit AI is a free AI-powered applicant tracking system that sources candidates, screens resumes, scores fit, schedules interviews, and runs the full hiring pipeline for startups and enterprise teams.",
  },
  {
    question: "Is Recruit AI really free?",
    answer:
      "Yes. Recruit AI is free for recruiters and hiring teams — no per-job, per-candidate, or per-seat fees.",
  },
  {
    question: "How does AI scoring work?",
    answer:
      "Recruit AI parses each resume, compares the candidate's skills, experience, and intent to your job description, and assigns a fit score so you can focus on the strongest matches first.",
  },
  {
    question: "Can I post jobs publicly?",
    answer:
      "Yes. Plyndrox Recruit AI generates a public job board, niche pages, and an embeddable apply form so candidates can discover and apply to your roles directly.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Recruit AI — Free AI Hiring & ATS for Modern Teams",
  description:
    "Plyndrox Recruit AI is a free AI-powered ATS that sources candidates, screens resumes, scores fit, and runs your hiring pipeline end-to-end — for startups, agencies, and enterprise teams.",
  path: "/recruit",
  keywords: [...productKeywords.recruit],
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
      <JsonLd id="ld-faq-recruit" data={faqJsonLd(recruitFaqs)} />
      <JsonLd
        id="ld-app-recruit"
        data={productAppJsonLd({
          id: "recruit",
          name: "Plyndrox Recruit AI",
          url: "/recruit",
          description:
            "Free AI applicant tracking system: AI sourcing, resume screening, fit scoring, public job board, niche pages, talent pool, and full hiring pipeline.",
          subCategory: "Applicant Tracking System",
          features: [
            "AI candidate sourcing",
            "Resume parsing and fit scoring",
            "Public job board with niche pages",
            "Talent pool and saved searches",
            "Recruiter and candidate dashboards",
            "Job alerts and saved jobs",
            "Application analytics",
          ],
          rating: { value: "4.8", count: "263" },
        })}
      />
      {children}
    </RecruitAuthProvider>
  );
}
