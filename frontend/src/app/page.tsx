import { InstallPrompt } from "@/components/InstallPrompt";
import { DemoChatWidget } from "@/components/DemoChatWidget";
import { ThreeBackground } from "@/components/ThreeBackground";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#090713] to-black text-zinc-100">
      <div className="premium-grid pointer-events-none absolute inset-0" />
      <div className="glow-orb absolute -left-24 top-16 h-56 w-56 rounded-full bg-pink-500/60" />
      <div className="glow-orb delay absolute -right-28 top-40 h-72 w-72 rounded-full bg-sky-500/40" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/55 px-3 py-3 backdrop-blur-md sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0d0d14] ring-1 ring-white/[0.08] overflow-hidden shadow-lg shadow-violet-900/20">
              <img src="/evara-logo.png" alt="Evara AI" className="h-full w-full object-contain p-1" draggable={false} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                Evara AI
              </p>
              <p className="text-xs text-zinc-500">
                Emotional intelligence, beautifully designed
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <InstallPrompt label="Get App" />
            <a
              href="/login"
              className="rounded-full border border-zinc-700/90 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-sky-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-purple-500/30 transition hover:scale-[1.02]"
            >
              Get Started
            </a>
          </nav>
        </header>

        <main className="mt-8 grid flex-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/50 p-6 backdrop-blur-md sm:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-400">
                Your premium AI companion
              </p>
              <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-zinc-50 sm:text-5xl lg:text-6xl">
                A calm and
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
                  {" "}deeply human{" "}
                </span>
                AI experience.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                Evara blends emotional intelligence with elegant product design.
                Smooth animations, supportive conversations, and a mobile-to-desktop
                experience that feels premium everywhere.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="/signup"
                  className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white"
                >
                  Try Evara Now
                </a>
                <InstallPrompt
                  label="Download App"
                  className="px-5 py-2.5 text-sm"
                />
                <a
                  href="/login"
                  className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
                >
                  Continue Conversation
                </a>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                "Real-time emotional chat",
                "PWA install on iOS + Android",
                "Simi / Loa personality switching",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-5">
            <div className="relative h-[320px] overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/55 sm:h-[400px] lg:h-[460px]">
              <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.30),_transparent_52%),_radial-gradient(circle_at_bottom,_rgba(56,189,248,0.26),_transparent_55%)]" />
              <ThreeBackground />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5">
                <p className="text-[10px] uppercase tracking-[0.26em] text-zinc-400">
                  Immersive 3D Landing
                </p>
                <p className="mt-1 text-sm text-zinc-200">
                  Built to feel cinematic and premium.
                </p>
              </div>
            </div>
          </section>
        </main>

        <section className="mt-6 rounded-3xl border border-zinc-800/80 bg-zinc-950/55 p-4 backdrop-blur-md sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100 sm:text-base">
              Try Evara Demo Chat (no login)
            </h2>
            <p className="text-[11px] text-zinc-500">Up to 4 AI replies</p>
          </div>
          <DemoChatWidget />
        </section>
      </div>
    </div>
  );
}
