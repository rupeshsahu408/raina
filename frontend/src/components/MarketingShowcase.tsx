import Image from "next/image";
import Link from "next/link";

export default function MarketingShowcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-indigo-300 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet-300 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="order-2 lg:order-1">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            Plyndrox in your pocket
          </p>
          <h2 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            Your AI workspace,<br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              wherever you go.
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-700">
            7 powerful AI workspaces — Personal, Business, Inbox, Payable, Recruit, Smart Ledger and Bihar regional AI — beautifully crafted for mobile. Open Plyndrox on any phone and pick up exactly where you left off on your laptop.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Lightning-fast on every device — no app install needed",
              "All 7 workspaces work seamlessly on your phone",
              "Your data syncs instantly across every screen",
              "100% free, forever — for individuals and businesses",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-zinc-800">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/personal/auth"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/20 transition hover:bg-zinc-800"
            >
              Start free — no signup
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="#workspaces"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-6 py-3 text-sm font-bold text-zinc-900 backdrop-blur transition hover:bg-white"
            >
              Explore workspaces
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-6 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="flex -space-x-1.5">
                {["#a78bfa", "#60a5fa", "#34d399", "#f59e0b"].map((c) => (
                  <span key={c} className="h-6 w-6 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </span>
              <span className="font-semibold">12,000+ users</span>
            </div>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 24 24" fill="#fbbf24" className="h-4 w-4">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="ml-1 font-semibold">4.9 / 5</span>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="absolute inset-0 -z-10 translate-y-8 scale-95 rounded-[3rem] bg-gradient-to-br from-indigo-200 via-violet-200 to-pink-200 opacity-60 blur-2xl" />
            <div className="relative">
              <Image
                src="/marketing/girl-with-phone.png"
                alt="A friendly Plyndrox user showing the Plyndrox AI app on her smartphone"
                width={720}
                height={1024}
                priority={false}
                className="h-auto w-full select-none"
                draggable={false}
              />

              {/* Live mockup of Plyndrox landing page composited onto the phone screen */}
              <div
                className="pointer-events-none absolute overflow-hidden rounded-[18px]"
                style={{
                  top: "40.6%",
                  left: "67.5%",
                  width: "30.0%",
                  height: "37.0%",
                  transform: "rotate(0.5deg)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
                }}
              >
                <PhoneScreenMockup />
              </div>

              <div className="pointer-events-none absolute -left-2 top-1/3 hidden rounded-2xl border border-white/60 bg-white/90 px-3 py-2 shadow-xl backdrop-blur md:block">
                <div className="flex items-center gap-2">
                  <img src="/plyndrox-logo.svg" alt="" className="h-8 w-8 rounded-lg object-contain plyndrox-logo-img" draggable={false} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Live now</p>
                    <p className="text-xs font-bold text-zinc-900">7 AI workspaces</p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-2 bottom-1/4 hidden rounded-2xl border border-white/60 bg-white/90 px-3 py-2 shadow-xl backdrop-blur md:block">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-zinc-900">Free forever</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneScreenMockup() {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 pt-1 pb-0.5 text-[7px] font-semibold text-zinc-900">
        <span>9:41</span>
        <div className="flex items-center gap-0.5">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-2 w-2"><path d="M2 22h2v-6H2v6zm5 0h2v-12H7v12zm5 0h2V4h-2v18zm5 0h2v-9h-2v9z"/></svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-2 w-2"><path d="M12 3C7 3 2.7 5.3 0 9l12 14L24 9c-2.7-3.7-7-6-12-6z"/></svg>
          <span>97</span>
        </div>
      </div>

      {/* Mini header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-100">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-[3px] bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <span className="text-[5px] font-black text-white">P</span>
          </div>
          <span className="text-[6px] font-bold text-zinc-900">Plyndrox AI</span>
        </div>
        <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[5px] font-bold text-white">Get Started</span>
      </div>

      {/* Hero */}
      <div className="flex-1 px-2 py-2 flex flex-col">
        <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 mb-1.5">
          <span className="h-0.5 w-0.5 rounded-full bg-emerald-500" />
          <span className="text-[4px] font-bold uppercase tracking-wider text-emerald-700">All tools — free</span>
        </div>
        <h1 className="text-center text-[8px] font-black leading-tight text-zinc-950">
          Every AI tool<br />you need.
        </h1>
        <h1 className="text-center text-[8px] font-black leading-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mt-0.5">
          Free — for everyone.
        </h1>
        <p className="text-center text-[5px] leading-tight text-zinc-600 mt-1 px-1">
          7 powerful AI workspaces in one platform.
        </p>

        <div className="flex flex-col gap-1 mt-1.5 px-2">
          <button className="rounded-full bg-zinc-950 py-1 text-[5px] font-bold text-white">
            Start Free →
          </button>
          <button className="rounded-full border border-zinc-300 bg-white py-1 text-[5px] font-bold text-zinc-900">
            Explore tools
          </button>
        </div>

        {/* Workspace icons grid */}
        <div className="mt-2 grid grid-cols-4 gap-0.5">
          {[
            { c: "from-rose-500 to-pink-500", l: "💬" },
            { c: "from-amber-500 to-orange-500", l: "🏢" },
            { c: "from-emerald-500 to-teal-500", l: "📊" },
            { c: "from-blue-500 to-indigo-500", l: "📥" },
            { c: "from-violet-500 to-purple-500", l: "💳" },
            { c: "from-cyan-500 to-blue-500", l: "👥" },
            { c: "from-fuchsia-500 to-pink-500", l: "📒" },
            { c: "from-yellow-500 to-amber-500", l: "🌾" },
          ].map((it, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className={`h-3.5 w-3.5 rounded-md bg-gradient-to-br ${it.c} flex items-center justify-center text-[5px]`}>
                {it.l}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-1 text-center">
          <div className="text-[4px] text-zinc-400">plyndrox.app</div>
        </div>
      </div>
    </div>
  );
}
