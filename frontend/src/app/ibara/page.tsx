"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function IbaraLanding() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1d2226] overflow-x-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float 6s ease-in-out infinite 2s; }
        .animate-float-delay2 { animation: float 6s ease-in-out infinite 4s; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.7s ease-out forwards; }
        .animate-slide-up-2 { animation: slide-up 0.7s ease-out 0.15s forwards; opacity: 0; }
        .animate-slide-up-3 { animation: slide-up 0.7s ease-out 0.3s forwards; opacity: 0; }
        .animate-slide-up-4 { animation: slide-up 0.7s ease-out 0.45s forwards; opacity: 0; }
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa 0%, #06b6d4 50%, #a78bfa 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-x 4s ease infinite;
        }
        .card-glass {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
        }
        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(124,58,237,0.4);
        }
        .feature-card:hover {
          border-color: rgba(124,58,237,0.4);
          transform: translateY(-4px);
          transition: all 0.3s ease;
        }
      `}</style>

      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-xl border-b border-gray-200" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <span className="text-[#1d2226] font-bold text-sm">I</span>
            </div>
            <span className="font-bold text-lg tracking-tight">IBARA AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-[#1d2226] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#1d2226] transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/ibara/auth?mode=login")}
              className="text-sm text-white/70 hover:text-[#1d2226] transition-colors px-4 py-2"
            >
              Log in
            </button>
            <button
              onClick={() => router.push("/ibara/auth?mode=signup")}
              className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-xl text-[#1d2226]"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered Website Chatbot Platform
          </div>

          <h1 className="animate-slide-up-2 text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Add AI to your <br />
            <span className="gradient-text">website in minutes</span>
          </h1>

          <p className="animate-slide-up-3 text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            IBARA AI turns your website into a 24/7 intelligent assistant. Train it on your business, deploy it instantly — no code required.
          </p>

          <div className="animate-slide-up-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push("/ibara/auth?mode=signup")}
              className="btn-primary w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base text-[#1d2226]"
            >
              Start for Free →
            </button>
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base text-white/60 hover:text-[#1d2226] border border-gray-200 hover:border-white/20 transition-all"
            >
              See how it works
            </button>
          </div>

          {/* Floating UI Preview */}
          <div className="mt-20 relative">
            <div className="animate-float card-glass rounded-3xl p-1 max-w-3xl mx-auto shadow-2xl shadow-violet-950/50">
              <div className="bg-[#0A0A1B] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <div className="flex-1 mx-4 h-6 bg-white/5 rounded-full flex items-center px-3">
                    <span className="text-[10px] text-white/30">your-website.com</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-40 bg-gradient-to-br from-violet-950/40 to-cyan-950/20 rounded-xl flex items-center justify-center text-white/20 text-sm border border-gray-200">
                    Your website content here
                  </div>
                  <div className="absolute bottom-4 right-4 animate-float-delay">
                    <div className="card-glass rounded-2xl p-3 shadow-xl w-52">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-[#1d2226] text-[9px] font-bold">AI</span>
                        </div>
                        <span className="text-xs font-semibold text-white/80">IBARA Assistant</span>
                        <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed">Hi! How can I help you today? I know everything about this business 👋</p>
                      <div className="mt-2 flex items-center gap-1 bg-white/5 rounded-xl px-2 py-1.5">
                        <span className="text-[9px] text-white/30 flex-1">Ask me anything...</span>
                        <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center">
                          <span className="text-[#1d2226] text-[7px]">↑</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-4">Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Built for businesses that<br />
              <span className="gradient-text">want results</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔒",
                title: "Domain Verified",
                desc: "Secure DNS verification ensures only you can deploy AI to your domain. One-click setup.",
              },
              {
                icon: "🧠",
                title: "Train on Your Data",
                desc: "Feed it your services, FAQs, products and tone. It speaks exactly like your brand.",
              },
              {
                icon: "⚡",
                title: "Instant Activation",
                desc: "Fill the form, hit activate — your AI starts answering visitor questions immediately.",
              },
              {
                icon: "🌐",
                title: "Multi-Language",
                desc: "Supports English, Hindi, and Hinglish. Speak your customers' language naturally.",
              },
              {
                icon: "📊",
                title: "Live Dashboard",
                desc: "Monitor your AI's activity, test conversations, and refine responses in real time.",
              },
              {
                icon: "🎨",
                title: "Personality Control",
                desc: "Choose Professional or Friendly tone to perfectly match your brand's voice.",
              },
            ].map((f) => (
              <div key={f.title} className="card-glass feature-card rounded-2xl p-6 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/20 flex items-center justify-center text-2xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-4">Simple process</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Launch in <span className="gradient-text">4 steps</span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { step: "01", title: "Create your account", desc: "Sign up with email or Google in under 30 seconds." },
              { step: "02", title: "Add your website", desc: "Enter your domain and verify ownership with a simple DNS TXT record." },
              { step: "03", title: "Train your AI", desc: "Fill in your business details, services, knowledge base and tone preferences." },
              { step: "04", title: "Go live", desc: "Hit Activate — your AI chatbot is now live on your website 24/7." },
            ].map((s, i) => (
              <div key={s.step} className="card-glass rounded-2xl p-6 flex items-start gap-6">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-black text-lg text-[#1d2226]">
                  {s.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-white/40 text-sm">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="shrink-0 text-white/10 text-2xl self-center">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-cyan-900/10" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                Ready to add AI <br />
                <span className="gradient-text">to your website?</span>
              </h2>
              <p className="text-white/40 mb-8 text-lg">
                Join businesses using IBARA AI to serve customers smarter.
              </p>
              <button
                onClick={() => router.push("/ibara/auth?mode=signup")}
                className="btn-primary px-10 py-4 rounded-2xl font-bold text-lg text-[#1d2226]"
              >
                Get Started Free →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <span className="text-[#1d2226] font-bold text-xs">I</span>
            </div>
            <span className="font-bold text-sm">IBARA AI</span>
          </div>
          <p className="text-white/20 text-xs">© {new Date().getFullYear()} IBARA AI. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-white/30">
            <a href="/privacy-policy" className="hover:text-[#1d2226]/60 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-[#1d2226]/60 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
