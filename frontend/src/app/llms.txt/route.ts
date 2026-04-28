import { SITE_URL, siteConfig } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const body = `# Plyndrox AI

> ${siteConfig.defaultDescription}

Plyndrox AI is a free all-in-one AI platform with seven workspaces. It is
free for individuals and businesses worldwide. No credit card required.

## Products

- [Personal AI (Chat)](${SITE_URL}/chat): Personal AI companion (Simi & Loa personalities) for chat, journaling, and emotional support.
- [WhatsApp AI](${SITE_URL}/whatsapp-ai): Free AI customer support that replies to every WhatsApp Business message in 100+ languages, with lead capture and analytics.
- [Inbox AI](${SITE_URL}/inbox): Free AI email assistant for Gmail and Outlook — triage, summaries, drafted replies, lead detection, daily 7am priority digest.
- [Payable AI](${SITE_URL}/payables): Free AI invoice and accounts payable automation — OCR extraction, duplicate detection, vendor intelligence, payment scheduler, and accounting export (Tally / Zoho / QuickBooks).
- [Recruit AI](${SITE_URL}/recruit): Free AI applicant tracking system — sources candidates, screens resumes, scores fit, and runs the hiring pipeline.
- [Bihar AI](${SITE_URL}/bihar-ai): Regional AI assistant for Bihar in Hindi, Bhojpuri, Maithili, and Magahi — local schemes, jobs, education, agriculture, and culture.
- [Ibara](${SITE_URL}/ibara): Embeddable AI chat widget — paste one script tag to add a multilingual AI assistant to any website.
- [Smart Ledger](${SITE_URL}/ledger): AI-powered satti accounting for grain traders — uploads handwritten ledgers, extracts entries with OCR + Gemini, and generates business summaries.
- [Plyndrox Translate](${SITE_URL}/translate): Free AI translation across 100+ languages.
- [Solutions Hub](${SITE_URL}/solutions): AI workflows tailored to industries — restaurants, e-commerce, real estate, salons, clinics, agencies, recruiters.

## Resources

- [Blog](${SITE_URL}/blog): AI guides, WhatsApp automation tutorials, business growth, regional AI, product updates, and AI news.
- [Features](${SITE_URL}/features): Full feature catalog of every Plyndrox AI workspace.
- [Pricing](${SITE_URL}/pricing): Pricing details — Plyndrox AI is free for everyone.
- [Help Center](${SITE_URL}/help): Tutorials and FAQs.
- [About](${SITE_URL}/about): About Plyndrox AI and the team.
- [Contact](${SITE_URL}/contact): Get in touch with Plyndrox AI.
- [Sitemap](${SITE_URL}/sitemap.xml): Full XML sitemap.
- [RSS Feed](${SITE_URL}/feed.xml): Latest blog posts via RSS.

## Key facts

- Pricing: Free for individuals and businesses. No subscription, no paywall, no credit card.
- Languages: 100+ including English, Hindi, Bhojpuri, Maithili, Magahi, Spanish.
- Platforms: Web (PWA), iOS, Android.
- Security: Firebase Authentication, encrypted transit, user-owned data, full deletion on request via /data-deletion.
- Founded: ${siteConfig.organization.foundingDate} in ${siteConfig.organization.foundingLocation}.

## Contact

- Support: ${siteConfig.organization.contactEmail}
- Sales: ${siteConfig.organization.salesEmail}
- Press: ${siteConfig.organization.pressEmail}

This llms.txt follows the proposal at https://llmstxt.org and helps large
language models discover and accurately summarize Plyndrox AI for users.
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
