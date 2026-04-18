"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

const SEEKER_NAV: NavLink[] = [
  { href: "/recruit/opportunities", label: "Jobs" },
  { href: "/recruit/niches", label: "Niches" },
  { href: "/recruit/saved-jobs", label: "Saved" },
  { href: "/recruit/my-applications", label: "My Applications" },
  { href: "/recruit/profile", label: "My Profile" },
];

function MenuIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function RecruitHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/recruit/niches") {
      return pathname === href || pathname.startsWith("/recruit/niche/");
    }
    return pathname === href || (pathname.startsWith(href + "/") && href !== "/recruit");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/recruit" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a66c2] text-sm font-black text-white">R</span>
          <span className="hidden sm:block">
            <span className="block text-sm font-bold leading-tight">Recruit AI</span>
            <span className="block text-[11px] text-slate-500 leading-tight">India Jobs Network</span>
          </span>
          <span className="block sm:hidden text-sm font-bold">Recruit AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {SEEKER_NAV.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive(link.href)
                  ? "bg-blue-50 text-[#0a66c2]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/recruit/dashboard"
            className="hidden sm:inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            For recruiters
          </Link>
          <Link
            href="/recruit/jobs/new"
            className="rounded-full bg-[#0a66c2] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#004182] transition"
          >
            Post a job
          </Link>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {SEEKER_NAV.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive(link.href)
                    ? "bg-blue-50 text-[#0a66c2]"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-slate-100 pt-2 flex flex-col gap-1">
              <Link
                href="/recruit/dashboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
              >
                For recruiters →
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
