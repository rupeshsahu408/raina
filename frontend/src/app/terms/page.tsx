import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Vercal AI",
  description:
    "Comprehensive Terms of Service for Vercal AI, including Ivana AI and WhatsApp AI platform usage terms.",
};

const tableOfContents = [
  ["Introduction", "introduction"],
  ["Definitions", "definitions"],
  ["Eligibility and Account Registration", "eligibility-and-account-registration"],
  ["Description of Services", "description-of-services"],
  ["Acceptable Use Policy", "acceptable-use-policy"],
  ["User Responsibilities", "user-responsibilities"],
  ["AI Output Disclaimer", "ai-output-disclaimer"],
  ["Payments, Subscriptions, and Billing", "payments-subscriptions-and-billing"],
  ["Intellectual Property Rights", "intellectual-property-rights"],
  ["Third-Party Services", "third-party-services"],
  ["Data Usage Reference", "data-usage-reference"],
  ["Service Availability and Modifications", "service-availability-and-modifications"],
  ["Termination and Suspension", "termination-and-suspension"],
  ["Limitation of Liability", "limitation-of-liability"],
  ["Indemnification", "indemnification"],
  ["Governing Law", "governing-law"],
  ["Changes to Terms", "changes-to-terms"],
  ["Contact Information", "contact-information"],
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(168,85,247,0.20),transparent_34%),radial-gradient(circle_at_90%_8%,rgba(56,189,248,0.12),transparent_28%),linear-gradient(180deg,#050506,#08080a_42%,#030304)]" />
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 transition group-hover:border-purple-300/40">
              <img src="/evara-logo.png" alt="Vercal AI" className="h-7 w-7 object-contain" draggable={false} />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[0.22em] text-white uppercase">Vercal AI</span>
              <span className="block text-xs text-zinc-500">Terms of Service</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/privacy-policy" className="hidden rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-xs font-semibold text-purple-200 transition hover:bg-purple-300/15 sm:inline-flex">
              Privacy Policy
            </Link>
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-purple-200">Table of Contents</p>
              <nav className="mt-5 space-y-1" aria-label="Terms sections">
                {tableOfContents.map(([label, id]) => (
                  <a key={id} href={`#${id}`} className="block rounded-2xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.07] hover:text-white">
                    {label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Services Covered</p>
                <div className="mt-3 space-y-2 text-sm text-zinc-400">
                  <p>Ivana AI — Web/App AI assistant</p>
                  <p>WhatsApp AI — WhatsApp Business API automation</p>
                </div>
              </div>
            </div>
          </aside>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8 lg:p-10">
            <div className="border-b border-white/10 pb-8">
              <p className="inline-flex rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-purple-200">
                Legal Agreement
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Terms of Service
              </h1>
              <p className="mt-4 text-sm text-zinc-500">
                Last updated: April 12, 2026 · Effective date: April 12, 2026
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">
                These Terms of Service constitute a legally binding agreement between you and Vercal AI governing access to and use of Vercal.app, Ivana AI, WhatsApp AI, websites, dashboards, applications, APIs, integrations, and related services. Please read this document carefully before using any part of the platform.
              </p>
            </div>

            <div className="mt-10 space-y-12">
              <TermsSection id="introduction" title="1. Introduction">
                <p>
                  Vercal AI provides artificial intelligence software services for individuals, creators, professionals, and businesses. The platform includes Ivana AI, a web and app-based AI assistant experience, and WhatsApp AI, a business automation service that may integrate with the WhatsApp Business API and related Meta platform services. These services are separate product experiences but are governed by these Terms unless service-specific terms state otherwise.
                </p>
                <p>
                  These Terms apply to your access to and use of all Vercal AI services, including websites, applications, dashboards, APIs, automations, AI chat features, WhatsApp automation features, support services, documentation, and future products or features that reference these Terms. By accessing or using the Services, creating an account, connecting an integration, submitting content, or using any AI-generated output, you agree to be bound by these Terms and by our Privacy Policy.
                </p>
                <p>
                  If you use the Services on behalf of a company, organization, or other legal entity, you represent and warrant that you have authority to bind that entity to these Terms. In that case, “you” and “your” refer both to you individually and to the entity you represent. If you do not agree to these Terms, you must not access or use the Services.
                </p>
              </TermsSection>

              <TermsSection id="definitions" title="2. Definitions">
                <p>For purposes of these Terms, the following definitions apply:</p>
                <DefinitionList items={[
                  ["Service or Services", "The Vercal AI websites, web applications, mobile or progressive web applications, dashboards, APIs, AI assistant functions, WhatsApp automation functions, documentation, support services, and related software or features."],
                  ["Platform", "The Vercal.app software environment, interface, infrastructure, and related technology through which the Services are made available."],
                  ["User", "Any individual or entity that accesses or uses the Services, including account holders, administrators, team members, website visitors, business customers, and authorized representatives."],
                  ["Ivana AI", "The Vercal AI web/app assistant service that allows users to submit prompts, questions, instructions, messages, and context to receive AI-generated responses."],
                  ["WhatsApp AI", "The Vercal AI business automation service that connects to the WhatsApp Business API or related Meta tools to process business messages, automate replies, and support customer communication."],
                  ["Content", "Any text, data, prompts, instructions, files, documents, business knowledge, customer messages, media, configurations, feedback, or other material submitted, uploaded, transmitted, generated, or displayed through the Services."],
                  ["User Content", "Content submitted, uploaded, provided, configured, or transmitted by or on behalf of a User, including business information, prompts, WhatsApp messages, and customer support materials."],
                  ["AI Output", "Any response, suggestion, classification, summary, message, analysis, automation result, or other material generated by artificial intelligence systems through the Services."],
                  ["Third-party Services", "Products, APIs, platforms, models, infrastructure, software, analytics tools, authentication providers, payment processors, Meta services, WhatsApp Business API, or other services not owned or controlled by Vercal AI."],
                  ["WhatsApp Integration", "The connection between WhatsApp AI and WhatsApp Business API functionality, including business phone numbers, webhook events, Meta developer tools, credentials, message templates, and related configuration."],
                ]} />
              </TermsSection>

              <TermsSection id="eligibility-and-account-registration" title="3. Eligibility and Account Registration">
                <SubSection title="3.1 Eligibility">
                  <p>
                    You must be at least eighteen (18) years old, or the age of legal majority in your jurisdiction, whichever is higher, to use the Services. If you access or use the Services on behalf of a business or other entity, you must have legal authority to act on behalf of that entity and to bind it to these Terms.
                  </p>
                </SubSection>
                <SubSection title="3.2 Account Creation Requirements">
                  <p>
                    Certain features require account registration. You agree to provide accurate, current, complete, and non-misleading information during registration and to keep such information updated. We may reject, suspend, or terminate an account if information appears inaccurate, fraudulent, unauthorized, unlawful, or inconsistent with these Terms.
                  </p>
                </SubSection>
                <SubSection title="3.3 Account Security">
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials, devices, sessions, API keys, integration tokens, administrative access, and all activities occurring under your account. You must promptly notify us if you suspect unauthorized access, credential compromise, security breach, or misuse of your account.
                  </p>
                </SubSection>
                <SubSection title="3.4 Business Accounts and Authority">
                  <p>
                    If you register a business account, connect WhatsApp AI, upload business verification materials, invite team members, or configure automation on behalf of a business, you represent that you are duly authorized to do so and that all business information provided is accurate and lawful.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="description-of-services" title="4. Description of Services">
                <SubSection title="4.1 Ivana AI">
                  <p>
                    Ivana AI provides AI chatbot and assistant functionality through a web or application interface. Users may submit prompts, questions, instructions, files, or contextual information and receive AI-generated responses. Ivana AI may support conversation history, personalization, productivity support, general information, drafting, summarization, and other assistant-like features.
                  </p>
                  <p>
                    AI-generated responses are probabilistic and may not be accurate, complete, current, lawful, appropriate, or suitable for every use case. Ivana AI is not a substitute for professional advice, including medical, legal, financial, tax, mental health, employment, safety, or other regulated advice. You are responsible for reviewing and validating AI Output before relying on it.
                  </p>
                </SubSection>
                <SubSection title="4.2 WhatsApp AI">
                  <p>
                    WhatsApp AI provides business automation features that may connect to the WhatsApp Business API and Meta platform tools. It may receive customer messages, apply business instructions and knowledge base content, generate AI-assisted replies, automate responses, classify requests, maintain conversation logs, and assist businesses in managing customer communication.
                  </p>
                  <p>
                    WhatsApp AI depends on third-party systems, including Meta and the WhatsApp Business API. Access, delivery, templates, account status, phone number status, message limits, pricing, verification, policy enforcement, and platform availability may be controlled by Meta or other third parties. Vercal AI does not guarantee continued availability of any WhatsApp or Meta functionality.
                  </p>
                  <p>
                    Business customers remain responsible for reviewing automation behavior, ensuring that replies are accurate and lawful, obtaining customer consent, complying with WhatsApp and Meta policies, and maintaining appropriate human oversight where required.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="acceptable-use-policy" title="5. Acceptable Use Policy">
                <p>You agree that you will not, and will not permit others to, use the Services to:</p>
                <ul>
                  <li>Engage in unlawful, harmful, fraudulent, deceptive, abusive, harassing, discriminatory, defamatory, invasive, exploitative, or otherwise objectionable activity.</li>
                  <li>Send spam, bulk unsolicited messages, unauthorized marketing, phishing content, deceptive messages, or communications without legally required consent.</li>
                  <li>Violate WhatsApp Business policies, Meta platform terms, developer policies, messaging rules, template policies, commerce policies, or any applicable third-party service terms.</li>
                  <li>Generate, distribute, or automate harmful, misleading, impersonating, fraudulent, violent, sexually exploitative, extremist, hateful, or policy-violating content.</li>
                  <li>Misrepresent identity, affiliation, authorization, business verification status, product availability, pricing, legal terms, or customer obligations.</li>
                  <li>Upload or process data you do not have the right to use, including data obtained unlawfully or without required consent.</li>
                  <li>Reverse-engineer, decompile, disassemble, scrape, crawl, probe, exploit, copy, benchmark for competitive purposes, or attempt to discover source code, models, prompts, architecture, or security measures.</li>
                  <li>Interfere with, overload, disrupt, degrade, or gain unauthorized access to the Services, accounts, infrastructure, integrations, APIs, or networks.</li>
                  <li>Bypass rate limits, access controls, content safeguards, usage restrictions, billing mechanisms, authentication systems, or security protections.</li>
                  <li>Use the Services to develop competing products or to provide unauthorized resale, sublicensing, outsourcing, service bureau, or managed service access without written permission.</li>
                </ul>
              </TermsSection>

              <TermsSection id="user-responsibilities" title="6. User Responsibilities">
                <p>You are solely responsible for your use of the Services, User Content, AI Output used or distributed by you, business configuration, connected integrations, and communications sent through or based on the Services.</p>
                <ul>
                  <li><strong>Legal compliance:</strong> You must comply with all laws, regulations, industry rules, consumer protection obligations, data protection laws, advertising rules, telecommunications rules, and platform policies applicable to your use.</li>
                  <li><strong>AI Output usage:</strong> You must evaluate AI Output for accuracy, suitability, legality, safety, and appropriateness before using, publishing, sending, relying on, or making decisions based on it.</li>
                  <li><strong>Customer consent:</strong> For WhatsApp AI, you are responsible for obtaining and maintaining all required customer consents, opt-ins, notices, and lawful bases for messaging and AI-assisted processing.</li>
                  <li><strong>Business verification:</strong> You must provide truthful and complete business information where required for Meta, WhatsApp, Vercal AI, or other platform compliance.</li>
                  <li><strong>Human oversight:</strong> You must use appropriate review and escalation procedures when AI automation may affect customer rights, purchases, complaints, health, safety, finance, legal obligations, or other important matters.</li>
                  <li><strong>Credential management:</strong> You must protect API keys, tokens, passwords, administrative access, and business account permissions and promptly revoke access when no longer needed.</li>
                </ul>
              </TermsSection>

              <TermsSection id="ai-output-disclaimer" title="7. AI Output Disclaimer">
                <p>
                  AI Output may be inaccurate, incomplete, outdated, offensive, biased, unsafe, duplicated, or unsuitable for your intended purpose. Similar or identical AI Output may be generated for multiple users. AI systems may produce information that appears confident but is incorrect. Vercal AI does not guarantee the correctness, reliability, uniqueness, legality, usefulness, or appropriateness of AI Output.
                </p>
                <p>
                  You must independently verify critical information before relying on AI Output, especially for legal, medical, financial, employment, safety, customer support, commercial, compliance, or regulated decisions. You acknowledge that use of AI Output is at your own risk and that you remain responsible for decisions, communications, actions, or omissions based on AI Output.
                </p>
              </TermsSection>

              <TermsSection id="payments-subscriptions-and-billing" title="8. Payments, Subscriptions, and Billing">
                <p>
                  Certain features may be offered free of charge, while others may require a paid plan, subscription, usage-based fee, add-on, or other commercial arrangement. Pricing, included usage, limits, plan features, renewal periods, taxes, and payment methods may be presented at checkout, in an order form, in the dashboard, or in a separate written agreement.
                </p>
                <ul>
                  <li><strong>Subscriptions:</strong> Subscription plans may renew automatically unless canceled before the renewal date, subject to the terms presented when you subscribe.</li>
                  <li><strong>Usage charges:</strong> Certain AI, WhatsApp, message, API, storage, or automation usage may be subject to limits or additional charges.</li>
                  <li><strong>Third-party charges:</strong> Meta, WhatsApp, payment processors, telecom providers, or other third parties may impose their own charges, fees, or taxes, which are your responsibility unless expressly stated otherwise.</li>
                  <li><strong>Payment failures:</strong> If payment fails, we may retry payment, downgrade, restrict, suspend, or terminate access to paid features after reasonable notice where required.</li>
                  <li><strong>Refunds:</strong> Unless required by law or expressly stated in a written policy, fees are non-refundable once paid. Any discretionary refund does not create an obligation to provide future refunds.</li>
                  <li><strong>Taxes:</strong> You are responsible for applicable taxes, duties, levies, and governmental assessments related to your purchase or use of paid Services.</li>
                </ul>
              </TermsSection>

              <TermsSection id="intellectual-property-rights" title="9. Intellectual Property Rights">
                <SubSection title="9.1 Vercal AI Ownership">
                  <p>
                    Vercal AI and its licensors own all rights, title, and interest in and to the Platform, Services, software, interfaces, design, trademarks, logos, technology, workflows, models, prompts, systems, documentation, analytics, know-how, and other proprietary materials. These Terms do not transfer any ownership rights to you.
                  </p>
                </SubSection>
                <SubSection title="9.2 User Content Ownership">
                  <p>
                    As between you and Vercal AI, you retain ownership of User Content you submit, upload, or configure, subject to the rights and licenses granted in these Terms. You represent that you have all rights, permissions, and lawful bases necessary to provide User Content to the Services.
                  </p>
                </SubSection>
                <SubSection title="9.3 License to Provide the Services">
                  <p>
                    You grant Vercal AI a worldwide, non-exclusive, royalty-free, sublicensable license to host, copy, process, transmit, display, adapt, and use User Content solely as necessary to provide, secure, maintain, support, and improve the Services; comply with law; enforce these Terms; and operate integrations you configure.
                  </p>
                </SubSection>
                <SubSection title="9.4 Restrictions">
                  <p>
                    You may not copy, modify, distribute, sell, lease, sublicense, publicly display, publicly perform, or create derivative works from the Services except as expressly permitted by Vercal AI. You may not remove proprietary notices, misuse trademarks, or represent that you own Vercal AI technology.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="third-party-services" title="10. Third-Party Services">
                <p>
                  The Services may depend on or interoperate with Third-party Services, including Meta, WhatsApp Business API, hosting providers, authentication providers, AI model providers, analytics tools, payment processors, and other APIs. Vercal AI does not control Third-party Services and is not responsible for their availability, security, policies, pricing, performance, errors, outages, suspensions, or changes.
                </p>
                <p>
                  Your use of Third-party Services may be subject to separate terms, privacy policies, data processing terms, acceptable use policies, and fees. You are responsible for complying with those terms. If a Third-party Service changes or becomes unavailable, Vercal AI may modify, suspend, or discontinue affected features without liability.
                </p>
              </TermsSection>

              <TermsSection id="data-usage-reference" title="11. Data Usage Reference">
                <p>
                  Our collection, use, storage, sharing, retention, and protection of information is described in our <Link href="/privacy-policy">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using the Services, you acknowledge that data handling is governed by the Privacy Policy and any applicable data processing agreement or separate written agreement between you and Vercal AI.
                </p>
                <p>
                  For WhatsApp AI, business customers are responsible for ensuring that their own privacy notices, customer consents, and data processing practices accurately describe the use of Vercal AI, WhatsApp Business API, Meta services, and AI automation where required by law.
                </p>
              </TermsSection>

              <TermsSection id="service-availability-and-modifications" title="12. Service Availability and Modifications">
                <p>
                  The Services are provided on an “as available” basis. We do not guarantee uninterrupted, error-free, secure, or continuous availability. The Services may be unavailable due to maintenance, updates, infrastructure failures, third-party outages, security incidents, capacity constraints, internet disruptions, API changes, regulatory issues, or events beyond our reasonable control.
                </p>
                <p>
                  We may modify, update, suspend, restrict, discontinue, rename, rebrand, or remove any feature, plan, integration, API, or part of the Services at any time. We may impose or change usage limits, eligibility requirements, security controls, rate limits, or technical restrictions where necessary for business, compliance, security, operational, or product reasons.
                </p>
              </TermsSection>

              <TermsSection id="termination-and-suspension" title="13. Termination and Suspension">
                <SubSection title="13.1 Termination by You">
                  <p>
                    You may stop using the Services at any time. You may request account closure by contacting support or using available account tools. Termination does not relieve you of payment obligations incurred before termination and does not require us to provide refunds except where required by law or expressly agreed.
                  </p>
                </SubSection>
                <SubSection title="13.2 Suspension or Termination by Vercal AI">
                  <p>
                    We may suspend, restrict, or terminate your access to the Services immediately, with or without notice, if we reasonably believe that you have violated these Terms, created legal or security risk, violated third-party policies, failed to pay amounts due, provided false information, misused AI Output, sent unauthorized messages, compromised platform integrity, or used the Services in a way that may harm users, customers, Vercal AI, Meta, WhatsApp, or third parties.
                  </p>
                </SubSection>
                <SubSection title="13.3 Effect of Termination">
                  <p>
                    Upon termination, your right to access the Services will cease, and we may disable accounts, revoke credentials, remove integrations, delete or retain data according to our Privacy Policy, and block future access where appropriate. Sections that by their nature should survive termination will survive, including intellectual property, payment obligations, disclaimers, limitations of liability, indemnification, governing law, and dispute provisions.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="limitation-of-liability" title="14. Limitation of Liability">
                <p>
                  To the maximum extent permitted by applicable law, Vercal AI, its founders, directors, officers, employees, contractors, affiliates, licensors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, punitive, or enhanced damages; loss of profits; loss of revenue; loss of business; loss of goodwill; loss of data; service interruption; substitute services; or damages arising from AI Output, third-party services, WhatsApp or Meta outages, unauthorized access, user content, or your use of or inability to use the Services.
                </p>
                <p>
                  To the maximum extent permitted by law, Vercal AI’s total aggregate liability for all claims arising out of or relating to the Services or these Terms will not exceed the greater of: (a) the amount you paid to Vercal AI for the Services in the twelve (12) months preceding the event giving rise to the claim; or (b) INR 1,000. Some jurisdictions do not allow certain limitations, so some limitations may not apply to you.
                </p>
              </TermsSection>

              <TermsSection id="indemnification" title="15. Indemnification">
                <p>
                  You agree to defend, indemnify, and hold harmless Vercal AI, its founders, directors, officers, employees, contractors, affiliates, licensors, and service providers from and against any claims, demands, actions, investigations, liabilities, damages, losses, costs, and expenses, including reasonable legal fees, arising out of or related to:
                </p>
                <ul>
                  <li>Your access to or use of the Services.</li>
                  <li>Your User Content, business data, customer messages, prompts, instructions, or automation configuration.</li>
                  <li>Your use, publication, transmission, or reliance on AI Output.</li>
                  <li>Your violation of these Terms, applicable law, third-party rights, Meta policies, WhatsApp policies, or third-party service terms.</li>
                  <li>Your failure to obtain required consents, provide required notices, or comply with data protection, messaging, consumer protection, or industry-specific obligations.</li>
                  <li>Claims from your customers, employees, contractors, end users, regulators, or third parties arising from your use of Ivana AI or WhatsApp AI.</li>
                </ul>
              </TermsSection>

              <TermsSection id="governing-law" title="16. Governing Law">
                <p>
                  These Terms and any dispute, claim, or controversy arising out of or relating to the Services will be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Subject to any mandatory consumer protection rights that may apply, the courts located in India will have jurisdiction over disputes arising from these Terms or the Services.
                </p>
                <p>
                  Before initiating formal proceedings, you agree to first contact Vercal AI at <a href="mailto:support@vercal.app">support@vercal.app</a> and attempt to resolve the dispute informally by providing a written description of the issue, requested relief, and relevant account information. We will make reasonable good-faith efforts to respond within a commercially reasonable period.
                </p>
              </TermsSection>

              <TermsSection id="changes-to-terms" title="17. Changes to Terms">
                <p>
                  We may update these Terms from time to time to reflect changes in law, business practices, services, security needs, third-party requirements, or platform functionality. When changes are material, we may provide notice through the Services, by email, through account notices, or by other reasonable means.
                </p>
                <p>
                  The “Last updated” date indicates when these Terms were last revised. Your continued access to or use of the Services after updated Terms become effective constitutes acceptance of the updated Terms. If you do not agree to updated Terms, you must stop using the Services and disconnect any integrations.
                </p>
              </TermsSection>

              <TermsSection id="contact-information" title="18. Contact Information">
                <p>
                  If you have questions about these Terms, the Services, Ivana AI, WhatsApp AI, or any legal notice, please contact us:
                </p>
                <div className="rounded-3xl border border-white/10 bg-black/35 p-6">
                  <p className="text-lg font-semibold text-white">Vercal AI</p>
                  <p className="mt-2 text-zinc-400">Vercal.app</p>
                  <p className="mt-4">
                    <span className="font-semibold text-zinc-200">Email:</span>{" "}
                    <a href="mailto:support@vercal.app" className="text-purple-200 underline decoration-purple-300/40 underline-offset-4 transition hover:text-white">
                      support@vercal.app
                    </a>
                  </p>
                </div>
              </TermsSection>
            </div>
          </article>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Vercal.app. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <Link href="/whatsapp-ai" className="transition hover:text-white">WhatsApp AI</Link>
            <Link href="/privacy-policy" className="transition hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TermsSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="border-b border-white/10 pb-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-4 text-base leading-8 text-zinc-300 [&_a]:text-purple-200 [&_a]:underline [&_a]:decoration-purple-300/40 [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-zinc-100 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-3">
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      <div className="mt-3 space-y-4 text-zinc-300 [&_li]:pl-1 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-3">
        {children}
      </div>
    </div>
  );
}

function DefinitionList({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid gap-4">
      {items.map(([term, definition]) => (
        <div key={term} className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
          <dt className="font-semibold text-white">{term}</dt>
          <dd className="mt-2 text-zinc-300">{definition}</dd>
        </div>
      ))}
    </dl>
  );
}
