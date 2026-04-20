import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Plyndrox AI",
  description:
    "Comprehensive Terms of Service for Plyndrox AI, including Plyndrox AI, Plyndrox WhatsApp AI, and Plyndrox Inbox AI platform usage terms.",
};

const tableOfContents = [
  ["Introduction and Agreement", "introduction"],
  ["Definitions", "definitions"],
  ["Eligibility and Account Registration", "eligibility-and-account-registration"],
  ["Description of Services", "description-of-services"],
  ["Plyndrox Inbox AI — Specific Terms", "inbox-ai-specific-terms"],
  ["Gmail Integration and Google OAuth Terms", "gmail-integration-terms"],
  ["Plyndrox WhatsApp AI — Specific Terms", "whatsapp-ai-specific-terms"],
  ["Acceptable Use Policy", "acceptable-use-policy"],
  ["Plyndrox Inbox AI Acceptable Use", "inbox-ai-acceptable-use"],
  ["User Responsibilities", "user-responsibilities"],
  ["AI Output Disclaimer", "ai-output-disclaimer"],
  ["Email Intelligence Disclaimer", "email-intelligence-disclaimer"],
  ["Payments, Subscriptions, and Billing", "payments-subscriptions-and-billing"],
  ["Intellectual Property Rights", "intellectual-property-rights"],
  ["User Content and License", "user-content-and-license"],
  ["Third-Party Services and Integrations", "third-party-services"],
  ["Data Usage and Privacy Reference", "data-usage-reference"],
  ["Confidentiality Obligations", "confidentiality"],
  ["Service Availability and Modifications", "service-availability-and-modifications"],
  ["Feedback and Suggestions", "feedback-and-suggestions"],
  ["Termination and Suspension", "termination-and-suspension"],
  ["Effect of Termination on Plyndrox Inbox AI Data", "termination-inbox-ai"],
  ["Disclaimer of Warranties", "disclaimer-of-warranties"],
  ["Limitation of Liability", "limitation-of-liability"],
  ["Indemnification", "indemnification"],
  ["Dispute Resolution", "dispute-resolution"],
  ["Governing Law and Jurisdiction", "governing-law"],
  ["Miscellaneous Provisions", "miscellaneous"],
  ["Changes to Terms", "changes-to-terms"],
  ["Contact Information", "contact-information"],
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white text-[#1d2226]">
      
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white/10 transition group-hover:border-purple-300/40">
              <img src="/plyndrox-logo.svg" alt="Plyndrox AI" className="h-10 w-10 object-contain plyndrox-logo-img" draggable={false} />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.24em] text-[#1d2226]">Plyndrox AI</span>
              <span className="block text-xs text-gray-400">Terms of Service</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/inbox" className="hidden rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 sm:inline-flex">
              Plyndrox Inbox AI
            </Link>
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
              <nav className="mt-5 space-y-1" aria-label="Terms sections">
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
                Legal Agreement
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#1d2226] sm:text-5xl lg:text-6xl">
                Terms of Service
              </h1>
              <p className="mt-4 text-sm text-gray-400">
                Last updated: June 14, 2026 · Effective date: June 14, 2026
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600">
                These Terms of Service constitute a legally binding agreement between you and Plyndrox AI governing your access to and use of plyndrox.app, Plyndrox AI, Plyndrox WhatsApp AI, Plyndrox Inbox AI, websites, dashboards, applications, APIs, integrations, and all related services. Please read this document carefully and in its entirety before using any part of the platform. Your use of any Service constitutes acceptance of all terms herein.
              </p>
            </div>

            <div className="mt-10 space-y-12">

              <TermsSection id="introduction" title="1. Introduction and Agreement">
                <p>
                  Plyndrox AI provides artificial intelligence software services for individuals, creators, professionals, and businesses. The platform encompasses Plyndrox AI, a web and app-based AI assistant experience; Plyndrox WhatsApp AI, a business automation service that integrates with the WhatsApp Business API and related Meta platform services; and Plyndrox Inbox AI, a Gmail-connected email intelligence service that uses artificial intelligence to analyze, prioritize, summarize, and extract intelligence from your email communications. These services represent distinct product experiences and are governed collectively by these Terms unless service-specific provisions state otherwise.
                </p>
                <p>
                  These Terms of Service, together with our <Link href="/privacy-policy">Privacy Policy</Link> and any additional agreements, order forms, service-level commitments, data processing addenda, or supplementary terms referenced herein or separately agreed to in writing, form the entire agreement between you and Plyndrox AI with respect to the Services. In the event of a conflict between these Terms and a separately executed written agreement, the separately executed written agreement shall govern to the extent of the conflict.
                </p>
                <p>
                  These Terms apply to your access to and use of all Plyndrox AI services, including websites, applications, dashboards, APIs, automations, AI chat features, Gmail integration features, WhatsApp automation features, support services, documentation, beta programs, pilot features, and future products or features that reference these Terms. By accessing or using the Services, creating an account, connecting an integration such as Gmail OAuth or the WhatsApp Business API, submitting content, or using or distributing any AI-generated output, you agree to be legally bound by these Terms and by our Privacy Policy, which is incorporated herein by reference.
                </p>
                <p>
                  If you use the Services on behalf of a company, organization, or other legal entity, you represent and warrant that: (a) you have the legal authority to act on behalf of that entity; (b) you are authorized to bind that entity to these Terms; (c) you have the authority to grant all permissions, connect all integrations, and accept all obligations described herein on behalf of that entity; and (d) the entity accepts full responsibility for compliance with these Terms. In that case, "you" and "your" refer both to you individually and to the entity you represent, and Plyndrox AI may hold the entity primarily responsible for breaches of these Terms. If you do not agree to these Terms in their entirety, you must not access or use any part of the Services.
                </p>
                <p>
                  Plyndrox Inbox AI is a particularly sensitive service because it involves access to and processing of your personal or business email communications through a Gmail Integration. By connecting your Gmail account to Plyndrox Inbox AI, you are consenting to the processing of email content, metadata, and related data as described in these Terms and in the Privacy Policy. You should not connect a Gmail account if you are not authorized to do so, if your workplace policies prohibit third-party email integrations, or if your emails contain regulated data such as attorney-client privileged communications, protected health information, or other data subject to special legal protections that restrict third-party processing.
                </p>
              </TermsSection>

              <TermsSection id="definitions" title="2. Definitions">
                <p>The following definitions apply throughout these Terms of Service. Defined terms appear in title case throughout the document.</p>
                <DefinitionList items={[
                  ["Service or Services", "The Plyndrox AI websites, web applications, mobile or progressive web applications, dashboards, APIs, AI assistant functions, Gmail integration functions, WhatsApp automation functions, documentation, support services, beta features, and all related software, features, and technology operated by or on behalf of Plyndrox AI under the plyndrox.app domain and associated services."],
                  ["Platform", "The plyndrox.app software environment, interface, infrastructure, backend systems, AI models, algorithms, and related technology through which the Services are made available to users."],
                  ["User or you", "Any individual or legal entity that accesses or uses the Services in any capacity, including account holders, administrators, team members, website visitors, business customers, developers using APIs, and authorized representatives of corporate or institutional accounts."],
                  ["Plyndrox AI", "The Plyndrox AI web and app AI assistant service that allows users to submit prompts, questions, instructions, messages, and contextual information to receive AI-generated responses, summaries, suggestions, drafts, and other assistant outputs."],
                  ["Plyndrox WhatsApp AI", "The Plyndrox AI business automation service that connects to the WhatsApp Business API or related Meta tools to receive customer messages, process automated or AI-assisted replies, manage business communication workflows, and display conversation data in a business dashboard."],
                  ["Plyndrox Inbox AI", "The Plyndrox AI Gmail-connected email intelligence service that, upon a User's explicit authorization via Google OAuth, accesses Gmail data to provide email summaries, intent and sentiment analysis, priority scoring, follow-up detection, smart reply suggestions, lead intelligence, and related AI-powered inbox management and analytics features."],
                  ["Gmail Integration", "The OAuth 2.0-based connection established between Plyndrox Inbox AI and a User's Google account, which grants the Service scoped, revocable access to Gmail API data including email messages, threads, labels, metadata, and related inbox data, strictly as authorized by the User and within the bounds of the Google API Services User Data Policy."],
                  ["Email Content Data", "The body text, subject lines, attachment metadata, sender and recipient email addresses, display names, timestamps, thread identifiers, label identifiers, message identifiers, read/unread status, draft content, and other structured or unstructured content contained within or associated with Gmail messages accessed through the Gmail Integration."],
                  ["AI Inbox Analysis", "The automated processing of Email Content Data and associated metadata by Plyndrox AI's AI systems to generate summaries, classify intent, detect sentiment, assign priority scores, identify follow-up requirements, surface leads and contacts, suggest smart replies, and produce other analytical outputs within the Plyndrox Inbox AI dashboard."],
                  ["Lead Intelligence Data", "Structured data extracted or inferred from Email Content Data through AI Inbox Analysis, including identified contacts, companies, roles, business opportunities, action items, project references, deal signals, meeting requests, budget references, timelines, and other commercially relevant information."],
                  ["OAuth Token", "A cryptographic credential issued by Google during the OAuth 2.0 authorization flow that grants the Service scoped, time-limited, revocable access to a User's Gmail account on behalf of that User, including both access tokens and refresh tokens issued by Google."],
                  ["Content", "Any text, data, prompts, instructions, files, documents, business knowledge, customer messages, email content, media, configurations, feedback, or other material submitted, uploaded, transmitted, generated, or displayed through the Services by any party."],
                  ["User Content", "Content submitted, uploaded, provided, configured, or transmitted by or on behalf of a User, including business information, prompts, WhatsApp messages, business knowledge base documents, customer support materials, feedback, and any other input provided to the Services."],
                  ["AI Output", "Any response, suggestion, classification, summary, message, analysis, priority score, smart reply draft, lead record, follow-up recommendation, automation result, or other material generated by artificial intelligence systems operating within or on behalf of the Services, including outputs generated in connection with Email Content Data processed through Plyndrox Inbox AI."],
                  ["Third-party Services", "Products, APIs, platforms, models, infrastructure, software, analytics tools, authentication providers, payment processors, Google services, Meta services, WhatsApp Business API, or other services not owned or controlled by Plyndrox AI that are used or interoperated with in connection with the Services."],
                  ["WhatsApp Integration", "The connection between Plyndrox WhatsApp AI and WhatsApp Business API functionality, including business phone numbers, webhook events, Meta developer tools, credentials, message templates, and related integration configuration."],
                  ["Effective Date", "The date on which these Terms become binding on you, which is the earlier of: (a) the date you first access or use the Services; (b) the date you create an account; or (c) the date you accept these Terms by clicking an acceptance button or entering into a written agreement referencing these Terms."],
                  ["Confidential Information", "Any non-public information disclosed by one party to the other in connection with the Services that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure, including business data, pricing, technical architecture, API credentials, OAuth Tokens, and Email Content Data."],
                ]} />
              </TermsSection>

              <TermsSection id="eligibility-and-account-registration" title="3. Eligibility and Account Registration">
                <SubSection title="3.1 Age and Legal Capacity">
                  <p>
                    You must be at least eighteen (18) years of age, or the age of legal majority in your jurisdiction, whichever is higher, to use the Services. The Services are not designed for, marketed to, or intended for use by minors. Plyndrox Inbox AI, in particular, involves access to personal and professional email communications and is strictly intended for adult users in personal or business contexts. By using any Service, you represent and warrant that you meet the applicable age requirements.
                  </p>
                </SubSection>
                <SubSection title="3.2 Authority to Bind an Entity">
                  <p>
                    If you access or use the Services on behalf of a business, employer, partnership, organization, government entity, or other legal entity, you represent and warrant that: (a) you are duly authorized to represent and bind that entity; (b) you have been granted express authority by an authorized officer, director, or equivalent of that entity to accept these Terms; and (c) you are not acting in violation of any fiduciary duty, employment obligation, or contractual restriction. Plyndrox AI may request evidence of your authority in connection with enterprise accounts, API access, or data processing agreements.
                  </p>
                </SubSection>
                <SubSection title="3.3 Account Registration Requirements">
                  <p>
                    Certain features and Services require account registration. You agree to provide accurate, current, complete, and non-misleading information during registration, including your name, valid email address, business information where applicable, and any other information required. You agree to keep all registration information updated throughout the period you maintain an account. We may reject, suspend, or terminate an account if information appears inaccurate, fraudulent, unauthorized, unlawful, or inconsistent with these Terms, or if we are unable to verify the information provided.
                  </p>
                </SubSection>
                <SubSection title="3.4 Account Security Obligations">
                  <p>
                    You are solely responsible for maintaining the security and confidentiality of your account credentials, passwords, two-factor authentication devices, API keys, integration tokens, administrative access settings, and all activities occurring under your account, including activities performed by team members, subaccounts, contractors, or third parties to whom you have granted access. You must promptly notify Plyndrox AI at support@plyndrox.app if you suspect or discover any unauthorized access to your account, credential compromise, security breach, suspicious activity, or misuse of your account. Plyndrox AI will not be liable for any loss or damage arising from your failure to safeguard your credentials or promptly report security incidents.
                  </p>
                </SubSection>
                <SubSection title="3.5 One Account Per User">
                  <p>
                    Unless Plyndrox AI expressly permits multiple accounts in writing, each User and each legal entity may maintain only one active account. Creating duplicate accounts to circumvent usage limits, abuse prevention measures, billing obligations, suspension decisions, or any other restriction is a material breach of these Terms and may result in termination of all associated accounts.
                  </p>
                </SubSection>
                <SubSection title="3.6 Geographic Availability">
                  <p>
                    The Services are operated from India and may not be available, legally compliant, or suitable in all countries or jurisdictions. You are responsible for determining whether your use of the Services is permitted in your jurisdiction and for complying with all applicable local laws, regulations, and export controls. Plyndrox AI does not represent that the Services are appropriate, lawful, or available in every location.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="description-of-services" title="4. Description of Services">
                <SubSection title="4.1 Plyndrox AI">
                  <p>
                    Plyndrox AI provides AI chatbot and assistant functionality through a web or application interface. Users may submit prompts, questions, instructions, files, or contextual information and receive AI-generated responses, summaries, drafts, suggestions, and other assistant-style outputs. Plyndrox AI may support conversation history, personalization, productivity support, general information retrieval, drafting assistance, summarization, creative tasks, analytical support, and other assistant-like features as developed and updated from time to time.
                  </p>
                  <p>
                    AI-generated responses from Plyndrox AI are probabilistic in nature and may not always be accurate, complete, current, lawful, appropriate, or suitable for every use case or individual. Plyndrox AI is not a substitute for professional advice, including but not limited to medical diagnosis or treatment recommendations, legal counsel, financial planning or investment advice, mental health or psychiatric services, employment law guidance, safety engineering assessments, regulatory compliance counsel, or any other regulated professional service. You are responsible for independently reviewing, evaluating, and validating AI Output before relying on it.
                  </p>
                </SubSection>
                <SubSection title="4.2 Plyndrox WhatsApp AI">
                  <p>
                    Plyndrox WhatsApp AI provides business automation features that may connect to the WhatsApp Business API and Meta platform tools. It may receive customer messages through webhook events, apply business instructions and knowledge base content configured by the business administrator, generate AI-assisted replies, automate responses, classify customer requests, detect customer intent, maintain conversation logs, surface alerts, and assist businesses in managing customer communication workflows at scale.
                  </p>
                  <p>
                    Plyndrox WhatsApp AI depends on Third-party Services, including Meta Platforms, Inc. and the WhatsApp Business API. Access, message delivery, message templates, business account status, phone number status, per-day message limits, pricing policies, verification requirements, platform policy enforcement, and overall availability of WhatsApp and Meta services are controlled by Meta or other third parties and may change without notice. Plyndrox AI does not guarantee continued availability of any WhatsApp or Meta functionality, and changes to Meta's policies or API terms may affect or terminate the functionality of Plyndrox WhatsApp AI without Plyndrox AI having control over or liability for such outcomes.
                  </p>
                  <p>
                    Business customers remain solely responsible for reviewing all automation behavior configured through Plyndrox WhatsApp AI, ensuring that AI-generated or automated replies are accurate and compliant with applicable law, obtaining all required customer consents and opt-ins for WhatsApp communication, complying with WhatsApp Business Policies, Meta Platform Policies, and all applicable consumer protection, telecommunications, and anti-spam laws, and maintaining appropriate human oversight and escalation mechanisms for customer interactions that involve complaints, health or safety matters, financial transactions, legal obligations, or other sensitive topics.
                  </p>
                </SubSection>
                <SubSection title="4.3 Plyndrox Inbox AI">
                  <p>
                    Plyndrox Inbox AI is a Gmail-connected artificial intelligence service that, upon a User's explicit authorization through the Google OAuth 2.0 flow, accesses the User's Gmail account data through the Gmail API to provide AI-powered inbox intelligence features. These features may include, but are not limited to: Smart Digest (a prioritized summary of recent emails), intent and sentiment classification, priority scoring and ranking, follow-up detection and reminders, smart reply suggestions, lead and contact extraction, business opportunity identification, inbox health analysis, and related analytical and productivity features as offered by Plyndrox AI from time to time.
                  </p>
                  <p>
                    Plyndrox Inbox AI is designed to operate as a read and analysis layer over your Gmail inbox, with optional send capabilities for smart reply features that you explicitly activate. The Service depends on the continued availability and terms of the Google Gmail API, Google OAuth services, and Plyndrox AI's AI inference infrastructure. Changes to Google's API terms, privacy policies, or technical implementation may affect the availability or functionality of Plyndrox Inbox AI without Plyndrox AI having control over or liability for such changes.
                  </p>
                </SubSection>
                <SubSection title="4.4 Beta Features and Experimental Functionality">
                  <p>
                    From time to time, Plyndrox AI may offer beta features, preview functionality, pilot programs, experimental tools, or early access features within any Service, including Plyndrox Inbox AI. Such features are provided on an "as is, as available" basis without any warranties, SLAs, or support commitments unless expressly stated. Beta features may be withdrawn, changed, or promoted to general availability at any time, and data processed through beta features may be subject to different retention or handling practices, which will be disclosed when you enroll.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="inbox-ai-specific-terms" title="5. Plyndrox Inbox AI — Specific Terms">
                <p>
                  This section contains terms that apply specifically to your use of Plyndrox Inbox AI and the Gmail Integration. These terms supplement the general terms in the rest of this document. In the event of a conflict between this section and other sections of these Terms specifically with respect to Plyndrox Inbox AI, this section shall govern.
                </p>
                <SubSection title="5.1 Nature of the Gmail Integration">
                  <p>
                    By connecting your Gmail account to Plyndrox Inbox AI, you are authorizing Plyndrox AI to access your Gmail data on your behalf through the Google Gmail API using OAuth 2.0. This access is strictly limited to the scopes you authorize during the OAuth consent screen. You represent and warrant that: (a) you are the lawful owner or authorized user of the Gmail account you are connecting; (b) you have the authority to grant third-party application access to that account; (c) connecting the account does not violate any workplace policy, contractual restriction, professional obligation, regulatory requirement, or applicable law; and (d) you are not connecting an account that contains data whose third-party processing is prohibited by law without explicit consent, such as attorney-client privileged communications or protected health information, unless you have independently assessed the legal implications and accept responsibility for doing so.
                  </p>
                </SubSection>
                <SubSection title="5.2 Scope of Access You Are Granting">
                  <p>
                    By completing the Google OAuth authorization flow, you are granting Plyndrox AI the specific Gmail API scopes displayed on the Google consent screen at the time of authorization. These scopes may include the ability to read your Gmail messages and metadata, access thread content, read labels and categories, access contact information in email headers, and — if you activate smart reply or send features — compose and send email on your behalf. You should carefully review the consent screen presented by Google before completing authorization. You may disconnect the integration at any time to immediately terminate Plyndrox AI's ability to access your Gmail account through the API.
                  </p>
                </SubSection>
                <SubSection title="5.3 Your Responsibilities Regarding Email Content">
                  <p>
                    You understand and accept that Email Content Data processed through Plyndrox Inbox AI may include personal information about third parties who have sent you email or whom you have emailed, including their names, email addresses, company affiliations, and personal or commercial communications. You are responsible for ensuring that your use of Plyndrox Inbox AI features does not violate the privacy rights of those third-party senders or recipients, applicable data protection laws, professional confidentiality rules, court orders or injunctions, employment agreements restricting disclosure of communications, or contractual confidentiality obligations owed to parties who have communicated with you.
                  </p>
                </SubSection>
                <SubSection title="5.4 Smart Reply and Email Send Features">
                  <p>
                    If you enable smart reply or email composition features within Plyndrox Inbox AI that allow the Service to compose and send email on your behalf through the Gmail API, you accept full responsibility for all emails sent through your account using such features. You agree to review any draft or suggested reply before sending. You agree that Plyndrox AI is not responsible for the content, accuracy, tone, legal implications, or consequences of any email sent through your Gmail account using Plyndrox Inbox AI features, regardless of whether the content was AI-generated. You represent that emails you send through Plyndrox Inbox AI smart reply features will comply with all applicable laws, including anti-spam laws, consumer protection laws, and professional communication standards.
                  </p>
                </SubSection>
                <SubSection title="5.5 No Guaranteed Accuracy of AI Inbox Analysis">
                  <p>
                    AI Inbox Analysis outputs — including summaries, intent labels, priority scores, follow-up flags, and smart reply suggestions — are generated by probabilistic AI systems and are subject to the inherent limitations of natural language processing. They may be inaccurate, incomplete, misleading, or inappropriate for your specific context. You agree not to rely on AI Inbox Analysis outputs as the sole basis for consequential business decisions, legal conclusions, financial commitments, contractual interpretations, or assessments of your obligations or rights arising from email communications. You are solely responsible for independently reviewing underlying email content before acting on AI-generated analysis.
                  </p>
                </SubSection>
                <SubSection title="5.6 Compliance with Google API Services User Data Policy">
                  <p>
                    Plyndrox AI's access to your Gmail data through the Gmail Integration complies with the Google API Services User Data Policy, including the Limited Use requirements. As a User of Plyndrox Inbox AI, you acknowledge that this compliance commitment forms part of the basis on which you grant access and that Plyndrox AI's obligations under that Policy — including restrictions on using your Gmail data for advertising, sharing it with unauthorized parties, or allowing human access except as disclosed — are binding obligations that Plyndrox AI undertakes as a condition of operating the Gmail Integration.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="gmail-integration-terms" title="6. Gmail Integration and Google OAuth Terms">
                <SubSection title="6.1 Authorization and Token Management">
                  <p>
                    When you authorize the Gmail Integration, Google issues OAuth Tokens to Plyndrox AI's systems. These tokens are stored securely in encrypted form and are used exclusively to make Gmail API calls on your behalf to provide Plyndrox Inbox AI features you have activated. Plyndrox AI will not use OAuth Tokens for any purpose other than the authorized Gmail API calls required to operate Plyndrox Inbox AI features. You may revoke these tokens at any time through your Google Account settings at myaccount.google.com/permissions or through the Plyndrox Inbox AI disconnect control.
                  </p>
                </SubSection>
                <SubSection title="6.2 Effect of Token Revocation">
                  <p>
                    Upon revocation of the Gmail Integration — whether through Google's account settings, the Plyndrox Inbox AI dashboard disconnect control, or account deletion — Plyndrox AI's ability to access your Gmail account through the API will be immediately terminated. Data previously fetched and stored in connection with your account will be subject to the deletion processes described in the Privacy Policy. Plyndrox AI is not responsible for any loss of Plyndrox Inbox AI features, history, or data that results from your revocation of the Gmail Integration.
                  </p>
                </SubSection>
                <SubSection title="6.3 Dependence on Google Services">
                  <p>
                    Plyndrox Inbox AI depends on the availability, terms, and technical implementation of Google's Gmail API and OAuth infrastructure. If Google modifies, restricts, suspends, or terminates API access — whether generally or specifically with respect to Plyndrox AI — the Plyndrox Inbox AI service may become partially or wholly unavailable. Plyndrox AI will make commercially reasonable efforts to notify Users of material changes to the Gmail Integration that affect service availability, but Plyndrox AI is not liable for service interruptions caused by Google's independent actions or policy changes.
                  </p>
                </SubSection>
                <SubSection title="6.4 Google's Independent Data Processing">
                  <p>
                    Your use of Gmail is independently governed by Google's Terms of Service and Google's Privacy Policy. Plyndrox AI's access to your Gmail data through the Gmail API does not affect, override, or modify Google's own data processing practices with respect to your Google account. Google processes your Gmail data independently as a controller under its own policies, which are separate from and not controlled by Plyndrox AI. You should review Google's terms and policies to understand how Google itself handles your email data.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="whatsapp-ai-specific-terms" title="7. Plyndrox WhatsApp AI — Specific Terms">
                <SubSection title="7.1 WhatsApp Business API Dependency">
                  <p>
                    Plyndrox WhatsApp AI operates through, and is entirely dependent on, the WhatsApp Business API provided by Meta Platforms, Inc. and its affiliates. Your use of Plyndrox WhatsApp AI requires you to independently comply with Meta's Developer Policies, WhatsApp Business Policies, WhatsApp Commerce Policies, Meta Platform Terms, and any other applicable Meta terms, all of which may change at any time without Plyndrox AI's control or advance notice to you. Meta may suspend, restrict, or terminate your WhatsApp Business Account, phone number, or API access independently of any action by Plyndrox AI, and Plyndrox AI is not liable for such actions.
                  </p>
                </SubSection>
                <SubSection title="7.2 Business Customer Obligations">
                  <p>
                    As a business customer using Plyndrox WhatsApp AI, you are solely and entirely responsible for: (a) verifying your business identity and maintaining compliance with Meta's business verification requirements; (b) obtaining and maintaining all necessary customer opt-ins, consents, and permission notifications required under applicable law and WhatsApp policies before initiating or continuing any business-to-customer messaging; (c) ensuring that all AI-generated or automated messages you send to customers are accurate, non-deceptive, lawful, and consistent with any prior representations made to customers; (d) complying with all applicable anti-spam laws, telemarketing laws, consumer protection laws, and data protection regulations in all jurisdictions where your customers are located; and (e) maintaining adequate human oversight and escalation mechanisms to handle customer disputes, complaints, urgent inquiries, safety issues, refund requests, and other matters requiring human judgment.
                  </p>
                </SubSection>
                <SubSection title="7.3 Message Template Compliance">
                  <p>
                    WhatsApp message templates are subject to Meta's approval and policy requirements. You are responsible for submitting accurate, policy-compliant templates. Plyndrox AI does not guarantee that templates you submit will be approved by Meta, and rejected templates may disrupt your automation workflow. You must not use templates or messaging functionality to send prohibited content categories under Meta's policies, including but not limited to: misleading or deceptive content, unsolicited promotional messages without opt-in, content violating applicable laws, hate speech, or content targeting protected categories in prohibited ways.
                  </p>
                </SubSection>
                <SubSection title="7.4 Shared Responsibility for Customer Interactions">
                  <p>
                    While Plyndrox AI provides the AI and automation technology that powers Plyndrox WhatsApp AI, the business customer is and remains the party responsible for the overall customer relationship, the accuracy and completeness of business information in the knowledge base, the behavior of automation rules and response logic configured by the business, and all communications sent to end customers through the connected WhatsApp Business account. Plyndrox AI operates as a technology provider, not as a party to the communication between the business and its end customers.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="acceptable-use-policy" title="8. Acceptable Use Policy — General">
                <p>You agree that you will not, and will not permit, authorize, or enable others under your account to, use the Services to:</p>
                <ul>
                  <li>Engage in unlawful, harmful, fraudulent, deceptive, abusive, harassing, intimidating, discriminatory, defamatory, invasive, exploitative, or otherwise objectionable activity of any kind, whether directed at other users, third parties, or Plyndrox AI personnel.</li>
                  <li>Send spam, bulk unsolicited messages, robocalls, unauthorized commercial communications, phishing content, vishing scripts, smishing messages, or any communications lacking legally required consent or opt-in from recipients.</li>
                  <li>Violate WhatsApp Business policies, Meta platform terms, Meta developer policies, WhatsApp messaging rules, WhatsApp template policies, WhatsApp commerce policies, or any applicable third-party service terms, API terms, or developer agreements.</li>
                  <li>Generate, distribute, automate, or facilitate the creation of harmful, misleading, impersonating, fraudulent, violent, sexually exploitative, extremist, hateful, race-baiting, or otherwise policy-violating content, whether through Plyndrox AI, Plyndrox WhatsApp AI, Plyndrox Inbox AI smart reply, or any other feature.</li>
                  <li>Misrepresent your identity, business identity, affiliation, authority, authorization, professional credentials, business verification status, product availability, pricing, legal obligations, or the nature of your relationship with Plyndrox AI, Meta, Google, or any other entity.</li>
                  <li>Upload, process, transmit, or instruct the Services to process data you do not have the lawful right to use, including personal data obtained without required consent, data subject to confidentiality restrictions you are violating, or data whose processing is prohibited by applicable law.</li>
                  <li>Reverse-engineer, decompile, disassemble, scrape, crawl, probe, exploit, copy, benchmark for competitive intelligence purposes, systematically extract data from, or attempt to discover source code, model weights, proprietary prompts, system architecture, security measures, or other proprietary information from the Services or any connected AI systems.</li>
                  <li>Interfere with, overload, disrupt, degrade, overwhelm, or gain unauthorized access to the Services, other user accounts, our backend infrastructure, integrations, APIs, databases, networks, or security systems through denial-of-service attacks, credential stuffing, automated scanning, API abuse, or other means.</li>
                  <li>Bypass rate limits, access controls, content safety systems, usage quotas, billing mechanisms, authentication systems, IP blocks, suspension measures, or other technical or contractual restrictions imposed by Plyndrox AI or third-party providers.</li>
                  <li>Use the Services to develop, train, or improve competing AI products or services, to replicate the Services' functionality, or to provide unauthorized resale, sublicensing, white-labeling, outsourcing, or managed service offerings without Plyndrox AI's express written permission.</li>
                  <li>Use AI Output, especially AI-generated customer communications, without maintaining reasonable human review processes for interactions involving potential harm, legal obligations, financial commitments, or significant customer impact.</li>
                  <li>Use the Services to process, analyze, or derive intelligence from data to which you have gained unauthorized access, including but not limited to email accounts of third parties, systems you have accessed without authorization, or data obtained through unlawful means.</li>
                  <li>Conduct or facilitate money laundering, fraud, market manipulation, unauthorized financial services, pyramid schemes, or any other financial crime or regulatory violation through or using AI-generated content or automation.</li>
                </ul>
              </TermsSection>

              <TermsSection id="inbox-ai-acceptable-use" title="9. Plyndrox Inbox AI Acceptable Use Policy">
                <p>
                  In addition to the general Acceptable Use Policy in Section 8, the following restrictions apply specifically to your use of Plyndrox Inbox AI and the Gmail Integration. These restrictions reflect the heightened sensitivity of email data and the additional responsibilities that come with AI-powered access to personal communications.
                </p>
                <ul>
                  <li><strong>No unauthorized account connections:</strong> You must not connect a Gmail account that you do not personally own or for which you have not obtained explicit, informed authorization from the account owner. Connecting a spouse's, employee's, contractor's, or any other person's Gmail account without their knowledge and consent is strictly prohibited and may constitute a violation of privacy laws, computer access laws, and these Terms.</li>
                  <li><strong>No prohibited data categories:</strong> You must not use Plyndrox Inbox AI to process email accounts that you know or reasonably should know contain legally protected data categories whose AI processing requires additional legal authorization you have not obtained, including emails subject to attorney-client or attorney work-product privilege (unless you are the attorney and have assessed the implications), protected health information covered by HIPAA or equivalent legislation, classified government information, or data subject to judicial sealing orders or preservation obligations.</li>
                  <li><strong>No surveillance or monitoring of others:</strong> You must not connect Plyndrox Inbox AI to another person's Gmail account for the purpose of monitoring, surveilling, tracking, or extracting intelligence about that person's communications without their knowledge and consent. This prohibition applies regardless of whether you technically have access to the account credentials.</li>
                  <li><strong>No use of Lead Intelligence for unlawful purposes:</strong> You must not use Lead Intelligence Data, contact information, deal signals, or other information extracted from Email Content Data to build unauthorized marketing lists, conduct unsolicited outreach to contacts who have not consented to communication from you through other channels, or engage in any form of unlawful commercial solicitation.</li>
                  <li><strong>No exfiltration of third-party data:</strong> You must not use the Plyndrox Inbox AI dashboard export features, API access, or any other mechanism to systematically extract, compile, or aggregate personal information about third-party email senders or recipients for purposes outside of your own personal or business use within the Plyndrox Inbox AI dashboard.</li>
                  <li><strong>No use of smart replies for deception:</strong> You must not use the smart reply or AI composition features to send misleading, deceptive, impersonating, or fraudulent communications to email recipients, including presenting AI-generated responses in ways that would deceive recipients into believing they came from a human when the recipient has a reasonable expectation of human communication in regulated contexts.</li>
                  <li><strong>Workplace policy compliance:</strong> If you are using a work-issued Gmail account or an account subject to your employer's information security or data governance policies, you are responsible for ensuring that connecting that account to Plyndrox Inbox AI complies with your employer's policies. Plyndrox AI is not responsible for any employment consequences arising from your use of Plyndrox Inbox AI in connection with a work account.</li>
                </ul>
              </TermsSection>

              <TermsSection id="user-responsibilities" title="10. User Responsibilities">
                <p>
                  You are solely responsible for your use of the Services, all User Content you submit, all AI Output you use, distribute, publish, or rely upon, all business configuration settings you establish, all integrations you connect — including the Gmail Integration and WhatsApp Integration — and all communications you send through or based on the Services. The following responsibilities apply to all Users and are non-delegable:
                </p>
                <ul>
                  <li><strong>Legal compliance across all jurisdictions:</strong> You must comply with all applicable laws, regulations, industry standards, self-regulatory codes, data protection laws, consumer protection obligations, advertising standards, telecommunications rules, financial services regulations, healthcare regulations, anti-spam laws, export control regulations, and platform policies that apply to your use of the Services, including laws applicable in all jurisdictions where you or your customers are located.</li>
                  <li><strong>Evaluation of AI Output:</strong> You must independently evaluate AI Output — including email summaries, smart replies, intent classifications, priority scores, lead intelligence entries, and WhatsApp automation responses — for accuracy, completeness, suitability, lawfulness, appropriateness, and potential for harm before using, publishing, sending, relying on, or making decisions based on such output.</li>
                  <li><strong>Customer consent and opt-in management (Plyndrox WhatsApp AI):</strong> For Plyndrox WhatsApp AI, you are solely responsible for obtaining and maintaining all required customer consents, opt-in records, opt-out requests, do-not-contact preferences, and lawful bases for processing customer data using AI-assisted automation, in compliance with applicable law and Meta's policies.</li>
                  <li><strong>Gmail authorization scope review:</strong> You are responsible for reviewing the OAuth scopes displayed during the Gmail authorization flow before completing it and for understanding what access you are granting. You must only grant access after independently determining that doing so is appropriate given your account, its contents, and your legal obligations.</li>
                  <li><strong>Business accuracy:</strong> You must ensure that all business information, knowledge base content, FAQs, product descriptions, pricing information, policies, and operational details you configure in the Services are accurate, current, and not misleading, as this information may be incorporated into AI-generated customer communications.</li>
                  <li><strong>Human oversight for sensitive matters:</strong> You must maintain adequate human review, escalation, and override procedures for AI-generated outputs in contexts involving customer disputes, health or safety matters, financial transactions, legal obligations, regulated industries, or other matters where AI error could cause significant harm.</li>
                  <li><strong>Credential and token security:</strong> You must protect all API keys, OAuth Tokens, account passwords, administrative credentials, integration configuration values, and other authentication or authorization materials, and you must promptly revoke or rotate credentials if you suspect they have been compromised.</li>
                  <li><strong>Notification of third-party processing (Plyndrox Inbox AI):</strong> Where required by applicable data protection law, you are responsible for notifying third parties whose personal information appears in your email communications that their data may be processed by third-party AI services when you use Plyndrox Inbox AI, and for maintaining any required legal basis for such processing.</li>
                </ul>
              </TermsSection>

              <TermsSection id="ai-output-disclaimer" title="11. AI Output Disclaimer">
                <p>
                  AI Output generated by Plyndrox AI, Plyndrox WhatsApp AI, or Plyndrox Inbox AI may be inaccurate, incomplete, outdated, offensive, biased, inconsistent, factually incorrect, inappropriate, unsafe, or otherwise unsuitable for your specific purpose or context. Substantially similar or even identical AI Output may be generated for different users with different inputs due to the probabilistic and statistical nature of large language model inference. AI systems may produce information that appears confident, authoritative, well-referenced, or internally consistent while being materially incorrect, a recognized phenomenon commonly referred to as "hallucination."
                </p>
                <p>
                  Plyndrox AI does not guarantee the correctness, reliability, uniqueness, novelty, novelty, consistency, legality, fitness for purpose, usefulness, or appropriateness of AI Output for any particular application. AI Output is provided for informational, productivity, and automation-assistance purposes only. Nothing in AI Output constitutes legal advice, medical advice, financial or investment advice, tax advice, mental health or psychiatric advice, professional engineering opinion, architectural assessment, safety certification, or any other form of regulated professional service.
                </p>
                <p>
                  You must independently verify all critical information contained in AI Output before relying on it, especially for decisions involving legal obligations, medical or health matters, financial transactions, contractual commitments, regulatory compliance, public communications, customer-facing statements, employment decisions, safety-critical operations, or any other context where an error could have significant consequences. You acknowledge that your use of AI Output is at your sole risk and that you remain wholly responsible for all decisions, communications, actions, omissions, publications, or uses based on or informed by AI Output generated through the Services.
                </p>
              </TermsSection>

              <TermsSection id="email-intelligence-disclaimer" title="12. Email Intelligence and Lead Data Disclaimer">
                <p>
                  AI Inbox Analysis outputs — including email summaries, intent classifications, sentiment scores, priority rankings, follow-up recommendations, smart reply suggestions, Lead Intelligence Data, and contact extractions — are generated by probabilistic AI inference systems operating over Email Content Data and are subject to all of the limitations described in Section 11. These limitations have particular significance for email intelligence features because email communications are contextually rich, contain ambiguity, irony, incomplete information, industry-specific jargon, cross-cultural nuances, and implicit context that AI systems may fail to interpret correctly.
                </p>
                <p>
                  Priority scores, intent labels, and follow-up recommendations may miss important emails, mislabel low-priority emails as high-priority, or vice versa. Smart reply suggestions may be tonally inappropriate, factually inconsistent with prior email thread content, or legally inadvisable for certain communications. Lead Intelligence Data extracted from emails is based on AI interpretation of email text and may contain errors, omissions, misattributions, or false signals. Contact information extracted from email signatures may be outdated, inaccurate, or misattributed to the wrong individual or company.
                </p>
                <p>
                  You agree not to use Lead Intelligence Data, contact extractions, or other AI Inbox Analysis outputs as the sole or primary basis for legal determinations, contractual interpretations, employment decisions, credit or financial assessments, claims about third parties' intentions or commitments, or any other purpose where the accuracy of the information is legally or commercially consequential. You remain responsible for reviewing the underlying email communications before acting on any AI Inbox Analysis output.
                </p>
              </TermsSection>

              <TermsSection id="payments-subscriptions-and-billing" title="13. Payments, Subscriptions, and Billing">
                <p>
                  Certain features and plans may be offered free of charge subject to usage limits or eligibility requirements, while others may require a paid subscription, usage-based fee, add-on purchase, or other commercial arrangement. Pricing, included usage allowances, feature limits, plan tiers, billing cycles, renewal periods, applicable taxes, accepted payment methods, and any promotional pricing will be presented at checkout, in an order form, in the dashboard, or in a separately executed commercial agreement. You are responsible for reviewing all pricing information before purchasing any plan or add-on.
                </p>
                <ul>
                  <li><strong>Subscription auto-renewal:</strong> Subscription plans may renew automatically at the then-current price at the end of each billing cycle unless you cancel before the renewal date. You are responsible for managing your subscription and canceling before renewal if you do not wish to continue. Plyndrox AI may provide renewal reminders but is not obligated to do so.</li>
                  <li><strong>Usage charges and overages:</strong> Certain AI processing, Gmail data fetching, WhatsApp messaging, API calls, storage, or other usage may be subject to plan-defined limits. Exceeding these limits may result in throttling, service degradation, overage charges at published rates, or temporary suspension of the relevant feature until the next billing cycle.</li>
                  <li><strong>Third-party charges:</strong> Meta, WhatsApp, Google, payment processors, telecommunications providers, or other third parties may independently impose their own charges, fees, conversation charges, message template fees, transaction fees, currency conversion fees, or taxes in connection with your use of Third-party Services. These charges are your sole responsibility and are separate from any fees paid to Plyndrox AI.</li>
                  <li><strong>Price changes:</strong> Plyndrox AI reserves the right to change pricing for any Service at any time upon notice provided through the Services, by email, or by other reasonable means. Price changes will take effect at the start of your next billing cycle unless you are on a fixed-term agreement that expressly locks pricing.</li>
                  <li><strong>Failed or declined payments:</strong> If a payment attempt fails or is declined, Plyndrox AI may retry the payment method, notify you by email, downgrade your account to a free tier, restrict access to paid features, or suspend or terminate your account after reasonable notice. You are responsible for maintaining a valid payment method on file.</li>
                  <li><strong>Refund policy:</strong> Unless expressly required by mandatory consumer protection law applicable in your jurisdiction, all fees paid to Plyndrox AI are non-refundable once processed. Any discretionary refund or credit issued by Plyndrox AI in a particular instance does not constitute a waiver of this policy or create an obligation to provide refunds in future instances.</li>
                  <li><strong>Taxes and duties:</strong> You are responsible for all applicable taxes, goods and services taxes, value-added taxes, sales taxes, withholding taxes, duties, levies, and other governmental assessments related to your purchase or use of paid Services. Where Plyndrox AI is required by law to collect taxes, such taxes will be added to your invoice and you agree to pay them.</li>
                  <li><strong>Disputed charges:</strong> You must notify Plyndrox AI of any billing dispute within thirty (30) days of the charge by contacting support@plyndrox.app with a description of the dispute. Disputes raised after thirty days may not be eligible for review.</li>
                </ul>
              </TermsSection>

              <TermsSection id="intellectual-property-rights" title="14. Intellectual Property Rights">
                <SubSection title="14.1 Plyndrox AI's Proprietary Rights">
                  <p>
                    Plyndrox AI and its licensors exclusively own all rights, title, and interest in and to the Platform, Services, software, backend infrastructure, AI models and algorithms, interfaces, visual design elements, trademarks, logos, service marks, brand names, technology stacks, workflows, system prompts, documentation, analytical methodologies, compiled and source code, data schemas, know-how, and all other proprietary and intellectual property materials associated with the Services. These Terms do not transfer any ownership interest, patent license, copyright license, trademark license, or other intellectual property rights to you, except for the limited, conditional, non-exclusive usage license described below.
                  </p>
                </SubSection>
                <SubSection title="14.2 Limited License to Use the Services">
                  <p>
                    Subject to your ongoing compliance with these Terms, payment of any applicable fees, and any plan-specific restrictions, Plyndrox AI grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Services solely for your own internal personal or business purposes as expressly permitted by these Terms and by your applicable plan. This license does not permit you to resell, sublicense, redistribute, white-label, or make the Services available to third parties as a managed service or platform offering without Plyndrox AI's express prior written consent.
                  </p>
                </SubSection>
                <SubSection title="14.3 User Content Ownership">
                  <p>
                    As between you and Plyndrox AI, you retain all ownership rights you hold in User Content you submit, upload, or configure, including business knowledge base documents, WhatsApp configuration data, and Email Content Data originating from your Gmail account. You represent and warrant that you have all necessary rights, permissions, licenses, and lawful bases to provide User Content to the Services, to authorize Plyndrox AI to process it as described herein, and that doing so does not infringe the intellectual property rights, privacy rights, or contractual rights of any third party.
                  </p>
                </SubSection>
                <SubSection title="14.4 License Granted to Plyndrox AI for Service Operation">
                  <p>
                    By using the Services, you grant Plyndrox AI a worldwide, non-exclusive, royalty-free, sublicensable (to service providers acting on Plyndrox AI's behalf) license to: host, copy, cache, process, transmit, index, display, adapt, reformat, and use User Content and Email Content Data solely as necessary to: (a) provide, maintain, secure, and support the Services you have activated; (b) generate AI Output in response to your inputs; (c) perform AI Inbox Analysis on email data you have authorized us to access; (d) comply with legal obligations; (e) enforce these Terms; and (f) operate integrations you have configured. This license is limited to the scope strictly necessary for the purposes stated and does not grant Plyndrox AI the right to use your content for its own commercial purposes beyond the Services, to train publicly available models on your private data without consent, or to sell or share your content with unauthorized third parties.
                  </p>
                </SubSection>
                <SubSection title="14.5 Restrictions on Use of the Platform">
                  <p>
                    You may not copy, modify, translate, adapt, create derivative works from, distribute, sell, lease, sublicense, publicly display, publicly perform, republish, or otherwise reproduce or exploit any part of the Services, Platform, or Plyndrox AI's proprietary materials except as expressly permitted by these Terms or by a separate written license agreement with Plyndrox AI. You may not remove, obscure, or alter any proprietary notices, copyright notices, trademark notices, or other notices embedded in or displayed by the Services.
                  </p>
                </SubSection>
                <SubSection title="14.6 AI Output Ownership">
                  <p>
                    Subject to your compliance with these Terms and applicable law, AI Output generated specifically in response to your inputs — including email summaries, suggested replies, and lead records generated from your Email Content Data — may be used by you for your own personal or internal business purposes. However, Plyndrox AI makes no representation that AI Output is legally protectable as original authorship under copyright law in any jurisdiction. You should not represent AI Output as human-authored where such representation is legally prohibited or ethically inappropriate.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="user-content-and-license" title="15. User Content Standards and Representations">
                <p>
                  By submitting User Content to the Services, you represent, warrant, and covenant that:
                </p>
                <ul>
                  <li>You own the User Content or have all necessary rights, licenses, permissions, and consents to submit it to the Services and to grant Plyndrox AI the rights described in these Terms.</li>
                  <li>The User Content does not infringe, misappropriate, or violate the intellectual property rights, privacy rights, personality rights, moral rights, or other proprietary rights of any third party.</li>
                  <li>The User Content does not contain information that is false, defamatory, libelous, fraudulent, deceptive, illegal, violative of any person's privacy or confidentiality rights, or otherwise unlawful.</li>
                  <li>You have obtained all consents, authorizations, and legal bases required under applicable data protection law for the processing of any personal data included in or derivable from User Content, including Email Content Data processed through the Gmail Integration.</li>
                  <li>You have not included in User Content any passwords, authentication tokens, OAuth credentials, private cryptographic keys, or other security secrets that you do not intend to share, and that if included, you understand that Plyndrox AI will process such content as part of normal service operations.</li>
                  <li>The submission of User Content and the use of AI Output derived from it will comply with all applicable laws, regulations, professional obligations, platform policies, and the terms of these Terms.</li>
                </ul>
              </TermsSection>

              <TermsSection id="third-party-services" title="16. Third-Party Services and Integrations">
                <p>
                  The Services depend on, interoperate with, or may link to Third-party Services, including but not limited to: Google Gmail API and OAuth 2.0 infrastructure (for Plyndrox Inbox AI), Meta Platforms and the WhatsApp Business API (for Plyndrox WhatsApp AI), cloud infrastructure providers, AI model inference providers, database and storage providers, authentication systems, analytics tools, payment processors, email delivery systems, and other APIs. Plyndrox AI does not own, operate, or control any Third-party Service and is not responsible for its availability, security, policies, pricing, performance, accuracy, reliability, errors, outages, suspensions, policy changes, or terms modifications.
                </p>
                <p>
                  Your use of Third-party Services connected to or used by the Services may be subject to those services' own terms of service, privacy policies, data processing agreements, developer policies, acceptable use policies, and fees. You are solely responsible for reviewing and complying with the terms of all applicable Third-party Services. If a Third-party Service changes its terms, policies, API specifications, pricing, or availability in a way that affects the Services, Plyndrox AI may modify, suspend, or discontinue affected features without liability to you.
                </p>
                <p>
                  Any links, integrations, or references to Third-party Services in the platform do not constitute Plyndrox AI's endorsement of those services, their quality, security, legality, or suitability for your purposes. You access Third-party Services at your own risk.
                </p>
              </TermsSection>

              <TermsSection id="data-usage-reference" title="17. Data Usage and Privacy Reference">
                <p>
                  Our collection, use, storage, sharing, retention, and protection of information — including Email Content Data processed through Plyndrox Inbox AI — is described in comprehensive detail in our <Link href="/privacy-policy">Privacy Policy</Link>, which is incorporated into these Terms by reference and forms an integral part of the legal agreement between you and Plyndrox AI. By using the Services, you acknowledge that data handling is governed by the Privacy Policy, and you agree to the practices described therein.
                </p>
                <p>
                  For Plyndrox Inbox AI, the Privacy Policy contains specific provisions governing Gmail OAuth access, Email Content Data processing, AI Inbox Analysis, Lead Intelligence Data, data retention and deletion following disconnection, compliance with the Google API Services User Data Policy, and your rights regarding email-related data. You should read those sections carefully before connecting your Gmail account.
                </p>
                <p>
                  For Plyndrox WhatsApp AI, business customers are responsible for ensuring that their own privacy notices, customer-facing disclosures, consent mechanisms, and data processing practices accurately describe the involvement of Plyndrox AI, WhatsApp Business API, Meta services, and AI automation in their customer communication workflows, to the extent required by applicable law.
                </p>
                <p>
                  If you are subject to applicable data protection laws that require a data processing agreement (DPA) or equivalent instrument for the processing of personal data on your behalf, you may contact Plyndrox AI at support@plyndrox.app to request a DPA. Execution of a DPA may be a condition of certain enterprise plans or regional service offerings.
                </p>
              </TermsSection>

              <TermsSection id="confidentiality" title="18. Confidentiality Obligations">
                <SubSection title="18.1 Mutual Confidentiality">
                  <p>
                    Each party ("Receiving Party") agrees to maintain the confidentiality of Confidential Information disclosed by the other party ("Disclosing Party") using at least the same degree of care it uses to protect its own confidential information of similar sensitivity, but not less than reasonable care. The Receiving Party agrees not to disclose Confidential Information to any third party except to its employees, contractors, affiliates, and service providers who have a need to know in connection with the permitted purposes herein and who are bound by confidentiality obligations at least as protective as those in this section.
                  </p>
                </SubSection>
                <SubSection title="18.2 Your Email Data as Confidential">
                  <p>
                    Email Content Data, AI Inbox Analysis outputs, and Lead Intelligence Data generated from your Gmail Integration are treated as Confidential Information under these Terms. Plyndrox AI will not disclose your Email Content Data to parties other than those necessary to provide the Plyndrox Inbox AI service, as described in the Privacy Policy, and will not use your Email Content Data for purposes other than those disclosed in these Terms and the Privacy Policy.
                  </p>
                </SubSection>
                <SubSection title="18.3 Exceptions to Confidentiality">
                  <p>
                    Confidentiality obligations do not apply to information that: (a) is or becomes publicly known through no breach by the Receiving Party; (b) was rightfully known to the Receiving Party before disclosure without restriction; (c) is independently developed by the Receiving Party without use of the Disclosing Party's Confidential Information; or (d) must be disclosed by operation of law, court order, or mandatory regulatory requirement, provided the Receiving Party gives the Disclosing Party advance written notice where legally permitted.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="service-availability-and-modifications" title="19. Service Availability and Modifications">
                <p>
                  The Services are provided on an "as available" basis. Plyndrox AI does not warrant or guarantee uninterrupted, error-free, secure, complete, or continuous availability of any Service or feature. The Services may be temporarily or permanently unavailable due to scheduled or emergency maintenance, platform updates, security patches, infrastructure failures, third-party API outages or policy changes, capacity constraints, internet disruptions, force majeure events, legal or regulatory requirements, or other circumstances within or outside of Plyndrox AI's reasonable control.
                </p>
                <p>
                  For Plyndrox Inbox AI specifically, service availability also depends on the continued availability of the Google Gmail API and Google OAuth infrastructure. Outages, rate limiting, API deprecations, scope restriction, or policy changes implemented by Google may affect Plyndrox Inbox AI availability independently of Plyndrox AI's systems.
                </p>
                <p>
                  Plyndrox AI reserves the right to modify, update, suspend, restrict, discontinue, rename, rebrand, merge, replace, or remove any feature, plan, integration, API endpoint, AI model, or other part of the Services at any time, for any reason, including in response to changes in Third-party Services, legal requirements, business strategy, operational needs, security concerns, or product direction. Plyndrox AI may impose or change usage limits, rate limits, eligibility requirements, geographic restrictions, security controls, or technical constraints where necessary. For material modifications that significantly affect your use of the Services, Plyndrox AI will use commercially reasonable efforts to provide advance notice through the Services or by email.
                </p>
              </TermsSection>

              <TermsSection id="feedback-and-suggestions" title="20. Feedback and Suggestions">
                <p>
                  If you provide Plyndrox AI with feedback, suggestions, ideas, feature requests, bug reports, testimonials, improvement recommendations, or other communications about the Services ("Feedback"), you grant Plyndrox AI a perpetual, irrevocable, worldwide, royalty-free, fully paid-up, sublicensable, transferable license to use, reproduce, modify, create derivative works from, publish, distribute, and otherwise exploit such Feedback for any purpose, including improving the Services and developing new products, without any obligation of confidentiality, attribution, compensation, or notice to you.
                </p>
                <p>
                  Plyndrox AI does not treat Feedback as confidential, and you should not include information in Feedback that you consider confidential or proprietary. You represent that your Feedback does not contain trade secrets of third parties and that providing Feedback does not violate any confidentiality obligation you owe to any third party.
                </p>
              </TermsSection>

              <TermsSection id="termination-and-suspension" title="21. Termination and Suspension">
                <SubSection title="21.1 Termination by You">
                  <p>
                    You may stop using the Services at any time. You may request account closure by contacting support@plyndrox.app or by using any account management tools made available in the dashboard. For Plyndrox Inbox AI specifically, you may disconnect the Gmail Integration at any time without closing your full Plyndrox AI account. Disconnecting the Gmail Integration will stop further access to your Gmail data, and remaining Plyndrox Inbox AI data will be subject to deletion as described in Section 22 and in the Privacy Policy. Account closure does not relieve you of any payment obligations, outstanding fees, or liabilities incurred before closure, and does not entitle you to refunds except where required by law.
                  </p>
                </SubSection>
                <SubSection title="21.2 Suspension or Termination by Plyndrox AI">
                  <p>
                    Plyndrox AI may suspend, restrict, downgrade, or terminate your access to all or any part of the Services — including the Gmail Integration, WhatsApp Integration, or your account generally — immediately, with or without prior notice, if we reasonably believe that: (a) you have violated any provision of these Terms or the Acceptable Use Policy; (b) your use of the Services creates legal risk, reputational risk, or security risk for Plyndrox AI, other users, or third parties; (c) you have violated applicable law; (d) you have violated Third-party Service terms including Meta policies, Google API policies, or other applicable developer agreements; (e) you have failed to pay amounts properly due; (f) you have provided false, misleading, or unauthorized account information; (g) your account has been compromised and continued access may harm other users or the platform; or (h) we are required to do so by law or court order.
                  </p>
                </SubSection>
                <SubSection title="21.3 Effect of Termination — General">
                  <p>
                    Upon termination of your account or your access to any Service: (a) all licenses granted to you under these Terms will immediately terminate; (b) your right to access the Services, dashboard, AI features, and stored data within the platform will cease; (c) we may disable your account, revoke API credentials, remove integrations, and block future registration under the same identity where warranted; and (d) data will be retained or deleted in accordance with the Privacy Policy and applicable law. Provisions of these Terms that by their nature should survive termination will survive, including but not limited to: intellectual property provisions, payment obligations, disclaimers, indemnification, limitation of liability, confidentiality, governing law, and dispute resolution.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="termination-inbox-ai" title="22. Effect of Termination on Plyndrox Inbox AI Data">
                <p>
                  Upon disconnection of the Gmail Integration or termination of your Plyndrox AI account, the following processes will be initiated with respect to Plyndrox Inbox AI data:
                </p>
                <ul>
                  <li><strong>Immediate revocation of API access:</strong> Plyndrox AI will no longer make Gmail API calls using your OAuth Tokens. If tokens have not been revoked at Google's authorization server, you should revoke them independently through your Google Account settings.</li>
                  <li><strong>OAuth Token deletion:</strong> Stored OAuth Tokens (access tokens and refresh tokens) associated with your Gmail Integration will be deleted from Plyndrox AI's database within the timeframes described in the Privacy Policy.</li>
                  <li><strong>Email Content Data deletion:</strong> Email Content Data, AI Inbox Analysis outputs, Lead Intelligence Data, and synchronization state data stored in Plyndrox AI's active database in connection with your account will be scheduled for deletion as described in the Privacy Policy.</li>
                  <li><strong>Backup purge timeline:</strong> Data deleted from active systems may persist in encrypted backups for the period described in the Privacy Policy until those backups are cycled out. Data in backups is not used for operational purposes and is not accessible to normal production systems.</li>
                  <li><strong>Irreversibility of deletion:</strong> You acknowledge that data deletion following termination is irreversible and that Plyndrox AI cannot recover deleted Plyndrox Inbox AI data, including historical email summaries, lead records, and analysis results, after deletion has been completed. You are responsible for exporting any dashboard data you wish to retain before closing your account or disconnecting the Gmail Integration.</li>
                </ul>
              </TermsSection>

              <TermsSection id="disclaimer-of-warranties" title="23. Disclaimer of Warranties">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICES — INCLUDING PLYNDROX AI, PLYNDROX WHATSAPP AI, AND PLYNDROX INBOX AI — ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT ANY WARRANTY OF ANY KIND, EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. PLYNDROX AI AND ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, CONTRACTORS, LICENSORS, AND SERVICE PROVIDERS EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING:
                </p>
                <ul>
                  <li>ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, RELIABILITY, NON-INFRINGEMENT, QUIET ENJOYMENT, OR FREEDOM FROM VIRUSES, MALICIOUS CODE, OR OTHER HARMFUL COMPONENTS.</li>
                  <li>ANY WARRANTY THAT THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR-FREE, OR FREE OF TECHNICAL DEFECTS.</li>
                  <li>ANY WARRANTY REGARDING THE ACCURACY, COMPLETENESS, CURRENCY, RELIABILITY, APPROPRIATENESS, OR SUITABILITY OF AI OUTPUT FOR ANY PARTICULAR PURPOSE.</li>
                  <li>ANY WARRANTY THAT EMAIL SUMMARIES, PRIORITY SCORES, INTENT CLASSIFICATIONS, SMART REPLY SUGGESTIONS, OR LEAD INTELLIGENCE DATA GENERATED THROUGH PLYNDROX INBOX AI WILL BE ACCURATE, COMPLETE, OR APPROPRIATE FOR YOUR SPECIFIC CONTEXT OR NEEDS.</li>
                  <li>ANY WARRANTY WITH RESPECT TO THE AVAILABILITY, CONTINUITY, OR TERMS OF GOOGLE GMAIL API, WHATSAPP BUSINESS API, META SERVICES, OR ANY OTHER THIRD-PARTY SERVICE.</li>
                  <li>ANY WARRANTY THAT THE SERVICES WILL COMPLY WITH ALL LAWS IN ALL JURISDICTIONS WHERE YOU OPERATE.</li>
                </ul>
                <p>
                  SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO SOME OR ALL OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU. IN SUCH JURISDICTIONS, PLYNDROX AI'S WARRANTIES ARE LIMITED TO THE MINIMUM WARRANTY REQUIRED BY APPLICABLE LAW.
                </p>
              </TermsSection>

              <TermsSection id="limitation-of-liability" title="24. Limitation of Liability">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PLYNDROX AI, ITS FOUNDERS, DIRECTORS, OFFICERS, EMPLOYEES, CONTRACTORS, AFFILIATES, LICENSORS, AND SERVICE PROVIDERS WILL NOT BE LIABLE FOR ANY OF THE FOLLOWING TYPES OF LOSS OR DAMAGE, REGARDLESS OF THE LEGAL THEORY UNDER WHICH THEY ARE CLAIMED AND EVEN IF PLYNDROX AI HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES:
                </p>
                <ul>
                  <li>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, PUNITIVE, OR ENHANCED DAMAGES OF ANY KIND.</li>
                  <li>LOSS OF PROFITS, REVENUE, BUSINESS OPPORTUNITIES, OR ANTICIPATED SAVINGS.</li>
                  <li>LOSS OF DATA, INCLUDING EMAIL CONTENT DATA, AI INBOX ANALYSIS RESULTS, LEAD INTELLIGENCE DATA, OR OTHER INFORMATION STORED WITHIN THE SERVICES.</li>
                  <li>LOSS OF GOODWILL, REPUTATION, OR COMPETITIVE ADVANTAGE.</li>
                  <li>COST OF SUBSTITUTE SERVICES, COVER, OR PROCUREMENT.</li>
                  <li>DAMAGES ARISING FROM AI OUTPUT, INCLUDING INACCURATE EMAIL SUMMARIES, MISLABELED INTENT, INCORRECT PRIORITY SCORES, OR ERRONEOUS SMART REPLIES.</li>
                  <li>DAMAGES ARISING FROM THIRD-PARTY SERVICE FAILURES, INCLUDING GOOGLE API OUTAGES, WHATSAPP BUSINESS API DOWNTIME, META POLICY ENFORCEMENT ACTIONS, OR PAYMENT PROCESSOR FAILURES.</li>
                  <li>DAMAGES ARISING FROM UNAUTHORIZED ACCESS TO OR USE OF YOUR ACCOUNT OR DATA, INCLUDING UNAUTHORIZED ACCESS TO EMAIL CONTENT DATA, IF SUCH ACCESS OCCURS DESPITE PLYNDROX AI'S REASONABLE SECURITY MEASURES.</li>
                  <li>DAMAGES ARISING FROM YOUR RELIANCE ON AI OUTPUT FOR LEGAL, FINANCIAL, MEDICAL, EMPLOYMENT, REGULATORY, OR OTHER CONSEQUENTIAL DECISIONS.</li>
                  <li>DAMAGES ARISING FROM YOUR USE OR INABILITY TO USE THE SERVICES FOR ANY REASON.</li>
                </ul>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PLYNDROX AI'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICES OR THESE TERMS, REGARDLESS OF THE THEORY OF LIABILITY, WILL NOT EXCEED THE GREATER OF: (A) THE TOTAL AMOUNTS PAID BY YOU TO PLYNDROX AI FOR THE SERVICES IN THE TWELVE (12) CALENDAR MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM; OR (B) INR 1,000 (ONE THOUSAND INDIAN RUPEES). THIS LIMITATION IS CUMULATIVE AND NOT PER INCIDENT.
                </p>
                <p>
                  SOME JURISDICTIONS DO NOT PERMIT EXCLUSION OR LIMITATION OF CERTAIN TYPES OF DAMAGES. IN SUCH JURISDICTIONS, THE LIMITATIONS AND EXCLUSIONS ABOVE WILL APPLY TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.
                </p>
              </TermsSection>

              <TermsSection id="indemnification" title="25. Indemnification">
                <p>
                  You agree to defend, indemnify, and hold harmless Plyndrox AI, its founders, directors, officers, employees, contractors, affiliates, licensors, and service providers (collectively, the "Plyndrox AI Parties") from and against any and all claims, demands, actions, investigations, proceedings, liabilities, judgments, damages, losses, costs, and expenses, including reasonable legal fees and professional costs, arising out of or related to any of the following:
                </p>
                <ul>
                  <li>Your access to or use of the Services, including your use of Plyndrox AI, Plyndrox WhatsApp AI, or Plyndrox Inbox AI.</li>
                  <li>Your connection of a Gmail account to Plyndrox Inbox AI, including any claim by the Gmail account owner, an email sender or recipient, a data protection authority, or any other party relating to the processing of Email Content Data through the Gmail Integration.</li>
                  <li>Your User Content, business data, knowledge base content, customer messages, prompts, instructions, automation configuration, or AI Output distributions.</li>
                  <li>Your use, publication, transmission, distribution, reliance on, or commercialization of AI Output generated through the Services.</li>
                  <li>Your violation of any provision of these Terms, including the Acceptable Use Policy and Plyndrox Inbox AI Acceptable Use Policy.</li>
                  <li>Your violation of applicable law, regulation, professional rule, or industry standard in any jurisdiction in connection with your use of the Services.</li>
                  <li>Your violation of Third-party Service terms, including Meta Platform Terms, WhatsApp Business Policies, Google API Services User Data Policy, or other developer or platform agreements.</li>
                  <li>Your failure to obtain required customer consents, opt-ins, notices, or privacy disclosures.</li>
                  <li>Your failure to maintain required human oversight or escalation procedures for AI-generated communications.</li>
                  <li>Claims from your customers, employees, contractors, end users, business partners, regulators, data protection authorities, or other third parties arising from your use of the Services or AI-generated communications sent on your behalf.</li>
                  <li>Any allegation that your use of Lead Intelligence Data violated the privacy rights, data protection rights, or other rights of the individuals whose information appears therein.</li>
                </ul>
                <p>
                  Plyndrox AI reserves the right to assume exclusive control of the defense and settlement of any claim for which you are obligated to indemnify Plyndrox AI. You agree to cooperate fully with Plyndrox AI's defense of such claims, provide all reasonably requested information, and not settle any claim without Plyndrox AI's prior written consent where such settlement imposes obligations on or affects the rights of any Plyndrox AI Party.
                </p>
              </TermsSection>

              <TermsSection id="dispute-resolution" title="26. Dispute Resolution">
                <SubSection title="26.1 Informal Resolution First">
                  <p>
                    Before initiating any formal legal proceeding, claim, arbitration, or administrative complaint arising out of or relating to these Terms or the Services, you agree to first contact Plyndrox AI at support@plyndrox.app and provide a written notice of dispute that includes: (a) your name, account email address, and relevant account or integration details; (b) a clear and specific description of the nature and basis of the dispute; (c) the specific relief or remedy you are seeking, including any monetary amount; and (d) any supporting documentation relevant to the dispute. Plyndrox AI will use commercially reasonable good-faith efforts to respond within thirty (30) calendar days. Both parties agree to engage in good-faith discussions during this informal resolution period for a period of at least sixty (60) days before either party initiates formal proceedings.
                  </p>
                </SubSection>
                <SubSection title="26.2 Governing Dispute Resolution Process">
                  <p>
                    If informal resolution efforts fail, disputes shall be resolved in accordance with the governing law and jurisdiction provisions of Section 27. Nothing in this section prevents either party from seeking emergency injunctive or other equitable relief from a court of competent jurisdiction to prevent irreparable harm pending resolution of a dispute, or prevents Plyndrox AI from taking immediate action to protect the security, integrity, or availability of the Services or to enforce these Terms.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="governing-law" title="27. Governing Law and Jurisdiction">
                <p>
                  These Terms and any dispute, claim, controversy, or proceeding of any kind arising out of or relating to these Terms, the Services, the Privacy Policy, the Gmail Integration, the WhatsApp Integration, AI Output, or any other aspect of the relationship between you and Plyndrox AI will be governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000, the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the Indian Contract Act, 1872, and applicable data protection regulations, without regard to conflict of law principles that would require the application of the laws of any other jurisdiction.
                </p>
                <p>
                  Subject to any mandatory consumer protection rights that may apply in your jurisdiction and that cannot be waived by contract, you agree that the courts of competent jurisdiction located in India shall have exclusive jurisdiction to resolve any dispute, claim, or controversy that is not resolved through the informal dispute resolution process described in Section 26. You irrevocably submit to the personal jurisdiction of such courts for this purpose.
                </p>
                <p>
                  If you are located in a jurisdiction with mandatory local dispute resolution laws, consumer protection laws, or data protection enforcement mechanisms that cannot be contractually displaced (such as certain EU, UK, or consumer jurisdiction requirements), nothing in these Terms is intended to deprive you of rights you cannot waive under the mandatory law of your jurisdiction. To the extent such mandatory laws apply and conflict with these Terms, the mandatory law shall govern to the minimum extent necessary to comply.
                </p>
              </TermsSection>

              <TermsSection id="miscellaneous" title="28. Miscellaneous Provisions">
                <SubSection title="28.1 Entire Agreement">
                  <p>
                    These Terms of Service, together with the Privacy Policy incorporated by reference and any written supplementary agreements, data processing addenda, order forms, or enterprise agreements separately executed by both parties, constitute the entire agreement between you and Plyndrox AI with respect to the subject matter herein and supersede all prior and contemporaneous oral and written understandings, representations, communications, and agreements between the parties relating to the same subject matter.
                  </p>
                </SubSection>
                <SubSection title="28.2 Severability">
                  <p>
                    If any provision of these Terms is found by a court or arbitrator of competent jurisdiction to be unlawful, invalid, void, or unenforceable for any reason, that provision shall be severed from these Terms to the minimum extent necessary, and the remaining provisions shall continue in full force and effect. If a provision is partially invalid, the parties agree that the provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the original intent of the parties to the greatest extent possible.
                  </p>
                </SubSection>
                <SubSection title="28.3 Waiver">
                  <p>
                    No failure or delay by Plyndrox AI in exercising any right, remedy, power, or privilege under these Terms shall operate as a waiver of that right or remedy. No single or partial exercise of any right or remedy shall preclude any other or further exercise of that right or remedy. A waiver by Plyndrox AI of any breach of these Terms shall not constitute a waiver of any subsequent breach, and no waiver shall be effective unless made in writing and signed by an authorized representative of Plyndrox AI.
                  </p>
                </SubSection>
                <SubSection title="28.4 Assignment">
                  <p>
                    You may not assign, transfer, sublicense, or delegate any of your rights or obligations under these Terms, in whole or in part, without the prior written consent of Plyndrox AI. Any purported assignment without such consent is void and of no effect. Plyndrox AI may freely assign these Terms, and all rights and obligations hereunder, in connection with a merger, acquisition, sale of assets, corporate restructuring, change of control, or as part of a broader business transfer, provided that the assignee assumes all of Plyndrox AI's obligations under these Terms and, where required by applicable data protection law, appropriate measures are taken to protect transferred personal data including Email Content Data.
                  </p>
                </SubSection>
                <SubSection title="28.5 Force Majeure">
                  <p>
                    Plyndrox AI will not be liable for any failure or delay in performing its obligations under these Terms to the extent such failure or delay is caused by circumstances beyond its reasonable control, including acts of God, natural disasters, floods, fires, earthquakes, pandemics, epidemics, acts of government or regulatory authority, wars, civil unrest, internet infrastructure failures, widespread power outages, third-party API outages including Google or Meta infrastructure failures, cyberattacks by nation-state or sophisticated threat actors that Plyndrox AI could not reasonably have prevented, or other events of similar extraordinary magnitude. Plyndrox AI will use commercially reasonable efforts to minimize the impact of force majeure events and to restore service availability as soon as practicable.
                  </p>
                </SubSection>
                <SubSection title="28.6 Notices">
                  <p>
                    Plyndrox AI may provide notices to you under these Terms through: (a) email to the address registered to your account; (b) in-app notifications within the Services dashboard; (c) prominent notice on the Services' homepage or applicable product page; or (d) other reasonable means. Notices sent by email are deemed received on the date transmitted. You are responsible for keeping your registered email address current. Notices from you to Plyndrox AI must be sent to support@plyndrox.app and are deemed received upon confirmation of receipt by Plyndrox AI.
                  </p>
                </SubSection>
                <SubSection title="28.7 Relationship of the Parties">
                  <p>
                    These Terms do not create any partnership, joint venture, agency, fiduciary relationship, franchise, or employment relationship between you and Plyndrox AI. You and Plyndrox AI are independent contractors, and neither party has authority to bind the other to any obligation, commitment, or agreement. Nothing in these Terms shall be construed to create any third-party beneficiary rights, except that the Plyndrox AI Parties named in the indemnification provision are intended third-party beneficiaries of that provision.
                  </p>
                </SubSection>
                <SubSection title="28.8 Headings and Interpretation">
                  <p>
                    Section headings in these Terms are for organizational convenience only and have no legal effect. The terms "include," "includes," and "including" are to be read as if followed by the phrase "without limitation." The word "or" is inclusive and means "and/or." References to "applicable law" include all applicable statutes, regulations, rules, orders, ordinances, judicial decisions, and other legally binding requirements in all relevant jurisdictions. These Terms shall not be construed against either party solely on the basis of which party drafted them.
                  </p>
                </SubSection>
              </TermsSection>

              <TermsSection id="changes-to-terms" title="29. Changes to These Terms">
                <p>
                  Plyndrox AI may update, revise, amend, or replace these Terms at any time, including to reflect changes in applicable law, business practices, the scope of Services offered, Third-party Service requirements, security obligations, or product functionality — including material changes to how Plyndrox Inbox AI accesses or uses Gmail data. When we make material changes to these Terms, we will provide notice by: (a) updating the "Last updated" date at the top of this page; (b) sending an email notification to your registered account address; and/or (c) displaying a prominent in-app notice within the Services before the changes take effect.
                </p>
                <p>
                  For changes that materially expand the scope of data we access through the Gmail Integration, we will seek your re-authorization through the Google OAuth flow before accessing any data under expanded permissions. For changes that materially increase your obligations or limit your rights, we will provide at least fourteen (14) days' advance notice where commercially reasonable.
                </p>
                <p>
                  Your continued access to or use of the Services after updated Terms become effective constitutes your acceptance of the updated Terms. If you do not agree to updated Terms, you must stop using the Services, disconnect the Gmail Integration, and, if applicable, close your account before the updated Terms take effect. You may not continue to use the Services while also rejecting these Terms.
                </p>
              </TermsSection>

              <TermsSection id="contact-information" title="30. Contact Information">
                <p>
                  If you have questions about these Terms, the Services, Plyndrox Inbox AI, Plyndrox WhatsApp AI, the Gmail Integration, data handling, legal compliance, or any legal notice required to be sent to Plyndrox AI, please contact us using the information below:
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
                    For legal notices, data deletion requests, privacy-related requests, or concerns regarding the Gmail Integration and Plyndrox Inbox AI, please include your account email address, the specific nature of your request, and any relevant account or integration details. For disputes, please follow the informal resolution process described in Section 26 before initiating formal proceedings. We aim to respond to all contact within a commercially reasonable timeframe, typically within five to ten business days for general inquiries and within thirty days for formal privacy or legal requests.
                  </p>
                </div>
              </TermsSection>

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
