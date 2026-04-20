"use client";

export default function WhatsAppAILandingPage() {
  return (
    <main className="relative min-h-screen bg-white text-[#1d2226]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.08),transparent_60%),radial-gradient(ellipse_at_bottom-right,rgba(16,185,129,0.06),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-0 pt-6 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-gray-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur-xl">
          <a href="/" className="flex items-center gap-3">
            <img src="/evara-logo.png" alt="Plyndrox AI" className="h-8 w-8 object-contain" draggable={false} />
            <span className="text-sm font-bold tracking-widest text-emerald-700 uppercase">Plyndrox Business</span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/login?next=/whatsapp-ai/dashboard"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1d2226]"
            >
              Log in
            </a>
            <a
              href="/signup?next=/whatsapp-ai/dashboard"
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Sign up
            </a>
          </div>
        </header>

        <div className="mt-24 flex flex-1 flex-col items-center justify-center text-center">
          <p className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Next Generation Plyndrox WhatsApp AI
          </p>
          <h1 className="mt-8 max-w-4xl text-balance text-5xl font-semibold leading-tight text-[#1d2226] sm:text-7xl">
            Customer support that never sleeps.
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-gray-500 sm:text-lg">
            Connect your WhatsApp Cloud API to Plyndrox&apos;s multilingual intelligence. 
            Automate inquiries, bookings, and support instantly with a deeply 
            human touch.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/signup?next=/whatsapp-ai/dashboard"
              className="rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:scale-105 hover:bg-emerald-700"
            >
              Start Building Now
            </a>
            <a
              href="/login?next=/whatsapp-ai/dashboard"
              className="rounded-full border border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-[#1d2226] shadow-sm transition hover:bg-gray-50"
            >
              Dashboard Login
            </a>
          </div>
        </div>

        <div className="mt-auto grid gap-6 pt-20 sm:grid-cols-3">
          {[
            {
              title: "Multilingual Intelligence",
              desc: "Understands Hindi, English, and Hinglish flawlessly out of the box.",
            },
            {
              title: "Instant Integration",
              desc: "Connects securely to your WhatsApp Cloud API without exposing credentials.",
            },
            {
              title: "Brand Alignment",
              desc: "Trained entirely on your custom business knowledge book.",
            },
          ].map((feature, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-emerald-700">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        <footer className="mt-20 border-t border-gray-200 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <img src="/evara-logo.png" alt="Plyndrox AI" className="h-8 w-8 object-contain" draggable={false} />
                <span className="text-sm font-bold tracking-widest text-emerald-700 uppercase">Plyndrox AI</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                Empowering businesses with intelligent WhatsApp automation. Built in India, serving the world.
              </p>
              <div className="mt-4 space-y-1 text-xs text-gray-400">
                <p>Co-founders: <span className="text-gray-600">Riley Parker</span> &amp; <span className="text-gray-600">Rupesh Sahu</span></p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Product</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="/whatsapp-ai" className="text-sm text-gray-500 transition hover:text-emerald-700">Plyndrox WhatsApp AI</a></li>
                <li><a href="/whatsapp-ai/dashboard" className="text-sm text-gray-500 transition hover:text-emerald-700">Dashboard</a></li>
                <li><a href="/signup?next=/whatsapp-ai/dashboard" className="text-sm text-gray-500 transition hover:text-emerald-700">Get Started</a></li>
                <li><a href="/login?next=/whatsapp-ai/dashboard" className="text-sm text-gray-500 transition hover:text-emerald-700">Log In</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Legal</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="/privacy-policy" className="text-sm text-gray-500 transition hover:text-emerald-700">Privacy Policy</a></li>
                <li><a href="/terms" className="text-sm text-gray-500 transition hover:text-emerald-700">Terms of Service</a></li>
                <li><a href="/data-deletion" className="text-sm text-gray-500 transition hover:text-emerald-700">Data Deletion</a></li>
                <li>
                  <span className="text-sm text-gray-400">
                    Compliant with WhatsApp Business API &amp; Meta policies.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Contact</h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href="mailto:support.studyhelp@gmail.com" className="text-sm text-gray-500 transition hover:text-emerald-700">
                    support.studyhelp@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+919060937559" className="text-sm text-gray-500 transition hover:text-emerald-700">
                    +91 9060937559
                  </a>
                </li>
                <li className="text-sm text-gray-400">
                  Kaimur, Bihar – 821195<br />India
                </li>
                <li className="text-xs text-gray-400">
                  Support: Mon–Sat, 10 AM – 6 PM IST
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Plyndrox AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy-policy" className="text-xs text-gray-400 transition hover:text-emerald-700">Privacy Policy</a>
              <a href="/terms" className="text-xs text-gray-400 transition hover:text-emerald-700">Terms of Service</a>
              <a href="/data-deletion" className="text-xs text-gray-400 transition hover:text-emerald-700">Data Deletion</a>
              <a href="mailto:support.studyhelp@gmail.com" className="text-xs text-gray-400 transition hover:text-emerald-700">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
