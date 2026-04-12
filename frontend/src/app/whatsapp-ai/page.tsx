"use client";

import { ThreeBackground } from "@/components/ThreeBackground";

export default function WhatsAppAILandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040c08] text-zinc-100">
      <div className="absolute inset-0 z-0">
        <ThreeBackground />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#040c08] via-[#040c08]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#040c08] via-transparent to-transparent opacity-80" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-0 pt-6 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-xl">
          <a href="/" className="flex items-center gap-3">
            <img src="/evara-logo.png" alt="Evara AI" className="h-8 w-8 object-contain" draggable={false} />
            <span className="text-sm font-bold tracking-widest text-emerald-300 uppercase">Evara Business</span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/login?next=/whatsapp-ai/dashboard"
              className="text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              Log in
            </a>
            <a
              href="/signup?next=/whatsapp-ai/dashboard"
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Sign up
            </a>
          </div>
        </header>

        <div className="mt-24 flex flex-1 flex-col items-center justify-center text-center">
          <p className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Next Generation WhatsApp AI
          </p>
          <h1 className="mt-8 max-w-4xl text-balance text-5xl font-semibold leading-tight text-white sm:text-7xl">
            Customer support that never sleeps.
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg">
            Connect your WhatsApp Cloud API to Evara's multilingual intelligence. 
            Automate inquiries, bookings, and support instantly with a deeply 
            human touch.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/signup?next=/whatsapp-ai/dashboard"
              className="rounded-full bg-emerald-400 px-8 py-3.5 text-sm font-bold text-black shadow-[0_0_40px_-10px_rgba(52,211,153,0.5)] transition hover:scale-105 hover:bg-emerald-300"
            >
              Start Building Now
            </a>
            <a
              href="/login?next=/whatsapp-ai/dashboard"
              className="rounded-full border border-white/20 bg-black/40 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
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
            <div key={i} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-emerald-100">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-white/10 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <img src="/evara-logo.png" alt="Raina Jet" className="h-8 w-8 object-contain" draggable={false} />
                <span className="text-sm font-bold tracking-widest text-emerald-300 uppercase">Raina Jet</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                Empowering businesses with intelligent WhatsApp automation. Built in India, serving the world.
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <span>Founder:</span>
                  <a href="https://vercal.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition">
                    <img
                      src="https://vercal.app/favicon.ico"
                      alt="vercal.app"
                      className="h-3.5 w-3.5 rounded-sm object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span>vercal.app</span>
                  </a>
                </div>
                <p>Co-founder: Rupesh Sahu</p>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Product</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="/whatsapp-ai" className="text-sm text-zinc-500 transition hover:text-emerald-400">WhatsApp AI</a></li>
                <li><a href="/whatsapp-ai/dashboard" className="text-sm text-zinc-500 transition hover:text-emerald-400">Dashboard</a></li>
                <li><a href="/signup?next=/whatsapp-ai/dashboard" className="text-sm text-zinc-500 transition hover:text-emerald-400">Get Started</a></li>
                <li><a href="/login?next=/whatsapp-ai/dashboard" className="text-sm text-zinc-500 transition hover:text-emerald-400">Log In</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Legal</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="/privacy-policy" className="text-sm text-zinc-500 transition hover:text-emerald-400">Privacy Policy</a></li>
                <li><a href="/terms" className="text-sm text-zinc-500 transition hover:text-emerald-400">Terms of Service</a></li>
                <li><a href="/data-deletion" className="text-sm text-zinc-500 transition hover:text-emerald-400">Data Deletion</a></li>
                <li>
                  <span className="text-sm text-zinc-600">
                    Compliant with WhatsApp Business API & Meta policies.
                  </span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Contact</h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href="mailto:support.studyhelp@gmail.com" className="text-sm text-zinc-500 transition hover:text-emerald-400">
                    support.studyhelp@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+919060937559" className="text-sm text-zinc-500 transition hover:text-emerald-400">
                    +91 9060937559
                  </a>
                </li>
                <li className="text-sm text-zinc-600">
                  Kaimur, Bihar – 821195<br />India
                </li>
                <li className="text-xs text-zinc-600">
                  Support: Mon–Sat, 10 AM – 6 PM IST
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} Raina Jet. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy-policy" className="text-xs text-zinc-600 transition hover:text-emerald-400">Privacy Policy</a>
              <a href="/terms" className="text-xs text-zinc-600 transition hover:text-emerald-400">Terms of Service</a>
              <a href="/data-deletion" className="text-xs text-zinc-600 transition hover:text-emerald-400">Data Deletion</a>
              <a href="mailto:support.studyhelp@gmail.com" className="text-xs text-zinc-600 transition hover:text-emerald-400">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
