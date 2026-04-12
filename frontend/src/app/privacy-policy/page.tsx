import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Vercal AI",
  description:
    "Comprehensive Privacy Policy for Vercal AI, including Ivana AI and WhatsApp AI data handling practices.",
};

const tableOfContents = [
  ["Introduction", "introduction"],
  ["Definitions", "definitions"],
  ["Information We Collect", "information-we-collect"],
  ["How We Use Information", "how-we-use-information"],
  ["Ivana AI Specific Privacy", "ivana-ai-specific-privacy"],
  ["WhatsApp AI Specific Privacy", "whatsapp-ai-specific-privacy"],
  ["Data Sharing and Disclosure", "data-sharing-and-disclosure"],
  ["Data Retention", "data-retention"],
  ["Data Security", "data-security"],
  ["User Rights", "user-rights"],
  ["Cookies and Tracking", "cookies-and-tracking"],
  ["Children’s Privacy", "childrens-privacy"],
  ["International Data Transfers", "international-data-transfers"],
  ["Changes to This Policy", "changes-to-this-policy"],
  ["Contact Information", "contact-information"],
];

export default function PrivacyPolicyPage() {
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
              <span className="block text-xs text-zinc-500">Privacy Policy</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/whatsapp-ai" className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/15 sm:inline-flex">
              WhatsApp AI
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
              <nav className="mt-5 space-y-1" aria-label="Privacy policy sections">
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
                Legal Document
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-sm text-zinc-500">
                Last updated: April 12, 2026 · Effective date: April 12, 2026
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">
                This Privacy Policy describes how Vercal AI collects, uses, stores, shares, protects, and otherwise processes information in connection with its artificial intelligence software services, including Ivana AI and WhatsApp AI. It is intended to provide a comprehensive and transparent explanation of our privacy practices for users, business customers, website visitors, and individuals whose information may be processed through customer-configured integrations.
              </p>
            </div>

            <div className="policy-content mt-10 space-y-12">
              <PolicySection id="introduction" title="1. Introduction">
                <p>
                  Vercal AI, operating through the Vercal.app platform, provides AI-powered software tools designed to assist individuals and businesses with automation, communication, productivity, and intelligent response generation. Our services include, without limitation, Ivana AI, a web and application-based AI assistant, and WhatsApp AI, an automation service that enables businesses to use artificial intelligence in connection with the WhatsApp Business API.
                </p>
                <p>
                  This Privacy Policy applies to all users of Vercal AI websites, applications, dashboards, APIs, integrations, and related services, whether accessed through a browser, mobile application, progressive web application, business dashboard, or third-party communication channel. Where this document refers to the “Service” or “Services,” it includes both Ivana AI and WhatsApp AI unless a section expressly states otherwise.
                </p>
                <p>
                  By accessing, registering for, connecting to, configuring, or otherwise using any part of the Services, you acknowledge that you have read and understood this Privacy Policy. If you use the Services on behalf of a company, organization, or other legal entity, you represent that you are authorized to bind that entity and that such entity accepts the practices described herein.
                </p>
                <p>
                  The WhatsApp AI service is separate from the primary Vercal AI landing page and from Ivana AI. However, because both services are operated under the Vercal AI platform, this Privacy Policy covers both services in a single document and includes service-specific provisions for each where necessary.
                </p>
              </PolicySection>

              <PolicySection id="definitions" title="2. Definitions">
                <p>For purposes of this Privacy Policy, the following terms have the meanings set forth below:</p>
                <DefinitionList items={[
                  ["Service or Services", "The websites, web applications, mobile or progressive web applications, dashboards, APIs, automations, integrations, AI assistant features, WhatsApp automation features, support channels, and related software operated by or on behalf of Vercal AI."],
                  ["Vercal AI", "The AI SaaS platform that provides Ivana AI, WhatsApp AI, and related automation, communication, and artificial intelligence services through Vercal.app."],
                  ["Ivana AI", "The Vercal AI web/app AI assistant service used for prompts, conversations, productivity support, general AI interaction, and related assistant functionality."],
                  ["WhatsApp AI", "The Vercal AI business automation service that connects to the WhatsApp Business API or related Meta services to process messages, automate replies, manage business communication, and assist with customer interactions."],
                  ["User", "Any individual who accesses or uses the Services, including account holders, website visitors, business administrators, team members, end customers who interact with a connected WhatsApp business number, and authorized representatives of business customers."],
                  ["Personal Data", "Any information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked to an identified or identifiable natural person."],
                  ["Processing", "Any operation performed on Personal Data, including collection, recording, organization, structuring, storage, adaptation, retrieval, consultation, use, transmission, disclosure, alignment, restriction, erasure, or destruction."],
                  ["AI Interaction Data", "Prompts, messages, instructions, uploaded context, conversation history, AI-generated responses, feedback, ratings, corrections, and related metadata generated when using AI features."],
                  ["Third-party Services", "External providers, platforms, APIs, infrastructure vendors, analytics tools, authentication providers, hosting providers, payment processors, AI model providers, Meta services, or other services not directly operated by Vercal AI."],
                  ["WhatsApp Integration", "The connection between WhatsApp AI and the WhatsApp Business API, Meta developer tools, business phone numbers, webhook events, message templates, credentials, and related Meta infrastructure."],
                ]} />
              </PolicySection>

              <PolicySection id="information-we-collect" title="3. Information We Collect">
                <p>
                  We collect information in several categories depending on how you interact with the Services, which features you use, whether you are an individual user or business customer, and whether you configure integrations such as the WhatsApp Business API. We collect only information that is reasonably necessary to provide, secure, administer, improve, and support the Services, subject to applicable legal requirements.
                </p>
                <SubSection title="3.1 Personal Information">
                  <p>We may collect personal information that you provide directly or that is generated through your use of the Services, including:</p>
                  <ul>
                    <li>Name, display name, account name, or profile identifier.</li>
                    <li>Email address, phone number, account login credentials, and authentication identifiers.</li>
                    <li>Account preferences, language settings, notification preferences, and profile configuration.</li>
                    <li>Customer support messages, feedback, attachments, and correspondence with Vercal AI.</li>
                    <li>Billing-related identifiers if paid services are later enabled, such as subscription plan, invoice reference, or transaction status, while payment card details may be processed directly by payment processors and not stored by us.</li>
                  </ul>
                </SubSection>
                <SubSection title="3.2 Business Information">
                  <p>For business users, especially users configuring WhatsApp AI, we may collect business-related information, including:</p>
                  <ul>
                    <li>Company name, brand name, business category, industry, website, location, operating hours, products, services, policies, pricing information, and frequently asked questions.</li>
                    <li>Business verification materials, supporting documents, screenshots, identity-related information, or records needed to configure integrations or meet platform compliance requirements.</li>
                    <li>Team member names, roles, contact details, permission settings, and administrative activity logs.</li>
                    <li>Business knowledge documents, training instructions, response tone preferences, escalation rules, and automation configuration.</li>
                  </ul>
                </SubSection>
                <SubSection title="3.3 Usage Data, Log Data, and Device Information">
                  <p>We may automatically collect technical and usage information when you access the Services, including:</p>
                  <ul>
                    <li>IP address, approximate location derived from IP address, browser type, browser version, operating system, device type, screen size, referring URL, pages visited, timestamps, session duration, and interaction events.</li>
                    <li>API request metadata, webhook delivery logs, error logs, diagnostic information, latency, performance events, and security logs.</li>
                    <li>Identifiers associated with authentication sessions, cookies, local storage, device tokens, and similar technologies used to maintain secure and reliable access.</li>
                  </ul>
                </SubSection>
                <SubSection title="3.4 AI Interaction Data">
                  <p>When you use AI functionality, including Ivana AI or AI-powered automations within WhatsApp AI, we may process:</p>
                  <ul>
                    <li>Prompts, messages, questions, commands, conversation threads, uploaded context, documents, notes, and files submitted to the Service.</li>
                    <li>AI-generated responses, summaries, suggested replies, classifications, moderation outcomes, automation decisions, and related system outputs.</li>
                    <li>Feedback signals such as thumbs-up/down, edits, regenerated responses, copied responses, deleted responses, and user-submitted corrections.</li>
                    <li>Context used to personalize or improve responses, such as selected tone, preferred language, business knowledge base, conversation history, and feature settings.</li>
                  </ul>
                </SubSection>
                <SubSection title="3.5 WhatsApp Data">
                  <p>If you use WhatsApp AI or interact with a business that uses WhatsApp AI, we may process WhatsApp-related data through the WhatsApp Integration, including:</p>
                  <ul>
                    <li>Incoming and outgoing WhatsApp message content, including text, supported media metadata, and AI-generated or human-approved replies.</li>
                    <li>Customer phone numbers, WhatsApp profile names where made available by Meta, message timestamps, delivery status, read or failed status where available, and conversation identifiers.</li>
                    <li>Webhook payload metadata, message IDs, template IDs, business phone number IDs, WhatsApp Business Account IDs, and integration status information.</li>
                    <li>Business administrator credentials or configuration values necessary to connect the WhatsApp Business API, such as tokens, phone number IDs, webhook verification values, and related setup metadata.</li>
                  </ul>
                </SubSection>
              </PolicySection>

              <PolicySection id="how-we-use-information" title="4. How We Use Information">
                <p>We process information for legitimate business, contractual, security, compliance, and user-requested purposes, including the following:</p>
                <ul>
                  <li><strong>Providing AI responses:</strong> To receive prompts or messages, generate AI outputs, deliver responses, support ongoing conversations, and operate the functionality requested by users.</li>
                  <li><strong>Operating Ivana AI:</strong> To maintain conversation continuity, apply user settings, provide assistant responses, enable chat history where available, and support account-based AI interaction.</li>
                  <li><strong>Operating WhatsApp AI:</strong> To receive WhatsApp messages through the WhatsApp Business API, apply business rules and knowledge base content, generate or route replies, send responses through Meta systems, and maintain dashboard visibility.</li>
                  <li><strong>Improving models and services:</strong> To evaluate quality, diagnose failures, improve prompts, refine product behavior, enhance accuracy, reduce hallucinations, improve safety systems, and develop new features, subject to the model training limitations described in this Policy.</li>
                  <li><strong>Analytics and performance:</strong> To understand usage patterns, measure reliability, detect errors, monitor latency, optimize infrastructure, and improve user experience.</li>
                  <li><strong>Customer support:</strong> To respond to inquiries, investigate account issues, resolve integration failures, troubleshoot WhatsApp configuration, and provide technical assistance.</li>
                  <li><strong>Security and fraud prevention:</strong> To authenticate users, prevent unauthorized access, detect abuse, monitor suspicious behavior, protect integrations, prevent spam, enforce rate limits, and maintain platform integrity.</li>
                  <li><strong>Business verification and compliance:</strong> To support Meta platform requirements, WhatsApp Business API compliance, legal obligations, audit readiness, and enforcement of applicable policies.</li>
                  <li><strong>Communications:</strong> To send administrative messages, service updates, policy notices, security alerts, billing or plan-related notices if applicable, and support responses.</li>
                  <li><strong>Legal obligations:</strong> To comply with applicable law, respond to lawful requests, preserve legal rights, enforce agreements, and protect users, customers, Vercal AI, or the public.</li>
                </ul>
              </PolicySection>

              <PolicySection id="ivana-ai-specific-privacy" title="5. Ivana AI Specific Privacy">
                <p>
                  Ivana AI is the web/app AI assistant service within the Vercal AI platform. It is separate from WhatsApp AI and is intended for user-directed AI conversations, productivity support, information assistance, and related interactive assistant experiences. The privacy practices in this section apply specifically to Ivana AI.
                </p>
                <SubSection title="5.1 AI Conversations and Assistant Context">
                  <p>
                    When you interact with Ivana AI, we process the text, prompts, commands, uploaded context, conversation history, and AI responses needed to provide the assistant experience. This may include sensitive information if you choose to submit it. You should not submit confidential, regulated, or highly sensitive information unless you are authorized to do so and understand the risks of AI-assisted processing.
                  </p>
                </SubSection>
                <SubSection title="5.2 Storage of Prompts and Responses">
                  <p>
                    Depending on your account settings and product functionality, Ivana AI prompts and responses may be stored to provide chat history, continuity, debugging, personalization, account recovery, and quality assurance. Certain transient processing data may be retained temporarily in logs or caches for operational reliability, security monitoring, and abuse prevention.
                  </p>
                </SubSection>
                <SubSection title="5.3 Model Training Clarification">
                  <p>
                    Vercal AI does not sell Ivana AI conversation data. We do not intentionally use private user conversations to train public third-party foundation models unless we provide a clear notice or obtain any consent required by applicable law. We may use aggregated, anonymized, or de-identified information to improve product performance, safety, analytics, and user experience, provided such information is not reasonably capable of identifying an individual.
                  </p>
                </SubSection>
                <SubSection title="5.4 Temporary and Persistent Storage">
                  <p>
                    Some Ivana AI data may be processed only temporarily for response generation, while other data may be stored persistently to support account features such as chat history, preferences, memory-like features, and personalization. Where persistent storage is available, users may be provided controls to delete conversations, clear history, or change retention-related settings.
                  </p>
                </SubSection>
                <SubSection title="5.5 User Control Over Chats">
                  <p>
                    Subject to product availability, technical limitations, and legal obligations, users may request access to, deletion of, or export of their Ivana AI conversation data. Deletion may not immediately remove data from encrypted backups, security logs, or disaster recovery systems, but such data will be isolated from ordinary use and removed in accordance with applicable retention schedules.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="whatsapp-ai-specific-privacy" title="6. WhatsApp AI Specific Privacy">
                <p>
                  WhatsApp AI is a separate business automation service that may connect to the WhatsApp Business API and Meta infrastructure to help businesses automate customer communication. The privacy practices in this section apply specifically to WhatsApp AI and to data processed through the WhatsApp Integration.
                </p>
                <SubSection title="6.1 Integration with WhatsApp Business API">
                  <p>
                    When a business customer connects WhatsApp AI, the Service may receive webhook events and message data from Meta’s WhatsApp Business API. We use this data to process customer messages, apply business-defined automation rules, generate AI-assisted responses, and send messages through the connected WhatsApp Business account. WhatsApp AI operates as a processor or service provider for business customers where it handles their customer communication on their behalf, except where Vercal AI determines the purposes and means of processing for its own platform operations.
                  </p>
                </SubSection>
                <SubSection title="6.2 Data Shared with Meta Platforms">
                  <p>
                    WhatsApp messages, metadata, delivery information, business account identifiers, and template-related information may be transmitted to or received from Meta Platforms, Inc. or its affiliates as necessary for WhatsApp Business API functionality. Such processing is also subject to Meta’s applicable terms, developer policies, WhatsApp Business terms, and privacy documentation. Vercal AI does not control Meta’s independent processing of information within Meta systems.
                  </p>
                </SubSection>
                <SubSection title="6.3 Message Handling and Automation">
                  <p>
                    Incoming customer messages may be analyzed by AI systems using the business’s configured knowledge base, instructions, FAQs, policies, tone settings, and escalation rules. WhatsApp AI may generate suggested or automated replies, classify requests, detect intent, summarize conversations, and record chat logs in the business dashboard. Business customers are responsible for reviewing and configuring automation behavior appropriately for their industry, customers, legal obligations, and risk tolerance.
                  </p>
                </SubSection>
                <SubSection title="6.4 Customer Consent and Business Responsibility">
                  <p>
                    Business customers using WhatsApp AI are responsible for obtaining all notices, consents, permissions, and lawful bases required to communicate with their customers through WhatsApp and to process customer data using AI automation. Business customers must comply with applicable data protection laws, consumer protection laws, telecommunications rules, anti-spam requirements, Meta policies, WhatsApp Business policies, and any industry-specific obligations that apply to their operations.
                  </p>
                </SubSection>
                <SubSection title="6.5 WhatsApp Policy Compliance">
                  <p>
                    Business customers must not use WhatsApp AI to send unlawful, misleading, harmful, discriminatory, harassing, or policy-violating content. They must not upload, process, or automate content that violates Meta or WhatsApp policies. Vercal AI may suspend or restrict WhatsApp AI functionality where we reasonably believe an account, integration, or message flow presents a security, legal, abuse, spam, or platform compliance risk.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="data-sharing-and-disclosure" title="7. Data Sharing and Disclosure">
                <p>
                  We do not sell Personal Data in the ordinary meaning of that term. We may share or disclose information only as described in this Privacy Policy, with user direction, for operation of the Services, or as required or permitted by law.
                </p>
                <ul>
                  <li><strong>Infrastructure and hosting providers:</strong> We may use cloud hosting, database, storage, logging, and delivery providers to operate the Services securely and reliably.</li>
                  <li><strong>Authentication and security providers:</strong> We may use identity, authentication, fraud prevention, monitoring, and access control providers to protect accounts and systems.</li>
                  <li><strong>AI model and API providers:</strong> We may transmit prompts, messages, context, or other necessary inputs to AI inference providers solely to generate responses, classify messages, summarize content, or provide requested AI functionality.</li>
                  <li><strong>Meta and WhatsApp services:</strong> For WhatsApp AI, message content and related metadata may be shared with Meta or processed through Meta APIs as necessary to send, receive, and manage WhatsApp messages.</li>
                  <li><strong>Analytics and performance providers:</strong> We may use analytics and diagnostic tools to understand product usage, improve reliability, detect crashes, and optimize performance.</li>
                  <li><strong>Professional advisors:</strong> We may disclose information to legal counsel, auditors, accountants, insurers, or other advisors where reasonably necessary for business, compliance, or legal purposes.</li>
                  <li><strong>Legal requirements:</strong> We may disclose information to courts, regulators, law enforcement, government authorities, or third parties where required by law or where we believe disclosure is necessary to protect rights, safety, security, or legal interests.</li>
                  <li><strong>Business transfers:</strong> If Vercal AI is involved in a merger, acquisition, financing, restructuring, bankruptcy, sale of assets, or similar transaction, information may be transferred as part of that transaction subject to appropriate confidentiality and notice measures where required.</li>
                </ul>
              </PolicySection>

              <PolicySection id="data-retention" title="8. Data Retention">
                <p>
                  We retain information for as long as reasonably necessary to provide the Services, maintain business records, comply with legal obligations, resolve disputes, enforce agreements, protect security, and support legitimate operational needs. Retention periods vary depending on the type of data, service used, account status, legal requirements, and user settings.
                </p>
                <ul>
                  <li><strong>Account information:</strong> Retained while your account remains active and for a reasonable period thereafter for security, audit, compliance, and dispute resolution purposes.</li>
                  <li><strong>Ivana AI conversations:</strong> Retained according to product settings, user controls, operational needs, and applicable law. Users may request deletion or export where available and legally required.</li>
                  <li><strong>WhatsApp AI chat logs:</strong> Retained to provide dashboard history, support business review, troubleshoot automation, and satisfy legal or compliance requirements. Business customers may request deletion subject to applicable constraints.</li>
                  <li><strong>Credentials and integration data:</strong> Retained only while necessary to maintain the integration or as required for audit, security, or legal reasons. If an integration is disconnected, credentials may be deleted or rendered unusable according to our technical processes.</li>
                  <li><strong>Backups and logs:</strong> Deleted data may persist in encrypted backups, disaster recovery systems, and security logs for a limited period until those systems cycle out according to retention schedules.</li>
                  <li><strong>De-identified data:</strong> Aggregated, anonymized, or de-identified information may be retained for longer periods where it cannot reasonably identify an individual.</li>
                </ul>
              </PolicySection>

              <PolicySection id="data-security" title="9. Data Security">
                <p>
                  Vercal AI uses administrative, technical, and organizational safeguards designed to protect information against unauthorized access, disclosure, alteration, loss, misuse, or destruction. These measures may include encryption in transit, secure storage practices, access controls, authentication protections, least-privilege permissions, audit logging, monitoring, credential isolation, and environment separation where appropriate.
                </p>
                <p>
                  Sensitive credentials, such as WhatsApp integration tokens where stored by the Service, are intended to be protected using encryption or equivalent safeguards and are not designed to be displayed back to users after submission. Access to production systems and user data is limited to authorized personnel and service providers who require access for legitimate operational purposes.
                </p>
                <p>
                  No system, network, software, encryption method, or electronic storage mechanism can be guaranteed to be completely secure. Users are responsible for maintaining the confidentiality of their account credentials, using strong passwords, protecting administrative access, reviewing connected integrations, and promptly notifying us of suspected unauthorized access or security incidents.
                </p>
              </PolicySection>

              <PolicySection id="user-rights" title="10. User Rights">
                <p>
                  Depending on your jurisdiction, role, and relationship with Vercal AI, you may have certain rights regarding Personal Data. These rights may be subject to limitations, verification requirements, exceptions, and the rights of other individuals.
                </p>
                <ul>
                  <li><strong>Access:</strong> You may request information about whether we process your Personal Data and request a copy of certain Personal Data we hold about you.</li>
                  <li><strong>Correction:</strong> You may request correction of inaccurate or incomplete Personal Data.</li>
                  <li><strong>Deletion:</strong> You may request deletion of Personal Data, subject to legal, contractual, security, backup, and operational limitations.</li>
                  <li><strong>Portability:</strong> Where applicable, you may request a portable copy of certain information in a structured, commonly used format.</li>
                  <li><strong>Restriction or objection:</strong> You may request that we restrict certain processing or object to certain processing based on legitimate interests where applicable law provides such rights.</li>
                  <li><strong>Withdraw consent:</strong> Where processing is based on consent, you may withdraw consent at any time, without affecting processing that occurred before withdrawal.</li>
                  <li><strong>Appeal or complaint:</strong> Where applicable, you may appeal our response or lodge a complaint with a competent data protection authority.</li>
                </ul>
                <p>
                  If you are an end customer of a business that uses WhatsApp AI, the business customer may be the primary controller of your data. In such cases, we may direct your request to that business or assist the business in responding where required by law or contract.
                </p>
              </PolicySection>

              <PolicySection id="cookies-and-tracking" title="11. Cookies and Tracking">
                <p>
                  We may use cookies, local storage, pixels, SDKs, log files, and similar technologies to operate, secure, analyze, and improve the Services. These technologies may store identifiers, preferences, authentication status, session information, device information, and usage events.
                </p>
                <ul>
                  <li><strong>Essential technologies:</strong> Required for login, security, session management, fraud prevention, preferences, and core platform functionality.</li>
                  <li><strong>Analytics technologies:</strong> Used to understand how users interact with the Services, identify issues, improve features, and measure performance.</li>
                  <li><strong>Preference technologies:</strong> Used to remember user choices, such as interface settings, language, cookie preferences, or dismissed notices.</li>
                  <li><strong>Marketing technologies:</strong> Used only where implemented and permitted, and subject to applicable consent requirements.</li>
                </ul>
                <p>
                  You may control cookies through browser settings and any cookie preference tools we provide. Disabling certain technologies may affect the availability, security, or functionality of the Services.
                </p>
              </PolicySection>

              <PolicySection id="childrens-privacy" title="12. Children’s Privacy">
                <p>
                  The Services are not intended for children under the age of 13, or under the age required by applicable law in the relevant jurisdiction. We do not knowingly collect Personal Data from children in violation of applicable law. If you believe a child has provided Personal Data to Vercal AI without appropriate consent, please contact us and we will take reasonable steps to delete or restrict the information as required.
                </p>
                <p>
                  Business customers using WhatsApp AI are responsible for ensuring that their customer communications, automations, and data collection practices are appropriate for their audience and comply with laws applicable to minors, students, consumers, and protected categories of individuals.
                </p>
              </PolicySection>

              <PolicySection id="international-data-transfers" title="13. International Data Transfers">
                <p>
                  Vercal AI may process and store information in countries other than the country where you reside or where your business is established. Cloud infrastructure, AI providers, analytics vendors, Meta services, support tools, and other service providers may operate globally. As a result, information may be transferred to, stored in, or accessed from jurisdictions that may have data protection laws different from those in your jurisdiction.
                </p>
                <p>
                  Where required, we use appropriate safeguards for international transfers, which may include contractual protections, data processing agreements, standard contractual clauses, vendor due diligence, transfer impact assessments, encryption, access controls, and other measures designed to protect Personal Data in accordance with applicable law.
                </p>
              </PolicySection>

              <PolicySection id="changes-to-this-policy" title="14. Changes to This Privacy Policy">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our Services, technology, legal requirements, business practices, integrations, security measures, or data processing activities. When we make material changes, we may provide notice through the Services, by email, through account notifications, or by other reasonable means.
                </p>
                <p>
                  The “Last updated” date at the top of this Privacy Policy indicates when it was last revised. Your continued use of the Services after an updated Privacy Policy becomes effective constitutes acknowledgment of the updated Policy, to the extent permitted by law. If you do not agree to the updated Policy, you should discontinue use of the Services and, where applicable, disconnect integrations or close your account.
                </p>
              </PolicySection>

              <PolicySection id="contact-information" title="15. Contact Information">
                <p>
                  If you have questions, requests, concerns, or complaints regarding this Privacy Policy or Vercal AI’s data practices, please contact us using the information below:
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
                  <p className="mt-3 text-sm text-zinc-500">
                    Please include sufficient information for us to understand and verify your request. For WhatsApp AI requests involving a business customer’s end users, we may require the relevant business account, phone number, or other information needed to route the request appropriately.
                  </p>
                </div>
              </PolicySection>
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
            <Link href="/terms" className="transition hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PolicySection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
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
