export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-800">
      <header className="border-b border-zinc-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <a href="/whatsapp-ai" className="flex items-center gap-2">
            <img src="/evara-logo.png" alt="Evara AI" className="h-7 w-7 rounded-md bg-white p-0.5 object-contain" draggable={false} />
            <span className="text-sm font-bold tracking-wide text-zinc-900">Evara AI</span>
          </a>
          <a href="/whatsapp-ai" className="text-sm text-emerald-700 hover:underline">← Back to Home</a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-zinc-900">Data Deletion Request</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: April 12, 2025</p>
          <p className="mt-4 text-base leading-relaxed text-gray-400">
            At Evara AI, we respect your right to control your personal data. This page explains how you can request the deletion of your data that we have collected and stored through your use of our WhatsApp AI platform. We are committed to processing all deletion requests promptly and transparently, in accordance with applicable data protection laws and Meta's WhatsApp Business API policies.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="border-b border-zinc-100 pb-3 text-2xl font-bold text-zinc-900">1. What Data We Hold</h2>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-gray-400">
              <p>When you use the Evara AI platform — either as a business owner connecting your WhatsApp account, or as an end customer interacting with a business through WhatsApp — we may store the following types of data:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li><strong>Account information</strong> — your name, email address, and account credentials (stored in encrypted form).</li>
                <li><strong>Business profile data</strong> — business name, type, working hours, location, services, and knowledge book content you configure on the dashboard.</li>
                <li><strong>WhatsApp Business credentials</strong> — your API access token and Phone Number ID (stored encrypted; never returned to the dashboard).</li>
                <li><strong>WhatsApp conversation logs</strong> — incoming customer messages and AI-generated replies associated with your account.</li>
                <li><strong>Usage and access logs</strong> — IP addresses, browser type, and activity logs generated during your use of the platform.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="border-b border-zinc-100 pb-3 text-2xl font-bold text-zinc-900">2. How to Request Data Deletion</h2>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-gray-400">
              <p>You can request the deletion of your personal data at any time by contacting us directly via email. To submit a data deletion request, please follow these steps:</p>
              <ol className="mt-3 list-decimal space-y-3 pl-5">
                <li>
                  <strong>Send an email</strong> to{" "}
                  <a href="mailto:support.studyhelp@gmail.com" className="text-emerald-700 underline">support.studyhelp@gmail.com</a>{" "}
                  with the subject line: <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-700">Data Deletion Request</span>
                </li>
                <li>
                  <strong>Include the following information</strong> in your email:
                  <ul className="mt-2 list-disc space-y-1.5 pl-5">
                    <li>Your full name as registered on the platform.</li>
                    <li>The email address associated with your Evara AI account.</li>
                    <li>Your WhatsApp phone number (if applicable).</li>
                    <li>A brief description of the data you want deleted (e.g., "all account data," "conversation logs only," etc.).</li>
                  </ul>
                </li>
                <li>
                  <strong>Wait for our confirmation</strong> — we will acknowledge your request within 48 hours of receiving it.
                </li>
              </ol>
              <p className="mt-3">
                If you connected your WhatsApp account through our platform via Meta, you may also revoke our app's access to your data directly from your Facebook account settings under <em>Settings → Apps and Websites</em>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="border-b border-zinc-100 pb-3 text-2xl font-bold text-zinc-900">3. Identity Verification</h2>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-gray-400">
              <p>To protect your privacy and prevent unauthorized deletion requests, we may need to verify your identity before processing your request. This is done to ensure that data is only deleted at the request of the actual account holder.</p>
              <p>Verification may include one or more of the following:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Confirming your identity by asking you to reply from the email address registered on your account.</li>
                <li>Asking you to provide a recent transaction, login timestamp, or other detail that only the account holder would know.</li>
                <li>In some cases, we may send a one-time verification code to your registered email before proceeding.</li>
              </ul>
              <p className="mt-3">We will keep verification requirements minimal and will not use verification as a means to delay or deny legitimate deletion requests.</p>
            </div>
          </section>

          <section>
            <h2 className="border-b border-zinc-100 pb-3 text-2xl font-bold text-zinc-900">4. Deletion Timeline</h2>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-gray-400">
              <p>Once your identity has been verified and your deletion request has been confirmed, we will process and complete the deletion of your personal data within the following timeframes:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li><strong>Account data and business profile:</strong> Deleted within <strong>7 business days</strong> of request confirmation.</li>
                <li><strong>WhatsApp conversation logs:</strong> Deleted within <strong>7 business days</strong> of request confirmation.</li>
                <li><strong>WhatsApp credentials (API tokens, Phone Number ID):</strong> Deleted within <strong>3 business days</strong> — these are prioritized for faster removal.</li>
                <li><strong>Usage and access logs:</strong> Anonymized or deleted within <strong>14 business days</strong>.</li>
              </ul>
              <p className="mt-3">We will send you a confirmation email once your data has been fully deleted, along with a summary of what was removed.</p>
            </div>
          </section>

          <section>
            <h2 className="border-b border-zinc-100 pb-3 text-2xl font-bold text-zinc-900">5. Data We May Retain</h2>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-gray-400">
              <p>In certain circumstances, we may be required to retain some of your data even after a deletion request has been processed. This limited retention applies only where required by applicable law or legitimate business necessity, and includes:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li><strong>Legal obligations:</strong> If we are required by law, court order, or regulatory authority to retain certain data, we will do so only for the minimum period required and will inform you if possible.</li>
                <li><strong>Dispute resolution:</strong> If there is an unresolved dispute, active investigation, or pending legal claim involving your account, we may retain relevant data until the matter is resolved.</li>
                <li><strong>Fraud prevention:</strong> In cases where an account was involved in suspected fraudulent, illegal, or abusive activity, certain records may be retained to prevent recurrence.</li>
                <li><strong>Aggregated and anonymized data:</strong> Statistical and analytical data that has been fully anonymized and cannot be traced back to any individual may be retained for product improvement purposes.</li>
              </ul>
              <p className="mt-3">Any data retained for these purposes will be stored securely, access will be strictly limited, and it will be deleted as soon as the legal or legitimate basis for retention no longer applies.</p>
            </div>
          </section>

          <section>
            <h2 className="border-b border-zinc-100 pb-3 text-2xl font-bold text-zinc-900">6. Meta / WhatsApp Data</h2>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-gray-400">
              <p>
                If you connected your WhatsApp Business account to Evara AI through the WhatsApp Cloud API provided by Meta Platforms, Inc., please be aware that certain data may also be held directly by Meta. Evara AI can only delete the data held within our own systems. To request deletion of data held by Meta, please refer to{" "}
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">Meta's Privacy Policy</a>{" "}
                and their data deletion tools.
              </p>
              <p>This data deletion page specifically covers data held by Evara AI on our own servers and databases.</p>
            </div>
          </section>

          <section>
            <h2 className="border-b border-zinc-100 pb-3 text-2xl font-bold text-zinc-900">7. Contact Us</h2>
            <div className="mt-5 text-base leading-relaxed text-gray-400">
              <p>If you have any questions about the data deletion process or want to submit a request, please reach out to us:</p>
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                <p className="font-semibold text-zinc-900">Evara AI — Data Privacy Team</p>
                <p className="mt-1 text-gray-400">Kaimur, Bihar – 821195, India</p>
                <p className="mt-3">
                  <span className="font-medium">Email:</span>{" "}
                  <a href="mailto:support.studyhelp@gmail.com" className="text-emerald-700 underline">support.studyhelp@gmail.com</a>
                </p>
                <p>
                  <span className="font-medium">Subject line to use:</span>{" "}
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-700">Data Deletion Request</span>
                </p>
                <p className="mt-3">
                  <span className="font-medium">Support Hours:</span> Monday – Saturday, 10:00 AM – 6:00 PM IST
                </p>
                <p className="mt-3 text-sm text-gray-400">We aim to acknowledge all requests within 48 hours and complete deletion within 7 business days of verification.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-100 bg-zinc-50 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Evara AI. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="/privacy-policy" className="hover:text-emerald-700">Privacy Policy</a>
          <a href="/terms" className="hover:text-emerald-700">Terms of Service</a>
          <a href="/data-deletion" className="hover:text-emerald-700">Data Deletion</a>
          <a href="/whatsapp-ai" className="hover:text-emerald-700">WhatsApp AI</a>
        </div>
      </footer>
    </div>
  );
}
