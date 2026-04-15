"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { setLastActivePlatform } from "@/lib/platformSession";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type Folder = "inbox" | "sent" | "spam" | "drafts" | "starred" | "trash";
type FilterType = "all" | "read" | "unread" | "starred" | "unstarred";

interface EmailItem {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  summary: string;
  intent: string;
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

const NAV_ITEMS: { id: Folder; label: string; icon: React.ReactNode }[] = [
  { id: "inbox",   label: "Inbox",     icon: <InboxIcon /> },
  { id: "spam",    label: "Spam",      icon: <SpamIcon /> },
  { id: "drafts",  label: "Drafts",    icon: <DraftIcon /> },
  { id: "sent",    label: "Sent",      icon: <SendIcon2 /> },
  { id: "starred", label: "Starred",   icon: <StarIcon filled={false} /> },
  { id: "trash",   label: "Trash",     icon: <TrashIcon /> },
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

  const [mobileView, setMobileView] = useState<"list" | "email">("list");

  const tokenRef = useRef("");
  const filterRef = useRef<HTMLDivElement>(null);

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

  const loadEmails = useCallback(async (fld = folder, pageToken?: string) => {
    const token = await getToken();
    if (!token) return;
    if (pageToken) setLoadingMore(true);
    else { setLoading(true); setEmails([]); }
    setError("");
    try {
      const url = `${API}/inbox/messages?maxResults=25&folder=${fld}${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { router.replace("/inbox/connect"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      if (pageToken) setEmails(prev => [...prev, ...(data.messages ?? [])]);
      else setEmails(data.messages ?? []);
      setNextPageToken(data.nextPageToken ?? null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [getToken, router, folder]);

  useEffect(() => {
    if (user) loadEmails(folder);
  }, [user, folder]);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function openEmail(email: EmailItem) {
    setSelectedEmail(email);
    setThreadMessages([]);
    setAiSummary("");
    setSmartReplies([]);
    setGeneratedReply("");
    setEditedReply("");
    setSendSuccess(false);
    setReplyOpen(false);
    setShowDetails(false);
    setMobileView("email");
    setThreadLoading(true);
    const token = await getToken();
    try {
      const res = await fetch(`${API}/inbox/thread/${email.threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setThreadMessages(data.messages ?? []);
    } catch {}
    finally { setThreadLoading(false); }
  }

  async function handleSummarize() {
    if (!selectedEmail || !threadMessages.length) return;
    setAiSummaryLoading(true);
    setAiSummary("");
    setSmartReplies([]);
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
        const replies = await fetch(`${API}/inbox/reply/generate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: selectedEmail.subject,
            thread: threadText,
            tone: "casual",
            instruction: "Generate 3 short one-sentence smart replies separated by ||| characters. No greetings, no sign-offs. Just the main sentence.",
          }),
        });
        const rd = await replies.json();
        if (replies.ok && rd.reply) {
          setSmartReplies(rd.reply.split("|||").map((s: string) => s.trim()).filter(Boolean).slice(0, 3));
        }
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
      const res = await fetch(`${API}/inbox/reply/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedEmail.from,
          subject: selectedEmail.subject,
          body: editedReply,
          threadId: selectedEmail.threadId,
          inReplyTo: lastMsg?.id,
        }),
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

  async function toggleStar(email: EmailItem, e: React.MouseEvent) {
    e.stopPropagation();
    const newStarred = !email.isStarred;
    setEmails(prev => prev.map(em => em.id === email.id ? { ...em, isStarred: newStarred } : em));
    if (selectedEmail?.id === email.id) setSelectedEmail(prev => prev ? { ...prev, isStarred: newStarred } : null);
    const token = await getToken();
    try {
      await fetch(`${API}/inbox/star/${email.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ starred: newStarred }),
      });
    } catch {}
  }

  function switchFolder(f: Folder) {
    setFolder(f);
    setSelectedEmail(null);
    setMobileView("list");
    setFilter("all");
    setSearch("");
  }

  const filteredEmails = emails.filter(em => {
    if (search && !em.subject.toLowerCase().includes(search.toLowerCase()) && !em.from.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "read" && em.isUnread) return false;
    if (filter === "unread" && !em.isUnread) return false;
    if (filter === "starred" && !em.isStarred) return false;
    if (filter === "unstarred" && em.isStarred) return false;
    return true;
  });

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
            onClick={() => { setReplyOpen(true); setSidebarOpen(w => w); }}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#5c4ff6] hover:bg-[#4f43e0] py-3 text-sm font-bold transition"
          >
            <ComposeIcon />
            + New message
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
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">Labels</p>
          </div>
          <div className="px-3 py-1.5">
            <p className="text-xs text-zinc-600">No labels yet</p>
          </div>
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
              <h2 className="text-base font-bold text-gray-800 mb-2">{folderLabel}</h2>
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
            </div>

            {/* Email list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
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
              ) : filteredEmails.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-400">No emails found</p>
                </div>
              ) : (
                <>
                  {filteredEmails.map(email => (
                    <button
                      key={email.id}
                      onClick={() => openEmail(email)}
                      className={`w-full text-left flex items-start gap-2.5 px-4 py-3 border-b border-gray-100 transition group relative ${
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
                      <input type="checkbox" onClick={e => e.stopPropagation()} className="accent-indigo-600 mt-1 w-4 h-4 shrink-0" />
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
                          <span className="text-[11px] text-gray-400 shrink-0">{formatDate(email.date)}</span>
                        </div>
                        <p className={`text-xs truncate mb-0.5 ${email.isUnread ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                          {email.subject}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{email.snippet}</p>
                      </div>
                      <button
                        onClick={e => toggleStar(email, e)}
                        className="shrink-0 p-0.5 mt-0.5 text-gray-300 hover:text-yellow-400 transition opacity-0 group-hover:opacity-100"
                      >
                        <StarIcon filled={email.isStarred} />
                      </button>
                    </button>
                  ))}
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
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <ArchiveIcon /> Archive
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
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
                      {smartReplies.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 mb-2 font-medium">Smart replies</p>
                          <div className="flex flex-wrap gap-2">
                            {smartReplies.map((sr, i) => (
                              <button
                                key={i}
                                onClick={() => { setReplyOpen(true); setEditedReply(sr); setGeneratedReply(sr); }}
                                className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50 transition text-left"
                              >
                                {sr}
                              </button>
                            ))}
                          </div>
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
                            <div className="text-xs text-gray-500 mb-1">To: <span className="text-gray-700">{senderName(selectedEmail.from)}</span></div>
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
    </div>
  );
}
