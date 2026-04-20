import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Plyndrox AI",
  description:
    "Comprehensive Privacy Policy for Plyndrox AI, including Plyndrox AI, Plyndrox WhatsApp AI, and Plyndrox Inbox AI data handling practices.",
};

const tableOfContents = [
  ["Introduction", "introduction"],
  ["Definitions", "definitions"],
  ["Information We Collect", "information-we-collect"],
  ["How We Use Information", "how-we-use-information"],
  ["Plyndrox AI Specific Privacy", "evara-ai-specific-privacy"],
  ["Plyndrox WhatsApp AI Specific Privacy", "whatsapp-ai-specific-privacy"],
  ["Plyndrox Inbox AI Specific Privacy", "inbox-ai-specific-privacy"],
  ["Gmail OAuth and Google API Data", "gmail-oauth-and-google-api-data"],
  ["Email Content Processing and AI Analysis", "email-content-processing"],
  ["Lead Intelligence and Contact Data", "lead-intelligence"],
  ["Plyndrox Inbox AI Data Retention and Deletion", "inbox-ai-data-retention"],
  ["Data Sharing and Disclosure", "data-sharing-and-disclosure"],
  ["General Data Retention", "data-retention"],
  ["Data Security", "data-security"],
  ["User Rights", "user-rights"],
  ["Cookies and Tracking", "cookies-and-tracking"],
  ["Children's Privacy", "childrens-privacy"],
  ["International Data Transfers", "international-data-transfers"],
  ["Changes to This Policy", "changes-to-this-policy"],
  ["Contact Information", "contact-information"],
];

export default function PrivacyPolicyPage() {
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
              <span className="block text-xs text-gray-400">Privacy Policy</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/inbox" className="hidden rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 sm:inline-flex">
              Plyndrox Inbox AI
            </Link>
            <Link href="/whatsapp-ai" className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:inline-flex">
              Plyndrox WhatsApp AI
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
              <nav className="mt-5 space-y-1" aria-label="Privacy policy sections">
                {tableOfContents.map(([label, id]) => (
                  <a key={id} href={`#${id}`} className="block rounded-2xl px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-[#1d2226]">
                    {label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Services Covered</p>
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <p>Plyndrox AI — Web/App AI assistant</p>
                  <p>Plyndrox WhatsApp AI — WhatsApp Business API automation</p>
                  <p>Plyndrox Inbox AI — Gmail-connected email intelligence</p>
                </div>
              </div>
            </div>
          </aside>

          <article className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-2xl shadow-gray-100 backdrop-blur-2xl sm:p-8 lg:p-10">
            <div className="border-b border-gray-200 pb-8">
              <p className="inline-flex rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-violet-700">
                Legal Document
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#1d2226] sm:text-5xl lg:text-6xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-sm text-gray-400">
                Last updated: June 14, 2026 · Effective date: June 14, 2026
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600">
                This Privacy Policy describes how Plyndrox AI collects, uses, stores, shares, protects, and otherwise processes information in connection with its artificial intelligence software services, including Plyndrox AI, Plyndrox WhatsApp AI, and Plyndrox Inbox AI. It is intended to provide a comprehensive and transparent explanation of our privacy practices for users, business customers, website visitors, and individuals whose information may be processed through customer-configured integrations.
              </p>
            </div>

            <div className="policy-content mt-10 space-y-12">
              <PolicySection id="introduction" title="1. Introduction">
                <p>
                  Plyndrox AI, operating through the plyndrox.app platform and associated services, provides AI-powered software tools designed to assist individuals and businesses with automation, communication, productivity, intelligent response generation, and email intelligence. Our services include, without limitation, Plyndrox AI, a web and application-based AI assistant; Plyndrox WhatsApp AI, an automation service that enables businesses to use artificial intelligence in connection with the WhatsApp Business API; and Plyndrox Inbox AI, a sophisticated Gmail-connected intelligence tool that provides email summaries, intent detection, priority scoring, lead intelligence, follow-up suggestions, and smart reply generation.
                </p>
                <p>
                  This Privacy Policy applies to all users of Plyndrox AI websites, applications, dashboards, APIs, integrations, and related services, whether accessed through a browser, mobile application, progressive web application, business dashboard, or third-party communication channel. Where this document refers to the "Service" or "Services," it includes Plyndrox AI, Plyndrox WhatsApp AI, and Plyndrox Inbox AI unless a section expressly states otherwise.
                </p>
                <p>
                  Plyndrox Inbox AI is a particularly data-sensitive service because it operates in connection with your Gmail account and processes actual email content, attachments, sender and recipient metadata, thread history, and related communication data. We take this responsibility seriously and have developed specific privacy controls, access limitations, data minimization principles, and user consent mechanisms specifically for the Plyndrox Inbox AI service. These are described in detail in sections 7 through 11 of this Privacy Policy.
                </p>
                <p>
                  By accessing, registering for, connecting to, configuring, or otherwise using any part of the Services, you acknowledge that you have read and understood this Privacy Policy. If you use the Services on behalf of a company, organization, or other legal entity, you represent that you are authorized to bind that entity and that such entity accepts the practices described herein.
                </p>
                <p>
                  The Plyndrox WhatsApp AI and Plyndrox Inbox AI services are separate products with distinct privacy implications. However, because all services are operated under the Plyndrox AI platform, this Privacy Policy covers them in a single document and includes service-specific provisions for each where necessary. We encourage all users — especially those using Plyndrox Inbox AI — to read this Policy in its entirety so they fully understand how their most sensitive data is handled.
                </p>
              </PolicySection>

              <PolicySection id="definitions" title="2. Definitions">
                <p>For purposes of this Privacy Policy, the following terms have the meanings set forth below:</p>
                <DefinitionList items={[
                  ["Service or Services", "The websites, web applications, mobile or progressive web applications, dashboards, APIs, automations, integrations, AI assistant features, WhatsApp automation features, Plyndrox Inbox AI features, support channels, and related software operated by or on behalf of Plyndrox AI."],
                  ["Plyndrox AI", "The AI SaaS platform that provides Plyndrox AI, Plyndrox WhatsApp AI, Plyndrox Inbox AI, and related automation, communication, and artificial intelligence services through plyndrox.app and associated domains."],
                  ["Plyndrox AI", "The Plyndrox AI web/app AI assistant service used for prompts, conversations, productivity support, general AI interaction, and related assistant functionality."],
                  ["Plyndrox WhatsApp AI", "The Plyndrox AI business automation service that connects to the WhatsApp Business API or related Meta services to process messages, automate replies, manage business communication, and assist with customer interactions."],
                  ["Plyndrox Inbox AI", "The Plyndrox AI Gmail-connected email intelligence service that, upon user authorization via Google OAuth, accesses Gmail data to provide email summaries, intent and sentiment analysis, priority scoring, smart reply suggestions, follow-up detection, lead intelligence, and related AI-powered inbox management features."],
                  ["Gmail Integration", "The connection established between Plyndrox Inbox AI and a user's Google account via OAuth 2.0, which grants the Service limited, scoped access to Gmail API data, including email messages, threads, labels, sender and recipient metadata, and related inbox data, as authorized by the user."],
                  ["Email Content Data", "The body text, subject lines, attachment metadata, sender and recipient email addresses, display names, timestamps, thread identifiers, label identifiers, message identifiers, read/unread status, draft content, and other structured and unstructured content contained within or associated with Gmail messages accessed through the Gmail Integration."],
                  ["AI Inbox Analysis", "The automated processing of Email Content Data and associated metadata by Plyndrox AI's AI systems to generate summaries, classify intent, detect sentiment, assign priority scores, identify follow-up requirements, surface leads and contacts, suggest smart replies, and produce other analytical outputs within the Plyndrox Inbox AI dashboard."],
                  ["Lead Intelligence Data", "Information extracted or inferred from Email Content Data through AI Inbox Analysis, including identified contacts, companies, roles, business opportunities, action items, project references, meeting requests, proposed deals, budgets, timelines, and other commercially relevant signals."],
                  ["User", "Any individual who accesses or uses the Services, including account holders, website visitors, business administrators, team members, end customers who interact with a connected WhatsApp business number, and authorized representatives of business customers."],
                  ["Personal Data", "Any information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked to an identified or identifiable natural person."],
                  ["Processing", "Any operation performed on Personal Data, including collection, recording, organization, structuring, storage, adaptation, retrieval, consultation, use, transmission, disclosure, alignment, restriction, erasure, or destruction."],
                  ["AI Interaction Data", "Prompts, messages, instructions, uploaded context, conversation history, AI-generated responses, feedback, ratings, corrections, and related metadata generated when using AI features."],
                  ["Third-party Services", "External providers, platforms, APIs, infrastructure vendors, analytics tools, authentication providers, hosting providers, payment processors, AI model providers, Google services, Meta services, or other services not directly operated by Plyndrox AI."],
                  ["OAuth Token", "A cryptographic credential issued by Google during the OAuth 2.0 authorization flow that grants Plyndrox AI scoped, revocable access to a user's Gmail account on behalf of the user. OAuth Tokens may include access tokens and refresh tokens."],
                  ["WhatsApp Integration", "The connection between Plyndrox WhatsApp AI and the WhatsApp Business API, Meta developer tools, business phone numbers, webhook events, message templates, credentials, and related Meta infrastructure."],
                ]} />
              </PolicySection>

              <PolicySection id="information-we-collect" title="3. Information We Collect">
                <p>
                  We collect information in several categories depending on how you interact with the Services, which features you use, whether you are an individual user or business customer, and whether you configure integrations such as the WhatsApp Business API or the Gmail Integration for Plyndrox Inbox AI. We collect only information that is reasonably necessary to provide, secure, administer, improve, and support the Services, subject to applicable legal requirements.
                </p>
                <SubSection title="3.1 Personal Information">
                  <p>We may collect personal information that you provide directly or that is generated through your use of the Services, including:</p>
                  <ul>
                    <li>Name, display name, account name, or profile identifier.</li>
                    <li>Email address, phone number, account login credentials, and authentication identifiers.</li>
                    <li>Account preferences, language settings, notification preferences, and profile configuration.</li>
                    <li>Customer support messages, feedback, attachments, and correspondence with Plyndrox AI.</li>
                    <li>Billing-related identifiers if paid services are later enabled, such as subscription plan, invoice reference, or transaction status, while payment card details may be processed directly by payment processors and not stored by us.</li>
                  </ul>
                </SubSection>
                <SubSection title="3.2 Business Information">
                  <p>For business users, especially users configuring Plyndrox WhatsApp AI or Plyndrox Inbox AI for business purposes, we may collect business-related information, including:</p>
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
                  <p>When you use AI functionality, including Plyndrox AI, AI-powered automations within Plyndrox WhatsApp AI, or AI Inbox Analysis within Plyndrox Inbox AI, we may process:</p>
                  <ul>
                    <li>Prompts, messages, questions, commands, conversation threads, uploaded context, documents, notes, and files submitted to the Service.</li>
                    <li>AI-generated responses, summaries, suggested replies, classifications, intent labels, priority scores, moderation outcomes, automation decisions, and related system outputs.</li>
                    <li>Feedback signals such as thumbs-up/down, edits, regenerated responses, copied responses, deleted responses, dismissed suggestions, and user-submitted corrections.</li>
                    <li>Context used to personalize or improve responses, such as selected tone, preferred language, business knowledge base, conversation history, and feature settings.</li>
                  </ul>
                </SubSection>
                <SubSection title="3.5 Gmail and Email Data (Plyndrox Inbox AI)">
                  <p>If you connect your Gmail account to Plyndrox Inbox AI using the Gmail Integration, we will access and process Gmail data on your behalf. This includes, but may not be limited to:</p>
                  <ul>
                    <li>Email message bodies, subject lines, quoted text, reply chains, and thread content, including any embedded links, formatted text, and inline text content.</li>
                    <li>Sender and recipient email addresses, display names, CC and BCC metadata to the extent accessible through the Gmail API, and contact information appearing in email headers.</li>
                    <li>Message timestamps, thread identifiers, message identifiers, label identifiers, folder structure, read/unread status, starred status, and archival status.</li>
                    <li>Attachment filenames, MIME types, and attachment size metadata — note that we do not by default read attachment content unless a specific feature requiring attachment analysis is activated and separately disclosed.</li>
                    <li>Gmail labels, categories, filters, and folder organization that may be relevant to the analysis or prioritization features you use.</li>
                    <li>Draft email content where you explicitly use features that involve draft creation or smart reply generation through the Service.</li>
                    <li>Pagination and synchronization tokens used to efficiently fetch new email data incrementally without re-fetching entire mailboxes.</li>
                    <li>OAuth Token metadata, including token issuance timestamps, last refresh timestamps, associated Google account identifiers, and scopes granted.</li>
                  </ul>
                  <p>We access Gmail data exclusively through the Google Gmail API using OAuth 2.0 authorization. We do not access Gmail data through screen scraping, credential sharing, password storage, or any method other than the authorized API. The specific Gmail API scopes requested are limited to those necessary to provide the Plyndrox Inbox AI features you have enabled.</p>
                </SubSection>
                <SubSection title="3.6 WhatsApp Data">
                  <p>If you use Plyndrox WhatsApp AI or interact with a business that uses Plyndrox WhatsApp AI, we may process WhatsApp-related data through the WhatsApp Integration, including:</p>
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
                  <li><strong>Operating Plyndrox AI:</strong> To maintain conversation continuity, apply user settings, provide assistant responses, enable chat history where available, and support account-based AI interaction.</li>
                  <li><strong>Operating Plyndrox WhatsApp AI:</strong> To receive WhatsApp messages through the WhatsApp Business API, apply business rules and knowledge base content, generate or route replies, send responses through Meta systems, and maintain dashboard visibility.</li>
                  <li><strong>Operating Plyndrox Inbox AI:</strong> To access Gmail data through the authorized Gmail Integration, apply AI Inbox Analysis to email content and metadata, generate summaries, classify intent, detect sentiment, score priorities, surface leads, identify follow-ups, generate smart replies, and display analytical outputs in your Plyndrox Inbox AI dashboard — all exclusively for your own use and account.</li>
                  <li><strong>Lead intelligence and contact extraction:</strong> To identify contacts, companies, deal signals, action items, and commercially relevant patterns within email data and present them as structured Lead Intelligence Data within your dashboard.</li>
                  <li><strong>Improving models and services:</strong> To evaluate quality, diagnose failures, improve prompts, refine product behavior, enhance accuracy, reduce hallucinations, improve safety systems, and develop new features, subject to the model training limitations described in this Policy.</li>
                  <li><strong>Analytics and performance:</strong> To understand usage patterns, measure reliability, detect errors, monitor latency, optimize infrastructure, and improve user experience.</li>
                  <li><strong>Customer support:</strong> To respond to inquiries, investigate account issues, resolve integration failures, troubleshoot Gmail connection problems, and provide technical assistance.</li>
                  <li><strong>Security and fraud prevention:</strong> To authenticate users, prevent unauthorized access, detect abuse, monitor suspicious behavior, protect integrations, prevent spam, enforce rate limits, and maintain platform integrity.</li>
                  <li><strong>Legal obligations:</strong> To comply with applicable law, respond to lawful requests, preserve legal rights, enforce agreements, and protect users, customers, Plyndrox AI, or the public.</li>
                  <li><strong>Communications:</strong> To send administrative messages, service updates, policy notices, security alerts, billing or plan-related notices if applicable, and support responses.</li>
                </ul>
              </PolicySection>

              <PolicySection id="evara-ai-specific-privacy" title="5. Plyndrox AI Specific Privacy">
                <p>
                  Plyndrox AI is the web/app AI assistant service within the Plyndrox AI platform. It is separate from Plyndrox WhatsApp AI and Plyndrox Inbox AI and is intended for user-directed AI conversations, productivity support, information assistance, and related interactive assistant experiences. The privacy practices in this section apply specifically to Plyndrox AI.
                </p>
                <SubSection title="5.1 AI Conversations and Assistant Context">
                  <p>
                    When you interact with Plyndrox AI, we process the text, prompts, commands, uploaded context, conversation history, and AI responses needed to provide the assistant experience. This may include sensitive information if you choose to submit it. You should not submit confidential, regulated, or highly sensitive information unless you are authorized to do so and understand the risks of AI-assisted processing.
                  </p>
                </SubSection>
                <SubSection title="5.2 Storage of Prompts and Responses">
                  <p>
                    Depending on your account settings and product functionality, Plyndrox AI prompts and responses may be stored to provide chat history, continuity, debugging, personalization, account recovery, and quality assurance. Certain transient processing data may be retained temporarily in logs or caches for operational reliability, security monitoring, and abuse prevention.
                  </p>
                </SubSection>
                <SubSection title="5.3 Model Training Clarification">
                  <p>
                    Plyndrox AI does not sell Plyndrox AI conversation data. We do not intentionally use private user conversations to train public third-party foundation models unless we provide a clear notice or obtain any consent required by applicable law. We may use aggregated, anonymized, or de-identified information to improve product performance, safety, analytics, and user experience, provided such information is not reasonably capable of identifying an individual.
                  </p>
                </SubSection>
                <SubSection title="5.4 User Control Over Chats">
                  <p>
                    Subject to product availability, technical limitations, and legal obligations, users may request access to, deletion of, or export of their Plyndrox AI conversation data. Deletion may not immediately remove data from encrypted backups, security logs, or disaster recovery systems, but such data will be isolated from ordinary use and removed in accordance with applicable retention schedules.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="whatsapp-ai-specific-privacy" title="6. Plyndrox WhatsApp AI Specific Privacy">
                <p>
                  Plyndrox WhatsApp AI is a separate business automation service that may connect to the WhatsApp Business API and Meta infrastructure to help businesses automate customer communication. The privacy practices in this section apply specifically to Plyndrox WhatsApp AI and to data processed through the WhatsApp Integration.
                </p>
                <SubSection title="6.1 Integration with WhatsApp Business API">
                  <p>
                    When a business customer connects Plyndrox WhatsApp AI, the Service may receive webhook events and message data from Meta's WhatsApp Business API. We use this data to process customer messages, apply business-defined automation rules, generate AI-assisted responses, and send messages through the connected WhatsApp Business account.
                  </p>
                </SubSection>
                <SubSection title="6.2 Data Shared with Meta Platforms">
                  <p>
                    WhatsApp messages, metadata, delivery information, business account identifiers, and template-related information may be transmitted to or received from Meta Platforms, Inc. or its affiliates as necessary for WhatsApp Business API functionality. Such processing is also subject to Meta's applicable terms, developer policies, WhatsApp Business terms, and privacy documentation. Plyndrox AI does not control Meta's independent processing of information within Meta systems.
                  </p>
                </SubSection>
                <SubSection title="6.3 Message Handling and Automation">
                  <p>
                    Incoming customer messages may be analyzed by AI systems using the business's configured knowledge base, instructions, FAQs, policies, tone settings, and escalation rules. Plyndrox WhatsApp AI may generate suggested or automated replies, classify requests, detect intent, summarize conversations, and record chat logs in the business dashboard. Business customers are responsible for reviewing and configuring automation behavior appropriately.
                  </p>
                </SubSection>
                <SubSection title="6.4 Customer Consent and Business Responsibility">
                  <p>
                    Business customers using Plyndrox WhatsApp AI are responsible for obtaining all notices, consents, permissions, and lawful bases required to communicate with their customers through WhatsApp and to process customer data using AI automation. Business customers must comply with applicable data protection laws, consumer protection laws, telecommunications rules, anti-spam requirements, Meta policies, and WhatsApp Business policies.
                  </p>
                </SubSection>
                <SubSection title="6.5 WhatsApp Policy Compliance">
                  <p>
                    Business customers must not use Plyndrox WhatsApp AI to send unlawful, misleading, harmful, discriminatory, harassing, or policy-violating content. Plyndrox AI may suspend or restrict Plyndrox WhatsApp AI functionality where we reasonably believe an account, integration, or message flow presents a security, legal, abuse, spam, or platform compliance risk.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="inbox-ai-specific-privacy" title="7. Plyndrox Inbox AI — General Privacy Practices">
                <p>
                  Plyndrox Inbox AI is Plyndrox AI's most data-intensive service. It operates in direct connection with your Gmail account and processes the contents of your personal or business email communications in order to provide AI-powered inbox intelligence. Because email contains some of the most sensitive categories of personal, professional, legal, financial, and relational information that individuals and businesses generate, we treat Plyndrox Inbox AI data with the highest degree of care and apply specific, heightened privacy practices to this service.
                </p>
                <p>
                  This section provides a general overview of Plyndrox Inbox AI privacy. Sections 8 through 11 provide deeper detail on specific aspects of the service, including Gmail OAuth access, email content processing, lead intelligence, and data retention. We strongly encourage all Plyndrox Inbox AI users to read these sections in full before connecting their Gmail account.
                </p>
                <SubSection title="7.1 Consent-First Access Model">
                  <p>
                    Plyndrox Inbox AI does not access your Gmail account without your explicit, informed consent expressed through the Google OAuth 2.0 authorization flow. You must actively initiate the connection by clicking "Connect Gmail" or an equivalent control within the Plyndrox Inbox AI interface and then completing the Google authorization screen, which clearly displays the permissions being requested. Until you complete this flow and grant authorization, we have no access to any Gmail data associated with your account.
                  </p>
                  <p>
                    The OAuth scopes we request are limited to those necessary for the specific Plyndrox Inbox AI features you have enabled. If we add features that require additional scopes, we will request your explicit re-authorization for the expanded permissions before accessing any additional data. We do not hold broader permissions than those you have actively granted.
                  </p>
                </SubSection>
                <SubSection title="7.2 Purpose Limitation for Email Data">
                  <p>
                    Email Content Data and AI Inbox Analysis outputs accessed through the Gmail Integration are used exclusively to provide Plyndrox Inbox AI features to you, the authenticated account holder who authorized the connection. We do not use your email content to train publicly available AI models without your separately expressed consent. We do not share your email content with other Plyndrox AI users, advertisers, data brokers, or unrelated third parties. We do not use your email content for any purpose that is not disclosed in this Privacy Policy or separately communicated to you.
                  </p>
                </SubSection>
                <SubSection title="7.3 Data Minimization Principles">
                  <p>
                    We apply data minimization principles to Plyndrox Inbox AI. This means we fetch and process only the email data necessary to deliver the specific features you are actively using. For example, if you are using the Smart Digest feature, we access recent email metadata and content sufficient to generate a daily summary. We do not perform bulk exports of your entire mailbox history unless a feature you explicitly activate requires broader historical access, and in such cases we will clearly describe the scope of data accessed.
                  </p>
                </SubSection>
                <SubSection title="7.4 No Email Advertising or Profiling for Third-Party Benefit">
                  <p>
                    Plyndrox AI does not use your Email Content Data to build advertising profiles, sell audience segments, perform cross-user behavioral profiling, or serve targeted advertisements. The Gmail data you share with us is used solely and exclusively to operate the Plyndrox Inbox AI features you have selected. This commitment applies regardless of whether you are on a free or paid plan.
                  </p>
                </SubSection>
                <SubSection title="7.5 AI Processing Transparency">
                  <p>
                    When AI Inbox Analysis produces outputs such as summaries, intent labels, priority scores, or smart reply suggestions, those outputs are presented to you in the dashboard and are based entirely on your own email data. We do not commingle your email data with another user's email data to produce outputs. Each user's Plyndrox Inbox AI analysis is performed in isolation with respect to that user's own authorized Gmail data.
                  </p>
                </SubSection>
                <SubSection title="7.6 User Control and Revocation">
                  <p>
                    You may disconnect your Gmail account from Plyndrox Inbox AI at any time by using the "Disconnect Gmail" or "Revoke Access" control in the Plyndrox Inbox AI settings, or by visiting your Google Account permissions page at myaccount.google.com/permissions and revoking access to Plyndrox Inbox AI. Upon revocation, we will no longer be able to fetch new Gmail data. Existing Email Content Data stored in our systems for the purpose of displaying your history within the dashboard will be scheduled for deletion in accordance with our data retention policy described in Section 11.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="gmail-oauth-and-google-api-data" title="8. Gmail OAuth and Google API Data">
                <p>
                  This section describes in detail how we handle the Google OAuth 2.0 authorization process, the OAuth Tokens generated by that process, the scope of Google API access we hold, and our obligations with respect to Google's API Services User Data Policy.
                </p>
                <SubSection title="8.1 OAuth 2.0 Authorization Flow">
                  <p>
                    Plyndrox Inbox AI uses the OAuth 2.0 authorization framework to obtain your consent to access Gmail data. During the authorization flow, you are redirected to Google's authorization server, where Google presents you with a consent screen listing the exact permissions (scopes) that Plyndrox Inbox AI is requesting. You have full visibility into what access is being requested before you grant it. Plyndrox AI does not have access to your Google account password at any point during or after this process.
                  </p>
                  <p>
                    The scopes we request are determined by the features you are activating. Typical scopes may include read access to Gmail messages and metadata, and where applicable, the ability to send email through your account for smart reply or follow-up features if you explicitly activate and authorize those capabilities.
                  </p>
                </SubSection>
                <SubSection title="8.2 OAuth Token Storage and Security">
                  <p>
                    After authorization, Google issues OAuth Tokens — including an access token for immediate API calls and a refresh token for long-lived access — to our backend systems. These tokens are stored in encrypted form in our database and are never exposed in API responses, user-facing interfaces, logs, or error messages. Access to stored OAuth Tokens is restricted to the backend services that need them to perform Gmail API calls on your behalf, and is not accessible to other users, frontend clients, or non-essential backend systems.
                  </p>
                  <p>
                    Refresh tokens are used solely to obtain new access tokens when they expire, allowing the Plyndrox Inbox AI service to continue operating between your active sessions without requiring you to re-authorize frequently. We do not use refresh tokens for any purpose other than refreshing access tokens for Plyndrox Inbox AI functionality.
                  </p>
                </SubSection>
                <SubSection title="8.3 Gmail API Scope Restrictions">
                  <p>
                    We access only the Gmail API data permitted by the scopes you have granted. We do not access Google Drive, Google Calendar, Google Contacts, Google Workspace admin functions, or any other Google service beyond what is authorized. If future Plyndrox Inbox AI features require access to additional Google services, we will request those permissions separately and clearly identify what new access is being requested before you grant it.
                  </p>
                </SubSection>
                <SubSection title="8.4 Compliance with Google API Services User Data Policy">
                  <p>
                    Plyndrox AI's use of data obtained through Google APIs complies with the Google API Services User Data Policy, including the Limited Use requirements. Specifically:
                  </p>
                  <ul>
                    <li>We use Google user data only to provide or improve features that are clearly visible within Plyndrox Inbox AI and that you have actively enabled.</li>
                    <li>We do not transfer Gmail data to third parties except as necessary to provide and improve the Plyndrox Inbox AI service, in compliance with applicable law, and only to processors who are bound by confidentiality obligations.</li>
                    <li>We do not use Gmail data to serve advertisements.</li>
                    <li>We do not allow humans to read your Gmail messages unless you have given us explicit permission to do so, we need to do so for security purposes such as investigating abuse, or we are required to do so by law.</li>
                    <li>We do not use Gmail data for any purpose not clearly disclosed to you at the time of authorization.</li>
                  </ul>
                </SubSection>
                <SubSection title="8.5 Token Revocation and Disconnection">
                  <p>
                    If you revoke our access through Google's permission management tools, our OAuth Tokens for your account will be invalidated by Google, and we will no longer be able to access your Gmail data through the API. Our systems will detect the token revocation upon the next API call and will update your account status to reflect the disconnected state. You may also disconnect from within the Plyndrox Inbox AI settings panel, which will trigger deletion of stored tokens from our database.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="email-content-processing" title="9. Email Content Processing and AI Analysis">
                <p>
                  This section explains in detail how email content is fetched, transmitted, processed by AI systems, stored, and presented back to you through the Plyndrox Inbox AI dashboard. Understanding this pipeline is important for evaluating the privacy implications of using Plyndrox Inbox AI features.
                </p>
                <SubSection title="9.1 Email Fetching and Synchronization">
                  <p>
                    When you access Plyndrox Inbox AI features, our backend systems use your authorized OAuth Token to make API calls to the Gmail API on your behalf. Depending on the feature, this may involve fetching full message content, fetching only message headers and metadata, listing threads or labels, or searching messages based on specific criteria such as date range, sender, or label. Email data is fetched over encrypted HTTPS connections directly from Google's API servers.
                  </p>
                  <p>
                    For efficiency, we may use incremental synchronization techniques such as Gmail's history tokens or page tokens to fetch only new or changed messages since the last synchronization, rather than re-fetching your entire mailbox on each request. Synchronization state tokens are stored securely in our database associated with your account.
                  </p>
                </SubSection>
                <SubSection title="9.2 AI Model Processing">
                  <p>
                    Fetched email content and metadata are passed to AI inference systems — either operated by Plyndrox AI directly or via AI API providers — to perform AI Inbox Analysis. This analysis may involve natural language understanding of email body text and subject lines, named entity recognition to identify people, companies, dates, and amounts, intent classification to determine the purpose of an email, sentiment analysis to assess tone and urgency, priority scoring algorithms that combine multiple signals to rank email importance, and generative AI to propose smart reply drafts.
                  </p>
                  <p>
                    When email data is transmitted to AI model providers as part of this inference pipeline, those providers receive the minimum necessary content to perform the requested analysis. We use AI providers who are bound by data processing agreements that prohibit them from using your data for their own model training purposes. The outputs of AI inference — summaries, labels, scores, and reply suggestions — are returned to our systems and presented to you in the Plyndrox Inbox AI dashboard.
                  </p>
                </SubSection>
                <SubSection title="9.3 Storage of Processed Email Data">
                  <p>
                    For the Plyndrox Inbox AI service to function effectively — including enabling you to view your smart digest, revisit analyzed emails, and access historical prioritization scores — we store certain Email Content Data and AI Inbox Analysis outputs in our database. This stored data is associated with your account and is not shared with other users.
                  </p>
                  <p>
                    Specifically, we may store the following:
                  </p>
                  <ul>
                    <li>Email message identifiers, thread identifiers, subject lines, sender and recipient addresses, and timestamps used as keys to link stored analysis to your inbox.</li>
                    <li>Summarized or processed representations of email content generated by AI Inbox Analysis, such as summaries, intent labels, and priority scores — rather than raw full-body content in all cases.</li>
                    <li>Smart reply suggestions generated by AI systems.</li>
                    <li>Lead Intelligence Data extracted from emails, including identified contacts, companies, and deal signals.</li>
                    <li>Synchronization state data such as history tokens used to efficiently fetch new data on subsequent sessions.</li>
                  </ul>
                  <p>
                    We may also temporarily cache raw email body content in memory or short-lived storage during active processing sessions to improve responsiveness, but we do not store full raw email bodies in permanent storage beyond what is necessary for active dashboard functionality. We continually evaluate our storage practices to minimize the retention of raw email content.
                  </p>
                </SubSection>
                <SubSection title="9.4 Smart Reply and Send Functionality">
                  <p>
                    If you use smart reply features that allow Plyndrox Inbox AI to compose or send email on your behalf, this requires the Service to call the Gmail API's send or draft-creation endpoints. Before any email is sent through your account using this feature, you will receive a preview and an explicit confirmation step. We will not send email on your behalf without your active confirmation unless you have separately configured an automation that you have explicitly set up and approved for unattended operation.
                  </p>
                  <p>
                    Outbound emails composed or sent through Plyndrox Inbox AI may be stored in your Gmail Sent folder by virtue of the Gmail API's standard behavior, subject to how Google processes send requests. Plyndrox AI may also log metadata about send events — such as timestamp, recipient address, and subject — for audit, security, and customer support purposes.
                  </p>
                </SubSection>
                <SubSection title="9.5 Confidentiality of Email Content">
                  <p>
                    Email communications often contain highly confidential information including legally privileged attorney-client communications, medical or health information, financial records, trade secrets, personal relationships, and sensitive business negotiations. You are responsible for evaluating whether connecting a particular Gmail account — especially a work or professional account — to Plyndrox Inbox AI is appropriate given the confidentiality obligations, workplace policies, regulatory requirements, or contractual restrictions that may apply to your email communications.
                  </p>
                  <p>
                    Plyndrox AI does not claim any ownership over your email content. Your email remains your property or the property of the applicable parties to those communications. We process your email content only in the capacity of a data processor or service provider acting on your behalf, for the limited purpose of providing the Plyndrox Inbox AI features you have enabled.
                  </p>
                </SubSection>
                <SubSection title="9.6 No Indexing for Cross-User Intelligence">
                  <p>
                    We do not use your email content to build cross-user indexes, competitive intelligence systems, industry trend databases, or aggregated signals that benefit other users or third parties. Your email data is processed individually, in the context of your own account, and the outputs are presented only to you. We do not identify or extract signals from your emails that could benefit a competitor, partner, advertiser, or other party outside your account.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="lead-intelligence" title="10. Lead Intelligence and Contact Data">
                <p>
                  One of the distinctive features of Plyndrox Inbox AI is the Lead Intelligence capability, which uses AI to identify commercially relevant signals, contacts, and opportunities within your email communications. This section describes how Lead Intelligence Data is processed, stored, and controlled.
                </p>
                <SubSection title="10.1 What Lead Intelligence Extracts">
                  <p>
                    The AI Inbox Analysis pipeline may identify and extract the following types of information from your email content for Lead Intelligence purposes:
                  </p>
                  <ul>
                    <li>Contact information appearing in emails, including names, email addresses, phone numbers, company names, job titles, and websites where they appear in email bodies, signatures, or headers.</li>
                    <li>Commercial signals such as inquiries about products or services, expressions of interest, price negotiations, project scoping conversations, budget discussions, and related commercial intent.</li>
                    <li>Action items, follow-up tasks, deadlines, meeting requests, and commitments made or received in email threads.</li>
                    <li>Deal-stage indicators such as first contact, proposal sent, approval requested, contract under discussion, or closing signals.</li>
                    <li>Company and organizational data inferred from email domain names, signatures, or contextual mentions within email content.</li>
                  </ul>
                </SubSection>
                <SubSection title="10.2 How Lead Intelligence Data Is Used">
                  <p>
                    Lead Intelligence Data is surfaced within your Plyndrox Inbox AI dashboard to help you manage relationships, prioritize follow-ups, and identify business opportunities. This data is stored in your Plyndrox Inbox AI account and is not shared with other Plyndrox AI users, business partners, or external lead databases. Lead Intelligence Data belongs to your account and represents information already present in your own email communications — we surface it as structured data, not create it from external sources.
                  </p>
                </SubSection>
                <SubSection title="10.3 Third-Party Contact Privacy">
                  <p>
                    Lead Intelligence processing necessarily involves data about third parties — the people and companies who send you email or whom you email. These individuals have not independently consented to Plyndrox AI's processing of their information. Their data appears in our systems solely because it was present in email communications you have authorized us to process.
                  </p>
                  <p>
                    We treat this third-party contact data with care. We do not sell it, aggregate it across users, use it to build marketing lists, or share it with external parties for any purpose unrelated to providing your Plyndrox Inbox AI service. If a third party contacts us about information we hold about them that originated from your email communications, we will direct such requests appropriately and work with you to resolve them where legally required.
                  </p>
                </SubSection>
                <SubSection title="10.4 Accuracy and AI Inference Limitations">
                  <p>
                    Lead Intelligence Data is generated by AI inference and is subject to the inherent limitations of natural language processing, including the possibility of misclassification, missed signals, false positives, incorrect attributions, hallucinations, or incomplete extraction. You should treat Lead Intelligence outputs as AI-assisted suggestions rather than as verified facts. Plyndrox AI is not responsible for business decisions made in reliance on Lead Intelligence Data without independent verification.
                  </p>
                </SubSection>
                <SubSection title="10.5 User Control Over Lead Data">
                  <p>
                    Within the Plyndrox Inbox AI dashboard, you may review, edit, dismiss, or delete Lead Intelligence entries. Deleted Lead Intelligence Data will be removed from your active dashboard. Depending on our backup retention schedules, deleted entries may persist in encrypted backups for a limited period before being permanently purged, as described in Section 11.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="inbox-ai-data-retention" title="11. Plyndrox Inbox AI Data Retention and Deletion">
                <p>
                  This section sets out the specific data retention and deletion practices that apply to Email Content Data, AI Inbox Analysis outputs, Lead Intelligence Data, OAuth Tokens, and synchronization data processed through Plyndrox Inbox AI. These practices are in addition to the general data retention practices described in Section 13.
                </p>
                <SubSection title="11.1 Active Account Retention">
                  <p>
                    While your Gmail account remains connected and your Plyndrox Inbox AI account remains active, Email Content Data, processed analysis outputs, and Lead Intelligence Data will be retained in our systems to provide continuous dashboard functionality, support feature performance, and allow you to access historical analysis. The retention period for actively connected accounts is governed by your account plan, product feature limits, and any retention controls available in your account settings.
                  </p>
                </SubSection>
                <SubSection title="11.2 Post-Disconnection Retention and Deletion">
                  <p>
                    When you disconnect your Gmail account from Plyndrox Inbox AI — whether by using the in-app disconnect control, revoking access through Google's account permissions, or deleting your Plyndrox AI account — we initiate a process to delete the following data:
                  </p>
                  <ul>
                    <li>Stored OAuth Tokens (access and refresh tokens) associated with your Google account.</li>
                    <li>Cached or stored Email Content Data fetched through the Gmail Integration.</li>
                    <li>AI Inbox Analysis outputs stored in our active database, including summaries, intent labels, and priority scores.</li>
                    <li>Lead Intelligence Data associated with your account.</li>
                    <li>Synchronization state data such as history tokens.</li>
                  </ul>
                  <p>
                    We aim to complete deletion of active database records within 30 days of disconnection or account deletion request. Data may persist in encrypted backups for up to an additional 90 days until those backups are cycled out according to our standard backup rotation schedule. During this period, backup data is not used for any operational purpose and is not accessible to normal production systems.
                  </p>
                </SubSection>
                <SubSection title="11.3 Legal Hold and Compliance Exceptions">
                  <p>
                    In certain limited circumstances, we may be required to retain data beyond the standard deletion timelines described above, including where we are subject to a legal hold, litigation preservation obligation, regulatory investigation, lawful court order, or mandatory audit requirement. Where such obligations apply, we will retain only the minimum data required and for the minimum period required, and we will resume ordinary deletion processes as soon as the legal obligation is satisfied.
                  </p>
                </SubSection>
                <SubSection title="11.4 Security Log Retention">
                  <p>
                    Security event logs associated with Plyndrox Inbox AI activity — such as login events, token refresh events, API call metadata, and rate limit events — may be retained for security investigation, fraud prevention, and compliance purposes even after your account is disconnected or deleted. These logs contain operational metadata rather than email content and are retained for a period consistent with our security and compliance needs, typically no longer than 12 months from the event date.
                  </p>
                </SubSection>
                <SubSection title="11.5 Requesting Early Deletion">
                  <p>
                    You may request early deletion of your Plyndrox Inbox AI data at any time by contacting us using the information in Section 20. We will process deletion requests within 30 days and will confirm completion to you. Note that early deletion may result in loss of dashboard history, analysis results, and Lead Intelligence Data that cannot be recovered after deletion.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="data-sharing-and-disclosure" title="12. Data Sharing and Disclosure">
                <p>
                  We do not sell Personal Data in the ordinary meaning of that term. We do not sell Gmail data, Email Content Data, or any data obtained through the Gmail Integration under any circumstances. We may share or disclose information only as described in this Privacy Policy, with user direction, for operation of the Services, or as required or permitted by law.
                </p>
                <ul>
                  <li><strong>Infrastructure and hosting providers:</strong> We may use cloud hosting, database, storage, logging, and delivery providers to operate the Services securely and reliably. These providers access only the data necessary to perform their contracted functions.</li>
                  <li><strong>AI model and API providers:</strong> We may transmit email content, prompts, messages, context, or other necessary inputs to AI inference providers solely to generate analysis outputs, summaries, classifications, and smart replies for your Plyndrox Inbox AI account. AI providers used for Gmail data processing are bound by data processing agreements that prohibit use of your data for their own training.</li>
                  <li><strong>Authentication and security providers:</strong> We may use identity, authentication, fraud prevention, monitoring, and access control providers to protect accounts and systems.</li>
                  <li><strong>Google APIs and Services:</strong> For Plyndrox Inbox AI, email data is fetched from Google through authorized API calls. Plyndrox AI does not independently share your data back to Google beyond normal API operations. Google's handling of its own data is governed by Google's Privacy Policy and API terms.</li>
                  <li><strong>Meta and WhatsApp services:</strong> For Plyndrox WhatsApp AI, message content and related metadata may be shared with Meta or processed through Meta APIs as necessary to send, receive, and manage WhatsApp messages.</li>
                  <li><strong>Analytics and performance providers:</strong> We may use analytics and diagnostic tools to understand product usage, improve reliability, detect crashes, and optimize performance. These tools receive aggregated, anonymized data and do not receive individual Email Content Data.</li>
                  <li><strong>Professional advisors:</strong> We may disclose information to legal counsel, auditors, accountants, insurers, or other advisors where reasonably necessary for business, compliance, or legal purposes.</li>
                  <li><strong>Legal requirements:</strong> We may disclose information to courts, regulators, law enforcement, government authorities, or third parties where required by law or where we believe disclosure is necessary to protect rights, safety, security, or legal interests. We will notify you of such requests where legally permitted to do so.</li>
                  <li><strong>Business transfers:</strong> If Plyndrox AI is involved in a merger, acquisition, financing, restructuring, bankruptcy, sale of assets, or similar transaction, information — including Plyndrox Inbox AI data — may be transferred as part of that transaction, subject to the acquirer being bound by privacy obligations at least as protective as those in this Policy, and subject to appropriate notice to affected users where required by law.</li>
                </ul>
              </PolicySection>

              <PolicySection id="data-retention" title="13. General Data Retention">
                <p>
                  We retain information for as long as reasonably necessary to provide the Services, maintain business records, comply with legal obligations, resolve disputes, enforce agreements, protect security, and support legitimate operational needs. Retention periods vary depending on the type of data, service used, account status, legal requirements, and user settings. For Plyndrox Inbox AI-specific retention practices, see Section 11.
                </p>
                <ul>
                  <li><strong>Account information:</strong> Retained while your account remains active and for a reasonable period thereafter for security, audit, compliance, and dispute resolution purposes.</li>
                  <li><strong>Plyndrox AI conversations:</strong> Retained according to product settings, user controls, operational needs, and applicable law. Users may request deletion or export where available and legally required.</li>
                  <li><strong>Plyndrox WhatsApp AI chat logs:</strong> Retained to provide dashboard history, support business review, troubleshoot automation, and satisfy legal or compliance requirements.</li>
                  <li><strong>Plyndrox Inbox AI data:</strong> Retained as described in Section 11, with deletion initiated upon disconnection or account deletion.</li>
                  <li><strong>Credentials and integration data:</strong> Retained only while necessary to maintain the integration or as required for audit, security, or legal reasons.</li>
                  <li><strong>Backups and logs:</strong> Deleted data may persist in encrypted backups, disaster recovery systems, and security logs for a limited period until those systems cycle out according to retention schedules.</li>
                  <li><strong>De-identified data:</strong> Aggregated, anonymized, or de-identified information may be retained for longer periods where it cannot reasonably identify an individual.</li>
                </ul>
              </PolicySection>

              <PolicySection id="data-security" title="14. Data Security">
                <p>
                  Plyndrox AI uses administrative, technical, and organizational safeguards designed to protect information against unauthorized access, disclosure, alteration, loss, misuse, or destruction. For Gmail and Plyndrox Inbox AI data specifically, we apply heightened security measures given the sensitivity of email content.
                </p>
                <p>
                  These measures may include: encryption of data in transit using TLS for all API communications, including Gmail API calls; encryption at rest for stored Email Content Data, OAuth Tokens, and Lead Intelligence Data using industry-standard encryption algorithms; strict access controls limiting which backend services and personnel can access Plyndrox Inbox AI data; separate storage and access paths for OAuth Tokens to prevent accidental exposure; audit logging of access to Gmail-related data and OAuth Token usage; and environment separation between development, staging, and production systems to prevent unauthorized access to real user data.
                </p>
                <p>
                  Sensitive credentials, including OAuth Tokens for Gmail, are stored in encrypted form and are not displayed back to users after authorization. Access to production systems and user data is limited to authorized personnel and service providers who require access for legitimate operational purposes and are bound by confidentiality obligations.
                </p>
                <p>
                  No system, network, software, encryption method, or electronic storage mechanism can be guaranteed to be completely secure. Users are responsible for maintaining the confidentiality of their Plyndrox AI account credentials, using strong passwords, protecting administrative access, reviewing connected integrations regularly, and promptly notifying us of suspected unauthorized access or security incidents at support@plyndrox.app.
                </p>
              </PolicySection>

              <PolicySection id="user-rights" title="15. User Rights">
                <p>
                  Depending on your jurisdiction, role, and relationship with Plyndrox AI, you may have certain rights regarding Personal Data. These rights may be subject to limitations, verification requirements, exceptions, and the rights of other individuals.
                </p>
                <ul>
                  <li><strong>Access:</strong> You may request information about whether we process your Personal Data, including Email Content Data and Lead Intelligence Data, and request a copy of certain Personal Data we hold about you.</li>
                  <li><strong>Correction:</strong> You may request correction of inaccurate or incomplete Personal Data.</li>
                  <li><strong>Deletion:</strong> You may request deletion of Personal Data, including Plyndrox Inbox AI data, subject to legal, contractual, security, backup, and operational limitations. See Section 11 for Plyndrox Inbox AI-specific deletion practices.</li>
                  <li><strong>Portability:</strong> Where applicable, you may request a portable copy of certain information in a structured, commonly used format.</li>
                  <li><strong>Restriction or objection:</strong> You may request that we restrict certain processing or object to certain processing based on legitimate interests where applicable law provides such rights.</li>
                  <li><strong>Withdraw consent and disconnect:</strong> You may withdraw your consent to Gmail data processing at any time by disconnecting the Gmail Integration through the Plyndrox Inbox AI settings or by revoking access through your Google Account. This will stop further data collection, though data already processed will be subject to our retention and deletion practices.</li>
                  <li><strong>Appeal or complaint:</strong> Where applicable, you may appeal our response or lodge a complaint with a competent data protection authority.</li>
                </ul>
                <p>
                  If you are an end customer of a business that uses Plyndrox WhatsApp AI, the business customer may be the primary controller of your data. In such cases, we may direct your request to that business or assist the business in responding where required by law or contract.
                </p>
              </PolicySection>

              <PolicySection id="cookies-and-tracking" title="16. Cookies and Tracking">
                <p>
                  We may use cookies, local storage, pixels, SDKs, log files, and similar technologies to operate, secure, analyze, and improve the Services. These technologies may store identifiers, preferences, authentication status, session information, device information, and usage events.
                </p>
                <ul>
                  <li><strong>Essential technologies:</strong> Required for login, security, session management, fraud prevention, preferences, and core platform functionality, including maintaining your Plyndrox Inbox AI connection state.</li>
                  <li><strong>Analytics technologies:</strong> Used to understand how users interact with the Services, identify issues, improve features, and measure performance. Analytics technologies do not receive your Gmail content.</li>
                  <li><strong>Preference technologies:</strong> Used to remember user choices, such as interface settings, language, or dismissed notices.</li>
                </ul>
                <p>
                  You may control cookies through browser settings and any cookie preference tools we provide. Disabling certain technologies may affect the availability, security, or functionality of the Services, including the ability to maintain your Gmail connection state across sessions.
                </p>
              </PolicySection>

              <PolicySection id="childrens-privacy" title="17. Children's Privacy">
                <p>
                  The Services are not intended for children under the age of 13, or under the age required by applicable law in the relevant jurisdiction. Plyndrox Inbox AI in particular, given its access to email communications, is intended for adult use in personal and professional contexts. We do not knowingly collect Personal Data from children in violation of applicable law.
                </p>
                <p>
                  If you believe a child has provided Personal Data to Plyndrox AI without appropriate consent, or has connected a Gmail account through Plyndrox Inbox AI without authorization, please contact us and we will take reasonable steps to delete or restrict the information as required by law.
                </p>
              </PolicySection>

              <PolicySection id="international-data-transfers" title="18. International Data Transfers">
                <p>
                  Plyndrox AI may process and store information in countries other than the country where you reside or where your business is established. Cloud infrastructure, AI providers, analytics vendors, Google APIs, Meta services, support tools, and other service providers may operate globally. As a result, information — including Email Content Data processed through Plyndrox Inbox AI — may be transferred to, stored in, or accessed from jurisdictions that may have data protection laws different from those in your jurisdiction.
                </p>
                <p>
                  Where required, we use appropriate safeguards for international transfers, which may include contractual protections, data processing agreements, standard contractual clauses, vendor due diligence, transfer impact assessments, encryption, access controls, and other measures designed to protect Personal Data in accordance with applicable law.
                </p>
                <p>
                  For users in the European Economic Area, United Kingdom, Switzerland, or other jurisdictions with cross-border transfer restrictions, our use of Gmail data via Google APIs necessarily involves processing by Google infrastructure which may span multiple jurisdictions. Google's own cross-border data transfer practices are governed by Google's Privacy Policy and applicable data processing agreements. Our processing of data fetched from Google APIs is subject to the safeguards described in this Policy and any applicable data processing addendum we maintain.
                </p>
              </PolicySection>

              <PolicySection id="changes-to-this-policy" title="19. Changes to This Privacy Policy">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our Services, technology, legal requirements, business practices, integrations, security measures, or data processing activities — including material changes to how Plyndrox Inbox AI handles Gmail data. When we make material changes, particularly to sections governing Gmail data, we will provide prominent notice through the Plyndrox Inbox AI dashboard, by email to your registered address, through account notifications, or by other reasonable means, and we may require you to re-acknowledge the updated Policy before continuing to use Plyndrox Inbox AI features.
                </p>
                <p>
                  The "Last updated" date at the top of this Privacy Policy indicates when it was last revised. For Plyndrox Inbox AI users specifically, we will not materially expand our use of Gmail data in ways that go beyond what you authorized without seeking your explicit re-consent. If you do not agree to an updated Policy as it applies to Plyndrox Inbox AI, you should disconnect your Gmail account from Plyndrox Inbox AI before the updated Policy takes effect.
                </p>
              </PolicySection>

              <PolicySection id="contact-information" title="20. Contact Information">
                <p>
                  If you have questions, requests, concerns, or complaints regarding this Privacy Policy, Plyndrox AI's data practices, or specifically regarding the handling of your Gmail data or Plyndrox Inbox AI information, please contact us using the information below:
                </p>
                <div className="rounded-3xl border border-gray-200 bg-white p-6">
                  <p className="text-lg font-semibold text-[#1d2226]">Plyndrox AI / Plyndrox</p>
                  <p className="mt-2 text-gray-500">plyndrox.app</p>
                  <p className="mt-4">
                    <span className="font-semibold text-[#1d2226]">Email:</span>{" "}
                    <a href="mailto:support@plyndrox.app" className="text-violet-700 underline decoration-purple-300/40 underline-offset-4 transition hover:text-white">
                      support@plyndrox.app
                    </a>
                  </p>
                  <p className="mt-3 text-sm text-gray-400">
                    For Plyndrox Inbox AI and Gmail data requests, please include your registered email address and a description of the data you are requesting access to, correction of, or deletion of. For requests related to disconnecting your Gmail account or revoking Plyndrox Inbox AI access, you may also visit your Google Account permissions page at myaccount.google.com/permissions. We aim to respond to all privacy-related requests within 30 days.
                  </p>
                </div>
              </PolicySection>
            </div>
          </article>
        </div>
      </main>

      <footer className="relative z-10 border-t border-gray-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Plyndrox AI. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <Link href="/inbox" className="transition hover:text-white">Plyndrox Inbox AI</Link>
            <Link href="/whatsapp-ai" className="transition hover:text-white">Plyndrox WhatsApp AI</Link>
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
      <h2 className="border-b border-gray-200 pb-4 text-2xl font-semibold tracking-tight text-[#1d2226] sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-4 text-base leading-8 text-gray-600 [&_a]:text-violet-700 [&_a]:underline [&_a]:decoration-purple-300/40 [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-[#1d2226] [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-3">
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white p-5">
      <h3 className="text-lg font-semibold text-[#1d2226]">{title}</h3>
      <div className="mt-3 space-y-4 text-gray-600 [&_li]:pl-1 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-3">
        {children}
      </div>
    </div>
  );
}

function DefinitionList({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid gap-4">
      {items.map(([term, definition]) => (
        <div key={term} className="rounded-3xl border border-white/[0.08] bg-white p-5">
          <dt className="font-semibold text-[#1d2226]">{term}</dt>
          <dd className="mt-2 text-gray-600">{definition}</dd>
        </div>
      ))}
    </dl>
  );
}
