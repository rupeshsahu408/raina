"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface BriefingCategory {
  count: number;
  preview: Array<{ id: string; subject: string; from: string; snippet: string; isUnread: boolean }>;
}

export interface BriefingData {
  date: string;
  greeting: string;
  categories: {
    urgent: BriefingCategory;
    leads: BriefingCategory;
    payments: BriefingCategory;
    followups: BriefingCategory;
    ignore: BriefingCategory;
  };
  totalEmails: number;
  focusMessage: string;
  generatedAt: string;
}

interface Props {
  data: BriefingData;
  onDismiss: () => void;
  userName?: string;
}

const CATEGORIES = [
  {
    key: "urgent" as const,
    label: "Urgent",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.86 2 8.28 0L22 7.86l0 8.28L16.14 22l-8.28 0L2 16.14l0-8.28Z" />
        <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    emoji: "🔴",
    desc: "Need immediate reply",
    href: "/inbox/dashboard",
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100 text-red-600",
    badge: "bg-red-600 text-white",
    action: "Reply now",
  },
  {
    key: "leads" as const,
    label: "Leads",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
      </svg>
    ),
    emoji: "💎",
    desc: "Potential clients / opportunities",
    href: "/inbox/leads",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-600 text-white",
    action: "View leads",
  },
  {
    key: "payments" as const,
    label: "Payments",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
    emoji: "💳",
    desc: "Invoices & payment emails",
    href: "/inbox/dashboard",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100 text-amber-600",
    badge: "bg-amber-500 text-white",
    action: "Review",
  },
  {
    key: "followups" as const,
    label: "Follow-ups",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    emoji: "🔔",
    desc: "Emails that need follow-up",
    href: "/inbox/followups",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    iconBg: "bg-indigo-100 text-indigo-600",
    badge: "bg-indigo-600 text-white",
    action: "Follow up",
  },
  {
    key: "ignore" as const,
    label: "Ignore",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    emoji: "📭",
    desc: "Low priority / newsletters",
    href: "/inbox/dashboard",
    bg: "bg-slate-50",
    border: "border-slate-200",
    iconBg: "bg-slate-100 text-slate-500",
    badge: "bg-slate-500 text-white",
    action: "View",
  },
];

function formatDate() {
  return new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

export default function DailyBriefingModal({ data, onDismiss, userName }: Props) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    setVisible(false);
    setTimeout(onDismiss, 280);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) handleDismiss();
  }

  const actionableCount = (data.categories.urgent.count + data.categories.leads.count + data.categories.payments.count + data.categories.followups.count);

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${visible ? "bg-white/50 backdrop-blur-sm" : "bg-white/0 backdrop-blur-none"}`}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#14112a] via-[#1a1640] to-[#0f1535] px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-xl bg-[#5c4ff6]">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
                  </svg>
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300">Daily AI Briefing</span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">
                {data.greeting}{userName ? `, ${userName.split(" ")[0]}` : ""}! 👋
              </h2>
              <p className="mt-1 text-sm text-gray-500">{formatDate()}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-500 hover:bg-white/20 hover:text-white transition mt-0.5"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>

          {/* Summary counts row */}
          <div className="mt-4 grid grid-cols-5 gap-1.5">
            {CATEGORIES.map(cat => {
              const count = data.categories[cat.key].count;
              return (
                <div key={cat.key} className="flex flex-col items-center gap-1 rounded-2xl bg-white/8 px-1 py-2">
                  <span className="text-base">{cat.emoji}</span>
                  <span className={`text-lg font-black ${count > 0 ? "text-white" : "text-zinc-600"}`}>{count}</span>
                  <span className="text-[9px] font-bold text-gray-400 text-center leading-tight">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="bg-white">
          {/* Category rows */}
          <div className="divide-y divide-slate-100">
            {CATEGORIES.filter(cat => data.categories[cat.key].count > 0).map(cat => {
              const category = data.categories[cat.key];
              const isExpanded = expanded === cat.key;
              return (
                <div key={cat.key} className={`transition-colors ${isExpanded ? cat.bg : "bg-white hover:bg-slate-50"}`}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : cat.key)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl ${cat.iconBg}`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900">{cat.label}</p>
                      <p className="text-[11px] text-slate-400">{cat.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${cat.badge}`}>{category.count}</span>
                      <svg className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </button>

                  {/* Expanded preview */}
                  {isExpanded && category.preview.length > 0 && (
                    <div className="px-5 pb-3 space-y-2">
                      {category.preview.map(email => (
                        <div key={email.id} className={`flex items-start gap-2.5 rounded-xl border ${cat.border} bg-white px-3 py-2.5`}>
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white mt-0.5 ${cat.iconBg.split(" ")[0].replace("bg-", "bg-").replace("100", "400")}`}
                               style={{ background: email.from ? `hsl(${(email.from.charCodeAt(0) * 37) % 360}, 65%, 50%)` : "#6366f1" }}>
                            {(email.from || email.subject || "?")[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-xs font-black text-slate-900">{email.from || "Unknown"}</p>
                              {email.isUnread && <span className="h-1.5 w-1.5 rounded-full bg-[#5c4ff6] shrink-0" />}
                            </div>
                            <p className="truncate text-[11px] text-slate-500">{email.subject}</p>
                          </div>
                        </div>
                      ))}
                      <Link
                        href={cat.href}
                        onClick={handleDismiss}
                        className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition ${cat.iconBg} hover:opacity-80`}
                      >
                        {cat.action}
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            {/* If inbox is completely clean */}
            {actionableCount === 0 && (
              <div className="flex flex-col items-center gap-2 px-5 py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xl">✓</div>
                <p className="text-sm font-black text-slate-800">Inbox Zero!</p>
                <p className="text-xs text-slate-400">Nothing urgent today. Great job staying on top of things.</p>
              </div>
            )}
          </div>

          {/* AI Focus message */}
          <div className="mx-4 mb-4 mt-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#5c4ff6] text-white mt-0.5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">AI Focus</p>
                <p className="text-sm font-bold text-indigo-900 leading-relaxed">{data.focusMessage}</p>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-2 px-4 pb-5">
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-2xl bg-[#14112a] py-3 text-sm font-black text-white hover:bg-[#1c183a] transition shadow-lg shadow-indigo-950/20"
            >
              Let's go! 🚀
            </button>
            <Link
              href="/inbox/dashboard"
              onClick={handleDismiss}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 transition"
            >
              Open Inbox
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
