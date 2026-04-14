"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

interface Site {
  _id: string;
  domain: string;
  verificationStatus: "pending" | "verified" | "failed";
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId") || "";

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSiteId, setActiveSiteId] = useState(siteId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/ibara/auth");
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthLoading(false);
      if (!u) {
        router.replace("/ibara/auth");
        return;
      }
      setUser(u);
      try {
        const res = await fetch(`/api/ibara/sites?userId=${u.uid}`);
        const data = await res.json();
        if (data.sites?.length) {
          setSites(data.sites);
          const id = siteId || data.sites[0]._id;
          setActiveSiteId(id);
          if (!siteId) {
            router.replace(`${pathname}?siteId=${id}`);
          }
        } else {
          router.replace("/ibara/onboarding");
        }
      } catch {}
    });
    return () => unsub();
  }, [router]);

  const navItem = (label: string, path: string, icon: string) => {
    const href = `/ibara/dashboard/${path}?siteId=${activeSiteId}`;
    const isActive = pathname.includes(`/ibara/dashboard/${path}`);
    return (
      <button
        key={path}
        onClick={() => { router.push(href); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
            : "text-white/40 hover:text-white/80 hover:bg-white/5"
        }`}
      >
        <span className="text-base">{icon}</span>
        {label}
        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
      </button>
    );
  };

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      router.replace("/ibara");
    } catch {}
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05050F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const activeSite = sites.find((s) => s._id === activeSiteId);

  return (
    <div className="min-h-screen bg-[#05050F] text-white flex">
      <style>{`
        .card-glass { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
        .sidebar-glass { background: rgba(8,8,20,0.95); border-right: 1px solid rgba(255,255,255,0.06); }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 sidebar-glass flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">I</span>
          </div>
          <span className="font-bold text-sm">IBARA AI</span>
        </div>

        {/* Site selector */}
        {activeSite && (
          <div className="px-3 py-4 border-b border-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-2 mb-2">Active Site</p>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-800 to-violet-600 flex items-center justify-center text-xs shrink-0">
                🌐
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/90 truncate">{activeSite.domain}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeSite.verificationStatus === "verified" ? "bg-green-400" : "bg-amber-400"}`} />
                  <span className="text-[10px] text-white/30 capitalize">{activeSite.verificationStatus}</span>
                </div>
              </div>
            </div>
            {sites.length > 1 && (
              <p className="mt-2 text-center text-[10px] text-white/20 hover:text-violet-400 cursor-pointer transition-colors" onClick={() => router.push("/ibara/onboarding")}>
                + Add another site
              </p>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-2 mb-2">Dashboard</p>
          {navItem("Overview", "overview", "◈")}
          {navItem("AI Setup", "ai-setup", "⚡")}
          {navItem("Chat Preview", "preview", "💬")}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <button
            onClick={() => router.push("/ibara/onboarding")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <span>+</span> Add Website
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/70 truncate">{user?.email}</p>
            </div>
            <button onClick={handleSignOut} className="text-white/25 hover:text-white/60 transition-colors text-sm" title="Sign out">
              ⇥
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-white/40 hover:text-white rounded-lg hover:bg-white/5"
          >
            ☰
          </button>
          <div className="flex-1" />
          <div className="text-xs text-white/25">
            {activeSite ? activeSite.domain : ""}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05050F] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
