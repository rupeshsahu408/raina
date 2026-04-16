"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface AnalyticsSummary {
  totalEmails: number; sentCount: number; unreadCount: number; starredCount: number;
  aiRescuedCount: number; avgPriorityScore: number; readRate: number; leadCount: number;
  avgPerDay: number; threadCount: number; prevPeriodCount: number; volumeChange: number;
  responseRate: number; inboxScore: number; estimatedReadingMins: number; inboxZeroDays: number;
}
interface VolumeTrendItem { date: string; received: number; sent: number; }
interface ActivityHourItem { hour: number; count: number; }
interface ActivityDowItem { day: string; count: number; }
interface HeatCell { dow: number; hour: number; count: number; }
interface SenderItem {
  name: string; email: string; count: number; domain: string;
  intents: Record<string, number>; relationshipScore: number; relationship: string; topIntent: string;
}
interface DomainItem { domain: string; count: number; }
interface KeywordItem { word: string; count: number; }
interface UnsubCandidate { name: string; email: string; count: number; domain: string; }
interface AnalyticsData {
  period: { days: number; from: string; to: string };
  summary: AnalyticsSummary;
  intentBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  riskBreakdown: { High: number; Medium: number; Low: number };
  gmailCategories: Record<string, number>;
  volumeTrend: VolumeTrendItem[];
  weeklyTrend: { week: string; received: number; sent: number }[];
  activityByHour: ActivityHourItem[];
  activityByDow: ActivityDowItem[];
  flatHeatmap: HeatCell[];
  topSenders: SenderItem[];
  topDomains: DomainItem[];
  keywords: KeywordItem[];
  unsubscribeCandidates: UnsubCandidate[];
  insights: string[];
  generatedAt: string;
}

type Tab = "overview" | "senders" | "activity" | "insights";

const INTENT_COLORS: Record<string, string> = {
  Lead: "#8b5cf6", Support: "#f59e0b", Payment: "#10b981",
  Meeting: "#3b82f6", Spam: "#ef4444", FYI: "#6b7280",
};
const INTENT_BG: Record<string, string> = {
  Lead: "bg-violet-100 text-violet-700", Support: "bg-amber-100 text-amber-700",
  Payment: "bg-emerald-100 text-emerald-700", Meeting: "bg-blue-100 text-blue-700",
  Spam: "bg-red-100 text-red-700", FYI: "bg-gray-100 text-gray-600",
};
const PRIORITY_COLORS: Record<string, string> = {
  "Urgent": "#ef4444", "Risk Detected": "#f97316", "High-Value Lead": "#8b5cf6",
  "Payment": "#10b981", "Support Issue": "#f59e0b", "Needs Reply": "#3b82f6", "Low Priority": "#9ca3af",
};
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function BackIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>; }
function RefreshIcon({ spinning }: { spinning?: boolean }) { return <svg className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>; }
function DownloadIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>; }
function SparkleIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>; }
function ChartIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>; }
function UsersIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function ClockIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }
function LightbulbIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>; }
function TrendUpIcon({ up }: { up?: boolean }) { return up === false ? <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg> : <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>; }
function BellOffIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" /><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="m2 2 20 20" /></svg>; }

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No data</div>;
  const size = 160; const radius = 60; const cx = size / 2; const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  const slices = data.filter(d => d.value > 0).map(d => {
    const pct = d.value / total;
    const offset = circumference * (1 - cumulative);
    const dash = circumference * pct;
    cumulative += pct;
    return { ...d, pct, offset, dash };
  });
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke={s.color} strokeWidth={24}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset + circumference} />
          ))}
          <circle cx={cx} cy={cy} r={48} fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-800">{total}</span>
          <span className="text-[10px] text-gray-400 font-medium">emails</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-600 font-medium">{s.label}</span>
            <span className="text-xs text-gray-400">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data }: { data: VolumeTrendItem[] }) {
  const W = 600; const H = 140;
  const pad = { top: 10, right: 60, bottom: 28, left: 32 };
  if (!data.length) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>;
  const maxVal = Math.max(...data.map(d => Math.max(d.received, d.sent)), 1);
  const toX = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * (W - pad.left - pad.right);
  const toY = (v: number) => pad.top + (1 - v / maxVal) * (H - pad.top - pad.bottom);
  const rPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.received)}`).join(" ");
  const sPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.sent)}`).join(" ");
  const rFill = `${rPath} L${toX(data.length - 1)},${toY(0)} L${toX(0)},${toY(0)} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(p * maxVal));
  const step = Math.max(1, Math.floor(data.length / 6));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map((v, i) => (
        <g key={i}>
          <line x1={pad.left} y1={toY(v)} x2={W - pad.right} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1" />
          <text x={pad.left - 4} y={toY(v) + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
        </g>
      ))}
      <path d={rFill} fill="url(#rg)" />
      <path d={rPath} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={sPath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
      {data.map((d, i) => {
        if (i % step !== 0 && i !== data.length - 1) return null;
        return <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" fontSize="8.5" fill="#94a3b8">{d.date.slice(5)}</text>;
      })}
      <text x={W - pad.right + 4} y={toY(data[data.length - 1]?.received ?? 0) + 4} fontSize="9" fill="#8b5cf6" fontWeight="600">▪ In</text>
      <text x={W - pad.right + 4} y={toY(data[data.length - 1]?.sent ?? 0) + 4} fontSize="9" fill="#10b981" fontWeight="600">▪ Out</text>
    </svg>
  );
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const r = 54; const cx = 70; const cy = 70;
  const arc = Math.PI * r;
  const pct = score / 100;
  const dash = arc * pct;
  const color = score >= 80 ? "#10b981" : score >= 55 ? "#f59e0b" : "#ef4444";
  const grade = score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 45 ? "Fair" : "Needs Work";
  return (
    <div className="flex flex-col items-center">
      <svg width={140} height={90} viewBox="0 0 140 90">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#f1f5f9" strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${dash} ${arc}`} style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="900" fill="#1e1b4b">{score}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">{grade}</text>
      </svg>
      <p className="text-xs text-gray-500 font-medium -mt-1">{label}</p>
    </div>
  );
}

function HeatmapGrid({ cells }: { cells: HeatCell[] }) {
  const maxCount = Math.max(...cells.map(c => c.count), 1);
  const grid: HeatCell[][] = Array.from({ length: 7 }, (_, dow) =>
    Array.from({ length: 24 }, (_, hour) => cells.find(c => c.dow === dow && c.hour === hour) ?? { dow, hour, count: 0 })
  );
  const fmtHour = (h: number) => h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-0.5 mb-1 ml-8">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="w-5 text-[8px] text-gray-400 text-center shrink-0">
              {h % 3 === 0 ? fmtHour(h) : ""}
            </div>
          ))}
        </div>
        {grid.map((row, dow) => (
          <div key={dow} className="flex items-center gap-0.5 mb-0.5">
            <span className="w-7 text-[10px] text-gray-400 font-medium shrink-0 text-right mr-1">{DOW_LABELS[dow]}</span>
            {row.map((cell, h) => {
              const intensity = cell.count / maxCount;
              const opacity = cell.count === 0 ? 0.06 : 0.15 + intensity * 0.85;
              return (
                <div
                  key={h}
                  className="w-5 h-5 rounded-sm shrink-0 cursor-default group relative"
                  style={{ background: `rgba(139,92,246,${opacity})` }}
                  title={`${DOW_LABELS[dow]} ${fmtHour(h)}: ${cell.count} emails`}
                />
              );
            })}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 ml-8">
          <span className="text-[10px] text-gray-400">Less</span>
          {[0.06, 0.25, 0.45, 0.65, 0.85].map((op, i) => (
            <div key={i} className="w-4 h-4 rounded-sm" style={{ background: `rgba(139,92,246,${op})` }} />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}

function KeywordCloud({ keywords }: { keywords: KeywordItem[] }) {
  if (!keywords.length) return <div className="text-gray-400 text-sm text-center py-6">No keywords found</div>;
  const maxCount = keywords[0]?.count ?? 1;
  const colors = ["#8b5cf6", "#5c4ff6", "#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];
  return (
    <div className="flex flex-wrap gap-2 justify-center py-2">
      {keywords.map((kw, i) => {
        const size = 10 + Math.round((kw.count / maxCount) * 16);
        const color = colors[i % colors.length];
        const opacity = 0.4 + (kw.count / maxCount) * 0.6;
        return (
          <span
            key={kw.word}
            className="rounded-lg px-2 py-1 font-bold cursor-default select-none transition-transform hover:scale-105"
            style={{ fontSize: `${size}px`, color, background: `${color}18`, border: `1px solid ${color}30`, opacity }}
          >
            {kw.word}
          </span>
        );
      })}
    </div>
  );
}

function LeadFunnel({ data }: { data: AnalyticsData }) {
  const total = data.summary.totalEmails;
  const leads = data.summary.leadCount;
  const highPriority = (data.priorityBreakdown["High-Value Lead"] ?? 0) + (data.priorityBreakdown["Urgent"] ?? 0);
  const starred = data.summary.starredCount;
  const stages = [
    { label: "Total Emails", value: total, color: "#6b7280", pct: 100 },
    { label: "Intent Detected", value: Math.round(total * 0.65), color: "#3b82f6", pct: total > 0 ? 65 : 0 },
    { label: "Leads Identified", value: leads, color: "#8b5cf6", pct: total > 0 ? Math.round((leads / total) * 100) : 0 },
    { label: "High Priority", value: highPriority, color: "#f59e0b", pct: total > 0 ? Math.round((highPriority / total) * 100) : 0 },
    { label: "Starred / Actioned", value: starred, color: "#10b981", pct: total > 0 ? Math.round((starred / total) * 100) : 0 },
  ];
  return (
    <div className="space-y-2">
      {stages.map((s, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 w-36 shrink-0">{s.label}</span>
          <div className="flex-1 relative h-7 bg-gray-100 rounded-lg overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-lg flex items-center pl-2 transition-all duration-700"
              style={{ width: `${Math.max(s.pct, 3)}%`, background: s.color }}
            >
              <span className="text-[11px] font-black text-white truncate">{s.value}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400 w-8 text-right shrink-0">{s.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color, badge, badgeColor }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
  color: string; badge?: string; badgeColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1">{label}</p>
          {badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${badgeColor ?? "bg-gray-100 text-gray-500"}`}>{badge}</span>}
        </div>
        <p className="text-xl font-black text-gray-800 leading-none">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-1 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

function DowBars({ data }: { data: ActivityDowItem[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex gap-2 items-end justify-between h-24">
      {data.map(d => {
        const pct = d.count / maxCount;
        return (
          <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1 relative group">
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {d.day}: {d.count}
            </div>
            <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
              <div className="w-full rounded-t-md transition-all duration-500" style={{
                height: `${Math.max(4, pct * 72)}px`,
                background: pct > 0.7 ? "linear-gradient(180deg,#8b5cf6,#6d28d9)" : pct > 0.4 ? "linear-gradient(180deg,#a78bfa,#8b5cf6)" : "#ede9fe",
              }} />
            </div>
            <span className="text-[10px] font-semibold text-gray-500">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function HourBars({ data }: { data: ActivityHourItem[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const fmtHour = (h: number) => h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;
  return (
    <div className="flex gap-0.5 items-end h-20 w-full">
      {data.map(d => {
        const pct = d.count / maxCount;
        return (
          <div key={d.hour} className="flex flex-col items-center flex-1 gap-0.5 group relative">
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {fmtHour(d.hour)}: {d.count}
            </div>
            <div className="w-full flex items-end justify-center" style={{ height: "56px" }}>
              <div className="w-full rounded-t-sm transition-all duration-500" style={{
                height: `${Math.max(2, pct * 56)}px`,
                background: pct > 0.6 ? "#8b5cf6" : pct > 0.3 ? "#a78bfa" : "#ede9fe",
              }} />
            </div>
            {d.hour % 4 === 0 && <span className="text-[8px] text-gray-400">{fmtHour(d.hour)}</span>}
          </div>
        );
      })}
    </div>
  );
}

function exportCSV(data: AnalyticsData, period: number) {
  const rows: string[][] = [
    ["Metric", "Value"],
    ["Period (days)", String(period)],
    ["Total Emails Received", String(data.summary.totalEmails)],
    ["Emails Sent", String(data.summary.sentCount)],
    ["Unread Count", String(data.summary.unreadCount)],
    ["Read Rate (%)", String(data.summary.readRate)],
    ["Leads Detected", String(data.summary.leadCount)],
    ["AI Rescued", String(data.summary.aiRescuedCount)],
    ["Avg Priority Score", String(data.summary.avgPriorityScore)],
    ["Inbox Score", String(data.summary.inboxScore)],
    ["Avg Emails/Day", String(data.summary.avgPerDay)],
    ["Response Rate (%)", String(data.summary.responseRate)],
    ["Volume Change (%)", String(data.summary.volumeChange)],
    [""],
    ["Intent", "Count"],
    ...Object.entries(data.intentBreakdown).map(([k, v]) => [k, String(v)]),
    [""],
    ["Priority", "Count"],
    ...Object.entries(data.priorityBreakdown).map(([k, v]) => [k, String(v)]),
    [""],
    ["Top Senders"],
    ["Name", "Email", "Count", "Relationship", "Top Intent"],
    ...data.topSenders.map(s => [s.name || s.email, s.email, String(s.count), s.relationship, s.topIntent]),
    [""],
    ["Top Domains"],
    ["Domain", "Count"],
    ...data.topDomains.map(d => [d.domain, String(d.count)]),
    [""],
    ["Top Keywords"],
    ["Word", "Frequency"],
    ...data.keywords.slice(0, 20).map(k => [k.word, String(k.count)]),
  ];
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `plyndrox-analyze-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AnalyzePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);
  const [tab, setTab] = useState<Tab>("overview");
  const hasFetched = useRef(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u); setAuthReady(true);
      if (!u) router.replace("/inbox");
    });
    return unsub;
  }, [router]);

  const fetchAnalytics = useCallback(async (days: number) => {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API}/inbox/analyze?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to load analytics" }));
        throw new Error(err.error || "Failed");
      }
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authReady && user && !hasFetched.current) {
      hasFetched.current = true;
      fetchAnalytics(period);
    }
  }, [authReady, user, fetchAnalytics, period]);

  const handlePeriod = (d: number) => { setPeriod(d); fetchAnalytics(d); };

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" /></div>;
  }

  const intentChartData = data
    ? Object.entries(data.intentBreakdown).filter(([, v]) => v > 0).map(([label, value]) => ({ label, value, color: INTENT_COLORS[label] ?? "#6b7280" }))
    : [];

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: <ChartIcon /> },
    { id: "senders" as Tab, label: "Senders", icon: <UsersIcon /> },
    { id: "activity" as Tab, label: "Activity", icon: <ClockIcon /> },
    { id: "insights" as Tab, label: "Insights", icon: <LightbulbIcon /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/inbox/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100">
                <BackIcon /> Back
              </Link>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg,#5c4ff6,#7c3aed)" }}>
                  <ChartIcon />
                </div>
                <div>
                  <span className="font-black text-gray-900 text-sm">Analyze</span>
                  <span className="text-gray-400 text-xs ml-1.5">Gmail Intelligence Dashboard</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Period selector */}
              <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
                {[7, 30, 60, 90].map(d => (
                  <button key={d} onClick={() => handlePeriod(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${period === d ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    style={period === d ? { background: "linear-gradient(135deg,#5c4ff6,#7c3aed)" } : undefined}>
                    {d}d
                  </button>
                ))}
              </div>
              <button onClick={() => fetchAnalytics(period)} disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">
                <RefreshIcon spinning={loading} />
                {loading ? "Analyzing…" : "Refresh"}
              </button>
              {data && (
                <button onClick={() => exportCSV(data, period)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">
                  <DownloadIcon /> Export
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          {data && (
            <div className="flex gap-1 pb-0 -mb-px">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                    tab === t.id ? "border-violet-600 text-violet-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Loading */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center"><SparkleIcon /></div>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">Analyzing your Gmail…</p>
              <p className="text-sm text-gray-400 mt-1">Scanning emails, detecting patterns & generating insights</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto mt-12">
            <p className="font-bold text-red-700 mb-1">Could not load analytics</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button onClick={() => fetchAnalytics(period)} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700">Try Again</button>
          </div>
        )}

        {data && (
          <>
            {/* ──── OVERVIEW TAB ──── */}
            {tab === "overview" && (
              <div className="space-y-5">
                {/* Score + WoW + Zero */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col items-center">
                    <ScoreGauge score={data.summary.inboxScore} label="Inbox Health Score" />
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">vs Previous Period</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-gray-800">{Math.abs(data.summary.volumeChange)}<span className="text-xl">%</span></span>
                      <span className={`flex items-center gap-1 text-sm font-bold mb-1 ${data.summary.volumeChange >= 0 ? "text-red-500" : "text-emerald-500"}`}>
                        <TrendUpIcon up={data.summary.volumeChange >= 0} />
                        {data.summary.volumeChange >= 0 ? "More" : "Less"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {data.summary.totalEmails} emails vs {data.summary.prevPeriodCount} in the previous {period}d period
                    </p>
                    <div className="mt-3 text-xs text-gray-500 flex gap-4">
                      <span><b className="text-gray-700">{data.summary.avgPerDay}</b> avg/day</span>
                      <span><b className="text-gray-700">{data.summary.responseRate}%</b> response rate</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Inbox Zero Forecast</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-gray-800">{data.summary.inboxZeroDays}</span>
                      <span className="text-sm font-medium text-gray-400 mb-1">days</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      At 10 emails/day, you can clear {data.summary.unreadCount} unread emails
                    </p>
                    <div className="mt-3 text-xs text-gray-500 flex gap-4">
                      <span><b className="text-gray-700">~{data.summary.estimatedReadingMins}min</b> reading time</span>
                      <span><b className="text-gray-700">{data.summary.readRate}%</b> read</span>
                    </div>
                  </div>
                </div>

                {/* Summary metric cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <MetricCard icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>} label="Received" value={data.summary.totalEmails} sub={`Last ${period}d`} color="bg-violet-100 text-violet-600" />
                  <MetricCard icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>} label="Sent" value={data.summary.sentCount} sub="Outbound" color="bg-emerald-100 text-emerald-600" />
                  <MetricCard icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>} label="Unread" value={data.summary.unreadCount} sub={`${100 - data.summary.readRate}% of inbox`} color="bg-amber-100 text-amber-600"
                    badge={data.summary.unreadCount > 30 ? "High" : undefined} badgeColor="bg-amber-100 text-amber-700" />
                  <MetricCard icon={<SparkleIcon />} label="Leads" value={data.summary.leadCount} sub="Opportunities" color="bg-purple-100 text-purple-600"
                    badge={data.summary.leadCount > 0 ? "Action" : undefined} badgeColor="bg-violet-100 text-violet-700" />
                  <MetricCard icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>} label="AI Rescued" value={data.summary.aiRescuedCount} sub="From promotions" color="bg-blue-100 text-blue-600" />
                  <MetricCard icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} label="Starred" value={data.summary.starredCount} sub="Flagged important" color="bg-yellow-100 text-yellow-600" />
                </div>

                {/* Volume chart + Donut */}
                <div className="grid lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-black text-gray-800">Email Volume Trend</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Received vs sent — last {period} days</p>
                      </div>
                    </div>
                    <div className="h-40"><LineChart data={data.volumeTrend} /></div>
                  </div>
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-black text-gray-800 mb-1">Intent Breakdown</h2>
                    <p className="text-xs text-gray-400 mb-3">What type of emails you receive</p>
                    <DonutChart data={intentChartData} />
                  </div>
                </div>

                {/* Priority + Risk + Gmail Categories */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-black text-gray-800 mb-1">Priority Distribution</h2>
                    <p className="text-xs text-gray-400 mb-4">Email urgency breakdown</p>
                    <div className="space-y-2.5">
                      {["Urgent","Risk Detected","High-Value Lead","Payment","Support Issue","Needs Reply","Low Priority"].map(cat => {
                        const count = data.priorityBreakdown[cat] ?? 0;
                        if (!count) return null;
                        return (
                          <div key={cat} className="flex items-center gap-2.5">
                            <span className="text-xs font-medium text-gray-600 w-28 shrink-0 truncate">{cat}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${data.summary.totalEmails > 0 ? (count / data.summary.totalEmails) * 100 : 0}%`, background: PRIORITY_COLORS[cat] ?? "#6b7280" }} />
                            </div>
                            <span className="text-xs text-gray-500 w-6 text-right font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-black text-gray-800 mb-1">Risk Levels</h2>
                    <p className="text-xs text-gray-400 mb-4">Inbox risk distribution</p>
                    <div className="space-y-3">
                      {(["High","Medium","Low"] as const).map(level => {
                        const count = data.riskBreakdown[level];
                        const pct = data.summary.totalEmails > 0 ? (count / data.summary.totalEmails) * 100 : 0;
                        const color = level === "High" ? "#ef4444" : level === "Medium" ? "#f59e0b" : "#10b981";
                        return (
                          <div key={level} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">{level} Risk</span>
                              <span className="text-gray-500">{count} <span className="text-gray-400 text-xs">({Math.round(pct)}%)</span></span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-black text-gray-800 mb-1">Gmail Categories</h2>
                    <p className="text-xs text-gray-400 mb-4">Where emails land in Gmail</p>
                    <div className="space-y-3">
                      {Object.entries(data.gmailCategories).map(([cat, count]) => (
                        <div key={cat} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${cat==="primary"?"bg-violet-500":cat==="promotions"?"bg-amber-500":cat==="social"?"bg-blue-500":"bg-emerald-500"}`} />
                            <span className="text-sm font-medium text-gray-700 capitalize">{cat}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${data.summary.totalEmails>0?(count/data.summary.totalEmails)*100:0}%`, background: cat==="primary"?"#8b5cf6":cat==="promotions"?"#f59e0b":cat==="social"?"#3b82f6":"#10b981" }} />
                            </div>
                            <span className="text-sm font-bold text-gray-700 w-7 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lead Funnel */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h2 className="font-black text-gray-800 mb-1">Lead Funnel</h2>
                  <p className="text-xs text-gray-400 mb-5">How emails flow from raw inbox to actionable leads</p>
                  <LeadFunnel data={data} />
                </div>

                {/* Keyword Cloud */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h2 className="font-black text-gray-800 mb-1">Subject Keyword Cloud</h2>
                  <p className="text-xs text-gray-400 mb-4">Most common words in your email subjects</p>
                  <KeywordCloud keywords={data.keywords} />
                </div>
              </div>
            )}

            {/* ──── SENDERS TAB ──── */}
            {tab === "senders" && (
              <div className="space-y-5">
                {/* Top Senders with relationship */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h2 className="font-black text-gray-800 mb-1">Sender Relationship Intelligence</h2>
                  <p className="text-xs text-gray-400 mb-5">AI-scored sender relationships based on frequency, intent & value</p>
                  {data.topSenders.length === 0 ? (
                    <p className="text-sm text-gray-400 py-8 text-center">No sender data available</p>
                  ) : (
                    <div className="space-y-3">
                      {data.topSenders.map((s, i) => {
                        const relColor = s.relationship === "Hot" ? { bg: "bg-red-100", text: "text-red-700", bar: "#ef4444" } : s.relationship === "Warm" ? { bg: "bg-amber-100", text: "text-amber-700", bar: "#f59e0b" } : { bg: "bg-gray-100", text: "text-gray-600", bar: "#9ca3af" };
                        const maxCount = data.topSenders[0]?.count || 1;
                        const pct = (s.count / maxCount) * 100;
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: INTENT_COLORS[s.topIntent] ?? "#6b7280" }}>
                              {(s.name || s.email)[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-bold text-gray-800 truncate">{s.name || s.email.split("@")[0]}</p>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${INTENT_BG[s.topIntent] ?? "bg-gray-100 text-gray-600"}`}>{s.topIntent}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${relColor.bg} ${relColor.text}`}>{s.relationship}</span>
                              </div>
                              <p className="text-[11px] text-gray-400 truncate mb-1.5">{s.email}</p>
                              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: relColor.bar }} />
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-base font-black text-gray-700">{s.count}</p>
                              <p className="text-[10px] text-gray-400">emails</p>
                            </div>
                            <div className="text-right shrink-0 w-10">
                              <p className="text-sm font-black" style={{ color: relColor.bar }}>{s.relationshipScore}</p>
                              <p className="text-[10px] text-gray-400">score</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top Domains */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h2 className="font-black text-gray-800 mb-1">Top Sending Domains</h2>
                  <p className="text-xs text-gray-400 mb-4">Where your email originates from</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {data.topDomains.map((d, i) => {
                      const maxCount = data.topDomains[0]?.count || 1;
                      const pct = (d.count / maxCount) * 100;
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-gray-700 truncate">{d.domain}</span>
                            <span className="text-gray-500 ml-2 shrink-0">{d.count} emails</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#5c4ff6,#7c3aed)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Unsubscribe Candidates */}
                {data.unsubscribeCandidates.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <BellOffIcon />
                      <h2 className="font-black text-gray-800">Unsubscribe Recommendations</h2>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Low-value senders generating inbox noise — consider unsubscribing</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {data.unsubscribeCandidates.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-black text-sm shrink-0">
                            {(c.name || c.email)[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{c.name || c.email.split("@")[0]}</p>
                            <p className="text-[11px] text-gray-400 truncate">{c.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-red-500">{c.count}x</p>
                            <p className="text-[10px] text-gray-400">emails</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Unsubscribing from these {data.unsubscribeCandidates.length} senders could cut inbox noise significantly.</p>
                  </div>
                )}
              </div>
            )}

            {/* ──── ACTIVITY TAB ──── */}
            {tab === "activity" && (
              <div className="space-y-5">
                {/* Day of week + Hour bars */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-black text-gray-800 mb-1">Activity by Day of Week</h2>
                    <p className="text-xs text-gray-400 mb-5">When you receive the most email</p>
                    <DowBars data={data.activityByDow} />
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-black text-gray-800 mb-1">Activity by Hour of Day</h2>
                    <p className="text-xs text-gray-400 mb-5">Your inbox traffic throughout the day</p>
                    <HourBars data={data.activityByHour} />
                  </div>
                </div>

                {/* Full 7×24 heatmap */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h2 className="font-black text-gray-800 mb-1">Weekly Activity Heatmap</h2>
                  <p className="text-xs text-gray-400 mb-5">Email density across every day and hour of the week</p>
                  <HeatmapGrid cells={data.flatHeatmap} />
                </div>

                {/* Weekly trend (if period >= 14) */}
                {data.weeklyTrend.length >= 2 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-black text-gray-800 mb-1">Weekly Volume Summary</h2>
                    <p className="text-xs text-gray-400 mb-4">Emails per week at a glance</p>
                    <div className="flex items-end gap-2 h-24">
                      {data.weeklyTrend.map((w, i) => {
                        const maxR = Math.max(...data.weeklyTrend.map(x => x.received), 1);
                        const pct = (w.received / maxR) * 100;
                        const label = `W${i + 1}`;
                        return (
                          <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <span className="text-[10px] text-gray-500 font-medium">{w.received}</span>
                            <div className="w-full rounded-t-md" style={{ height: `${Math.max(4, pct * 0.6)}px`, background: "linear-gradient(180deg,#8b5cf6,#6d28d9)", transition: "height 0.5s ease" }} />
                            <span className="text-[9px] text-gray-400">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Peak Day", value: data.activityByDow.reduce((a, b) => b.count > a.count ? b : a, { day: "—", count: 0 }).day, sub: "Busiest day of week" },
                    { label: "Peak Hour", value: (() => { const h = data.activityByHour.reduce((a, b) => b.count > a.count ? b : a, { hour: 0, count: 0 }).hour; return h < 12 ? `${h || 12}AM` : `${h === 12 ? 12 : h - 12}PM`; })(), sub: "Most active hour" },
                    { label: "Avg/Day", value: data.summary.avgPerDay, sub: "Emails per day" },
                    { label: "Threads", value: data.summary.threadCount, sub: "Unique conversations" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                      <p className="text-2xl font-black text-gray-800">{item.value}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">{item.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ──── INSIGHTS TAB ──── */}
            {tab === "insights" && (
              <div className="space-y-5">
                {/* AI Insights panel */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><SparkleIcon /></div>
                    <div>
                      <h2 className="font-black text-white text-sm">AI-Generated Insights</h2>
                      <p className="text-violet-200 text-xs">Smart observations from your inbox data</p>
                    </div>
                    <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-1 rounded-lg font-bold">{data.insights.length} insights</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {data.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-white/10 rounded-xl px-4 py-3 hover:bg-white/15 transition-colors">
                        <span className="text-sm leading-relaxed text-white/90">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action items */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h2 className="font-black text-gray-800 mb-1">Recommended Action Plan</h2>
                  <p className="text-xs text-gray-400 mb-4">What to do based on your inbox data</p>
                  <div className="space-y-3">
                    {[
                      data.riskBreakdown.High > 0 && { priority: "Critical", label: `Review ${data.riskBreakdown.High} high-risk email${data.riskBreakdown.High > 1 ? "s" : ""} immediately`, color: "border-red-200 bg-red-50", badge: "bg-red-100 text-red-700", href: "/inbox/dashboard" },
                      data.summary.leadCount > 0 && { priority: "High", label: `Reply to ${data.summary.leadCount} lead email${data.summary.leadCount > 1 ? "s" : ""} — every hour matters for conversion`, color: "border-violet-200 bg-violet-50", badge: "bg-violet-100 text-violet-700", href: "/inbox/leads" },
                      data.summary.unreadCount > 10 && { priority: "Medium", label: `Process ${data.summary.unreadCount} unread emails — use AI summaries to speed through`, color: "border-amber-200 bg-amber-50", badge: "bg-amber-100 text-amber-700", href: "/inbox/dashboard" },
                      data.unsubscribeCandidates.length > 0 && { priority: "Low", label: `Unsubscribe from ${data.unsubscribeCandidates.length} low-value sender${data.unsubscribeCandidates.length > 1 ? "s" : ""} to reduce noise`, color: "border-gray-200 bg-gray-50", badge: "bg-gray-100 text-gray-600", href: "#" },
                      { priority: "Tip", label: `Schedule reply blocks at ${(() => { const h = data.activityByHour.reduce((a, b) => b.count > a.count ? b : a, { hour: 9, count: 0 }).hour; return h < 12 ? `${h || 12}:00 AM` : `${h === 12 ? 12 : h - 12}:00 PM`; })()} when your inbox is busiest`, color: "border-blue-200 bg-blue-50", badge: "bg-blue-100 text-blue-700", href: "#" },
                    ].filter(Boolean).map((item: any, i) => (
                      <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${item.color}`}>
                        <span className={`text-[11px] font-black px-2 py-1 rounded-lg shrink-0 ${item.badge}`}>{item.priority}</span>
                        <p className="text-sm text-gray-700 flex-1">{item.label}</p>
                        {item.href !== "#" && (
                          <Link href={item.href} className="text-xs font-bold text-violet-600 hover:text-violet-800 shrink-0">Go →</Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inbox health summary */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-black text-gray-800 mb-4">Inbox Health Scorecard</h2>
                    <div className="flex justify-center mb-4">
                      <ScoreGauge score={data.summary.inboxScore} label="Overall Inbox Score" />
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Read Rate", value: `${data.summary.readRate}%`, good: data.summary.readRate > 60 },
                        { label: "Response Rate", value: `${data.summary.responseRate}%`, good: data.summary.responseRate > 30 },
                        { label: "High-Risk Emails", value: String(data.riskBreakdown.High), good: data.riskBreakdown.High === 0 },
                        { label: "AI Rescued", value: String(data.summary.aiRescuedCount), good: true },
                        { label: "Lead Detection", value: `${data.summary.leadCount} found`, good: true },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-600">{row.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-800">{row.value}</span>
                            <span className={`w-2 h-2 rounded-full ${row.good ? "bg-emerald-400" : "bg-red-400"}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-black text-gray-800 mb-4">Productivity Metrics</h2>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1 p-3 bg-violet-50 rounded-xl">
                        <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wide">Reading Time</p>
                        <p className="text-2xl font-black text-gray-800">{data.summary.estimatedReadingMins} min</p>
                        <p className="text-xs text-gray-500">Estimated time to read all {data.summary.totalEmails} emails at 250 wpm</p>
                      </div>
                      <div className="flex flex-col gap-1 p-3 bg-emerald-50 rounded-xl">
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Inbox Zero</p>
                        <p className="text-2xl font-black text-gray-800">{data.summary.inboxZeroDays} days</p>
                        <p className="text-xs text-gray-500">To clear {data.summary.unreadCount} unread at 10/day</p>
                      </div>
                      <div className="flex flex-col gap-1 p-3 bg-amber-50 rounded-xl">
                        <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Volume Trend</p>
                        <p className="text-2xl font-black text-gray-800">{data.summary.volumeChange > 0 ? "+" : ""}{data.summary.volumeChange}%</p>
                        <p className="text-xs text-gray-500">vs previous {period}-day period ({data.summary.prevPeriodCount} emails)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center py-6 mt-2">
              <p className="text-xs text-gray-400">Analyzed up to 200 emails · Generated {new Date(data.generatedAt).toLocaleString()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
