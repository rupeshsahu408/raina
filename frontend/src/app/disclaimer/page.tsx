import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer — Plyndrox AI",
  description:
    "Legal Disclaimer for Plyndrox AI, covering AI output limitations, professional advice disclaimers, Plyndrox WhatsApp AI integration responsibilities, and liability limitations.",
};

const tableOfContents = [
  ["General Disclaimer", "general-disclaimer"],
  ["AI Output Disclaimer", "ai-output-disclaimer"],
  ["Professional Disclaimer", "professional-disclaimer"],
  ["Plyndrox AI Disclaimer", "plyndrox-ai-disclaimer"],
  ["Plyndrox WhatsApp AI Disclaimer", "whatsapp-ai-disclaimer"],
  ["Third-Party Disclaimer", "third-party-disclaimer"],
  ["Limitation of Liability", "limitation-of-liability"],
  ["No Guarantees", "no-guarantees"],
  ["External Links Disclaimer", "external-links-disclaimer"],
  ["Brand Independence Statement", "brand-independence-statement"],
  ["User Responsibility", "user-responsibility"],
  ["Changes to This Disclaimer", "changes-to-this-disclaimer"],
  ["Contact Information", "contact-information"],
];

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white text-[#1d2226]">
      
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white/10 transition group-hover:border-purple-300/40">
              <img src="/evara-logo.png" alt="Plyndrox AI" className="h-7 w-7 object-contain" draggable={false} />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Plyndrox AI</span>
              <span className="block text-xs text-gray-400">Disclaimer</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/privacy-policy" className="hidden rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-purple-300/15 sm:inline-flex">
              Privacy Policy
            </Link>
            <Link href="/" className="rounded-full bg-[#1d2226] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d3238]">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-2xl shadow-gray-100 backdrop-blur-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-700">Table of Contents</p>
              <nav className="mt-5 space-y-1" aria-label="Disclaimer sections">
                {tableOfContents.map(([label, id]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block rounded-2xl px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-[#1d2226]"
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Services Covered</p>
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <p>Plyndrox AI — Web/App AI assistant</p>
                  <p>Plyndrox WhatsApp AI — WhatsApp Business API automation</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Important Notice</p>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  This document constitutes a legally binding disclaimer. Please read it carefully before using any Plyndrox AI service.
                </p>
              </div>
            </div>
          </aside>

          <article className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-2xl shadow-gray-100 backdrop-blur-2xl sm:p-8 lg:p-10">
            <div className="border-b border-gray-200 pb-8">
              <p className="inline-flex rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-violet-700">
                Legal Document
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#1d2226] sm:text-5xl lg:text-6xl">
                Disclaimer
              </h1>
              <p className="mt-4 text-sm text-gray-400">
                Last updated: April 12, 2026 · Effective date: April 12, 2026
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600">
                This Disclaimer governs your access to and use of Plyndrox AI, its platforms, applications, dashboards, AI assistant services, WhatsApp automation tools, and all related features. By accessing or using any part of the Plyndrox AI platform, you acknowledge that you have read, understood, and agree to the terms of this Disclaimer. Please read this document carefully, as it contains important information regarding the limitations of our services and the boundaries of our liability.
              </p>
            </div>

            <div className="policy-content mt-10 space-y-12">

              <DisclaimerSection id="general-disclaimer" title="1. General Disclaimer">
                <p>
                  Plyndrox AI is an independent artificial intelligence software platform that provides AI-powered tools and automation services to individuals, professionals, and business customers through its web applications, mobile applications, progressive web applications, dashboards, APIs, and related digital properties. The platform currently includes, without limitation, Plyndrox AI, a web and application-based AI assistant, and Plyndrox WhatsApp AI, a business automation service operating through the WhatsApp Business API.
                </p>
                <p>
                  All information, content, outputs, features, tools, services, and resources provided through the Plyndrox AI platform are made available on an <strong>"as-is"</strong> and <strong>"as-available"</strong> basis. Plyndrox AI makes no representations or warranties of any kind, whether express, implied, statutory, or otherwise, regarding the accuracy, reliability, completeness, timeliness, legality, safety, merchantability, fitness for a particular purpose, or non-infringement of any content, service, output, or feature made available through the platform.
                </p>
                <p>
                  The operation of the Plyndrox AI platform depends on a variety of factors outside our direct control, including but not limited to third-party AI model providers, cloud hosting infrastructure, internet connectivity, device compatibility, regulatory requirements, and third-party API availability. Plyndrox AI does not guarantee uninterrupted, error-free, or perfectly accurate operation at all times. Users access and use the platform at their own risk, subject to the terms of this Disclaimer and any applicable terms of service or other agreements between the user and Plyndrox AI.
                </p>
                <p>
                  Nothing contained within the Plyndrox AI platform, its outputs, its documentation, its communications, its marketing materials, or any other materials associated with Plyndrox AI constitutes a warranty, guarantee, or representation that the services will meet your specific expectations, requirements, or standards. Plyndrox AI expressly disclaims any and all implied warranties to the fullest extent permitted by applicable law.
                </p>
              </DisclaimerSection>

              <DisclaimerSection id="ai-output-disclaimer" title="2. AI Output Disclaimer">
                <p>
                  The artificial intelligence systems integrated within the Plyndrox AI platform are designed to generate text-based responses, suggestions, summaries, classifications, automated replies, and other forms of AI-generated output based on user inputs, configured instructions, and underlying language model capabilities. While significant effort is made to ensure that AI outputs are helpful, relevant, and coherent, the nature of AI-generated content is inherently probabilistic and subject to significant limitations.
                </p>
                <SubSection title="2.1 Accuracy and Completeness">
                  <p>
                    AI-generated responses may be inaccurate, incomplete, outdated, misleading, inconsistent, or factually incorrect. AI systems do not possess real-time knowledge of current events, regulatory changes, market conditions, or any information that postdates their training data. Outputs generated by AI may reflect biases, errors, or gaps present in the underlying models, and similar or identical outputs may be generated for different users in different contexts.
                  </p>
                </SubSection>
                <SubSection title="2.2 No Reliance for Critical Decisions">
                  <p>
                    Users must not rely solely or primarily on AI-generated outputs when making decisions that involve significant personal, financial, legal, medical, commercial, operational, safety-related, or other material consequences. AI output should be treated as a preliminary or supplementary input that requires independent human review, verification, and judgment before being acted upon. Plyndrox AI explicitly discourages uncritical reliance on AI-generated content in any context where the accuracy of information is material to the outcome.
                  </p>
                </SubSection>
                <SubSection title="2.3 No Liability for Actions Based on AI Output">
                  <p>
                    Plyndrox AI shall not be liable for any loss, harm, damage, claim, liability, cost, or consequence of any nature arising directly or indirectly from any action taken, decision made, communication sent, or omission made in reliance on AI-generated outputs. Users assume full responsibility for their use of AI outputs and for any downstream consequences arising from that use, including but not limited to business losses, reputational harm, regulatory violations, customer complaints, contractual breaches, or personal harm.
                  </p>
                </SubSection>
                <SubSection title="2.4 AI Confidence and Perceived Certainty">
                  <p>
                    AI language systems may present information with a tone of confidence or certainty even when the underlying content is speculative, unverified, or incorrect. The stylistic fluency of AI output does not constitute evidence of its accuracy, completeness, or reliability. Users are advised to treat all AI output with appropriate critical analysis and to seek independent verification of any information that is material to a decision or action.
                  </p>
                </SubSection>
              </DisclaimerSection>

              <DisclaimerSection id="professional-disclaimer" title="3. Professional Disclaimer">
                <p>
                  The Plyndrox AI platform is a general-purpose AI productivity and automation tool. It is not designed, trained, certified, licensed, or regulated as a provider of professional advice, and nothing produced by the platform should be interpreted as professional advice of any kind.
                </p>
                <SubSection title="3.1 Not Legal Advice">
                  <p>
                    AI outputs generated by Plyndrox AI do not constitute legal advice, legal opinions, legal guidance, legal analysis, or legal representation. The platform is not a law firm and is not subject to the professional rules applicable to licensed legal practitioners. Users should not rely on Plyndrox AI for guidance on contracts, disputes, intellectual property, regulatory compliance, litigation, employment law, criminal law, immigration, estate planning, or any other legal matter. For legal questions, users must consult a qualified, licensed attorney in the relevant jurisdiction.
                  </p>
                </SubSection>
                <SubSection title="3.2 Not Financial Advice">
                  <p>
                    Nothing on the Plyndrox AI platform constitutes financial advice, investment advice, trading recommendations, portfolio guidance, tax advice, accounting opinions, actuarial analysis, or any other form of financial or investment-related professional guidance. The platform is not registered as a financial advisor, broker-dealer, investment manager, tax advisor, or accounting professional. For financial decisions, users must consult a qualified, licensed financial or accounting professional appropriate to their needs and jurisdiction.
                  </p>
                </SubSection>
                <SubSection title="3.3 Not Medical Advice">
                  <p>
                    Plyndrox AI does not provide medical advice, clinical diagnoses, treatment recommendations, therapeutic guidance, pharmaceutical information, or any other form of healthcare or medical professional opinion. The platform is not a licensed healthcare provider, medical device, or clinical support system. Information provided through the platform should never be used as a substitute for professional medical evaluation, diagnosis, or treatment. Users with health concerns must seek the guidance of a qualified, licensed medical professional.
                  </p>
                </SubSection>
                <SubSection title="3.4 No Other Professional Advice">
                  <p>
                    The disclaimer against professional reliance extends to all other regulated or specialized professional domains, including but not limited to psychological or mental health counseling, architectural or engineering design, educational assessment, social work, immigration consulting, insurance advisory services, and real estate brokerage. For any matter requiring professional expertise, users must engage appropriately qualified and licensed professionals.
                  </p>
                </SubSection>
              </DisclaimerSection>

              <DisclaimerSection id="plyndrox-ai-disclaimer" title="4. Plyndrox AI Disclaimer">
                <p>
                  Plyndrox AI is the conversational AI assistant provided through the Plyndrox AI web and application platform. It is intended to assist users with productivity, information, content generation, summarization, question-answering, and general AI-assisted tasks. The following specific disclaimers apply to your use of Plyndrox AI and any outputs it generates.
                </p>
                <SubSection title="4.1 Conversational AI Risks">
                  <p>
                    Conversational AI systems like Plyndrox AI operate by predicting contextually appropriate responses based on large volumes of training data. This methodology introduces inherent risks that users must understand, including the generation of plausible-sounding but incorrect information (commonly referred to as "hallucination"), the reproduction of biased or stereotyped language present in training data, the inability to access real-time or post-training information, and the potential for misunderstanding ambiguous user inputs in ways that result in unhelpful or misleading responses.
                  </p>
                </SubSection>
                <SubSection title="4.2 No Guarantee of Correctness">
                  <p>
                    Plyndrox AI makes no guarantee that Plyndrox AI responses will be accurate, complete, current, lawful, safe, appropriate, or suitable for any specific purpose. The quality and reliability of Plyndrox AI outputs may vary depending on the complexity of the query, the clarity of the user's input, the subject matter involved, the version of the underlying model in use, and the availability of relevant training data. Users should not treat any Plyndrox AI response as authoritative without independent verification.
                  </p>
                </SubSection>
                <SubSection title="4.3 User Responsibility for Interpreting Outputs">
                  <p>
                    The user is solely responsible for interpreting, evaluating, validating, and applying Plyndrox AI outputs. Plyndrox AI is not responsible for any outcome that results from the user's interpretation or application of AI-generated content. This includes, without limitation, errors in published communications, incorrect automation logic, business decisions based on AI-generated analysis, creative works generated using AI assistance, or any other downstream application of AI outputs. Users are advised to apply their own knowledge, critical judgment, and professional expertise when reviewing and utilizing Plyndrox AI responses.
                  </p>
                </SubSection>
                <SubSection title="4.4 Sensitive Information">
                  <p>
                    Users should exercise caution when submitting sensitive, confidential, personal, or regulated information to Plyndrox AI. While Plyndrox AI implements technical and organizational security measures, users should not transmit information that they are not authorized to share with third-party AI systems, including but not limited to protected health information, confidential legal communications, trade secrets, proprietary business data, government-classified material, or any information subject to regulatory restrictions on processing. Submission of such information is at the user's sole risk.
                  </p>
                </SubSection>
              </DisclaimerSection>

              <DisclaimerSection id="whatsapp-ai-disclaimer" title="5. Plyndrox WhatsApp AI Disclaimer">
                <p>
                  Plyndrox WhatsApp AI is a business automation service provided by Plyndrox AI that enables business customers to integrate AI-powered messaging automation with the WhatsApp Business API, operated by Meta Platforms, Inc. The following specific disclaimers apply to your use of Plyndrox WhatsApp AI and any operations conducted through it.
                </p>
                <SubSection title="5.1 Integration with WhatsApp Business API">
                  <p>
                    Plyndrox WhatsApp AI operates through the WhatsApp Business API, which is a third-party service provided by Meta Platforms, Inc. The availability, functionality, performance, pricing, terms, permissions, message limits, template approval processes, and policy requirements of the WhatsApp Business API are controlled exclusively by Meta. Plyndrox AI does not own, operate, or control the WhatsApp platform, the WhatsApp Business API, or any Meta infrastructure, and the provision of Plyndrox WhatsApp AI features is contingent upon the continued availability and operation of Meta's systems.
                  </p>
                </SubSection>
                <SubSection title="5.2 Dependency on Meta and Third-Party Platforms">
                  <p>
                    Because Plyndrox WhatsApp AI depends fundamentally on Meta's infrastructure and policies, Plyndrox AI cannot guarantee the continuous, uninterrupted, or error-free availability of Plyndrox WhatsApp AI features. Users acknowledge and accept that:
                  </p>
                  <ul>
                    <li>WhatsApp service outages, maintenance windows, degraded performance, API rate limiting, or infrastructure disruptions caused by Meta are entirely outside the control of Plyndrox AI and do not constitute a failure or breach by Plyndrox AI.</li>
                    <li>API limitations imposed by Meta, including but not limited to message delivery limits, template restrictions, media restrictions, phone number policies, and account verification requirements, may affect the functionality of Plyndrox WhatsApp AI in ways that Plyndrox AI cannot override, circumvent, or mitigate.</li>
                    <li>Policy changes made by Meta, including changes to WhatsApp Business API terms, messaging policies, data processing requirements, commerce policies, acceptable use policies, or developer platform terms, may require changes to or suspension of Plyndrox WhatsApp AI features without prior notice, and Plyndrox AI shall not be liable for any resulting disruption.</li>
                    <li>Account suspensions, restrictions, or bans applied by Meta to a business's WhatsApp Business account are not within the control of Plyndrox AI and do not give rise to any liability on the part of Plyndrox AI.</li>
                  </ul>
                </SubSection>
                <SubSection title="5.3 User Responsibilities for Plyndrox WhatsApp AI">
                  <p>
                    Business customers using Plyndrox WhatsApp AI assume full and sole responsibility for the following:
                  </p>
                  <ul>
                    <li><strong>Customer Consent:</strong> Obtaining all legally required consents, opt-ins, permissions, and authorizations from end customers prior to initiating, automating, or otherwise conducting messaging through Plyndrox WhatsApp AI. This includes compliance with applicable telecommunications laws, anti-spam regulations, consumer protection laws, and the WhatsApp Business Policy.</li>
                    <li><strong>Lawful Communication:</strong> Ensuring that all messages, content, responses, templates, media, and communications transmitted through Plyndrox WhatsApp AI are lawful, accurate, non-deceptive, non-harassing, and compliant with all applicable laws and regulations in the jurisdictions where recipients are located.</li>
                    <li><strong>Compliance with WhatsApp Policies:</strong> Reading, understanding, and complying fully with all applicable Meta and WhatsApp policies, including the WhatsApp Business Policy, Meta Platform Terms, WhatsApp Commerce Policy, and any additional terms applicable to the WhatsApp Business API. Plyndrox AI does not accept liability for any policy violations committed by business customers through their use of Plyndrox WhatsApp AI.</li>
                    <li><strong>Human Oversight:</strong> Maintaining appropriate human oversight over AI-generated automated replies, particularly where such replies may affect customer rights, purchases, complaints, financial obligations, or other sensitive matters. Business customers may not use Plyndrox WhatsApp AI as a substitute for required human judgment in regulated or high-stakes contexts.</li>
                  </ul>
                </SubSection>
                <SubSection title="5.4 No Liability for WhatsApp-Related Failures">
                  <p>
                    Plyndrox AI shall not be liable for any loss, claim, damage, disruption, regulatory sanction, customer complaint, reputational harm, or business consequence arising from or related to the unavailability, performance degradation, policy enforcement, or technical limitations of the WhatsApp Business API, Meta's infrastructure, or Meta's independent processing of data. Such risks are inherent to the use of a third-party communication platform and are accepted by users as a condition of using Plyndrox WhatsApp AI.
                  </p>
                </SubSection>
              </DisclaimerSection>

              <DisclaimerSection id="third-party-disclaimer" title="6. Third-Party Disclaimer">
                <p>
                  The Plyndrox AI platform may incorporate, depend upon, or provide access to a range of third-party services, integrations, APIs, providers, libraries, hosting infrastructure, and other external systems. These include but are not limited to cloud hosting providers, AI model providers, content delivery networks, authentication providers, analytics tools, payment processors, messaging platforms, and business productivity integrations.
                </p>
                <SubSection title="6.1 No Control Over Third-Party Services">
                  <p>
                    Plyndrox AI does not own, operate, control, or assume responsibility for any third-party service, platform, or infrastructure integrated with or used in connection with the Plyndrox AI platform. Third-party services operate independently and are governed by their own terms of service, privacy policies, data processing agreements, acceptable use policies, and applicable laws. Plyndrox AI cannot guarantee the availability, performance, accuracy, security, compliance, or lawfulness of any third-party service.
                  </p>
                </SubSection>
                <SubSection title="6.2 No Liability for Third-Party Failures">
                  <p>
                    Plyndrox AI shall not be liable for any failure, outage, error, security breach, data loss, unauthorized access, policy change, pricing change, discontinuation, or other adverse event caused by or arising from a third-party service provider, regardless of whether such provider is identified to users or whether users interact with such provider directly. Users acknowledge that reliance on a platform that integrates with third-party services inherently carries risks associated with the availability and behavior of those services.
                  </p>
                </SubSection>
                <SubSection title="6.3 Third-Party Data Handling">
                  <p>
                    Where user data is processed by or transmitted to third-party providers in connection with the operation of the Plyndrox AI platform, such processing is subject to the privacy practices and data protection commitments of those providers. Plyndrox AI is not responsible for the data handling practices, privacy policies, security measures, or regulatory compliance posture of any third-party provider. Users are encouraged to review the terms and privacy policies of any third-party service they interact with in connection with the Plyndrox AI platform.
                  </p>
                </SubSection>
              </DisclaimerSection>

              <DisclaimerSection id="limitation-of-liability" title="7. Limitation of Liability">
                <p>
                  To the fullest extent permitted by applicable law, Plyndrox AI, its officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns shall not be liable to any user or third party for any damages of any kind arising from or related to the use of, inability to use, or reliance upon the Plyndrox AI platform, its content, its AI outputs, or any related services.
                </p>
                <SubSection title="7.1 Categories of Excluded Liability">
                  <p>Without limiting the generality of the foregoing, Plyndrox AI expressly excludes all liability for:</p>
                  <ul>
                    <li><strong>Direct Damages:</strong> Any direct loss, cost, claim, or damage arising from a specific failure of the platform to perform as intended, including loss caused by reliance on AI outputs.</li>
                    <li><strong>Indirect and Consequential Damages:</strong> Any indirect, incidental, special, punitive, exemplary, or consequential damages, including but not limited to loss of revenue, loss of anticipated savings, loss of contracts, loss of goodwill, loss of opportunity, or damage to reputation.</li>
                    <li><strong>Loss of Data:</strong> Any loss, corruption, unauthorized access to, or destruction of data, records, configurations, or content stored on, transmitted through, or processed by the platform.</li>
                    <li><strong>Business Interruptions:</strong> Any disruption to business operations, workflows, customer communications, automated processes, or productivity caused by platform unavailability, errors, degraded performance, or third-party service failures.</li>
                    <li><strong>Loss of Profits:</strong> Any loss of actual or anticipated profits, income, revenue, or commercial opportunity arising from or related to the use of or reliance upon the platform.</li>
                    <li><strong>Third-Party Claims:</strong> Any claim, liability, cost, or damages arising from third-party allegations resulting from a user's use of the platform, including customer complaints, regulatory sanctions, or contractual disputes.</li>
                    <li><strong>Security Incidents:</strong> Any loss, harm, or damage arising from unauthorized access, data breaches, phishing attacks, account compromise, or other security incidents that are not directly caused by Plyndrox AI's own gross negligence or willful misconduct.</li>
                  </ul>
                </SubSection>
                <SubSection title="7.2 Use at User's Own Risk">
                  <p>
                    The use of the Plyndrox AI platform and all its services is entirely at the user's own risk. Users acknowledge that AI-powered platforms involve inherent uncertainties, technical limitations, and operational dependencies that cannot be fully eliminated. By accessing and using the platform, users accept these risks and waive any claims against Plyndrox AI arising from them to the fullest extent permissible under applicable law.
                  </p>
                </SubSection>
                <SubSection title="7.3 Applicable Law Limitations">
                  <p>
                    Some jurisdictions do not permit the exclusion or limitation of certain types of liability, including liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or other liabilities that cannot be excluded under applicable mandatory law. Nothing in this Disclaimer shall be construed to exclude or limit any liability that cannot lawfully be excluded or limited in the applicable jurisdiction. Where such mandatory protections apply, the exclusions and limitations set out in this section shall apply to the maximum extent permitted by law.
                  </p>
                </SubSection>
              </DisclaimerSection>

              <DisclaimerSection id="no-guarantees" title="8. No Guarantees">
                <p>
                  Plyndrox AI expressly disclaims any and all guarantees, warranties, commitments, or assurances regarding the performance, availability, accuracy, or continuity of the platform and its services, except as may be set out in a separate written agreement between Plyndrox AI and a specific customer.
                </p>
                <ul>
                  <li>
                    <strong>Service Uptime:</strong> Plyndrox AI does not guarantee any specific level of service uptime, availability, or operational continuity. The platform may be subject to planned or unplanned downtime due to maintenance, infrastructure failures, security incidents, third-party outages, or other operational requirements. Any uptime or availability metrics shared informally or in marketing materials are targets only and do not constitute binding commitments.
                  </li>
                  <li>
                    <strong>Accuracy of AI Outputs:</strong> As described in detail in Section 2 of this Disclaimer, Plyndrox AI makes no guarantee regarding the accuracy, completeness, or correctness of any AI-generated output. AI systems are inherently probabilistic, and their outputs should not be treated as authoritative or definitive without independent verification.
                  </li>
                  <li>
                    <strong>Continuous Availability:</strong> Plyndrox AI does not guarantee that all features, integrations, or capabilities of the platform will remain continuously available. Features may be added, modified, temporarily suspended, or permanently discontinued at any time, with or without prior notice, based on business, technical, legal, or operational considerations.
                  </li>
                  <li>
                    <strong>Response Times:</strong> Plyndrox AI does not guarantee specific response times for AI queries, API requests, customer support inquiries, or platform operations. Performance may vary based on server load, network conditions, input complexity, and other factors.
                  </li>
                  <li>
                    <strong>Integration Reliability:</strong> Plyndrox AI does not guarantee the continuous, error-free operation of any third-party integration, including the WhatsApp Business API, authentication providers, AI model providers, or other external services upon which the platform depends.
                  </li>
                </ul>
              </DisclaimerSection>

              <DisclaimerSection id="external-links-disclaimer" title="9. External Links Disclaimer">
                <p>
                  The Plyndrox AI platform, its documentation, its support resources, and its AI-generated outputs may from time to time contain hyperlinks, references, or citations to external websites, resources, articles, services, tools, or other third-party digital content. These links are provided for informational and convenience purposes only and do not constitute an endorsement, sponsorship, recommendation, verification, or approval by Plyndrox AI of the linked content, organization, product, or service.
                </p>
                <p>
                  Plyndrox AI does not control, monitor, review, or maintain any external website or third-party content linked from the platform. External websites may contain information, viewpoints, products, services, or practices that differ from or conflict with those of Plyndrox AI, and Plyndrox AI accepts no responsibility for the accuracy, legality, safety, completeness, or appropriateness of any externally linked content. Accessing external links from the Plyndrox AI platform is entirely at the user's own risk.
                </p>
                <p>
                  Plyndrox AI shall not be liable for any loss, harm, damage, or adverse experience arising from the user's access to, use of, or reliance upon any external website or third-party resource linked from the platform. The inclusion of a hyperlink in any platform interface, document, or AI-generated output does not imply that Plyndrox AI has reviewed, validated, or takes responsibility for the linked destination.
                </p>
              </DisclaimerSection>

              <DisclaimerSection id="brand-independence-statement" title="10. Brand Independence Statement">
                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 mb-4">Important Notice</p>
                  <p className="text-base leading-8 text-gray-600 font-medium">
                    Plyndrox AI is an independent platform and has no affiliation, association, endorsement, sponsorship, partnership, or connection of any kind with vercal.com, Vercal, or any entity operating under a similarly named brand. Any resemblance in name, branding, or terminology between Plyndrox AI and vercal.com or any similarly named entity is entirely coincidental and unintentional.
                  </p>
                </div>
                <p>
                  Plyndrox AI operates as a fully independent artificial intelligence software company. It has not been licensed, authorized, endorsed, or approved by vercal.com or any related entity, and no relationship — whether commercial, legal, technological, or organizational — exists between Plyndrox AI and vercal.com or any entity bearing a similar name. Users should not interpret any similarity in naming as implying any form of relationship, affiliation, or collaboration between these entities.
                </p>
                <p>
                  Plyndrox AI is its own distinct platform, brand, and legal entity with its own independent products, services, team, intellectual property, terms of service, privacy practices, and operational infrastructure. Any representations suggesting a connection between Plyndrox AI and vercal.com or similarly named entities are unauthorized, inaccurate, and not reflective of any actual relationship.
                </p>
                <p>
                  If you have encountered any communication, advertisement, content, or representation that incorrectly suggests a connection between Plyndrox AI and vercal.com or any similarly named entity, please contact us immediately at the email address provided in Section 13 of this Disclaimer so that we may investigate and address the matter appropriately.
                </p>
              </DisclaimerSection>

              <DisclaimerSection id="user-responsibility" title="11. User Responsibility">
                <p>
                  By accessing and using the Plyndrox AI platform and its services, each user accepts full personal and, where applicable, organizational responsibility for their conduct, their use of the platform, the content they submit, the AI outputs they act upon, and the downstream consequences of their decisions and actions. The following responsibilities apply to all users of the platform:
                </p>
                <ul>
                  <li>
                    <strong>Legal Compliance:</strong> Users are solely responsible for ensuring that their use of the Plyndrox AI platform, including all content submitted, messages sent, automations configured, and AI outputs acted upon, complies with all applicable laws, regulations, industry standards, professional codes of conduct, and contractual obligations in every jurisdiction relevant to their operations or communications.
                  </li>
                  <li>
                    <strong>Appropriate Use:</strong> Users must use the platform for lawful, legitimate purposes only. Users must not use the platform to engage in harassment, fraud, defamation, impersonation, spam, unauthorized data collection, intellectual property infringement, dissemination of harmful or illegal content, or any other unlawful or abusive activity.
                  </li>
                  <li>
                    <strong>Account Security:</strong> Users are responsible for maintaining the security and confidentiality of their account credentials, API keys, integration tokens, and administrative access. Any activity conducted through a user's account is the user's responsibility, regardless of whether the user authorized that activity.
                  </li>
                  <li>
                    <strong>Content Accuracy:</strong> Where users configure business information, knowledge base content, FAQs, automation instructions, or other content that influences AI behavior, they are solely responsible for ensuring that such content is accurate, current, lawful, and appropriate for the intended use case.
                  </li>
                  <li>
                    <strong>Third-Party Rights:</strong> Users must not submit, process, or distribute content that infringes the intellectual property rights, privacy rights, or other legal rights of any third party. Users assume all liability for claims arising from their submission or use of content that violates third-party rights.
                  </li>
                  <li>
                    <strong>Platform Misuse:</strong> Users must not engage in activities that interfere with, disrupt, overload, or compromise the integrity, security, or availability of the Plyndrox AI platform or any associated infrastructure. Any attempt to reverse-engineer, exploit, scrape, or circumvent platform protections is strictly prohibited and may result in immediate account suspension and legal action.
                  </li>
                </ul>
                <p>
                  Plyndrox AI reserves the right to suspend or terminate access to the platform for any user who violates these responsibilities, engages in unlawful conduct, misuses the platform, or poses a risk to other users or the integrity of the platform, without prior notice and without liability.
                </p>
              </DisclaimerSection>

              <DisclaimerSection id="changes-to-this-disclaimer" title="12. Changes to This Disclaimer">
                <p>
                  Plyndrox AI reserves the right to update, amend, supplement, or replace this Disclaimer at any time and for any reason, including to reflect changes in our services, practices, legal requirements, third-party dependencies, or operational policies. Any changes will be effective upon the posting of the revised Disclaimer to the Plyndrox AI platform, with the updated effective date indicated at the top of this document.
                </p>
                <p>
                  Where changes to this Disclaimer are material or significantly affect user rights or platform responsibilities, Plyndrox AI may provide advance notice through the platform interface, via email notification to registered account holders, or through other reasonable communication methods. However, Plyndrox AI is not obligated to provide advance notice of all changes, and the absence of notice does not affect the validity or enforceability of any revised Disclaimer.
                </p>
                <p>
                  Your continued access to or use of the Plyndrox AI platform following the posting of any revised Disclaimer constitutes your acknowledgment of the updated terms and your agreement to be bound by them. If you do not agree with any changes made to this Disclaimer, you must immediately discontinue your use of the platform and, if applicable, close your account. Continued use of the platform after the effective date of any revision confirms your acceptance of the revised terms.
                </p>
                <p>
                  Plyndrox AI recommends that users periodically review this Disclaimer to remain informed of any updates. Archived versions of prior Disclaimer documents may be made available upon reasonable request.
                </p>
              </DisclaimerSection>

              <DisclaimerSection id="contact-information" title="13. Contact Information">
                <p>
                  If you have any questions, concerns, or comments regarding this Disclaimer, the limitations described herein, the Brand Independence Statement in Section 10, or any aspect of your rights or responsibilities in connection with the Plyndrox AI platform, please contact us using the details provided below. We are committed to addressing all inquiries promptly, clearly, and in good faith.
                </p>
                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-100 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-600">Contact Details</p>
                  <div className="mt-4 space-y-3 text-sm text-gray-500">
                    <p><strong className="text-[#1d2226]">Platform:</strong> Plyndrox AI</p>
                    <p>
                      <strong className="text-[#1d2226]">Support Email:</strong>{" "}
                      <a
                        href="mailto:support@plyndrox.app"
                        className="text-violet-600 underline underline-offset-2 hover:text-violet-700 transition"
                      >
                        support@plyndrox.app
                      </a>
                    </p>
                    <p className="pt-2 text-xs text-gray-400">
                      For matters related to the Brand Independence Statement (Section 10) or any misrepresentation of affiliation, please mark your inquiry as urgent.
                    </p>
                  </div>
                </div>
              </DisclaimerSection>

            </div>

            <div className="mt-12 border-t border-gray-200 pt-8">
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                <span>© 2026 Plyndrox AI. All rights reserved.</span>
                <Link href="/privacy-policy" className="text-gray-500 hover:text-white transition">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-500 hover:text-white transition">Terms of Service</Link>
                <Link href="/cookies" className="text-gray-500 hover:text-white transition">Cookie Policy</Link>
                <Link href="/disclaimer" className="text-violet-600 hover:text-violet-700 transition">Disclaimer</Link>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

function DisclaimerSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-xl font-semibold text-[#1d2226] sm:text-2xl">{title}</h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-gray-500 [&_strong]:text-[#1d2226] [&_ul]:mt-3 [&_ul]:space-y-3 [&_ul]:pl-5 [&_ul]:list-disc [&_a]:text-violet-600 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-violet-700">
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-[#1d2226]">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}
