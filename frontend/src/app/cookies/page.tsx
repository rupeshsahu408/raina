import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — Vercal AI",
  description:
    "Comprehensive Cookie Policy for Vercal AI, including Ivana AI and WhatsApp AI cookie and tracking technology practices.",
};

const tableOfContents = [
  ["Introduction", "introduction"],
  ["What Are Cookies", "what-are-cookies"],
  ["Types of Cookies We Use", "types-of-cookies-we-use"],
  ["How We Use Cookies", "how-we-use-cookies"],
  ["Ivana AI Specific Cookie Usage", "ivana-ai-specific-cookie-usage"],
  ["WhatsApp AI and Tracking", "whatsapp-ai-and-tracking"],
  ["Third-Party Cookies", "third-party-cookies"],
  ["Cookie Duration", "cookie-duration"],
  ["Managing Cookies", "managing-cookies"],
  ["Consent and Control", "consent-and-control"],
  ["Data Protection and Privacy", "data-protection-and-privacy"],
  ["Updates to This Policy", "updates-to-this-policy"],
  ["Contact Information", "contact-information"],
];

export default function CookiePolicyPage() {
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
              <span className="block text-xs text-zinc-500">Cookie Policy</span>
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
              <nav className="mt-5 space-y-1" aria-label="Cookie policy sections">
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
                Cookie Policy
              </h1>
              <p className="mt-4 text-sm text-zinc-500">
                Last updated: April 12, 2026 · Effective date: April 12, 2026
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">
                This Cookie Policy explains how Vercal AI uses cookies and similar tracking technologies across its platform, including Ivana AI and WhatsApp AI. It is intended to help you understand what cookies are, how we use them, and what choices you have regarding their use. This policy should be read alongside our Privacy Policy.
              </p>
            </div>

            <div className="policy-content mt-10 space-y-12">
              <PolicySection id="introduction" title="1. Introduction">
                <p>
                  Vercal AI operates through the Vercal.app platform and provides AI-powered software services for individuals and businesses, including Ivana AI, a web and application-based AI assistant, and WhatsApp AI, a business automation service integrated with the WhatsApp Business API. As part of delivering and continuously improving these services, Vercal AI and its authorized third-party partners use cookies and similar tracking technologies on its websites, web applications, dashboards, and related digital properties.
                </p>
                <p>
                  This Cookie Policy describes the types of cookies and tracking technologies we use, the purposes for which they are used, how long they remain active, and the options available to you for managing or withdrawing your consent to such technologies. By using the Vercal AI platform, you acknowledge that you have reviewed this Cookie Policy and understand how cookies may be used in connection with your experience.
                </p>
                <p>
                  This Cookie Policy forms part of, and should be read in conjunction with, our Privacy Policy, which describes in greater detail how we collect, use, store, share, and protect personal information across all of our services. Where this Cookie Policy refers to "Services," it includes all Vercal AI products, features, websites, dashboards, and applications unless expressly limited to a specific service.
                </p>
                <p>
                  The WhatsApp AI service operates differently from Ivana AI with respect to cookies, as WhatsApp AI primarily functions through the WhatsApp Business API and Meta-managed communication channels rather than traditional browser-based interfaces. Specific provisions for each service are set out where applicable throughout this policy.
                </p>
              </PolicySection>

              <PolicySection id="what-are-cookies" title="2. What Are Cookies">
                <p>
                  Cookies are small text files that are placed on your computer, mobile device, tablet, or other internet-connected device by a website or application when you access it. These files allow the website or application to recognize your device, remember your preferences or actions over a period of time, maintain session continuity, and deliver a more personalized or functional experience.
                </p>
                <p>
                  Cookies may be set either by the website you are visiting, in which case they are known as first-party cookies, or by third-party organizations whose content, functionality, or services appear on or are integrated into the website you are visiting, known as third-party cookies. Cookies can be read by the server that placed them when you return to the same website and are generally harmless files that do not themselves contain executable code or malware.
                </p>
                <SubSection title="2.1 Session Cookies">
                  <p>
                    Session cookies are temporary cookies that exist only for the duration of a single browsing session. They are automatically deleted when you close your browser or terminate your active session. Session cookies are primarily used to maintain continuity within a single visit, such as keeping you authenticated while navigating between pages or maintaining a conversation context within an AI session.
                  </p>
                </SubSection>
                <SubSection title="2.2 Persistent Cookies">
                  <p>
                    Persistent cookies remain on your device for a defined period of time after your session ends, or until they are manually deleted. Unlike session cookies, persistent cookies survive browser closure and allow a website to recognize you on subsequent visits. They are used for purposes such as remembering your login state, saving your preferences, or tracking usage patterns over time for analytics purposes.
                  </p>
                </SubSection>
                <SubSection title="2.3 Similar Technologies">
                  <p>
                    In addition to traditional cookies, we and our partners may use related tracking technologies that function in a similar manner or in conjunction with cookies. These include, without limitation:
                  </p>
                  <ul>
                    <li><strong>Local Storage and Session Storage:</strong> Browser-based storage mechanisms that allow web applications to store data on your device without expiry (local storage) or only for the duration of a session (session storage). These are typically used to remember application state, user interface settings, or temporary data that improves functionality.</li>
                    <li><strong>Pixel Tags and Web Beacons:</strong> Tiny invisible image files or code embedded in web pages or emails that send a signal to a server when loaded, which may be used to track whether an email has been opened, confirm page visits, or support analytics and advertising measurement.</li>
                    <li><strong>Device Fingerprinting:</strong> A technique that uses combinations of browser attributes, device characteristics, and connection metadata to identify or distinguish devices, sometimes used for fraud prevention and security monitoring.</li>
                    <li><strong>Tracking URLs and Query Parameters:</strong> Specially crafted web links that include identifiers or parameters used to attribute traffic sources, campaigns, referrals, or user actions across sessions or channels.</li>
                    <li><strong>Service Workers and Cached Data:</strong> Background scripts registered by web applications that may cache content, assets, and state information locally on your device to support offline functionality or improve loading performance.</li>
                  </ul>
                  <p>
                    References to "cookies" throughout this policy should be understood to include all such similar technologies unless a distinction is expressly stated.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="types-of-cookies-we-use" title="3. Types of Cookies We Use">
                <p>
                  We use several categories of cookies across the Vercal AI platform, each serving a distinct purpose. The categories below reflect the standard classification of cookies used by digital services and are presented to give you a clear and transparent understanding of our practices.
                </p>
                <SubSection title="3.1 Essential Cookies">
                  <p>
                    Essential cookies are strictly necessary for the operation of the Vercal AI platform. Without these cookies, certain fundamental features of the Services cannot function, including user authentication, session management, secure access controls, and core application navigation. These cookies do not require your consent to the extent that they are indispensable to providing services you have specifically requested, but we are committed to transparency in disclosing their use.
                  </p>
                  <p>Essential cookies may include those used to:</p>
                  <ul>
                    <li>Authenticate and maintain your logged-in session after successful sign-in.</li>
                    <li>Protect against cross-site request forgery (CSRF) and other security vulnerabilities.</li>
                    <li>Remember security settings or verification status during a session.</li>
                    <li>Route requests correctly between servers and maintain load balancing consistency.</li>
                    <li>Support required consent management or cookie preference records.</li>
                    <li>Enable basic platform navigation and prevent session expiry during active use.</li>
                  </ul>
                </SubSection>
                <SubSection title="3.2 Performance and Analytics Cookies">
                  <p>
                    Performance and analytics cookies collect information about how users interact with the Vercal AI platform, including which pages are visited most frequently, how long users spend on particular sections, what actions are taken, where errors occur, and what referral sources bring traffic to the platform. This data is used in aggregate or anonymized form to understand platform usage and improve the reliability, speed, and overall quality of our Services.
                  </p>
                  <p>These cookies may be used to:</p>
                  <ul>
                    <li>Measure page load times, resource availability, and response latency.</li>
                    <li>Identify frequently used features, underperforming sections, or navigational friction points.</li>
                    <li>Track error rates, failed requests, and unexpected behavior to support debugging.</li>
                    <li>Understand traffic sources, user journey patterns, and session engagement levels.</li>
                    <li>Assess the impact of platform updates, design changes, or new feature releases.</li>
                  </ul>
                  <p>
                    Where analytics cookies involve third-party providers, we implement data minimization practices and configure such tools to reduce or eliminate the transmission of personally identifiable information where technically feasible.
                  </p>
                </SubSection>
                <SubSection title="3.3 Functionality Cookies">
                  <p>
                    Functionality cookies enable the Vercal AI platform to remember choices you have made and provide enhanced, personalized features that improve your experience. These cookies are not strictly essential to basic functionality but significantly improve convenience, accessibility, and usability.
                  </p>
                  <p>Functionality cookies may be used to:</p>
                  <ul>
                    <li>Remember your preferred language, locale, or regional settings.</li>
                    <li>Preserve your chosen interface theme, such as dark mode or light mode.</li>
                    <li>Retain dashboard layout preferences, notification settings, or display configurations.</li>
                    <li>Remember previously entered form data to avoid repeating input steps.</li>
                    <li>Maintain AI assistant tone preferences, conversation style settings, or pinned features.</li>
                    <li>Recognize returning users and streamline onboarding or setup flows.</li>
                  </ul>
                </SubSection>
                <SubSection title="3.4 Advertising and Tracking Cookies">
                  <p>
                    Vercal AI does not currently operate display advertising campaigns that place targeting cookies directly on users through the Vercal.app platform. However, certain marketing activities, referral programs, or third-party integrations that may be present on publicly accessible pages of our website could involve cookies used for advertising attribution, conversion measurement, or retargeting purposes.
                  </p>
                  <p>Where such cookies are present, they may be used to:</p>
                  <ul>
                    <li>Attribute visits or conversions to specific marketing campaigns, referral sources, or promotional links.</li>
                    <li>Measure the effectiveness of marketing efforts, such as cost-per-acquisition or return on advertising spend.</li>
                    <li>Enable remarketing audiences so that users who visit the platform may see related content on other digital channels.</li>
                    <li>Provide third-party advertising or analytics partners with aggregated behavioral signals.</li>
                  </ul>
                  <p>
                    Advertising and tracking cookies are only used with your consent where legally required. You may manage your preferences for these cookies through the cookie consent mechanism made available on the platform or through your browser settings.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="how-we-use-cookies" title="4. How We Use Cookies">
                <p>
                  Vercal AI uses cookies and similar tracking technologies for a range of purposes that collectively support the delivery, security, improvement, and personalization of the Services. The following describes the primary uses of cookies across the platform:
                </p>
                <ul>
                  <li><strong>Ensuring Platform Functionality:</strong> Essential cookies are used to authenticate users, maintain sessions, prevent unauthorized access, protect against security threats, and ensure that core features of the platform operate correctly and reliably across different devices and browsers.</li>
                  <li><strong>Improving User Experience:</strong> Functionality and preference-related cookies allow the platform to remember your settings, customizations, and previously selected options so that you do not need to reconfigure them on every visit. This results in a more seamless and consistent interaction with the Services.</li>
                  <li><strong>Analyzing Performance and Usage:</strong> Analytics cookies help us understand how users interact with the platform in aggregate, identify areas requiring improvement, diagnose technical issues, measure the impact of changes, and allocate development resources to the features and areas that matter most to users.</li>
                  <li><strong>Personalizing Content and Features:</strong> Certain cookies enable the platform to tailor content, recommendations, AI assistant behavior, and interface elements based on your interaction history, stated preferences, or account configuration, thereby delivering a more relevant and efficient experience.</li>
                  <li><strong>Maintaining Security and Preventing Abuse:</strong> Security-related cookies and device identifiers assist in detecting fraudulent activity, identifying suspicious login patterns, preventing account takeover, monitoring for unusual API activity, enforcing rate limits, and protecting the integrity of the platform and its users.</li>
                  <li><strong>Supporting Attribution and Marketing Measurement:</strong> Where applicable, cookies may assist in tracking referral sources, campaign performance, and conversion events to help us understand how users discover and engage with the Vercal AI platform across different channels.</li>
                </ul>
              </PolicySection>

              <PolicySection id="ivana-ai-specific-cookie-usage" title="5. Ivana AI Specific Cookie Usage">
                <p>
                  Ivana AI is the web and application-based AI assistant service within the Vercal AI platform. As a browser-accessible service, Ivana AI makes broader use of cookies and browser-based storage than the WhatsApp AI service. The following describes how cookies and similar technologies are used specifically in connection with Ivana AI.
                </p>
                <SubSection title="5.1 Chat Session Management">
                  <p>
                    When you use Ivana AI to conduct a conversation or submit prompts to the AI assistant, session cookies are used to maintain the continuity and authentication state of your chat session. These cookies ensure that your identity is preserved across navigational actions within the same session and that your ongoing conversation is attributed correctly to your account. Without session cookies, Ivana AI would be unable to associate successive messages with the same conversation thread or maintain your logged-in status between requests.
                  </p>
                </SubSection>
                <SubSection title="5.2 Temporary Interaction State Storage">
                  <p>
                    In addition to cookies, Ivana AI may use browser local storage or session storage to temporarily retain information such as in-progress message drafts, partially loaded conversation history, pending interface states, and transient UI data. This local state management reduces unnecessary server requests, prevents data loss in the event of brief connectivity disruptions, and contributes to a more responsive user experience during active AI sessions.
                  </p>
                </SubSection>
                <SubSection title="5.3 AI Response Performance Enhancement">
                  <p>
                    Certain performance-related storage mechanisms may be used to cache frequently accessed platform assets, interface components, and non-sensitive static resources within your browser. This caching reduces load times on repeat visits, decreases bandwidth consumption, and supports a faster and more fluid interaction with the Ivana AI assistant, particularly on lower-bandwidth connections or high-frequency usage scenarios.
                  </p>
                </SubSection>
                <SubSection title="5.4 Session Continuity and Preferences">
                  <p>
                    Persistent cookies associated with Ivana AI may be used to remember your account session between visits, enabling a seamless login experience if you have previously authenticated and have not explicitly signed out. Additionally, preference-related cookies may retain your chosen settings such as conversation display options, language preferences, response tone configurations, or notification behavior, ensuring these settings are applied automatically when you return to the service.
                  </p>
                </SubSection>
                <SubSection title="5.5 Progressive Web Application Storage">
                  <p>
                    If you install the Vercal AI progressive web application on a supported device, the application may register a service worker and maintain a local cache of application assets, user interface resources, and configuration data. This is necessary for the application to function in offline or low-connectivity environments and does not involve the transmission of sensitive user data. Such cached data is managed in accordance with applicable platform policies and may be cleared through your device or browser settings.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="whatsapp-ai-and-tracking" title="6. WhatsApp AI and Tracking">
                <p>
                  WhatsApp AI is a business automation service that operates primarily through the WhatsApp Business API, Meta infrastructure, and business-facing dashboards rather than through traditional consumer-facing browser sessions. The nature of this service means that cookie usage is limited compared to Ivana AI, and that significant aspects of data processing are governed by Meta's own policies and systems.
                </p>
                <SubSection title="6.1 Limited Direct Cookie Usage">
                  <p>
                    WhatsApp AI does not set cookies on the devices of end customers who interact with a business through WhatsApp. Customer interactions occur within the WhatsApp application environment, which is owned and operated by Meta Platforms, Inc. As a result, Vercal AI does not directly place or access cookies on end-customer devices through the WhatsApp channel. Cookies used in connection with WhatsApp AI are limited to those placed on the browsers of business administrators who access the Vercal AI dashboard to configure, monitor, or manage their WhatsApp AI integration.
                  </p>
                </SubSection>
                <SubSection title="6.2 Data Flow Through WhatsApp Business API">
                  <p>
                    When a business customer connects WhatsApp AI to the WhatsApp Business API, data including message content, phone number identifiers, delivery status, and webhook payloads flows between Vercal AI and Meta systems. This data flow does not involve traditional cookies but may involve API tokens, session identifiers, and integration credentials necessary to maintain the connection. These technical identifiers are used solely for the purpose of maintaining the authorized integration and are managed as sensitive credentials under our security and access control practices.
                  </p>
                </SubSection>
                <SubSection title="6.3 Meta and WhatsApp Tracking Technologies">
                  <p>
                    Meta Platforms, Inc. operates the WhatsApp application and the WhatsApp Business API infrastructure. Meta may use its own tracking technologies, cookies, device identifiers, and analytics systems in connection with the delivery of WhatsApp services to end customers and business users. Vercal AI does not control and is not responsible for Meta's independent tracking practices, cookie policies, or data processing activities. Business customers and end customers are encouraged to review Meta's Privacy Policy and WhatsApp's Privacy Policy to understand how Meta processes information within its ecosystem.
                  </p>
                </SubSection>
                <SubSection title="6.4 Business Dashboard Cookies">
                  <p>
                    Business administrators who access the Vercal AI dashboard to configure or operate WhatsApp AI may be subject to the same categories of cookies described in this policy that apply to authenticated platform users, including essential authentication cookies, functionality cookies for dashboard preferences, and analytics cookies that help us improve the business dashboard experience. These cookies apply to the browser-based dashboard interface only and do not affect end customers interacting through WhatsApp.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="third-party-cookies" title="7. Third-Party Cookies">
                <p>
                  In addition to cookies placed directly by Vercal AI, third-party service providers whose tools, scripts, or content are integrated into the Vercal AI platform may also place cookies on your device. These third-party cookies are governed by the privacy and cookie policies of the respective providers, and Vercal AI does not have direct control over their scope, duration, or behavior.
                </p>
                <SubSection title="7.1 Analytics Providers">
                  <p>
                    We may use third-party analytics services to collect and analyze information about platform usage, traffic patterns, session behavior, and performance metrics. These services may set cookies or use other tracking mechanisms to identify returning visitors and associate session data with prior visits. Information collected through analytics cookies is typically aggregated and used to understand platform performance rather than to identify individual users.
                  </p>
                </SubSection>
                <SubSection title="7.2 Hosting and Content Delivery Networks">
                  <p>
                    Vercal AI uses third-party hosting infrastructure and content delivery network (CDN) services to ensure reliable, fast, and globally accessible delivery of the platform. These providers may set technical cookies related to routing, caching, load balancing, security challenges (such as bot detection), and content optimization. These cookies are generally essential to reliable service delivery and are subject to the privacy terms of the respective infrastructure providers.
                  </p>
                </SubSection>
                <SubSection title="7.3 Authentication and Identity Providers">
                  <p>
                    If you use a third-party authentication provider, such as Google or another identity service, to create or access your Vercal AI account, that provider may set its own cookies or tokens on your device as part of the authentication flow. These cookies remain under the control and responsibility of the respective identity provider and are governed by their policies.
                  </p>
                </SubSection>
                <SubSection title="7.4 AI Model Providers">
                  <p>
                    Vercal AI may use third-party AI model providers to power certain AI features within Ivana AI and WhatsApp AI. API calls to these providers are made server-to-server and generally do not involve the placement of cookies on your device. However, if any third-party AI provider integrates client-side scripts or widget components with the Vercal AI platform, such components may set their own cookies subject to the provider's policies.
                  </p>
                </SubSection>
                <SubSection title="7.5 Disclaimer on External Control">
                  <p>
                    Vercal AI is not responsible for the privacy or data handling practices of any third-party service provider. We encourage you to review the cookie and privacy policies of any third-party provider whose cookies may be placed through the Vercal AI platform. Where technically and commercially feasible, we configure third-party integrations to minimize the scope of data collection and to ensure alignment with applicable data protection standards.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="cookie-duration" title="8. Cookie Duration">
                <p>
                  Cookies used on the Vercal AI platform vary in their duration depending on their purpose and technical implementation. Understanding how long cookies remain active on your device helps you make informed decisions about your preferences and browser settings.
                </p>
                <SubSection title="8.1 Session Cookies">
                  <p>
                    Session cookies are temporary and are automatically deleted from your device when you close your web browser or terminate your active session. These cookies do not persist between browsing sessions and do not accumulate over time. They are used for purposes such as maintaining login state within a single visit, managing active conversation contexts in Ivana AI, and supporting form completion or multi-step processes within a single session.
                  </p>
                </SubSection>
                <SubSection title="8.2 Persistent Cookies">
                  <p>
                    Persistent cookies remain on your device for a defined period after your session ends. The retention duration of a persistent cookie depends on its purpose and is set by the originating server when the cookie is created. Common durations for persistent cookies on the Vercal AI platform include:
                  </p>
                  <ul>
                    <li><strong>Short-term (up to 30 days):</strong> Typically used for recent preference storage, onboarding status, or short-cycle authentication tokens.</li>
                    <li><strong>Medium-term (30 days to 6 months):</strong> Used for analytics session continuity, returning user recognition, and interface setting retention.</li>
                    <li><strong>Long-term (6 months to 2 years):</strong> Used for persistent login tokens where you have elected to remain signed in, or for long-lived preference storage tied to your account.</li>
                  </ul>
                  <p>
                    Persistent cookies are automatically deleted upon reaching their configured expiry date, unless manually deleted earlier by the user or cleared through browser settings. We periodically review the duration of persistent cookies placed through our platform to ensure they are proportionate to their stated purpose and do not retain data beyond what is reasonably necessary.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="managing-cookies" title="9. Managing Cookies">
                <p>
                  You have several options for managing or limiting the use of cookies in connection with your use of the Vercal AI platform. The following describes the primary mechanisms available to you and their practical effects.
                </p>
                <SubSection title="9.1 Browser Settings">
                  <p>
                    Most modern web browsers allow you to control cookies through their settings or preferences menu. Depending on your browser, you may be able to block all cookies, block third-party cookies only, delete existing cookies, receive notifications before cookies are set, or configure cookie acceptance on a per-site basis. The specific options and their location vary between browsers; you should consult your browser's help documentation or support resources for instructions relevant to your browser version.
                  </p>
                  <p>Links to cookie management instructions for common browsers include:</p>
                  <ul>
                    <li>Google Chrome: Settings &gt; Privacy and security &gt; Cookies and other site data</li>
                    <li>Mozilla Firefox: Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
                    <li>Apple Safari: Preferences &gt; Privacy &gt; Manage Website Data</li>
                    <li>Microsoft Edge: Settings &gt; Cookies and site permissions &gt; Cookies and site data</li>
                  </ul>
                </SubSection>
                <SubSection title="9.2 Deleting Cookies">
                  <p>
                    You may delete cookies that have already been stored on your device at any time through your browser's history or privacy settings. Deleting cookies will remove stored preferences, may require you to log in again, and may reset previously configured settings. If you regularly clear cookies, you may need to re-enter preferences or authentication information more frequently.
                  </p>
                </SubSection>
                <SubSection title="9.3 Impact of Disabling Cookies">
                  <p>
                    If you choose to disable or block certain categories of cookies, please be aware that some features of the Vercal AI platform may not function correctly or at all. In particular:
                  </p>
                  <ul>
                    <li>Disabling essential cookies may prevent you from logging in, maintaining an authenticated session, or using protected features of the platform.</li>
                    <li>Disabling functionality cookies may cause the platform to reset your preferences on each visit and may result in a less personalized or convenient experience.</li>
                    <li>Disabling analytics cookies will not affect your ability to use the platform but will reduce our ability to understand usage patterns and improve the service.</li>
                    <li>Disabling advertising or tracking cookies may affect attribution measurement but will not impair core service functionality.</li>
                  </ul>
                  <p>
                    We recommend retaining at minimum the essential cookies required for authentication and security, as disabling these may render the Services inaccessible.
                  </p>
                </SubSection>
                <SubSection title="9.4 Opt-Out Tools for Analytics and Advertising">
                  <p>
                    Certain third-party analytics and advertising providers offer their own opt-out mechanisms that allow you to prevent the collection of data about your usage through their respective technologies. You may also explore browser extensions or privacy tools that block tracking scripts across multiple providers simultaneously. Vercal AI does not guarantee the availability or effectiveness of third-party opt-out tools and is not responsible for their accuracy or completeness.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="consent-and-control" title="10. Consent and Control">
                <p>
                  Vercal AI is committed to providing meaningful transparency and control over the use of cookies and tracking technologies, consistent with applicable data protection and privacy laws in the jurisdictions where we operate.
                </p>
                <SubSection title="10.1 Cookie Consent Mechanism">
                  <p>
                    Where required by applicable law, we display a cookie consent banner or notice upon your first visit to the Vercal AI platform. This notice informs you of the categories of cookies we use and invites you to accept, reject, or customize your cookie preferences. Your choices are recorded and respected across subsequent visits to the extent technically feasible. We do not set non-essential cookies prior to obtaining your consent where such consent is legally required.
                  </p>
                </SubSection>
                <SubSection title="10.2 Granular Cookie Preferences">
                  <p>
                    Where technically implemented, the cookie consent mechanism may allow you to accept or reject individual categories of cookies independently, rather than applying a blanket acceptance or rejection. This allows you to, for example, accept essential and functionality cookies while declining analytics or advertising cookies. These preferences can generally be updated at any time by revisiting the cookie settings interface on the platform.
                  </p>
                </SubSection>
                <SubSection title="10.3 Regional Compliance">
                  <p>
                    Our cookie practices are designed with reference to applicable regulatory frameworks including, without limitation, the General Data Protection Regulation (GDPR) as applied in the European Economic Area, the UK GDPR, the ePrivacy Directive, and comparable laws in other jurisdictions. To the extent that such frameworks require prior informed consent for the use of non-essential cookies, we endeavor to obtain such consent before placing those cookies on your device. If you are located in a jurisdiction with specific cookie consent requirements and you believe our practices do not comply, you are encouraged to contact us using the information provided in Section 13.
                  </p>
                </SubSection>
                <SubSection title="10.4 Withdrawal of Consent">
                  <p>
                    You may withdraw or modify your cookie consent at any time by updating your cookie preferences through the platform's consent management interface, if available, or by adjusting your browser settings as described in Section 9. Withdrawal of consent does not affect the lawfulness of cookie use that occurred prior to your withdrawal. Please note that withdrawing consent for essential cookies may affect your ability to use certain features of the platform.
                  </p>
                </SubSection>
              </PolicySection>

              <PolicySection id="data-protection-and-privacy" title="11. Data Protection and Privacy">
                <p>
                  Cookies and similar technologies may collect or facilitate the collection of information that constitutes personal data under applicable data protection laws. Vercal AI takes its obligations regarding personal data seriously and processes all cookie-related data in accordance with our Privacy Policy and applicable legal requirements.
                </p>
                <p>
                  Information collected through cookies, including identifiers, session data, behavioral signals, and preference records, is treated with the same level of care and protection as other personal information we process. We implement appropriate technical and organizational measures to protect this data against unauthorized access, loss, destruction, or disclosure, including encryption in transit, access controls, and secure storage practices.
                </p>
                <p>
                  For a comprehensive description of how we collect, use, store, share, protect, and retain personal information across all of our services, including the legal bases on which we process personal data, your rights as a data subject, and our data retention and deletion practices, please refer to our <Link href="/privacy-policy" className="text-purple-300 underline underline-offset-2 hover:text-purple-200 transition">Privacy Policy</Link>.
                </p>
                <p>
                  Vercal AI does not sell personal data collected through cookies to third parties for their own independent marketing or advertising purposes. Where cookie data is shared with third-party providers, such sharing is governed by contractual data processing terms that obligate those providers to handle the data in accordance with applicable law and our instructions.
                </p>
              </PolicySection>

              <PolicySection id="updates-to-this-policy" title="12. Updates to This Policy">
                <p>
                  Vercal AI reserves the right to update, amend, or revise this Cookie Policy at any time to reflect changes in our cookie practices, the introduction of new technologies, changes in applicable law, or updates to the Services. Any changes will be effective upon posting the revised policy to the Vercal AI website, with the updated effective date indicated at the top of this document.
                </p>
                <p>
                  Where changes to this Cookie Policy are material, we may notify you through appropriate means such as a notice displayed on the platform, an email notification to the address associated with your account, or an updated cookie consent prompt. We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies and tracking technologies.
                </p>
                <p>
                  Your continued use of the Vercal AI platform following the posting of any changes to this Cookie Policy constitutes your acknowledgment of the updated terms. If you do not agree with any changes, you should discontinue use of the affected Services or adjust your cookie preferences as described in this policy.
                </p>
              </PolicySection>

              <PolicySection id="contact-information" title="13. Contact Information">
                <p>
                  If you have any questions, concerns, or requests regarding this Cookie Policy, our use of cookies and tracking technologies, your cookie preferences, or the exercise of any rights you may have under applicable data protection law, please contact us using the information provided below.
                </p>
                <p>
                  We endeavor to respond to all privacy and cookie-related inquiries in a timely and thorough manner. If you are located in a jurisdiction that provides a right to lodge a complaint with a supervisory authority, you may also exercise that right in addition to or instead of contacting us directly.
                </p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Contact Details</p>
                  <div className="mt-4 space-y-3 text-sm text-zinc-400">
                    <p><strong className="text-zinc-200">Platform:</strong> Vercal AI</p>
                    <p><strong className="text-zinc-200">Website:</strong> Vercal.app</p>
                    <p>
                      <strong className="text-zinc-200">Email:</strong>{" "}
                      <a href="mailto:support@vercal.app" className="text-purple-300 hover:text-purple-200 transition underline underline-offset-2">
                        support@vercal.app
                      </a>
                    </p>
                  </div>
                </div>
              </PolicySection>
            </div>

            <div className="mt-12 border-t border-white/10 pt-8">
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span>© 2026 Vercal AI. All rights reserved.</span>
                <Link href="/privacy-policy" className="text-zinc-400 hover:text-white transition">Privacy Policy</Link>
                <Link href="/terms" className="text-zinc-400 hover:text-white transition">Terms of Service</Link>
                <Link href="/cookies" className="text-purple-300 hover:text-purple-200 transition">Cookie Policy</Link>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

function PolicySection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-400 [&_strong]:text-zinc-200 [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_a]:text-purple-300 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-purple-200">
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-zinc-200">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}
