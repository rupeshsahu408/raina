export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-800">
      <header className="border-b border-zinc-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <a href="/whatsapp-ai" className="flex items-center gap-2">
            <img src="/evara-logo.png" alt="Evara" className="h-7 w-7 rounded-md bg-black p-0.5 object-contain" draggable={false} />
            <span className="text-sm font-bold tracking-wide text-zinc-900">Raina Jet</span>
          </a>
          <a href="/whatsapp-ai" className="text-sm text-emerald-700 hover:underline">← Back to Home</a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-zinc-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-zinc-500">Last updated: April 12, 2025 &nbsp;·&nbsp; Effective date: April 12, 2025</p>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            Welcome to Raina Jet ("we," "our," or "us"). We operate a WhatsApp AI automation platform that helps businesses automatically respond to customer messages using artificial intelligence. This Privacy Policy explains in detail how we collect, use, store, share, and protect your information when you use our website and services at{" "}
            <a href="https://raina-jet.vercel.app" className="text-emerald-700 underline">raina-jet.vercel.app</a>.
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-600">
            By accessing or using our platform, you agree to the practices described in this Privacy Policy. If you do not agree with any part of this policy, please discontinue your use of our services immediately.
          </p>
        </div>

        <div className="space-y-10">
          <Section title="1. Information We Collect">
            <p>We collect several categories of information to provide and improve our services. This includes information you provide directly, information collected automatically, and information from third-party services you connect to our platform.</p>

            <SubSection title="1.1 Information You Provide Directly">
              <ul>
                <li><strong>Account Information:</strong> When you register for an account, we collect your full name, email address, and password (stored in encrypted form). We may also collect your phone number for verification and account security purposes.</li>
                <li><strong>Business Profile Information:</strong> To configure the AI auto-reply system, you may provide us with your business name, type of business, working hours, physical location, list of services or products, a business knowledge document (FAQs, policies, pricing), preferred AI tone, and language preferences.</li>
                <li><strong>WhatsApp Business Credentials:</strong> When connecting your WhatsApp Business account, you provide your WhatsApp Cloud API access token, your Phone Number ID associated with your WhatsApp Business account, and a webhook verify token. These credentials are stored using industry-standard encryption and are never returned or displayed on the dashboard after submission.</li>
                <li><strong>Communication with Us:</strong> If you contact our support team via email or other channels, we collect the content of your messages and any attachments, your contact information, and the history of our communications.</li>
              </ul>
            </SubSection>

            <SubSection title="1.2 Information Collected Automatically">
              <ul>
                <li><strong>Usage Data:</strong> We automatically collect information about how you access and use our platform, including your IP address, browser type and version, operating system, referring URLs, pages visited, time spent on pages, and actions taken within the platform.</li>
                <li><strong>Device Information:</strong> We collect information about the device you use to access our services, including device type, operating system version, and unique device identifiers.</li>
                <li><strong>Log Data:</strong> Our servers automatically record information when you use our services, including the date and time of your requests, error logs, and performance data.</li>
                <li><strong>Cookies and Similar Technologies:</strong> We use session cookies to maintain your login state and remember your preferences. These are strictly necessary for the platform to function correctly. We do not use third-party advertising cookies.</li>
              </ul>
            </SubSection>

            <SubSection title="1.3 WhatsApp Message Data">
              <ul>
                <li><strong>Incoming Customer Messages:</strong> When a customer sends a message to your connected WhatsApp number, the message content is received by our platform via the WhatsApp Business Cloud API. We process this message to generate an AI-powered reply on your behalf.</li>
                <li><strong>AI-Generated Replies:</strong> The responses generated by our AI system are stored in your chat log, allowing you to review and monitor conversations on your dashboard.</li>
                <li><strong>Sender Information:</strong> We receive the customer's WhatsApp phone number (as provided by Meta's API), their display name (if available), and the timestamp of their message.</li>
                <li>We process this data solely for the purpose of generating relevant replies on behalf of your business. We do not use your customers' message data for advertising or share it with other businesses on our platform.</li>
              </ul>
            </SubSection>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect for the following specific purposes:</p>
            <ul>
              <li><strong>Service Delivery:</strong> To operate, maintain, and provide all features of the Raina Jet platform, including connecting your WhatsApp account, processing incoming messages, and generating AI auto-replies.</li>
              <li><strong>Account Management:</strong> To create and manage your account, authenticate your identity when you log in, and secure your account against unauthorized access.</li>
              <li><strong>AI Auto-Reply Processing:</strong> To use your provided business configuration (knowledge book, tone, language settings, working hours) to generate contextually appropriate and helpful responses to your customers' WhatsApp messages.</li>
              <li><strong>Service Improvement:</strong> To analyze usage patterns, identify performance bottlenecks, fix bugs, and improve the overall quality and accuracy of our AI system. This analysis is performed in aggregate and is not used to profile individual users.</li>
              <li><strong>Communications:</strong> To send you important service-related notifications such as account confirmations, security alerts, updates to our policies, and information about significant changes to the platform. We will never send you unsolicited marketing emails without your explicit consent.</li>
              <li><strong>Legal and Safety:</strong> To comply with applicable laws and regulations, respond to legal requests and government inquiries, enforce our Terms of Service, and protect the rights, property, and safety of Raina Jet, our users, and the public.</li>
              <li><strong>Technical Support:</strong> To diagnose technical issues, respond to support requests, and help you resolve problems with your account or the platform.</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing and Disclosure">
            <p><strong>We do not sell, rent, or trade your personal information to any third party, for any purpose, at any time.</strong> We may share your information only in the following limited circumstances:</p>
            <ul>
              <li><strong>Meta (WhatsApp Cloud API):</strong> Our platform connects to Meta's WhatsApp Business Cloud API to send and receive messages on your behalf. When you link your WhatsApp account, certain data flows between our platform and Meta's systems as required by the API. This is governed by Meta's own Privacy Policy and Data Policy.</li>
              <li><strong>AI Processing Providers:</strong> Message content is sent to our AI inference provider (NVIDIA AI) to generate replies. This data is transmitted securely and is used only for the immediate purpose of generating a response. It is not stored by the AI provider for training or profiling purposes.</li>
              <li><strong>Database and Infrastructure Providers:</strong> We use trusted cloud infrastructure providers (including MongoDB Atlas for database hosting and Firebase for authentication) to store and process your data. These providers are contractually bound to process your data only on our behalf and in accordance with strict confidentiality obligations.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law, court order, or government authority, or if we believe in good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you via email or a prominent notice on our platform before your information becomes subject to a different privacy policy.</li>
            </ul>
          </Section>

          <Section title="4. Data Security">
            <p>We take the security of your information seriously and implement multiple layers of protection:</p>
            <ul>
              <li><strong>Encryption in Transit:</strong> All data transmitted between your browser, our servers, and third-party APIs is encrypted using Transport Layer Security (TLS/HTTPS). We do not allow unencrypted connections to our platform.</li>
              <li><strong>Encryption at Rest:</strong> Sensitive credentials such as your WhatsApp API tokens are encrypted before being stored in our database. The encryption keys are stored separately from the data they protect.</li>
              <li><strong>Credential Isolation:</strong> Your WhatsApp Business credentials are stored separately from your general account data. Stored credentials are never returned or displayed in the dashboard after initial submission — only their status (present or missing) is shown.</li>
              <li><strong>Authentication Security:</strong> We use Firebase Authentication, which provides industry-standard authentication including protection against brute-force attacks, session management, and secure token handling.</li>
              <li><strong>Access Controls:</strong> Only authorized personnel with a legitimate business need can access user data, and all such access is logged and monitored.</li>
              <li><strong>Regular Reviews:</strong> We regularly review our security practices and update our systems to address emerging threats.</li>
            </ul>
            <p className="mt-3">Despite our best efforts, no method of transmission over the internet or method of electronic storage is 100% secure. We cannot guarantee absolute security. If you believe your account has been compromised, please contact us immediately at <a href="mailto:support.studyhelp@gmail.com" className="text-emerald-700 underline">support.studyhelp@gmail.com</a>.</p>
          </Section>

          <Section title="5. Data Retention">
            <p>We retain your personal information for as long as necessary to provide you with our services and fulfill the purposes described in this policy:</p>
            <ul>
              <li><strong>Account Data:</strong> Retained for the duration of your account. If you delete your account, we will delete or anonymize your personal information within 30 days, unless we are legally required to retain it.</li>
              <li><strong>WhatsApp Chat Logs:</strong> Conversation logs are retained for up to 90 days by default to allow you to review them in your dashboard. You may delete specific logs from your dashboard at any time.</li>
              <li><strong>Business Configuration:</strong> Retained as long as your account is active and deleted upon account deletion.</li>
              <li><strong>WhatsApp Credentials:</strong> Retained as long as your WhatsApp connection is active. You may revoke and delete your credentials from your account settings at any time.</li>
              <li><strong>Usage and Log Data:</strong> Aggregate usage data may be retained for longer periods for analytics and service improvement purposes, but this data is anonymized and cannot be used to identify individual users.</li>
            </ul>
          </Section>

          <Section title="6. Your Rights and Choices">
            <p>Depending on your location, you may have certain rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> You have the right to request a copy of the personal information we hold about you.</li>
              <li><strong>Correction:</strong> You have the right to request that we correct any inaccurate or incomplete personal information we hold about you.</li>
              <li><strong>Deletion:</strong> You have the right to request that we delete your personal information. Please note that some information may be required for legal or contractual reasons and cannot be immediately deleted.</li>
              <li><strong>Portability:</strong> You have the right to request a copy of your data in a structured, machine-readable format so you can transfer it to another service.</li>
              <li><strong>Objection:</strong> You have the right to object to the processing of your personal information in certain circumstances.</li>
              <li><strong>Withdraw Consent:</strong> Where processing is based on your consent, you have the right to withdraw that consent at any time. Withdrawing consent will not affect the lawfulness of processing before the withdrawal.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:support.studyhelp@gmail.com" className="text-emerald-700 underline">support.studyhelp@gmail.com</a>. We will respond to your request within 30 days.</p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately. If we discover that a child under 18 has provided us with personal information, we will delete that information from our systems promptly.</p>
          </Section>

          <Section title="8. Third-Party Links">
            <p>Our platform may contain links to third-party websites or services that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites. We strongly advise you to review the privacy policy of every site you visit. Our Privacy Policy does not apply to third-party websites.</p>
          </Section>

          <Section title="9. International Data Transfers">
            <p>Our servers and infrastructure providers may be located in countries other than your own. By using our services, you consent to the transfer of your information to countries that may have different data protection laws than your country of residence. We take steps to ensure that any international transfers of personal data are subject to appropriate safeguards.</p>
          </Section>

          <Section title="10. Changes to This Privacy Policy">
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make significant changes, we will notify you by email (to the address associated with your account) or by posting a prominent notice on our website at least 7 days before the changes take effect. The updated policy will always be available at <a href="https://raina-jet.vercel.app/privacy-policy" className="text-emerald-700 underline">raina-jet.vercel.app/privacy-policy</a>.</p>
            <p className="mt-3">Your continued use of our services after the effective date of the updated Privacy Policy constitutes your acceptance of the changes.</p>
          </Section>

          <Section title="11. Contact Us">
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              <p className="font-semibold text-zinc-900">Raina Jet</p>
              <p className="mt-1 text-zinc-600">Kaimur, Bihar – 821195, India</p>
              <p className="mt-3">
                <span className="font-medium">Email:</span>{" "}
                <a href="mailto:support.studyhelp@gmail.com" className="text-emerald-700 underline">support.studyhelp@gmail.com</a>
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                <a href="tel:+919060937559" className="text-emerald-700 underline">+91 9060937559</a>
              </p>
              <p>
                <span className="font-medium">Support Hours:</span> Monday – Saturday, 10:00 AM – 6:00 PM IST
              </p>
            </div>
          </Section>
        </div>
      </main>

      <footer className="border-t border-zinc-100 bg-zinc-50 py-8 text-center text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} Raina Jet. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="/privacy-policy" className="hover:text-emerald-700">Privacy Policy</a>
          <a href="/terms" className="hover:text-emerald-700">Terms of Service</a>
          <a href="/whatsapp-ai" className="hover:text-emerald-700">WhatsApp AI</a>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-zinc-900 border-b border-zinc-100 pb-3 mb-5">{title}</h2>
      <div className="space-y-4 text-base leading-relaxed text-zinc-600 [&_ul]:mt-3 [&_ul]:space-y-2.5 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold text-zinc-800 mb-2">{title}</h3>
      <div className="text-base leading-relaxed text-zinc-600 [&_ul]:mt-2 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:leading-relaxed">
        {children}
      </div>
    </div>
  );
}
