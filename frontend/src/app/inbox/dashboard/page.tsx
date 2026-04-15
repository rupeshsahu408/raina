"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { setLastActivePlatform } from "@/lib/platformSession";
import Link from "next/link";
import ComposeModal from "@/components/ComposeModal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type Folder = "inbox" | "sent" | "spam" | "drafts" | "starred" | "trash" | "scheduled" | "archive";
type FilterType = "all" | "read" | "unread" | "starred" | "unstarred";
type CommandView = "inbox" | "mission";
type PriorityCategory = "Urgent" | "High-Value Lead" | "Payment" | "Support Issue" | "Risk Detected" | "Needs Reply" | "Low Priority";

interface LocalDraft {
  id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string;
  attachments: { name: string; size: number; type: string }[];
  savedAt: number;
}

interface ScheduledEmailItem {
  id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string;
  scheduledAt: number;
  attachments: { name: string; size: number; type: string }[];
}

interface EmailItem {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  summary: string;
  intent: string;
  priorityCategory: PriorityCategory;
  priorityScore: number;
  priorityReason: string;
  suggestedAction: string;
  riskLevel: "High" | "Medium" | "Low";
  bestTone: string;
  isUnread: boolean;
  isStarred: boolean;
}

interface ThreadMessage {
  id: string;
  subject: string;
  from: string;
  to?: string;
  cc?: string;
  date: string;
  body: string;
  bodyText?: string;
  bodyHtml?: string;
}

interface ActionPlan {
  summary: string;
  intent: string;
  priority: string;
  recommendedAction: string;
  risk: string;
  bestTone: string;
  suggestedNextStep: string;
  source?: "ai" | "rules";
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function InboxIcon() {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function SpamIcon() {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m7.86 2 8.28 0L22 7.86l0 8.28L16.14 22l-8.28 0L2 16.14l0-8.28Z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function DraftIcon() {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function SendIcon2() {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>;
}
function ScheduledIcon() {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function StarIcon({ filled }: { filled?: boolean }) {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill={filled ? "#f4b400" : "none"} stroke={filled ? "#f4b400" : "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function TrashIcon() {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function ArchiveIcon() {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="5" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>;
}
function BackArrowIcon() {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
}
function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return <svg className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
}
function MenuIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>;
}
function SearchIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function ChevronDown() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
}
function SparkleIcon() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
}
function ReplyIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>;
}
function MoreVertIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
}
function ComposeIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function BellIcon() {
  return <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function CheckCircleIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

const NAV_ITEMS: { id: Folder; label: string; icon: React.ReactNode }[] = [
  { id: "inbox",     label: "Inbox",     icon: <InboxIcon /> },
  { id: "sent",      label: "Sent",      icon: <SendIcon2 /> },
  { id: "drafts",    label: "Drafts",    icon: <DraftIcon /> },
  { id: "scheduled", label: "Scheduled", icon: <ScheduledIcon /> },
  { id: "starred",   label: "Starred",   icon: <StarIcon filled={false} /> },
  { id: "archive",   label: "Archive",   icon: <ArchiveIcon /> },
  { id: "trash",     label: "Trash",     icon: <TrashIcon /> },
  { id: "spam",      label: "Spam",      icon: <SpamIcon /> },
];

function cleanAddressPart(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function senderName(from: string): string {
  const match = from.match(/^(.*?)\s*<(.+?)>$/);
  const name = match ? cleanAddressPart(match[1]) : cleanAddressPart(from);
  if (name.includes("@") && !match) return name.split("@")[0] || name;
  return name || from;
}
function senderEmail(from: string): string {
  const match = from.match(/<(.+?)>/);
  return cleanAddressPart(match ? match[1] : from);
}
function senderInitial(from: string): string {
  return (senderName(from)[0] || "?").toUpperCase();
}
function avatarColor(name: string): string {
  const colors = [
    "#5c4ff6","#0b8a4d","#d44000","#1565c0","#6a1b9a","#00838f","#c62828","#2e7d32"
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return colors[h % colors.length];
}
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Yesterday";
    if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  } catch { return dateStr; }
}
function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) + ", " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return dateStr; }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function linkifyPlainText(value: string): string {
  const urlPattern = /(https?:\/\/[^\s<>"')]+[^\s<>"').,;:!?])/gi;
  let output = "";
  let lastIndex = 0;
  for (const match of value.matchAll(urlPattern)) {
    const url = match[0];
    const index = match.index ?? 0;
    output += escapeHtml(value.slice(lastIndex, index));
    const safeUrl = escapeHtml(url);
    const label = url.length > 72 ? "Open link" : url;
    output += `<a href="${safeUrl}" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    lastIndex = index + url.length;
  }
  output += escapeHtml(value.slice(lastIndex));
  return output;
}

function plainTextToHtml(value: string): string {
  const normalized = value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/={12,}/g, "\n\n---\n\n")
    .replace(/([.!?])\s+(This message was sent|If you don't want|To help keep|Follow the link|Community Support|You can unsubscribe)/gi, "$1\n\n$2")
    .replace(/\s+(Hi\s+[^,\n]+,)/i, "\n\n$1")
    .replace(/\s+(Thanks,\s*[^\n]+)$/i, "\n\n$1")
    .trim();

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      if (/^-{3,}$/.test(paragraph)) return "<hr>";
      const readable = paragraph.length > 900
        ? paragraph.replace(/([.!?])\s+(?=[A-Z])/g, "$1\n")
        : paragraph;
      return `<p>${linkifyPlainText(readable).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
  return paragraphs ? `<div class="text-fallback">${paragraphs}</div>` : "<p></p>";
}

function replySubject(subject: string): string {
  const trimmed = subject.trim() || "(no subject)";
  return /^re:/i.test(trimmed) ? trimmed : `Re: ${trimmed}`;
}

function simpleTextToHtml(value: string): string {
  return value
    .split(/\n{2,}/)
    .map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function parseSmartReplies(raw: string): string[] {
  const cleaned = raw.trim();
  if (!cleaned) return [];
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map(item => String(item).trim()).filter(Boolean).slice(0, 5);
    }
  } catch {}
  return cleaned
    .split(/\|\|\||\n+/)
    .map(item => item.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

const PRIORITY_ORDER: PriorityCategory[] = ["Urgent", "Risk Detected", "High-Value Lead", "Payment", "Support Issue", "Needs Reply", "Low Priority"];

function priorityStyle(category?: PriorityCategory) {
  const styles: Record<PriorityCategory, { badge: string; dot: string; panel: string; text: string }> = {
    Urgent: { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", panel: "bg-red-50 border-red-100", text: "text-red-700" },
    "Risk Detected": { badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", panel: "bg-rose-50 border-rose-100", text: "text-rose-700" },
    "High-Value Lead": { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", panel: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" },
    Payment: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", panel: "bg-amber-50 border-amber-100", text: "text-amber-700" },
    "Support Issue": { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", panel: "bg-blue-50 border-blue-100", text: "text-blue-700" },
    "Needs Reply": { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", panel: "bg-indigo-50 border-indigo-100", text: "text-indigo-700" },
    "Low Priority": { badge: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-300", panel: "bg-gray-50 border-gray-100", text: "text-gray-500" },
  };
  return styles[category ?? "Low Priority"];
}

function priorityRank(email: EmailItem): number {
  const base = PRIORITY_ORDER.indexOf(email.priorityCategory);
  return (base === -1 ? 99 : base) * 100 - (email.priorityScore || 0);
}

function missionHeadline(emails: EmailItem[]) {
  const urgent = emails.filter(e => ["Urgent", "Risk Detected"].includes(e.priorityCategory)).length;
  const leads = emails.filter(e => e.priorityCategory === "High-Value Lead").length;
  const payments = emails.filter(e => e.priorityCategory === "Payment").length;
  const needsReply = emails.filter(e => e.priorityCategory === "Needs Reply" || e.isUnread).length;
  if (!emails.length) return "No priority mission yet.";
  if (urgent) return `${urgent} urgent conversation${urgent > 1 ? "s" : ""} need attention first.`;
  if (leads) return `${leads} lead${leads > 1 ? "s" : ""} may turn into revenue today.`;
  if (payments) return `${payments} payment conversation${payments > 1 ? "s" : ""} should be checked.`;
  return `${needsReply || emails.length} conversation${(needsReply || emails.length) > 1 ? "s" : ""} are worth clearing today.`;
}

function normalizeEmailItem(item: Partial<EmailItem> & { id: string; threadId: string; subject: string; from: string; date: string; snippet: string }): EmailItem {
  return {
    id: item.id,
    threadId: item.threadId,
    subject: item.subject,
    from: item.from,
    date: item.date,
    snippet: item.snippet,
    summary: item.summary ?? item.snippet.slice(0, 120),
    intent: item.intent ?? "FYI",
    priorityCategory: item.priorityCategory ?? "Low Priority",
    priorityScore: item.priorityScore ?? 38,
    priorityReason: item.priorityReason ?? "No strong action signal was detected.",
    suggestedAction: item.suggestedAction ?? "Review after higher-priority conversations.",
    riskLevel: item.riskLevel ?? "Low",
    bestTone: item.bestTone ?? "Neutral",
    isUnread: item.isUnread ?? false,
    isStarred: item.isStarred ?? false,
  };
}

function emailFrameDocument(message: ThreadMessage, fallback: string): string {
  const content = message.bodyHtml?.trim() || plainTextToHtml(message.bodyText || message.body || fallback);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base target="_blank">
  <style>
    html, body { margin: 0; padding: 0; background: #fff; color: #202124; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; }
    body { padding: 2px 0 18px; overflow-wrap: anywhere; }
    .email-root { max-width: 100%; }
    img { max-width: 100% !important; height: auto !important; display: inline-block; }
    table { max-width: 100% !important; border-collapse: collapse; }
    td, th { vertical-align: top; }
    p { margin: 0 0 12px; }
    blockquote { margin: 12px 0 12px 12px; padding-left: 12px; border-left: 3px solid #dadce0; color: #5f6368; }
    pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; }
    a { color: #1a73e8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr { border: 0; border-top: 1px solid #e8eaed; margin: 18px 0; }
    .text-fallback { max-width: 760px; }
    .text-fallback p { margin: 0 0 14px; }
    .text-fallback a { display: inline-block; margin: 0 2px; padding: 1px 6px; border-radius: 999px; background: #eef3fe; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="email-root">${content}</div>
</body>
</html>`;
}

function EmailBodyFrame({ message, fallback }: { message: ThreadMessage; fallback: string }) {
  return (
    <iframe
      title={`Email body ${message.id}`}
      srcDoc={emailFrameDocument(message, fallback)}
      sandbox=""
      referrerPolicy="no-referrer"
      className="h-[65vh] min-h-[360px] w-full rounded-xl border-0 bg-white"
    />
  );
}

export default function InboxDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [folder, setFolder] = useState<Folder>("inbox");
  const [filter, setFilter] = useState<FilterType>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [aiSearch, setAiSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandView, setCommandView] = useState<CommandView>("inbox");
  const [priorityFilter, setPriorityFilter] = useState<PriorityCategory | "All">("All");

  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [aiSummary, setAiSummary] = useState("");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [smartRepliesLoading, setSmartRepliesLoading] = useState(false);
  const [smartRepliesError, setSmartRepliesError] = useState("");
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [actionPlanError, setActionPlanError] = useState("");

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyTone, setReplyTone] = useState("Formal");
  const [customInstruction, setCustomInstruction] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [editedReply, setEditedReply] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [showTonePanel, setShowTonePanel] = useState(false);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeSuccess, setComposeSuccess] = useState("");
  const [composeInitialTo, setComposeInitialTo] = useState("");
  const [composeInitialSubject, setComposeInitialSubject] = useState("");
  const [composeInitialBody, setComposeInitialBody] = useState("");
  const [composeDraftId, setComposeDraftId] = useState<string | undefined>();

  const [localDrafts, setLocalDrafts] = useState<LocalDraft[]>([]);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmailItem[]>([]);

  const [mobileView, setMobileView] = useState<"list" | "email">("list");

  const [followUpDetection, setFollowUpDetection] = useState<{
    needsFollowUp: boolean;
    reason: string;
    suggestedLabel: string;
    suggestedDaysFromNow: number;
    intent?: "Sales" | "Support" | "General";
    confidence?: "low" | "medium" | "high";
    tag?: "Urgent" | "Sales" | "Waiting" | "General";
    alreadyDismissed?: boolean;
  } | null>(null);
  const [followUpDetecting, setFollowUpDetecting] = useState(false);
  const [followUpSaved, setFollowUpSaved] = useState(false);
  const [followUpSaving, setFollowUpSaving] = useState(false);
  const [followUpGenerating, setFollowUpGenerating] = useState(false);
  const [showFollowUpReason, setShowFollowUpReason] = useState(false);
  const [pendingFollowUps, setPendingFollowUps] = useState<Array<{
    _id: string; threadId: string; subject: string; from: string;
    scheduledAt: number; reason: string; status: string;
    intent?: string; confidence?: string; tag?: string;
  }>>([]);
  const [followUpsPanelOpen, setFollowUpsPanelOpen] = useState(true);

  const [newEmailsBanner, setNewEmailsBanner] = useState(0);
  const [newEmailItems, setNewEmailItems] = useState<EmailItem[]>([]);

  const tokenRef = useRef("");
  const filterRef = useRef<HTMLDivElement>(null);
  const activeThreadRequestRef = useRef(0);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownEmailIdsRef = useRef<Set<string>>(new Set());
  const currentFolderRef = useRef<string>("inbox");

  useEffect(() => {
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/login?next=/inbox/dashboard");
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthLoading(false);
      if (!u) { router.replace("/login?next=/inbox/dashboard"); return; }
      setUser(u);
      setLastActivePlatform("inbox");
      tokenRef.current = await u.getIdToken();
    });
    return () => unsub();
  }, [router]);

  const getToken = useCallback(async () => {
    if (!user) return "";
    const t = await user.getIdToken();
    tokenRef.current = t;
    return t;
  }, [user]);

  const pollForNewEmails = useCallback(async () => {
    if (currentFolderRef.current !== "inbox") return;
    const token = tokenRef.current;
    if (!token) return;
    try {
      const url = `${API}/inbox/messages?maxResults=10&folder=inbox`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      const fetched: EmailItem[] = (data.messages ?? []).map(normalizeEmailItem);
      const fresh = fetched.filter(e => !knownEmailIdsRef.current.has(e.id));
      if (fresh.length > 0) {
        fresh.forEach(e => knownEmailIdsRef.current.add(e.id));
        setNewEmailItems(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          return [...fresh.filter(e => !existingIds.has(e.id)), ...prev];
        });
        setNewEmailsBanner(prev => prev + fresh.length);
      }
    } catch {}
  }, []);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(pollForNewEmails, 45000);
  }, [pollForNewEmails]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user && folder === "inbox") {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [user, folder, startPolling, stopPolling]);

  function acceptNewEmails() {
    setEmails(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const toAdd = newEmailItems.filter(e => !existingIds.has(e.id));
      return [...toAdd, ...prev];
    });
    setNewEmailsBanner(0);
    setNewEmailItems([]);
  }

  async function generateSmartReplySuggestions(email: EmailItem, messages: ThreadMessage[], token: string, requestId: number) {
    if (!messages.length) return;
    setSmartRepliesLoading(true);
    setSmartRepliesError("");
    const threadText = messages.map(m => `From: ${m.from}\n${m.bodyText || m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/reply/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: email.subject,
          thread: threadText,
          tone: "short",
          instruction: "Generate 5 distinct, ready-to-send reply suggestions for the latest email. Each suggestion must be 1-3 sentences, useful on its own, and must not include a subject line. Separate suggestions only with |||. Do not add numbering, labels, greetings-only replies, or explanations.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate reply suggestions");
      if (activeThreadRequestRef.current === requestId) {
        const parsed = parseSmartReplies(data.reply ?? "");
        setSmartReplies(parsed.length ? parsed : []);
      }
    } catch (e: any) {
      if (activeThreadRequestRef.current === requestId) {
        setSmartRepliesError(e.message || "Could not generate reply suggestions.");
        setSmartReplies([]);
      }
    } finally {
      if (activeThreadRequestRef.current === requestId) {
        setSmartRepliesLoading(false);
      }
    }
  }

  async function loadActionPlan(email: EmailItem, messages: ThreadMessage[], token: string, requestId: number) {
    if (!messages.length) return;
    setActionPlanLoading(true);
    setActionPlanError("");
    setActionPlan(null);
    const threadText = messages.map(m => `From: ${m.from}\nDate: ${m.date}\n${m.bodyText || m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/action-plan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: email.subject,
          from: email.from,
          snippet: email.snippet,
          intent: email.intent,
          priorityCategory: email.priorityCategory,
          thread: threadText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to build action plan");
      if (activeThreadRequestRef.current === requestId) {
        setActionPlan(data.actionPlan ?? null);
      }
    } catch (e: any) {
      if (activeThreadRequestRef.current === requestId) {
        setActionPlanError(e.message || "Could not build the action plan.");
      }
    } finally {
      if (activeThreadRequestRef.current === requestId) {
        setActionPlanLoading(false);
      }
    }
  }

  const loadPendingFollowUps = useCallback(async () => {
    const token = tokenRef.current || await getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/inbox/followups?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingFollowUps(data.followUps ?? []);
      }
    } catch {}
  }, [getToken]);

  useEffect(() => {
    if (user) loadPendingFollowUps();
  }, [user, loadPendingFollowUps]);

  async function autoCompleteFollowUp(threadId: string) {
    const token = tokenRef.current || await getToken();
    if (!token || !threadId) return;
    try {
      const res = await fetch(`${API}/inbox/followup/auto-complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.completed) {
          setPendingFollowUps(prev => prev.filter(f => f.threadId !== threadId));
        }
      }
    } catch {}
  }

  async function sendFollowUpDraft(email: EmailItem, intent: string) {
    setFollowUpGenerating(true);
    const token = await getToken();
    const threadText = threadMessages.map(m => `From: ${m.from}\n${m.bodyText || m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/followup/generate-draft`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject, thread: threadText, from: email.from, intent }),
      });
      const data = await res.json();
      if (res.ok && data.draft) {
        setComposeInitialTo(email.from);
        setComposeInitialSubject(data.draft.subject);
        setComposeInitialBody(data.draft.body);
        setComposeDraftId(undefined);
        setComposeOpen(true);
      }
    } catch {}
    finally { setFollowUpGenerating(false); }
  }

  async function runFollowUpDetection(email: EmailItem, messages: { bodyText?: string; body: string; from: string }[], token: string, requestId: number) {
    if (!messages.length) return;
    setFollowUpDetecting(true);
    setFollowUpDetection(null);
    setFollowUpSaved(false);
    setShowFollowUpReason(false);
    const threadText = messages.map(m => `From: ${m.from}\n${m.bodyText || m.body}`).join("\n\n---\n\n");

    // Auto-complete: if the latest message is from someone else, a reply was received
    const latestMsg = messages[messages.length - 1];
    if (latestMsg && !latestMsg.from.includes(user?.email ?? "___")) {
      void autoCompleteFollowUp(email.threadId);
    }

    try {
      const res = await fetch(`${API}/inbox/followup/detect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject, thread: threadText, intent: email.intent, threadId: email.threadId }),
      });
      const data = await res.json();
      if (res.ok && activeThreadRequestRef.current === requestId) {
        setFollowUpDetection(data.detection ?? null);
      }
    } catch {}
    finally {
      if (activeThreadRequestRef.current === requestId) setFollowUpDetecting(false);
    }
  }

  async function saveFollowUp(email: EmailItem, daysFromNow: number, reason: string) {
    setFollowUpSaving(true);
    const token = await getToken();
    const scheduledAt = Date.now() + daysFromNow * 24 * 60 * 60 * 1000;
    try {
      const res = await fetch(`${API}/inbox/followups`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: email.id,
          threadId: email.threadId,
          subject: email.subject,
          from: email.from,
          scheduledAt,
          reason,
          intent: followUpDetection?.intent ?? "General",
          confidence: followUpDetection?.confidence ?? "medium",
          tag: followUpDetection?.tag ?? "General",
        }),
      });
      if (res.ok) {
        setFollowUpSaved(true);
        loadPendingFollowUps();
      }
    } catch {}
    finally { setFollowUpSaving(false); }
  }

  const loadLocalDrafts = useCallback(() => {
    try {
      const raw = localStorage.getItem("plyndrox_drafts");
      const drafts: LocalDraft[] = raw ? JSON.parse(raw) : [];
      setLocalDrafts(drafts);
    } catch { setLocalDrafts([]); }
  }, []);

  const loadScheduled = useCallback(() => {
    try {
      const raw = localStorage.getItem("plyndrox_scheduled");
      const items: ScheduledEmailItem[] = raw ? JSON.parse(raw) : [];
      setScheduledEmails(items.sort((a, b) => a.scheduledAt - b.scheduledAt));
    } catch { setScheduledEmails([]); }
  }, []);

  const loadEmails = useCallback(async (fld = folder, pageToken?: string) => {
    if (fld === "scheduled") {
      setLoading(false);
      loadScheduled();
      return;
    }
    if (fld === "drafts") {
      loadLocalDrafts();
    }
    currentFolderRef.current = fld;
    const token = await getToken();
    if (!token) return;
    if (pageToken) setLoadingMore(true);
    else {
      setLoading(true);
      setEmails([]);
      setNewEmailsBanner(0);
      setNewEmailItems([]);
    }
    setError("");
    try {
      const url = `${API}/inbox/messages?maxResults=25&folder=${fld}${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { router.replace("/inbox/connect"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      const loaded = (data.messages ?? []).map(normalizeEmailItem);
      if (pageToken) {
        setEmails(prev => [...prev, ...loaded]);
      } else {
        setEmails(loaded);
        if (fld === "inbox") {
          knownEmailIdsRef.current = new Set(loaded.map((e: EmailItem) => e.id));
        }
      }
      setNextPageToken(data.nextPageToken ?? null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [getToken, router, folder, loadLocalDrafts, loadScheduled]);

  useEffect(() => {
    if (user) loadEmails(folder);
  }, [user, folder]);

  // Handoff from followups page: open compose with pre-filled draft
  useEffect(() => {
    if (!user) return;
    try {
      const raw = sessionStorage.getItem("plyndrox_followup_compose");
      if (raw) {
        sessionStorage.removeItem("plyndrox_followup_compose");
        const { to, subject, body } = JSON.parse(raw);
        if (to && subject) {
          setComposeInitialTo(to);
          setComposeInitialSubject(subject);
          setComposeInitialBody(body ?? "");
          setComposeDraftId(undefined);
          setComposeOpen(true);
        }
      }
    } catch {}
  }, [user]);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function openEmail(email: EmailItem) {
    const requestId = activeThreadRequestRef.current + 1;
    activeThreadRequestRef.current = requestId;
    setSelectedEmail(email);
    setThreadMessages([]);
    setAiSummary("");
    setSmartReplies([]);
    setSmartRepliesError("");
    setSmartRepliesLoading(false);
    setActionPlan(null);
    setActionPlanError("");
    setActionPlanLoading(false);
    setGeneratedReply("");
    setEditedReply("");
    setSendSuccess(false);
    setReplyOpen(false);
    setShowDetails(false);
    setMobileView("email");
    setFollowUpDetection(null);
    setFollowUpDetecting(false);
    setFollowUpSaved(false);
    setFollowUpGenerating(false);
    setShowFollowUpReason(false);
    setThreadLoading(true);
    const token = await getToken();
    try {
      const res = await fetch(`${API}/inbox/thread/${email.threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && activeThreadRequestRef.current === requestId) {
        const messages = data.messages ?? [];
        setThreadMessages(messages);
        void loadActionPlan(email, messages, token, requestId);
        void generateSmartReplySuggestions(email, messages, token, requestId);
        void runFollowUpDetection(email, messages, token, requestId);
      }
    } catch {}
    finally {
      if (activeThreadRequestRef.current === requestId) setThreadLoading(false);
    }
  }

  async function handleSummarize() {
    if (!selectedEmail || !threadMessages.length) return;
    setAiSummaryLoading(true);
    setAiSummary("");
    const token = await getToken();
    const threadText = threadMessages.map(m => `From: ${m.from}\n${m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/reply/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedEmail.subject,
          thread: threadText,
          tone: "formal",
          instruction: "Instead of writing a reply, write a 3-bullet-point summary of this email thread. Start each bullet with •. Keep each bullet to one sentence.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setAiSummary(data.reply);
      }
    } catch {}
    finally { setAiSummaryLoading(false); }
  }

  async function handleGenerateReply() {
    if (!selectedEmail) return;
    setGenerating(true);
    setGeneratedReply("");
    setEditedReply("");
    setReplyError("");
    const token = await getToken();
    const threadText = threadMessages.map(m => `From: ${m.from}\n${m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/reply/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedEmail.subject,
          thread: threadText,
          tone: replyTone,
          instruction: customInstruction || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setGeneratedReply(data.reply ?? "");
      setEditedReply(data.reply ?? "");
    } catch (e: any) {
      setReplyError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend() {
    if (!selectedEmail || !editedReply.trim()) return;
    setSending(true);
    setSendSuccess(false);
    const token = await getToken();
    const lastMsg = threadMessages[threadMessages.length - 1];
    try {
      const formData = new FormData();
      formData.append("to", senderEmail(selectedEmail.from));
      formData.append("subject", selectedEmail.subject);
      formData.append("body", editedReply);
      formData.append("threadId", selectedEmail.threadId);
      if (lastMsg?.id) formData.append("inReplyTo", lastMsg.id);

      const res = await fetch(`${API}/inbox/reply/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSendSuccess(true);
      setEditedReply("");
      setGeneratedReply("");
      setReplyOpen(false);
    } catch (e: any) {
      setReplyError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function handleTrash(email: EmailItem, e?: React.MouseEvent) {
    e?.stopPropagation();
    const token = await getToken();
    // Optimistic remove
    setEmails(prev => prev.filter(em => em.id !== email.id));
    if (selectedEmail?.id === email.id) { setSelectedEmail(null); setMobileView("list"); }
    try {
      const res = await fetch(`${API}/inbox/trash/${email.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        // Restore the email and ask to reconnect
        setEmails(prev => [email, ...prev]);
        setComposeSuccess("Permission error — please reconnect your Gmail account (Settings → Reconnect).");
        window.setTimeout(() => setComposeSuccess(""), 6000);
      }
    } catch {}
  }

  async function handleArchive(email: EmailItem, e?: React.MouseEvent) {
    e?.stopPropagation();
    const token = await getToken();
    // Optimistic remove
    setEmails(prev => prev.filter(em => em.id !== email.id));
    if (selectedEmail?.id === email.id) { setSelectedEmail(null); setMobileView("list"); }
    try {
      const res = await fetch(`${API}/inbox/archive/${email.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        setEmails(prev => [email, ...prev]);
        setComposeSuccess("Permission error — please reconnect your Gmail account (Settings → Reconnect).");
        window.setTimeout(() => setComposeSuccess(""), 6000);
      }
    } catch {}
  }

  function deleteScheduled(id: string) {
    try {
      const items: ScheduledEmailItem[] = JSON.parse(localStorage.getItem("plyndrox_scheduled") || "[]");
      const updated = items.filter(i => i.id !== id);
      localStorage.setItem("plyndrox_scheduled", JSON.stringify(updated));
      setScheduledEmails(updated.sort((a, b) => a.scheduledAt - b.scheduledAt));
    } catch {}
  }

  function deleteLocalDraft(id: string) {
    try {
      const drafts: LocalDraft[] = JSON.parse(localStorage.getItem("plyndrox_drafts") || "[]");
      const updated = drafts.filter(d => d.id !== id);
      localStorage.setItem("plyndrox_drafts", JSON.stringify(updated));
      setLocalDrafts(updated);
    } catch {}
  }

  function openDraftInCompose(draft: LocalDraft) {
    setComposeInitialTo(draft.to.join(", "));
    setComposeInitialSubject(draft.subject);
    setComposeInitialBody(draft.bodyHtml);
    setComposeDraftId(draft.id);
    setComposeOpen(true);
  }

  function openCompose() {
    setComposeInitialTo("");
    setComposeInitialSubject("");
    setComposeInitialBody("");
    setComposeDraftId(undefined);
    setComposeOpen(true);
  }

  function openSmartReplyInCompose(reply: string) {
    if (!selectedEmail) return;
    setComposeInitialTo(senderEmail(selectedEmail.from));
    setComposeInitialSubject(replySubject(selectedEmail.subject));
    setComposeInitialBody(simpleTextToHtml(reply));
    setComposeDraftId(undefined);
    setReplyOpen(false);
    setComposeOpen(true);
  }

  function handleComposeSent(fld?: string) {
    if (fld === "scheduled") {
      setComposeSuccess("Message scheduled successfully.");
      loadScheduled();
    } else {
      setComposeSuccess("Message sent through Gmail.");
      if (fld === "sent" || folder === "sent") loadEmails("sent");
      else if (fld) loadEmails(fld as Folder);
    }
    window.setTimeout(() => setComposeSuccess(""), 4500);
  }

  async function toggleStar(email: EmailItem, e: React.MouseEvent) {
    e.stopPropagation();
    const newStarred = !email.isStarred;
    if (folder === "starred" && !newStarred) {
      // Remove from starred view immediately when un-starring
      setEmails(prev => prev.filter(em => em.id !== email.id));
      if (selectedEmail?.id === email.id) { setSelectedEmail(null); setMobileView("list"); }
    } else {
      setEmails(prev => prev.map(em => em.id === email.id ? { ...em, isStarred: newStarred } : em));
      if (selectedEmail?.id === email.id) setSelectedEmail(prev => prev ? { ...prev, isStarred: newStarred } : null);
    }
    const token = await getToken();
    try {
      const res = await fetch(`${API}/inbox/star/${email.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ starred: newStarred }),
      });
      if (res.status === 403) {
        // Revert the optimistic update
        setEmails(prev => prev.map(em => em.id === email.id ? { ...em, isStarred: email.isStarred } : em));
        if (selectedEmail?.id === email.id) setSelectedEmail(prev => prev ? { ...prev, isStarred: email.isStarred } : null);
        setComposeSuccess("Permission error — please reconnect your Gmail account (Settings → Reconnect).");
        window.setTimeout(() => setComposeSuccess(""), 6000);
      }
    } catch {}
  }

  function switchFolder(f: Folder) {
    currentFolderRef.current = f;
    setFolder(f);
    setSelectedEmail(null);
    setMobileView("list");
    setFilter("all");
    setPriorityFilter("All");
    setCommandView("inbox");
    setSearch("");
    setNewEmailsBanner(0);
    setNewEmailItems([]);
  }

  function openMission() {
    setCommandView("mission");
    setPriorityFilter("All");
    setFilter("all");
    setSelectedEmail(null);
    setMobileView("list");
    if (folder !== "inbox") setFolder("inbox");
  }

  const searchedEmails = emails.filter(em => {
    if (search && !em.subject.toLowerCase().includes(search.toLowerCase()) && !em.from.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "read" && em.isUnread) return false;
    if (filter === "unread" && !em.isUnread) return false;
    if (filter === "starred" && !em.isStarred) return false;
    if (filter === "unstarred" && em.isStarred) return false;
    return true;
  });
  const priorityFilteredEmails = searchedEmails
    .filter(em => priorityFilter === "All" || em.priorityCategory === priorityFilter)
    .sort((a, b) => priorityRank(a) - priorityRank(b));
  const missionEmails = searchedEmails
    .filter(em => em.priorityCategory !== "Low Priority" || em.isUnread)
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
    .slice(0, 8);
  const displayedEmails = commandView === "mission" ? missionEmails : priorityFilteredEmails;
  const missionCount = missionEmails.length;
  const highPriorityCount = searchedEmails.filter(em => ["Urgent", "Risk Detected", "High-Value Lead"].includes(em.priorityCategory)).length;
  const lowPriorityCount = searchedEmails.filter(em => em.priorityCategory === "Low Priority").length;

  const TONES = ["Formal", "Casual", "Sales", "Empathetic", "Short"];
  const FILTER_LABELS: Record<FilterType, string> = { all: "All", read: "Read", unread: "Unread", starred: "Starred", unstarred: "Unstarred" };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const folderLabel = NAV_ITEMS.find(n => n.id === folder)?.label ?? "Inbox";
  const selectedPriorityStyle = selectedEmail ? priorityStyle(selectedEmail.priorityCategory) : priorityStyle();

  return (
    <div className="flex h-screen overflow-hidden bg-white text-gray-800 font-sans">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? "w-[240px]" : "w-0 overflow-hidden"} transition-all duration-200 shrink-0 bg-[#14112a] flex flex-col text-white`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <img src="/evara-logo.png" alt="Evara" className="h-8 w-8 object-contain rounded-lg" />
            <span className="text-base font-black tracking-tight">Plyndrox</span>
          </Link>
        </div>

        {/* New message */}
        <div className="px-3 mb-4">
          <button
            onClick={openCompose}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#5c4ff6] hover:bg-[#4f43e0] py-3 text-sm font-bold transition"
          >
            <ComposeIcon />
            + New message
          </button>
        </div>

        <div className="px-3 mb-4">
          <button
            onClick={openMission}
            className={`w-full overflow-hidden rounded-2xl border p-3 text-left transition ${
              commandView === "mission"
                ? "border-[#8c82ff] bg-white text-[#14112a]"
                : "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-xl ${commandView === "mission" ? "bg-[#5c4ff6] text-white" : "bg-[#5c4ff6]/30 text-[#b9b4ff]"}`}>
                  <SparkleIcon />
                </span>
                <span className="text-sm font-black">Today’s Mission</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${commandView === "mission" ? "bg-[#14112a] text-white" : "bg-white/10 text-white"}`}>
                {missionCount}
              </span>
            </div>
            <p className={`mt-2 text-[11px] leading-4 ${commandView === "mission" ? "text-gray-600" : "text-zinc-400"}`}>
              A focused action list pulled from your real Gmail priorities.
            </p>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => switchFolder(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                folder === item.id
                  ? "bg-[#5c4ff6] text-white"
                  : "text-zinc-400 hover:bg-white/8 hover:text-white"
              }`}
            >
              <span className={folder === item.id ? "text-white" : "text-zinc-500"}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="px-3 pt-4 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">AI Features</p>
          </div>
          <Link
            href="/inbox/followups"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-white/8 hover:text-white transition"
          >
            <span className="text-zinc-500"><BellIcon /></span>
            Follow-Ups
          </Link>
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-4 space-y-0.5 border-t border-white/8 pt-3">
          <Link href="/inbox/connect" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-white hover:bg-white/8 transition">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.071 4.929A10 10 0 1 0 4.93 19.07A10 10 0 0 0 19.07 4.93"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>
            Settings
          </Link>
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-zinc-500">
            <div className="flex items-center gap-3">
              <SparkleIcon />
              <span>AI assistant</span>
            </div>
            <span className="text-zinc-600 text-lg leading-none">+</span>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar — always visible */}
        <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-2.5 shrink-0 bg-white">
          <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
            <MenuIcon />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-[#f3f2ff] px-4 py-2">
              <SearchIcon />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search messages"
                className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500 text-gray-800"
              />
            </div>
            <label className="flex items-center gap-1.5 mt-1 ml-2 cursor-pointer">
              <input type="checkbox" checked={aiSearch} onChange={e => setAiSearch(e.target.checked)} className="accent-indigo-600 w-3 h-3" />
              <span className="text-[11px] text-gray-500"><span className="text-indigo-600 font-semibold">AI</span> natural language search</span>
            </label>
          </div>

          {/* User avatar */}
          <div className="ml-auto">
            {user?.email && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: avatarColor(user.email) }}>
                {user.email[0].toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Email list panel ─────────────────────────────────────── */}
          <div className={`${selectedEmail ? "hidden md:flex" : "flex"} md:flex w-full md:w-[320px] lg:w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white overflow-hidden`}>
            {/* List header */}
            <div className="px-4 pt-3 pb-2 border-b border-gray-100">
              <div className="mb-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-gray-800">{commandView === "mission" ? "Today’s Mission" : folderLabel}</h2>
                  {folder === "inbox" && (
                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">AI Priority</span>
                  )}
                </div>
                {folder === "inbox" && (
                  <div className={`mt-3 rounded-2xl border p-3 ${commandView === "mission" ? "border-indigo-100 bg-[#f6f4ff]" : "border-gray-100 bg-gray-50"}`}>
                    <p className="text-xs font-bold text-gray-900">{missionHeadline(missionEmails)}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-white px-2 py-2 text-center shadow-sm">
                        <p className="text-base font-black text-gray-900">{missionCount}</p>
                        <p className="text-[10px] text-gray-400">Mission</p>
                      </div>
                      <div className="rounded-xl bg-white px-2 py-2 text-center shadow-sm">
                        <p className="text-base font-black text-red-600">{highPriorityCount}</p>
                        <p className="text-[10px] text-gray-400">Hot</p>
                      </div>
                      <div className="rounded-xl bg-white px-2 py-2 text-center shadow-sm">
                        <p className="text-base font-black text-gray-500">{lowPriorityCount}</p>
                        <p className="text-[10px] text-gray-400">Can wait</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="accent-indigo-600 w-4 h-4" />

                {/* Filter dropdown */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setFilterOpen(o => !o)}
                    className="flex items-center gap-1.5 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    {FILTER_LABELS[filter]}
                    <ChevronDown />
                  </button>
                  {filterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-40 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
                      {(["all", "read", "unread", "starred", "unstarred"] as FilterType[]).map(f => (
                        <button
                          key={f}
                          onClick={() => { setFilter(f); setFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition ${filter === f ? "bg-indigo-600 text-white font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                          {FILTER_LABELS[f]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => loadEmails(folder)}
                  disabled={loading}
                  className="flex items-center gap-1.5 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition ml-auto"
                >
                  <RefreshIcon spinning={loading} />
                  Refresh
                </button>
              </div>
              {folder === "inbox" && commandView !== "mission" && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {(["All", ...PRIORITY_ORDER] as (PriorityCategory | "All")[]).map(category => {
                    const selected = priorityFilter === category;
                    const count = category === "All" ? searchedEmails.length : searchedEmails.filter(em => em.priorityCategory === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => setPriorityFilter(category)}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                          selected ? "border-[#5c4ff6] bg-[#5c4ff6] text-white" : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50"
                        }`}
                      >
                        {category} <span className={selected ? "text-white/75" : "text-gray-400"}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Email list */}
            <div className="flex-1 overflow-y-auto">
              {/* ── Follow-Up Needed panel ──────────────────────────── */}
              {folder === "inbox" && pendingFollowUps.length > 0 && (
                <div className="border-b border-amber-100 bg-amber-50">
                  <button
                    onClick={() => setFollowUpsPanelOpen(v => !v)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-amber-200 text-amber-700">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </span>
                    <span className="text-xs font-black text-amber-800 flex-1">Follow-Up Needed</span>
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-800">{pendingFollowUps.length}</span>
                    <svg className={`w-3.5 h-3.5 text-amber-600 transition-transform ${followUpsPanelOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {followUpsPanelOpen && (
                    <div className="px-3 pb-3 space-y-1.5">
                      {pendingFollowUps.slice(0, 5).map(fu => {
                        const isOverdueItem = fu.scheduledAt < Date.now();
                        const tagColor = fu.tag === "Urgent" ? "bg-red-100 text-red-700" : fu.tag === "Sales" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500";
                        return (
                          <div
                            key={fu._id}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 cursor-pointer hover:bg-amber-100 transition ${isOverdueItem ? "border-red-200 bg-red-50" : "border-amber-200 bg-white"}`}
                            onClick={() => {
                              const match = emails.find(e => e.threadId === fu.threadId);
                              if (match) openEmail(match);
                            }}
                          >
                            <div className="w-7 h-7 rounded-full bg-amber-300 flex items-center justify-center text-amber-900 text-xs font-black shrink-0">
                              {(fu.from.match(/^(.*?)\s*</)?.[1]?.trim() || fu.from)[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{fu.subject}</p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {isOverdueItem ? <span className="text-red-600 font-semibold">Overdue · </span> : null}
                                {fu.reason.slice(0, 60)}{fu.reason.length > 60 ? "…" : ""}
                              </p>
                            </div>
                            {fu.tag && fu.tag !== "General" && (
                              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase ${tagColor}`}>{fu.tag}</span>
                            )}
                          </div>
                        );
                      })}
                      {pendingFollowUps.length > 5 && (
                        <Link href="/inbox/followups" className="block text-center text-[10px] font-bold text-amber-700 hover:text-amber-900 py-1">
                          +{pendingFollowUps.length - 5} more — View all
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── New emails banner ───────────────────────────────── */}
              {newEmailsBanner > 0 && folder === "inbox" && (
                <button
                  onClick={acceptNewEmails}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5c4ff6] text-white text-xs font-black hover:bg-[#4f43e0] transition animate-pulse"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7-7-7 7"/></svg>
                  {newEmailsBanner} new email{newEmailsBanner > 1 ? "s" : ""} — click to show
                </button>
              )}

              {/* ── Scheduled folder ────────────────────────────────── */}
              {folder === "scheduled" && (
                scheduledEmails.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400">
                      <ScheduledIcon />
                    </div>
                    <p className="text-sm text-gray-400">No scheduled messages</p>
                    <p className="text-xs text-gray-300 mt-1">Schedule a message using the compose window</p>
                  </div>
                ) : (
                  scheduledEmails.map(item => (
                    <div key={item.id} className="px-4 py-3 border-b border-gray-100 bg-white hover:bg-[#f8f7ff] transition group">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-black mt-0.5">
                          <ScheduledIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-sm font-semibold text-gray-900 truncate">To: {item.to.join(", ")}</span>
                            <span className="text-[11px] text-indigo-500 shrink-0 font-semibold">
                              {new Date(item.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" })} {new Date(item.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-700 truncate mb-0.5">{item.subject || "(no subject)"}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-gray-400 truncate" dangerouslySetInnerHTML={{ __html: item.bodyHtml.replace(/<[^>]+>/g, " ").slice(0, 80) }} />
                            <button
                              onClick={() => deleteScheduled(item.id)}
                              className="ml-2 shrink-0 text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                            >
                              Cancel
                            </button>
                          </div>
                          {item.attachments?.length > 0 && (
                            <p className="text-[10px] text-gray-400 mt-0.5">📎 {item.attachments.length} attachment{item.attachments.length > 1 ? "s" : ""}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* ── Drafts folder — local drafts section ────────────── */}
              {folder === "drafts" && localDrafts.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">Local Drafts</p>
                  {localDrafts.map(draft => (
                    <div key={draft.id} className="px-4 py-3 border-b border-gray-100 bg-amber-50/40 hover:bg-amber-50 transition group">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-amber-100 text-amber-600 text-xs font-black mt-0.5">
                          <DraftIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              {draft.to.length ? `To: ${draft.to.join(", ")}` : "(no recipients)"}
                            </span>
                            <span className="text-[11px] text-gray-400 shrink-0">{formatDate(new Date(draft.savedAt).toISOString())}</span>
                          </div>
                          <p className="text-xs font-medium text-gray-700 truncate mb-0.5">{draft.subject || "(no subject)"}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-gray-400 truncate" dangerouslySetInnerHTML={{ __html: draft.bodyHtml.replace(/<[^>]+>/g, " ").slice(0, 80) }} />
                            <div className="flex gap-2 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => openDraftInCompose(draft)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                              <button onClick={() => deleteLocalDraft(draft.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {emails.length > 0 && (
                    <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">Gmail Drafts</p>
                  )}
                </div>
              )}

              {/* ── Regular email list ──────────────────────────────── */}
              {folder !== "scheduled" && (
                loading ? (
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5 animate-pulse">
                        <div className="w-4 h-4 rounded bg-gray-100" />
                        <div className="w-8 h-8 rounded-full bg-gray-100" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                          <div className="h-2.5 bg-gray-50 rounded w-full" />
                          <div className="h-2 bg-gray-50 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-red-500 mb-3">{error}</p>
                    <button onClick={() => loadEmails(folder)} className="text-sm text-indigo-600 underline">Retry</button>
                  </div>
                ) : displayedEmails.length === 0 && !(folder === "drafts" && localDrafts.length > 0) ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-400">{commandView === "mission" ? "No mission items yet" : "No emails found"}</p>
                    {commandView === "mission" && <p className="mt-1 text-xs text-gray-300">Refresh your inbox or clear the search filter.</p>}
                  </div>
                ) : (
                  <>
                    {displayedEmails.map(email => {
                      const style = priorityStyle(email.priorityCategory);
                      return (
                      <div
                        key={email.id}
                        onClick={() => openEmail(email)}
                        className={`w-full text-left flex items-start gap-2.5 px-4 py-3 border-b border-gray-100 transition group relative cursor-pointer ${
                          selectedEmail?.id === email.id
                            ? "bg-[#eeebff]"
                            : email.isUnread
                            ? "bg-white hover:bg-[#f8f7ff]"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {email.isUnread && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-indigo-600" />
                        )}
                        <div
                          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-black mt-0.5"
                          style={{ background: avatarColor(senderName(email.from)) }}
                        >
                          {senderInitial(email.from)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`text-sm truncate ${email.isUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                              {senderName(email.from)}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Date — hidden on hover, replaced by action buttons */}
                              <span className="text-[11px] text-gray-400 group-hover:hidden">{formatDate(email.date)}</span>
                              {/* Hover action buttons */}
                              <div className="hidden group-hover:flex items-center gap-0.5">
                                <button
                                  onClick={e => { e.stopPropagation(); toggleStar(email, e); }}
                                  title={email.isStarred ? "Unstar" : "Star"}
                                  className={`p-1 rounded transition ${email.isStarred ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
                                >
                                  <StarIcon filled={email.isStarred} />
                                </button>
                                <button
                                  onClick={e => handleArchive(email, e)}
                                  title="Archive"
                                  className="p-1 rounded text-gray-400 hover:text-indigo-600 transition"
                                >
                                  <ArchiveIcon />
                                </button>
                                <button
                                  onClick={e => handleTrash(email, e)}
                                  title="Move to trash"
                                  className="p-1 rounded text-gray-400 hover:text-red-500 transition"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                              {/* Star — always visible when starred, even without hover */}
                              {email.isStarred && (
                                <button
                                  onClick={e => { e.stopPropagation(); toggleStar(email, e); }}
                                  className="p-0.5 text-yellow-400 group-hover:hidden transition"
                                >
                                  <StarIcon filled />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mb-1 flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${style.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                              {email.priorityCategory}
                            </span>
                            <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{email.intent}</span>
                          </div>
                          <p className={`text-xs truncate mb-0.5 ${email.isUnread ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                            {email.subject}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">{email.snippet}</p>
                          {commandView === "mission" && (
                            <p className="mt-1 rounded-lg bg-white/80 px-2 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-100">{email.suggestedAction}</p>
                          )}
                        </div>
                      </div>
                    );})}
                    {nextPageToken && (
                      <div className="p-4">
                        <button
                          onClick={() => loadEmails(folder, nextPageToken)}
                          disabled={loadingMore}
                          className="w-full py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
                        >
                          {loadingMore ? "Loading..." : "Load more"}
                        </button>
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </div>

          {/* ── Reading pane ─────────────────────────────────────────── */}
          <div className={`${selectedEmail ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden bg-white`}>
            {!selectedEmail ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <InboxIcon />
                  </div>
                  <p className="text-sm text-gray-400">Select an email to read</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Email top bar */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 shrink-0">
                  <button
                    onClick={() => { setSelectedEmail(null); setMobileView("list"); }}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                  >
                    <BackArrowIcon />
                  </button>
                  <h2 className="flex-1 font-bold text-gray-900 text-base truncate">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={e => handleArchive(selectedEmail, e)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                      <ArchiveIcon /> Archive
                    </button>
                    <button
                      onClick={e => handleTrash(selectedEmail, e)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-red-500 hover:bg-red-50 hover:border-red-200 transition"
                    >
                      <TrashIcon /> Trash
                    </button>
                    <button
                      onClick={e => toggleStar(selectedEmail, e)}
                      className={`p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition ${selectedEmail.isStarred ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`}
                    >
                      <StarIcon filled={selectedEmail.isStarred} />
                    </button>
                  </div>
                </div>

                {/* Email body scroll area */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {threadLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-gray-100 rounded w-40" />
                          <div className="h-2.5 bg-gray-50 rounded w-28" />
                        </div>
                      </div>
                      <div className="space-y-2 pt-4">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-3 bg-gray-50 rounded" style={{ width: `${95 - i * 5}%` }} />)}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`mb-5 rounded-3xl border p-4 ${selectedPriorityStyle.panel}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-black ${selectedPriorityStyle.badge}`}>
                                <span className={`h-2 w-2 rounded-full ${selectedPriorityStyle.dot}`} />
                                {selectedEmail.priorityCategory}
                              </span>
                              <span className="rounded-full border border-white bg-white px-3 py-1 text-xs font-bold text-gray-600">{selectedEmail.priorityScore}/100 priority</span>
                              <span className="rounded-full border border-white bg-white px-3 py-1 text-xs font-bold text-gray-600">{selectedEmail.bestTone}</span>
                            </div>
                            <h3 className="text-sm font-black text-gray-900">AI Action Plan</h3>
                            <p className="mt-1 text-xs leading-5 text-gray-600">{selectedEmail.priorityReason}</p>
                          </div>
                          <button
                            onClick={() => smartReplies[0] ? openSmartReplyInCompose(smartReplies[0]) : setReplyOpen(true)}
                            disabled={!selectedEmail}
                            className="shrink-0 rounded-full bg-[#14112a] px-4 py-2 text-xs font-black text-white transition hover:bg-[#25204a]"
                          >
                            {smartReplies[0] ? "Use best reply" : "Draft reply"}
                          </button>
                        </div>

                        {actionPlanLoading ? (
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-2xl bg-white/70 animate-pulse" />)}
                          </div>
                        ) : actionPlanError ? (
                          <p className="mt-4 rounded-2xl bg-white px-3 py-2 text-xs text-red-500">{actionPlanError}</p>
                        ) : actionPlan ? (
                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            <div className="rounded-2xl bg-white p-3 shadow-sm">
                              <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Summary</p>
                              <p className="mt-1 text-sm leading-6 text-gray-700">{actionPlan.summary}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-3 shadow-sm">
                              <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Recommended action</p>
                              <p className="mt-1 text-sm leading-6 text-gray-700">{actionPlan.recommendedAction}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-3 shadow-sm">
                              <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Risk if ignored</p>
                              <p className="mt-1 text-sm leading-6 text-gray-700">{actionPlan.risk}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-3 shadow-sm">
                              <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Next step</p>
                              <p className="mt-1 text-sm leading-6 text-gray-700">{actionPlan.suggestedNextStep}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Suggested action</p>
                            <p className="mt-1 text-sm leading-6 text-gray-700">{selectedEmail.suggestedAction}</p>
                          </div>
                        )}
                      </div>

                      {threadMessages.map((msg, idx) => {
                        const name = senderName(msg.from);
                        const email = senderEmail(msg.from);
                        const isLast = idx === threadMessages.length - 1;
                        return (
                          <div key={msg.id} className="mb-6">
                            {/* Sender row */}
                            <div className="flex items-start gap-3 mb-4">
                              <div
                                className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-black"
                                style={{ background: avatarColor(name) }}
                              >
                                {name[0]?.toUpperCase() ?? "?"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                                      <span className="font-bold text-gray-900 text-sm">{name}</span>
                                      <span className="text-xs text-gray-500">&lt;{email}&gt;</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                      to {msg.to ? senderName(msg.to) : "me"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-gray-400">{formatDateLong(msg.date)}</span>
                                    <button className="text-gray-400 hover:text-gray-600 p-0.5"><MoreVertIcon /></button>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setShowDetails(o => !o)}
                                  className="text-[11px] text-indigo-600 hover:underline mt-0.5"
                                >
                                  {showDetails ? "Hide details" : "Show details"}
                                </button>
                                {showDetails && (
                                  <div className="mt-2 text-[11px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                                    <p><span className="font-semibold">From:</span> {msg.from}</p>
                                    {msg.to && <p><span className="font-semibold">To:</span> {msg.to}</p>}
                                    {msg.cc && <p><span className="font-semibold">Cc:</span> {msg.cc}</p>}
                                    <p><span className="font-semibold">Subject:</span> {msg.subject}</p>
                                    <p><span className="font-semibold">Date:</span> {formatDateLong(msg.date)}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Body */}
                            <div className="overflow-hidden rounded-xl bg-white text-sm text-gray-700">
                              <EmailBodyFrame message={msg} fallback={selectedEmail.snippet} />
                            </div>

                            {idx < threadMessages.length - 1 && (
                              <div className="mt-5 border-t border-gray-100" />
                            )}
                          </div>
                        );
                      })}

                      {/* AI Summary card */}
                      {(aiSummary || aiSummaryLoading) && (
                        <div className="mt-4 rounded-2xl border border-indigo-100 bg-[#f6f4ff] p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <SparkleIcon />
                              <span className="text-xs font-bold text-indigo-700">AI Summary</span>
                            </div>
                            <span className="text-[10px] text-gray-400">Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          {aiSummaryLoading ? (
                            <div className="space-y-2 animate-pulse">
                              {[1,2,3].map(i => <div key={i} className="h-3 bg-indigo-100 rounded w-full" />)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-700 leading-7">
                              {aiSummary.split("\n").filter(Boolean).map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Smart replies */}
                      {(smartRepliesLoading || smartRepliesError || smartReplies.length > 0) && (
                        <div className="mt-4">
                          <div className="mb-2 flex items-center gap-2">
                            <p className="text-xs text-gray-500 font-medium">AI reply suggestions</p>
                            {smartRepliesLoading && <div className="w-3 h-3 border border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />}
                          </div>
                          {smartRepliesLoading ? (
                            <div className="flex flex-wrap gap-2">
                              {[1,2,3].map(i => <div key={i} className="h-8 w-36 rounded-full bg-indigo-50 animate-pulse" />)}
                            </div>
                          ) : smartRepliesError ? (
                            <p className="text-xs text-red-500">{smartRepliesError}</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {smartReplies.map((sr, i) => (
                                <button
                                  key={i}
                                  onClick={() => openSmartReplyInCompose(sr)}
                                  className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50 transition text-left"
                                >
                                  {sr}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Follow-Up Card ──────────────────────────────── */}
                      {(followUpDetecting || followUpDetection) && (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                              <BellIcon />
                            </span>
                            <span className="text-xs font-black text-amber-800">AI Follow-Up Detection</span>
                            {followUpDetecting && <div className="w-3.5 h-3.5 border border-amber-300 border-t-amber-600 rounded-full animate-spin ml-auto" />}
                          </div>
                          {followUpDetecting ? (
                            <div className="space-y-2 animate-pulse">
                              <div className="h-3 bg-amber-100 rounded w-3/4" />
                              <div className="h-3 bg-amber-100 rounded w-1/2" />
                            </div>
                          ) : followUpDetection?.needsFollowUp ? (
                            <>
                              {/* Tags row */}
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                {followUpDetection.tag && followUpDetection.tag !== "General" && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                                    followUpDetection.tag === "Urgent" ? "bg-red-100 text-red-700" :
                                    followUpDetection.tag === "Sales" ? "bg-blue-100 text-blue-700" :
                                    "bg-gray-100 text-gray-600"
                                  }`}>{followUpDetection.tag}</span>
                                )}
                                {followUpDetection.intent && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700 uppercase tracking-wide">{followUpDetection.intent}</span>
                                )}
                                {followUpDetection.confidence && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                                    followUpDetection.confidence === "high" ? "bg-emerald-100 text-emerald-700" :
                                    followUpDetection.confidence === "medium" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-gray-100 text-gray-500"
                                  }`}>{followUpDetection.confidence} confidence</span>
                                )}
                              </div>
                              {/* Reason with tooltip toggle */}
                              <div className="mb-1">
                                <button
                                  onClick={() => setShowFollowUpReason(v => !v)}
                                  className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 font-semibold"
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                  Why this follow-up?
                                </button>
                                {showFollowUpReason && (
                                  <p className="mt-1.5 text-sm text-amber-900 font-medium bg-amber-100 rounded-xl px-3 py-2">{followUpDetection.reason}</p>
                                )}
                              </div>
                              <p className="text-xs text-amber-700 mb-3">
                                Suggested: <span className="font-black">{followUpDetection.suggestedLabel}</span>
                              </p>
                              {followUpSaved ? (
                                <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
                                  <CheckCircleIcon />
                                  Reminder set for {followUpDetection.suggestedLabel}
                                  {selectedEmail && (
                                    <button
                                      onClick={() => selectedEmail && sendFollowUpDraft(selectedEmail, followUpDetection.intent ?? "General")}
                                      disabled={followUpGenerating}
                                      className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5c4ff6] hover:bg-[#4f43e0] text-white text-xs font-black transition disabled:opacity-60"
                                    >
                                      {followUpGenerating ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>}
                                      {followUpGenerating ? "Drafting…" : "Send Follow-Up"}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => selectedEmail && saveFollowUp(selectedEmail, followUpDetection.suggestedDaysFromNow, followUpDetection.reason)}
                                    disabled={followUpSaving}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition disabled:opacity-60"
                                  >
                                    {followUpSaving ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <BellIcon />}
                                    {followUpSaving ? "Saving…" : "Set Reminder"}
                                  </button>
                                  <button
                                    onClick={() => selectedEmail && sendFollowUpDraft(selectedEmail, followUpDetection.intent ?? "General")}
                                    disabled={followUpGenerating}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5c4ff6] hover:bg-[#4f43e0] text-white text-xs font-black transition disabled:opacity-60"
                                  >
                                    {followUpGenerating ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>}
                                    {followUpGenerating ? "Drafting…" : "Send Follow-Up"}
                                  </button>
                                  <Link href="/inbox/followups" className="text-xs text-amber-700 underline hover:text-amber-900">View all</Link>
                                </div>
                              )}
                            </>
                          ) : followUpDetection?.alreadyDismissed ? (
                            <p className="text-xs text-amber-600 italic">Follow-up was dismissed for this thread — won&apos;t be recreated.</p>
                          ) : (
                            <p className="text-xs text-amber-700">No follow-up needed for this thread.</p>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-5 flex items-center gap-3">
                        <button
                          onClick={() => setReplyOpen(o => !o)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5c4ff6] hover:bg-[#4f43e0] text-white text-sm font-bold transition"
                        >
                          <ReplyIcon />
                          Reply
                        </button>
                        <button
                          onClick={handleSummarize}
                          disabled={aiSummaryLoading || !threadMessages.length}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#5c4ff6] text-[#5c4ff6] hover:bg-indigo-50 text-sm font-bold transition disabled:opacity-50"
                        >
                          {aiSummaryLoading ? (
                            <div className="w-3.5 h-3.5 border border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                          ) : (
                            <SparkleIcon />
                          )}
                          Summarize
                        </button>
                      </div>

                      {sendSuccess && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          Reply sent successfully!
                        </div>
                      )}

                      {/* Reply compose area */}
                      {replyOpen && (
                        <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                          {/* Tone selector */}
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                            <span className="text-xs text-gray-500 font-medium mr-1">Tone:</span>
                            {TONES.map(t => (
                              <button
                                key={t}
                                onClick={() => setReplyTone(t)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium transition border ${
                                  replyTone === t
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                            <button
                              onClick={handleGenerateReply}
                              disabled={generating}
                              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition disabled:opacity-50"
                            >
                              {generating ? <div className="w-3 h-3 border border-indigo-300 border-t-indigo-600 rounded-full animate-spin" /> : <SparkleIcon />}
                              {generating ? "Generating…" : "AI Draft"}
                            </button>
                          </div>

                          {/* Custom instruction */}
                          <div className="px-4 py-2 border-b border-gray-100">
                            <input
                              value={customInstruction}
                              onChange={e => setCustomInstruction(e.target.value)}
                              placeholder='Custom instruction (optional) — e.g. "mention our 20% discount"'
                              className="w-full text-xs text-gray-600 outline-none placeholder-gray-400"
                            />
                          </div>

                          {/* Reply text area */}
                          <div className="px-4 py-3">
                            <div className="text-xs text-gray-500 mb-1">To: <span className="text-gray-700">{senderName(selectedEmail.from)} &lt;{senderEmail(selectedEmail.from)}&gt;</span></div>
                            <textarea
                              value={editedReply}
                              onChange={e => setEditedReply(e.target.value)}
                              placeholder="Write your reply here..."
                              rows={6}
                              className="w-full text-sm text-gray-800 outline-none resize-none leading-7 placeholder-gray-300"
                            />
                          </div>

                          {replyError && (
                            <div className="px-4 pb-2 text-xs text-red-500">{replyError}</div>
                          )}

                          {/* Send row */}
                          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                            <button
                              onClick={handleSend}
                              disabled={sending || !editedReply.trim()}
                              className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#5c4ff6] hover:bg-[#4f43e0] text-white text-sm font-bold transition disabled:opacity-50"
                            >
                              {sending ? <div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" /> : <SendIcon2 />}
                              {sending ? "Sending…" : "Send"}
                            </button>
                            <button
                              onClick={() => { setReplyOpen(false); setEditedReply(""); setGeneratedReply(""); }}
                              className="text-sm text-gray-500 hover:text-gray-800 transition"
                            >
                              Discard
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {composeSuccess && (
        <div className={`fixed bottom-5 right-5 z-50 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl bg-white flex items-center gap-2 max-w-sm ${
          composeSuccess.startsWith("Permission") || composeSuccess.startsWith("Error")
            ? "border-red-200 text-red-700"
            : composeSuccess.startsWith("Message scheduled")
            ? "border-indigo-200 text-indigo-700"
            : "border-emerald-200 text-emerald-700"
        }`}>
          {composeSuccess.startsWith("Permission") || composeSuccess.startsWith("Error")
            ? <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            : composeSuccess.startsWith("Message scheduled")
            ? <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            : <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          }
          {composeSuccess}
        </div>
      )}

      {composeOpen && (
        <ComposeModal
          user={user}
          apiBase={API}
          onClose={() => { setComposeOpen(false); if (folder === "drafts") loadLocalDrafts(); if (folder === "scheduled") loadScheduled(); }}
          onSent={handleComposeSent}
          initialTo={composeInitialTo || undefined}
          initialSubject={composeInitialSubject || undefined}
          initialBodyHtml={composeInitialBody || undefined}
          draftId={composeDraftId}
        />
      )}
    </div>
  );
}
