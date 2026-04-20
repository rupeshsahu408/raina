"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ─── Icons ─── */
function LayoutDashboardIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
}
function BuildingIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01"/></svg>;
}
function BarChartIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
}
function SettingsIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function UsersIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ShieldIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function MailIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function CreditCardIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
}
function MenuIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
}
function XIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function ZapIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}

/* ─── Nav Items ─── */
const PRIMARY_NAV = [
  { href: "/payables/dashboard", label: "Dashboard",    Icon: LayoutDashboardIcon },
  { href: "/payables/vendors",   label: "Vendors",      Icon: BuildingIcon },
  { href: "/payables/analytics", label: "Analytics",    Icon: BarChartIcon },
  { href: "/payables/emails",    label: "Email Inbox",  Icon: MailIcon },
  { href: "/payables/payments",  label: "Payments",     Icon: CreditCardIcon },
  { href: "/payables/rules",     label: "Rules",        Icon: ShieldIcon },
  { href: "/payables/team",      label: "Team",         Icon: UsersIcon },
];

const BOTTOM_NAV = [
  { href: "/payables/settings",  label: "Settings",    Icon: SettingsIcon },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-5 w-5 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
          <ZapIcon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-black text-white leading-none">Plyndrox</p>
          <p className="text-[10px] font-semibold text-indigo-300 leading-none mt-0.5">Plyndrox Payable AI</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white">
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Workspace</p>
        {PRIMARY_NAV.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition ${active ? "text-indigo-300" : "text-white/40 group-hover:text-white/70"}`} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="shrink-0 border-t border-white/10 px-3 py-3 space-y-0.5">
        {BOTTOM_NAV.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition ${active ? "text-indigo-300" : "text-white/40 group-hover:text-white/70"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Mobile Bottom Tab Bar ─── */
function MobileBottomBar({ pathname }: { pathname: string }) {
  const mobileTabs = [
    { href: "/payables/dashboard", label: "Dashboard", Icon: LayoutDashboardIcon },
    { href: "/payables/vendors",   label: "Vendors",   Icon: BuildingIcon },
    { href: "/payables/analytics", label: "Analytics", Icon: BarChartIcon },
    { href: "/payables/emails",    label: "Inbox",     Icon: MailIcon },
    { href: "/payables/settings",  label: "Settings",  Icon: SettingsIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex">
        {mobileTabs.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
                active ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-indigo-600" : "text-gray-400"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Shell ─── */
interface PayablesShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  headerActions?: React.ReactNode;
}

export default function PayablesShell({
  children,
  pageTitle,
  pageSubtitle,
  headerActions,
}: PayablesShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FC]">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-[#111827]">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#111827] shadow-2xl">
            <SidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          {/* Page title */}
          <div className="min-w-0 flex-1">
            {pageTitle && (
              <h1 className="truncate text-base font-black text-[#111827]">{pageTitle}</h1>
            )}
            {pageSubtitle && (
              <p className="truncate text-xs text-gray-400 mt-0.5">{pageSubtitle}</p>
            )}
          </div>

          {/* Actions slot */}
          {headerActions && (
            <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
          )}
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileBottomBar pathname={pathname} />
    </div>
  );
}
