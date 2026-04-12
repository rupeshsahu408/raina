export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-zinc-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-zinc-500">Last updated: April 12, 2025 &nbsp;·&nbsp; Effective date: April 12, 2025</p>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            Welcome to Raina Jet. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Raina Jet ("Company," "we," "our," or "us"), governing your access to and use of the Raina Jet platform, website, and all related services (collectively, the "Services") available at{" "}
            <a href="https://raina-jet.vercel.app" className="text-emerald-700 underline">raina-jet.vercel.app</a>.
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-600">
            Please read these Terms carefully before using our Services. By accessing or using Raina Jet, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use our Services.
          </p>
        </div>

        <div className="space-y-10">
          <Section title="1. Description of Services">
            <p>Raina Jet is a Software-as-a-Service (SaaS) platform that enables businesses to connect their WhatsApp Business accounts and use artificial intelligence to automatically respond to customer messages. The Services include:</p>
            <ul>
              <li>A user dashboard for configuring AI auto-reply behavior, tone, language, and business knowledge.</li>
              <li>Integration with the WhatsApp Business Cloud API (provided by Meta Platforms, Inc.) for receiving and sending WhatsApp messages.</li>
              <li>An AI-powered reply engine that generates contextually relevant, human-like responses based on your business configuration.</li>
              <li>A conversation log and management interface to monitor customer interactions.</li>
              <li>Account management, authentication, and security features.</li>
            </ul>
            <p>Our Services are designed for businesses and professionals. By using Raina Jet, you confirm that you are using the platform for legitimate business communication purposes and that your use complies with all applicable laws and Meta's WhatsApp Business policies.</p>
          </Section>

          <Section title="2. Eligibility and Account Registration">
            <SubSection title="2.1 Eligibility">
              <p>To use Raina Jet, you must:</p>
              <ul>
                <li>Be at least 18 years of age.</li>
                <li>Have the legal capacity to enter into a binding agreement.</li>
                <li>Not be prohibited from using the Services under applicable laws.</li>
                <li>Be a duly authorized representative of the business you are registering, if registering on behalf of a business entity.</li>
              </ul>
            </SubSection>

            <SubSection title="2.2 Account Registration">
              <p>To access the full features of our platform, you must create an account by providing accurate, current, and complete information. You agree to:</p>
              <ul>
                <li>Provide truthful and accurate information during registration.</li>
                <li>Keep your account information up to date at all times.</li>
                <li>Maintain the confidentiality of your account credentials, including your password.</li>
                <li>Be solely responsible for all activities that occur under your account.</li>
                <li>Notify us immediately if you suspect unauthorized access to your account by emailing <a href="mailto:support.studyhelp@gmail.com" className="text-emerald-700 underline">support.studyhelp@gmail.com</a>.</li>
              </ul>
            </SubSection>

            <SubSection title="2.3 Account Security">
              <p>You are responsible for maintaining the security of your account. Raina Jet will not be liable for any loss or damage arising from your failure to protect your account credentials. We strongly recommend using a strong, unique password and enabling any available security features.</p>
            </SubSection>
          </Section>

          <Section title="3. Acceptable Use Policy">
            <p>You agree to use Raina Jet only for lawful purposes and in a manner that does not infringe upon the rights of others. By using our Services, you represent and warrant that your use will comply with all applicable local, state, national, and international laws and regulations.</p>

            <SubSection title="3.1 User Responsibilities">
              <p>You are responsible for:</p>
              <ul>
                <li>Ensuring that all business information, FAQs, pricing, and knowledge content you upload to the platform is accurate, truthful, and not misleading.</li>
                <li>Complying with Meta's WhatsApp Business Policies and the WhatsApp Business API Terms of Service when using the platform to send messages.</li>
                <li>Obtaining all necessary consents from your customers before communicating with them via WhatsApp, in accordance with applicable data protection laws.</li>
                <li>Ensuring that your use of the AI auto-reply system does not violate any consumer protection laws or regulations in your jurisdiction.</li>
                <li>Monitoring the AI-generated replies periodically to ensure accuracy and appropriateness.</li>
              </ul>
            </SubSection>

            <SubSection title="3.2 Prohibited Activities">
              <p>You agree that you will NOT use Raina Jet to:</p>
              <ul>
                <li><strong>Send Spam or Unsolicited Messages:</strong> Use the platform to send bulk unsolicited messages, promotional content, or communications to individuals who have not consented to receive them.</li>
                <li><strong>Harass or Harm:</strong> Harass, abuse, threaten, stalk, or harm any individual or group of people through messages sent via the platform.</li>
                <li><strong>Spread Misinformation:</strong> Distribute false, misleading, or fraudulent information through the AI auto-reply system or manually.</li>
                <li><strong>Illegal Activities:</strong> Engage in any activity that violates applicable laws, including but not limited to fraud, phishing, money laundering, illegal gambling, drug trafficking, or any other criminal activity.</li>
                <li><strong>Violate Intellectual Property:</strong> Infringe upon the intellectual property rights, privacy rights, or other legal rights of any person or entity.</li>
                <li><strong>Impersonation:</strong> Impersonate another person, business, or organization in a way that is deceptive or misleading.</li>
                <li><strong>Platform Abuse:</strong> Attempt to reverse-engineer, decompile, disassemble, or otherwise discover the source code or underlying algorithms of our platform.</li>
                <li><strong>Security Attacks:</strong> Attempt to probe, scan, or test the vulnerability of the system, or to breach any security or authentication measures.</li>
                <li><strong>Overloading:</strong> Use automated scripts, bots, or other methods to place excessive demand on our servers in a way that degrades the performance of the service for other users.</li>
                <li><strong>Reselling Without Authorization:</strong> Resell, sublicense, or otherwise transfer access to the Services to third parties without our prior written consent.</li>
                <li><strong>Violating Meta Policies:</strong> Use the platform in a way that violates Meta's Community Standards, WhatsApp Business Policy, or any other applicable Meta platform policy.</li>
              </ul>
            </SubSection>
          </Section>

          <Section title="4. WhatsApp Integration and Third-Party APIs">
            <p>Raina Jet integrates with the WhatsApp Business Cloud API provided by Meta Platforms, Inc. Your use of this integration is subject to:</p>
            <ul>
              <li>Meta's WhatsApp Business API Terms of Service</li>
              <li>Meta's Business Terms of Service</li>
              <li>Meta's Platform Terms</li>
              <li>WhatsApp's Business Policy</li>
            </ul>
            <p>By connecting your WhatsApp Business account to Raina Jet, you represent and warrant that you have the authority to do so and that your WhatsApp Business account is in good standing with Meta. You acknowledge that:</p>
            <ul>
              <li>Raina Jet acts as a Business Solution Provider (BSP) facilitating your use of the WhatsApp Business API, and is not itself a party to your communications with your customers.</li>
              <li>You are solely responsible for the content of messages sent through our platform on behalf of your business.</li>
              <li>Meta may suspend or revoke your WhatsApp Business account access at any time if you violate their policies, which may affect your ability to use our Services.</li>
              <li>We are not responsible for any interruption to the WhatsApp Cloud API service or changes to Meta's API policies that may affect our Services.</li>
            </ul>
          </Section>

          <Section title="5. Intellectual Property">
            <SubSection title="5.1 Our Property">
              <p>All content, features, and functionality on the Raina Jet platform — including but not limited to the website design, logos, text, graphics, software, AI models, and code — are owned by Raina Jet or its licensors and are protected by applicable intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our platform without our express written permission.</p>
            </SubSection>

            <SubSection title="5.2 Your Content">
              <p>You retain all ownership rights to the business content you provide to the platform (business name, knowledge book, FAQs, etc.). By uploading content to Raina Jet, you grant us a limited, non-exclusive, royalty-free license to use, process, store, and transmit that content solely for the purpose of providing the Services to you. We will not use your content for any other purpose.</p>
            </SubSection>
          </Section>

          <Section title="6. Service Availability and Modifications">
            <p>We strive to maintain high availability of our Services, but we make no guarantees regarding uptime or uninterrupted access. You acknowledge that:</p>
            <ul>
              <li><strong>Service Interruptions:</strong> We may experience downtime due to maintenance, system updates, third-party service failures (including the WhatsApp Cloud API), or technical issues beyond our control. We will make reasonable efforts to notify you in advance of planned maintenance.</li>
              <li><strong>Modifications:</strong> We reserve the right to modify, update, or discontinue any feature of the Services at any time, with or without notice. We will make reasonable efforts to provide advance notice of significant changes.</li>
              <li><strong>Discontinuation:</strong> We reserve the right to discontinue the Services entirely, with reasonable advance notice to active users.</li>
              <li><strong>Feature Changes:</strong> Features available in the Service may change over time. We are not obligated to maintain any particular feature indefinitely.</li>
            </ul>
          </Section>

          <Section title="7. Privacy and Data Protection">
            <p>Your use of the Services is subject to our <a href="/privacy-policy" className="text-emerald-700 underline">Privacy Policy</a>, which is incorporated into these Terms by reference. By using the Services, you consent to our collection and use of your information as described in the Privacy Policy. You are responsible for ensuring that your use of the Services and any data you provide complies with applicable data protection laws in your jurisdiction, including obtaining necessary consents from your customers.</p>
          </Section>

          <Section title="8. Account Suspension and Termination">
            <SubSection title="8.1 Termination by You">
              <p>You may terminate your account at any time by contacting us at <a href="mailto:support.studyhelp@gmail.com" className="text-emerald-700 underline">support.studyhelp@gmail.com</a>. Upon termination, your right to use the Services will immediately cease. Please review our data retention practices in the Privacy Policy for information on how we handle your data after termination.</p>
            </SubSection>

            <SubSection title="8.2 Suspension or Termination by Us">
              <p>We reserve the right to suspend or terminate your account, with or without notice, for any of the following reasons:</p>
              <ul>
                <li>Violation of these Terms of Service or our Acceptable Use Policy.</li>
                <li>Violation of Meta's WhatsApp Business policies that affects your ability to use our platform.</li>
                <li>Engaging in fraudulent, illegal, or harmful activities through the platform.</li>
                <li>Providing false information during registration or at any time thereafter.</li>
                <li>Non-payment of applicable fees (if any paid plans are introduced).</li>
                <li>Extended periods of inactivity (we will notify you before this happens).</li>
                <li>Any other conduct that we determine, in our sole discretion, to be harmful to Raina Jet, our users, or third parties.</li>
              </ul>
            </SubSection>

            <SubSection title="8.3 Effects of Termination">
              <p>Upon termination, your access to the Services will end. We will handle your data in accordance with our Privacy Policy. Sections of these Terms that by their nature should survive termination will remain in effect after termination.</p>
            </SubSection>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, RAINA JET DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:</p>
            <ul>
              <li>WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</li>
              <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY AI-GENERATED CONTENT.</li>
              <li>WARRANTIES THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.</li>
              <li>WARRANTIES REGARDING THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICES.</li>
            </ul>
            <p>You use the AI auto-reply system at your own risk. While we strive for accuracy, AI-generated replies may occasionally be incorrect, incomplete, or inappropriate. You are responsible for monitoring and reviewing AI-generated content.</p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, RAINA JET AND ITS FOUNDERS, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:</p>
            <ul>
              <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICES.</li>
              <li>ANY LOSS OF PROFITS, REVENUE, DATA, BUSINESS, OR GOODWILL.</li>
              <li>ANY DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA.</li>
              <li>ANY CONDUCT OR CONTENT OF THIRD PARTIES ON OR THROUGH THE SERVICES.</li>
              <li>ANY INTERRUPTION OR CESSATION OF THE WHATSAPP CLOUD API BY META PLATFORMS, INC.</li>
            </ul>
            <p>IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS EXCEED THE GREATER OF (A) THE AMOUNT YOU HAVE PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) INR 1,000 (ONE THOUSAND INDIAN RUPEES).</p>
            <p>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN WARRANTIES OR LIABILITY, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU IN FULL.</p>
          </Section>

          <Section title="11. Indemnification">
            <p>You agree to defend, indemnify, and hold harmless Raina Jet and its founders, officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable legal fees) arising out of or relating to:</p>
            <ul>
              <li>Your violation of these Terms of Service.</li>
              <li>Your use of the Services in violation of applicable laws or regulations.</li>
              <li>Your violation of any third party's rights, including intellectual property rights and privacy rights.</li>
              <li>Any content you upload or transmit through the platform.</li>
              <li>Your violation of Meta's WhatsApp Business policies.</li>
            </ul>
          </Section>

          <Section title="12. Governing Law and Dispute Resolution">
            <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising out of or related to these Terms or the Services shall be subject to the exclusive jurisdiction of the courts located in Bihar, India.</p>
            <p className="mt-3">Before initiating any formal legal proceedings, you agree to first attempt to resolve the dispute informally by contacting us at <a href="mailto:support.studyhelp@gmail.com" className="text-emerald-700 underline">support.studyhelp@gmail.com</a> and providing a written description of the dispute. We will make good-faith efforts to resolve the dispute within 30 days.</p>
          </Section>

          <Section title="13. Changes to These Terms">
            <p>We reserve the right to modify these Terms at any time. We will provide notice of significant changes by email (to the address associated with your account) or by posting a prominent notice on our website at least 7 days before the changes take effect. The updated Terms will always be available at <a href="https://raina-jet.vercel.app/terms" className="text-emerald-700 underline">raina-jet.vercel.app/terms</a>.</p>
            <p className="mt-3">Your continued use of the Services after the effective date of the updated Terms constitutes your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Services and delete your account.</p>
          </Section>

          <Section title="14. Miscellaneous">
            <ul>
              <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Raina Jet with respect to the Services and supersede all prior agreements.</li>
              <li><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable or invalid, that provision will be modified to the minimum extent necessary to make it enforceable, and the remaining provisions will continue in full force and effect.</li>
              <li><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of that right or provision.</li>
              <li><strong>Assignment:</strong> You may not assign your rights or obligations under these Terms without our prior written consent. We may freely assign our rights and obligations under these Terms.</li>
              <li><strong>Force Majeure:</strong> We will not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, natural disasters, war, governmental actions, or failures of third-party services.</li>
            </ul>
          </Section>

          <Section title="15. Contact Us">
            <p>If you have any questions about these Terms of Service, please contact us:</p>
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
