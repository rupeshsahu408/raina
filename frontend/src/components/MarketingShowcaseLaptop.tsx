"use client";

import Image from "next/image";
import Link from "next/link";

export default function MarketingShowcaseLaptop() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-20 sm:py-28 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-8">
        <div className="order-1">
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute inset-0 -z-10 translate-y-10 scale-[0.92] rounded-[3rem] bg-gradient-to-br from-amber-400/30 via-rose-400/20 to-indigo-500/30 blur-3xl" />
            <div className="relative">
              <Image
                src="/marketing/boy-with-laptop.png"
                alt="A delighted Plyndrox user excitedly showing the Plyndrox dashboard on his laptop"
                width={720}
                height={1024}
                priority={false}
                className="h-auto w-full select-none rounded-[1.25rem]"
                draggable={false}
              />

              {/* Live mockup of Plyndrox dashboard composited onto the laptop screen */}
              <div
                className="pointer-events-none absolute overflow-hidden"
                style={{
                  top: "49.5%",
                  left: "4.2%",
                  width: "50.5%",
                  height: "23.5%",
                  transform: "perspective(800px) rotateY(-3deg)",
                  transformOrigin: "right center",
                  borderRadius: "4px 4px 0 0",
                }}
              >
                <LaptopScreenMockup />
              </div>

              {/* Floating accent badges */}
              <div className="pointer-events-none absolute left-4 top-8 hidden rounded-2xl border border-white/20 bg-white/10 px-3 py-2 shadow-xl backdrop-blur-md md:block">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Verified</p>
                    <p className="text-xs font-bold text-white">10x faster workflow</p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-2 bottom-24 hidden rounded-2xl border border-white/20 bg-white/10 px-3 py-2 shadow-xl backdrop-blur-md md:block">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <svg key={i} viewBox="0 0 24 24" fill="#fbbf24" className="h-3 w-3">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-white">"Game changer"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-2">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-300 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            Loved by professionals
          </p>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            "Wow — this is<br />
            <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
              actually incredible."
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
            That's the reaction we keep hearing. Plyndrox runs as a full premium AI workspace right in your browser — no install, no setup, no learning curve. Open your laptop, sign in once, and the entire AI suite is at your fingertips.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: "⚡", title: "Built for speed", text: "Sub-second AI responses on every workspace." },
              { icon: "🧠", title: "7 AIs in one", text: "Switch between specialized AIs without losing context." },
              { icon: "🔒", title: "Private by default", text: "Your data stays yours — no training on your inputs." },
              { icon: "🎁", title: "Free forever", text: "No credit card. No trial. No paywall. Ever." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/10">
                <div className="mb-1.5 text-xl">{f.icon}</div>
                <p className="text-sm font-bold text-white">{f.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/personal/auth"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950 shadow-2xl shadow-amber-500/20 transition hover:bg-zinc-100"
            >
              Try it on your laptop now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
            <Link
              href="/translate"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              See Translate AI
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LaptopScreenMockup() {
  return (
    <div className="flex h-full w-full flex-col bg-white text-zinc-900">
      {/* Browser chrome */}
      <div className="flex items-center gap-1 border-b border-zinc-200 bg-zinc-100 px-2 py-1">
        <div className="flex gap-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="ml-2 flex flex-1 items-center justify-center rounded bg-white px-2 py-0.5">
          <span className="text-[6px] text-zinc-500">🔒 plyndrox.app/dashboard</span>
        </div>
      </div>

      {/* App layout: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex w-[18%] flex-col border-r border-zinc-200 bg-zinc-50 px-1 py-1">
          <div className="mb-1 flex items-center gap-0.5 px-0.5">
            <div className="flex h-2.5 w-2.5 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-600 to-violet-600">
              <span className="text-[5px] font-black text-white">P</span>
            </div>
            <span className="text-[5px] font-black text-zinc-900">Plyndrox</span>
          </div>
          {[
            { l: "Personal", c: "bg-rose-500", active: false },
            { l: "Business", c: "bg-amber-500", active: true },
            { l: "Inbox", c: "bg-blue-500", active: false },
            { l: "Payable", c: "bg-violet-500", active: false },
            { l: "Recruit", c: "bg-cyan-500", active: false },
            { l: "Ledger", c: "bg-fuchsia-500", active: false },
            { l: "Bihar", c: "bg-yellow-500", active: false },
          ].map((it) => (
            <div
              key={it.l}
              className={`mb-0.5 flex items-center gap-1 rounded px-0.5 py-0.5 ${it.active ? "bg-indigo-100" : ""}`}
            >
              <span className={`h-1.5 w-1.5 rounded-sm ${it.c}`} />
              <span className={`text-[5px] ${it.active ? "font-bold text-indigo-700" : "text-zinc-700"}`}>{it.l}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden p-1.5">
          {/* Top bar */}
          <div className="mb-1 flex items-center justify-between">
            <div>
              <p className="text-[5px] font-bold uppercase tracking-wider text-zinc-500">Business AI</p>
              <p className="text-[7px] font-black text-zinc-950">Welcome back, Arjun 👋</p>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="rounded-sm bg-emerald-100 px-1 py-0.5 text-[4px] font-bold text-emerald-700">● Live</span>
              <span className="rounded-sm bg-zinc-100 px-1 py-0.5 text-[4px] font-bold text-zinc-700">⚡ Pro</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-1 grid grid-cols-3 gap-0.5">
            {[
              { l: "Tasks done", v: "1,284", c: "from-indigo-500 to-violet-500" },
              { l: "Saved hrs", v: "47.2", c: "from-amber-500 to-rose-500" },
              { l: "Accuracy", v: "98%", c: "from-emerald-500 to-teal-500" },
            ].map((s) => (
              <div key={s.l} className="rounded-sm border border-zinc-200 bg-white p-0.5">
                <p className="text-[4px] uppercase text-zinc-500">{s.l}</p>
                <p className={`text-[7px] font-black bg-gradient-to-r ${s.c} bg-clip-text text-transparent`}>{s.v}</p>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="mb-1 rounded-sm border border-zinc-200 bg-white p-0.5">
            <div className="mb-0.5 flex items-center justify-between">
              <p className="text-[5px] font-bold text-zinc-900">AI activity · 7 days</p>
              <p className="text-[4px] text-emerald-600">↑ 24%</p>
            </div>
            <div className="flex h-6 items-end gap-0.5">
              {[40, 60, 35, 75, 55, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-indigo-600 to-violet-500" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-sm border border-zinc-200 bg-white p-0.5">
            <p className="mb-0.5 text-[5px] font-bold text-zinc-900">Recent</p>
            {[
              { i: "✉️", t: "Email replied automatically", c: "text-blue-600" },
              { i: "📄", t: "Invoice processed · ₹12,400", c: "text-emerald-600" },
              { i: "🤝", t: "3 new candidates shortlisted", c: "text-violet-600" },
            ].map((r, i) => (
              <div key={i} className="mb-0.5 flex items-center gap-0.5">
                <span className="text-[5px]">{r.i}</span>
                <span className="text-[4px] text-zinc-700 flex-1 truncate">{r.t}</span>
                <span className={`text-[4px] font-bold ${r.c}`}>✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
