"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type PriorityCategory = "Urgent" | "High-Value Lead" | "Payment" | "Support Issue" | "Risk Detected" | "Needs Reply" | "Low Priority";

interface EmailItem {
  id: string; threadId: string; subject: string; from: string; date: string;
  snippet: string; summary: string; intent: string; priorityCategory: PriorityCategory;
  priorityScore: number; priorityReason: string; suggestedAction: string;
  riskLevel: "High" | "Medium" | "Low"; bestTone: string;
  isUnread: boolean; isStarred: boolean; aiRescued?: boolean;
}
interface ThreadMessage {
  id: string; subject: string; from: string; to?: string; cc?: string;
  date: string; body: string; bodyText?: string; bodyHtml?: string;
}

// ─── Category config ────────────────────────────────────────────────────────
const CAT_META: Record<string, { label: string; icon: string; filterType: "priority" | "importance" | "none"; folder: string }> = {
  primary:    { label: "Primary",          icon: "✉️",  filterType: "priority",   folder: "primary" },
  updates:    { label: "Updates",          icon: "🔔",  filterType: "priority",   folder: "updates" },
  promotions: { label: "Promotions",       icon: "🏷️",  filterType: "importance", folder: "promotions" },
  social:     { label: "Social",           icon: "👥",  filterType: "importance", folder: "social" },
  starred:    { label: "Starred",          icon: "⭐",  filterType: "none",       folder: "starred" },
  sent:       { label: "Sent",             icon: "📤",  filterType: "none",       folder: "sent" },
  drafts:     { label: "Drafts",           icon: "📝",  filterType: "none",       folder: "drafts" },
  archive:    { label: "Archive",          icon: "🗃️",  filterType: "none",       folder: "archive" },
  spam:       { label: "Spam",             icon: "🚫",  filterType: "none",       folder: "spam" },
  trash:      { label: "Trash",            icon: "🗑️",  filterType: "none",       folder: "trash" },
  waiting:    { label: "Waiting for Reply",icon: "⏳",  filterType: "none",       folder: "primary" },
  hot:        { label: "Hot Leads",        icon: "🔥",  filterType: "none",       folder: "primary" },
  warm:       { label: "Warm Leads",       icon: "🌤️",  filterType: "none",       folder: "primary" },
  cold:       { label: "Cold Leads",       icon: "❄️",  filterType: "none",       folder: "primary" },
};

const PRIORITY_FILTERS: { id: PriorityCategory | "Ignore" | "All"; label: string; color: string; dot: string }[] = [
  { id: "All",             label: "All",             color: "text-gray-600",   dot: "bg-gray-400" },
  { id: "Urgent",          label: "Urgent",          color: "text-red-700",    dot: "bg-red-500" },
  { id: "Risk Detected",   label: "Risk Detect",     color: "text-rose-700",   dot: "bg-rose-500" },
  { id: "High-Value Lead", label: "High Value Lead", color: "text-violet-700", dot: "bg-violet-500" },
  { id: "Payment",         label: "Payment",         color: "text-emerald-700",dot: "bg-emerald-500" },
  { id: "Support Issue",   label: "Support Issue",   color: "text-blue-700",   dot: "bg-blue-500" },
  { id: "Ignore",          label: "Ignore",          color: "text-gray-500",   dot: "bg-gray-300" },
  { id: "Needs Reply",     label: "Needs Reply",     color: "text-indigo-700", dot: "bg-indigo-500" },
  { id: "Low Priority",    label: "Low Priority",    color: "text-gray-500",   dot: "bg-gray-300" },
];

const IMPORTANCE_FILTERS = [
  { id: "All",       label: "All",       dot: "bg-gray-400" },
  { id: "important", label: "Important", dot: "bg-red-500" },
  { id: "medium",    label: "Medium",    dot: "bg-amber-400" },
  { id: "low",       label: "Low",       dot: "bg-gray-300" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function senderName(from: string): string {
  const m = from.match(/^(.*?)\s*<(.+?)>$/);
  const name = m ? m[1].trim().replace(/^["']|["']$/g, "") : from.trim();
  return name || from;
}
function senderInitial(from: string): string { return (senderName(from)[0] || "?").toUpperCase(); }
function avatarColor(name: string): string {
  const colors = ["#5c4ff6","#0b8a4d","#d44000","#1565c0","#6a1b9a","#00838f","#c62828","#2e7d32"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return colors[h % colors.length];
}
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr); const now = new Date();
    const diff = now.getTime() - d.getTime(); const days = Math.floor(diff / 86400000);
    if (days === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Yesterday";
    if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return dateStr; }
}
function priorityBadge(cat: PriorityCategory): string {
  const map: Record<PriorityCategory, string> = {
    Urgent: "bg-red-50 text-red-700 border-red-200",
    "Risk Detected": "bg-rose-50 text-rose-700 border-rose-200",
    "High-Value Lead": "bg-violet-50 text-violet-700 border-violet-200",
    Payment: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Support Issue": "bg-blue-50 text-blue-700 border-blue-200",
    "Needs Reply": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Low Priority": "bg-gray-50 text-gray-500 border-gray-200",
  };
  return map[cat] ?? "bg-gray-50 text-gray-500 border-gray-200";
}
function priorityDot(cat: PriorityCategory): string {
  const map: Record<PriorityCategory, string> = {
    Urgent: "bg-red-500", "Risk Detected": "bg-rose-500", "High-Value Lead": "bg-violet-500",
    Payment: "bg-emerald-500", "Support Issue": "bg-blue-500", "Needs Reply": "bg-indigo-500", "Low Priority": "bg-gray-300",
  };
  return map[cat] ?? "bg-gray-300";
}

function emailFrameDoc(msg: ThreadMessage, fallback: string): string {
  const content = msg.bodyHtml?.trim() || `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#202124;padding:0 0 18px">${(msg.bodyText || msg.body || fallback).replace(/\n/g, "<br>")}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;background:#fff;color:#202124;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6}body{padding:2px 0 18px;overflow-wrap:anywhere}img{max-width:100%!important;height:auto!important}a{color:#1a73e8}hr{border:0;border-top:1px solid #e8eaed;margin:18px 0}p{margin:0 0 12px}blockquote{margin:12px 0 12px 12px;padding-left:12px;border-left:3px solid #dadce0;color:#5f6368}</style></head><body>${content}</body></html>`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function BackIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>; }
function RefreshIcon({ spinning }: { spinning?: boolean }) { return <svg className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>; }
function StarIcon({ filled }: { filled?: boolean }) { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill={filled ? "#f4b400" : "none"} stroke={filled ? "#f4b400" : "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function TrashIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function ArchiveIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="5" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>; }
function ReplyIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>; }
function SparkleIcon() { return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>; }
function CloseIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>; }
function SendIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>; }

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = (params?.category as string) || "primary";
  const meta = CAT_META[category] ?? CAT_META.primary;

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [importanceFilter, setImportanceFilter] = useState<string>("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyTone, setReplyTone] = useState("Formal");
  const [replyDraft, setReplyDraft] = useState("");
  const [replyEditing, setReplyEditing] = useState("");
  const [replyGenerating, setReplyGenerating] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const [replyError, setReplyError] = useState("");

  const requestRef = useRef(0);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u); setAuthReady(true);
      if (!u) router.replace("/inbox");
    });
    return unsub;
  }, [router]);

  const getToken = useCallback(async () => {
    if (!user) return "";
    return user.getIdToken();
  }, [user]);

  const loadEmails = useCallback(async (append = false) => {
    if (!user) return;
    if (!append) { setLoading(true); setEmails([]); }
    else setLoadingMore(true);
    const token = await getToken();
    try {
      // "Waiting for Reply" uses its own dedicated endpoint backed by the FollowUp database
      if (category === "waiting") {
        const res = await fetch(`${API}/inbox/explore/waiting`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEmails(data.messages ?? []);
        }
        setNextPageToken(null);
        return;
      }

      const folder = meta.folder;
      const pageToken = append && nextPageToken ? `&pageToken=${nextPageToken}` : "";
      const res = await fetch(`${API}/inbox/messages?folder=${folder}&maxResults=50${pageToken}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        let msgs: EmailItem[] = data.messages ?? [];

        // Hot/Warm/Cold leads — filter the primary inbox emails client-side
        if (category === "hot") {
          msgs = msgs.filter(m => m.priorityCategory === "High-Value Lead" && m.isUnread);
        } else if (category === "warm") {
          msgs = msgs.filter(m => (m.intent === "Lead" || m.priorityCategory === "High-Value Lead") && !m.isUnread);
        } else if (category === "cold") {
          msgs = msgs.filter(m => m.intent === "Lead" && m.priorityCategory !== "High-Value Lead");
        }

        setEmails(prev => append ? [...prev, ...msgs] : msgs);
        setNextPageToken(data.nextPageToken ?? null);
      }
    } catch {}
    finally { setLoading(false); setLoadingMore(false); }
  }, [user, getToken, meta.folder, category, nextPageToken]);

  useEffect(() => {
    if (authReady && user) loadEmails();
  }, [authReady, user]);

  const openEmail = useCallback(async (email: EmailItem) => {
    const rid = ++requestRef.current;
    setSelectedEmail({ ...email, isUnread: false });
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isUnread: false } : e));
    setThread([]); setReplyOpen(false); setReplyDraft(""); setReplyEditing("");
    setReplySent(false); setReplyError(""); setThreadLoading(true);
    const token = await getToken();
    if (email.isUnread) {
      fetch(`${API}/inbox/mark-read/${email.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    try {
      const res = await fetch(`${API}/inbox/thread/${email.threadId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok && requestRef.current === rid) {
        const data = await res.json();
        setThread(data.messages ?? []);
      }
    } catch {}
    finally { if (requestRef.current === rid) setThreadLoading(false); }
  }, [getToken]);

  const handleStar = useCallback(async (email: EmailItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = await getToken();
    const newStarred = !email.isStarred;
    setEmails(prev => prev.map(em => em.id === email.id ? { ...em, isStarred: newStarred } : em));
    if (selectedEmail?.id === email.id) setSelectedEmail(s => s ? { ...s, isStarred: newStarred } : s);
    fetch(`${API}/inbox/star/${email.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ starred: newStarred }) }).catch(() => {});
  }, [getToken, selectedEmail]);

  const handleArchive = useCallback(async (email: EmailItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = await getToken();
    setEmails(prev => prev.filter(em => em.id !== email.id));
    if (selectedEmail?.id === email.id) setSelectedEmail(null);
    fetch(`${API}/inbox/archive/${email.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  }, [getToken, selectedEmail]);

  const handleTrash = useCallback(async (email: EmailItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = await getToken();
    setEmails(prev => prev.filter(em => em.id !== email.id));
    if (selectedEmail?.id === email.id) setSelectedEmail(null);
    fetch(`${API}/inbox/trash/${email.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  }, [getToken, selectedEmail]);

  const handleGenerateReply = useCallback(async () => {
    if (!selectedEmail || !thread.length) return;
    setReplyGenerating(true); setReplyDraft(""); setReplyEditing(""); setReplyError("");
    const token = await getToken();
    const threadText = thread.map(m => `From: ${m.from}\n${m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/reply/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: selectedEmail.subject, thread: threadText, tone: replyTone }),
      });
      const data = await res.json();
      if (res.ok && data.reply) { setReplyDraft(data.reply); setReplyEditing(data.reply); }
      else setReplyError("Failed to generate reply");
    } catch { setReplyError("Failed to generate reply"); }
    finally { setReplyGenerating(false); }
  }, [selectedEmail, thread, getToken, replyTone]);

  const handleSendReply = useCallback(async () => {
    if (!selectedEmail || !replyEditing.trim()) return;
    setReplySending(true); setReplyError("");
    const token = await getToken();
    try {
      const form = new FormData();
      form.append("threadId", selectedEmail.threadId);
      form.append("to", selectedEmail.from);
      form.append("subject", `Re: ${selectedEmail.subject}`);
      form.append("body", replyEditing);
      const res = await fetch(`${API}/inbox/reply/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) { setReplySent(true); setReplyOpen(false); }
      else setReplyError("Failed to send");
    } catch { setReplyError("Failed to send"); }
    finally { setReplySending(false); }
  }, [selectedEmail, replyEditing, getToken]);

  // Apply filters
  const filteredEmails = emails.filter(em => {
    if (readFilter === "read" && em.isUnread) return false;
    if (readFilter === "unread" && !em.isUnread) return false;
    if (meta.filterType === "priority" && priorityFilter !== "All") {
      if (priorityFilter === "Ignore") {
        if (!(em.priorityCategory === "Low Priority" && (em.intent === "FYI" || em.intent === "Spam"))) return false;
      } else {
        if (em.priorityCategory !== priorityFilter) return false;
      }
    }
    if (meta.filterType === "importance" && importanceFilter !== "All") {
      const IMPORTANT_CATS: PriorityCategory[] = ["Urgent", "Risk Detected", "High-Value Lead", "Payment"];
      const MEDIUM_CATS: PriorityCategory[] = ["Support Issue", "Needs Reply"];
      if (importanceFilter === "important" && !IMPORTANT_CATS.includes(em.priorityCategory)) return false;
      if (importanceFilter === "medium" && !MEDIUM_CATS.includes(em.priorityCategory)) return false;
      if (importanceFilter === "low" && em.priorityCategory !== "Low Priority") return false;
    }
    return true;
  });

  const showNoFilters = meta.filterType === "none";
  const showPriorityFilters = meta.filterType === "priority";
  const showImportanceFilters = meta.filterType === "importance";
  const TONES = ["Formal", "Casual", "Sales", "Empathetic", "Short"];

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin"/></div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* ── Filter Sidebar ─────────────────────────────────────── */}
      {!showNoFilters && (
        <aside className={`${sidebarOpen ? "w-52" : "w-0 overflow-hidden"} transition-all duration-300 shrink-0 flex flex-col bg-white border-r border-gray-100`}>
          <div className="px-4 pt-5 pb-3 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Filters</p>
          </div>

          {/* Read/Unread */}
          <div className="px-3 pt-4 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">Status</p>
            {(["all", "unread", "read"] as const).map(f => (
              <button
                key={f}
                onClick={() => setReadFilter(f)}
                className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold mb-0.5 transition ${readFilter === f ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 mx-3" />

          {/* Priority */}
          {showPriorityFilters && (
            <div className="px-3 pt-3 pb-4 flex-1 overflow-y-auto">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">Priority</p>
              {PRIORITY_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setPriorityFilter(f.id)}
                  className={`w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold mb-0.5 transition ${priorityFilter === f.id ? "bg-violet-600 text-white" : `${f.color} hover:bg-gray-100`}`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${priorityFilter === f.id ? "bg-white" : f.dot}`} />
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Importance */}
          {showImportanceFilters && (
            <div className="px-3 pt-3 pb-4 flex-1 overflow-y-auto">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">Importance</p>
              {IMPORTANCE_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setImportanceFilter(f.id)}
                  className={`w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold mb-0.5 transition ${importanceFilter === f.id ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${importanceFilter === f.id ? "bg-white" : f.dot}`} />
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </aside>
      )}

      {/* ── Main Column ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100 shrink-0">
          {/* Breadcrumb */}
          <Link href="/inbox/analyze" className="text-gray-400 hover:text-gray-700 transition text-sm">
            Analyze
          </Link>
          <span className="text-gray-300 text-sm">/</span>
          <Link href="/inbox/analyze/explore" className="text-gray-400 hover:text-gray-700 transition text-sm">
            Email Universe
          </Link>
          <span className="text-gray-300 text-sm">/</span>
          <span className="text-sm font-bold text-gray-800">{meta.icon} {meta.label}</span>
          <div className="ml-auto flex items-center gap-2">
            {!showNoFilters && (
              <button
                onClick={() => setSidebarOpen(o => !o)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 border border-gray-200 transition"
              >
                {sidebarOpen ? "Hide filters" : "Filters"}
              </button>
            )}
            <button onClick={() => loadEmails()} disabled={loading} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 border border-gray-200 transition disabled:opacity-50">
              <RefreshIcon spinning={loading} /> Refresh
            </button>
          </div>
        </div>

        {/* Read/Unread tabs (no-filter categories) */}
        {showNoFilters && (
          <div className="flex gap-1 px-4 py-2.5 bg-white border-b border-gray-100 shrink-0">
            {(["all", "unread", "read"] as const).map(f => (
              <button
                key={f}
                onClick={() => setReadFilter(f)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${readFilter === f ? "bg-violet-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400 self-center">{filteredEmails.length} emails</span>
          </div>
        )}

        {/* Body: email list + detail */}
        <div className="flex flex-1 overflow-hidden">
          {/* Email list */}
          <div className={`${selectedEmail ? "hidden sm:flex" : "flex"} w-full sm:w-[340px] flex-col border-r border-gray-100 bg-white overflow-hidden shrink-0`}>
            {!showNoFilters && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                <span className="text-xs text-gray-400">{filteredEmails.length} emails</span>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-full" />
                      <div className="h-2.5 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : filteredEmails.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">No emails found</div>
              ) : (
                filteredEmails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => openEmail(email)}
                    className={`flex items-start gap-2.5 px-4 py-3 border-b border-gray-100 cursor-pointer transition group relative ${
                      selectedEmail?.id === email.id ? "bg-[#eeebff]" : email.isUnread ? "bg-white hover:bg-[#f8f7ff]" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {email.isUnread && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-indigo-500" />}
                    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-black mt-0.5" style={{ background: avatarColor(senderName(email.from)) }}>
                      {senderInitial(email.from)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs truncate ${email.isUnread ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>{senderName(email.from)}</span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <span className="text-[10px] text-gray-400 group-hover:hidden">{formatDate(email.date)}</span>
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button onClick={e => handleStar(email, e)} className={`p-0.5 rounded transition ${email.isStarred ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}><StarIcon filled={email.isStarred}/></button>
                            <button onClick={e => handleArchive(email, e)} className="p-0.5 rounded text-gray-300 hover:text-indigo-500 transition"><ArchiveIcon/></button>
                            <button onClick={e => handleTrash(email, e)} className="p-0.5 rounded text-gray-300 hover:text-red-500 transition"><TrashIcon/></button>
                          </div>
                        </div>
                      </div>
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[9px] font-black ${priorityBadge(email.priorityCategory)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${priorityDot(email.priorityCategory)}`}/>
                          {email.priorityCategory}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${email.isUnread ? "font-semibold text-gray-800" : "text-gray-600"}`}>{email.subject}</p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{email.snippet}</p>
                    </div>
                  </div>
                ))
              )}
              {nextPageToken && !loading && (
                <button onClick={() => loadEmails(true)} disabled={loadingMore} className="w-full py-3 text-xs text-indigo-600 font-semibold hover:bg-gray-50 transition disabled:opacity-50">
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
            </div>
          </div>

          {/* Email detail panel */}
          {selectedEmail ? (
            <div className="flex flex-1 flex-col overflow-hidden bg-white">
              {/* Email header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 shrink-0">
                <button onClick={() => setSelectedEmail(null)} className="sm:hidden flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition mr-1">
                  <BackIcon/>
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-gray-900 truncate">{selectedEmail.subject}</h2>
                  <p className="text-xs text-gray-500">from {selectedEmail.from}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={e => handleStar(selectedEmail, e)} className={`p-1.5 rounded-lg transition ${selectedEmail.isStarred ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}><StarIcon filled={selectedEmail.isStarred}/></button>
                  <button onClick={e => handleArchive(selectedEmail, e)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"><ArchiveIcon/></button>
                  <button onClick={e => handleTrash(selectedEmail, e)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><TrashIcon/></button>
                </div>
              </div>

              {/* Priority & intent badges */}
              <div className="flex items-center gap-2 px-5 py-2 border-b border-gray-50 shrink-0">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${priorityBadge(selectedEmail.priorityCategory)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${priorityDot(selectedEmail.priorityCategory)}`}/>
                  {selectedEmail.priorityCategory}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{selectedEmail.intent}</span>
                {selectedEmail.aiRescued && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-black text-violet-700"><SparkleIcon/>AI Rescued</span>
                )}
              </div>

              {/* Thread messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {threadLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin"/>
                  </div>
                ) : thread.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">Loading thread…</div>
                ) : (
                  thread.map((msg, i) => (
                    <div key={msg.id} className={`rounded-2xl border overflow-hidden ${i === thread.length - 1 ? "border-gray-200 shadow-sm" : "border-gray-100"}`}>
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0" style={{ background: avatarColor(senderName(msg.from)) }}>
                          {senderInitial(msg.from)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{senderName(msg.from)}</p>
                          <p className="text-[10px] text-gray-400">{formatDate(msg.date)}</p>
                        </div>
                      </div>
                      <div className="bg-white">
                        <iframe
                          title={`msg-${msg.id}`}
                          srcDoc={emailFrameDoc(msg, selectedEmail.snippet)}
                          sandbox=""
                          referrerPolicy="no-referrer"
                          className="h-[55vh] min-h-[260px] w-full rounded-b-2xl border-0"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Panel */}
              {category !== "sent" && category !== "drafts" && category !== "trash" && (
                <div className="shrink-0 border-t border-gray-100 bg-gray-50">
                  {!replyOpen ? (
                    <div className="px-5 py-3 flex items-center gap-2">
                      <button
                        onClick={() => setReplyOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-violet-300 hover:text-violet-700 transition shadow-sm"
                      >
                        <ReplyIcon/> Reply
                      </button>
                      {replySent && <span className="text-xs text-emerald-600 font-semibold">✓ Reply sent</span>}
                    </div>
                  ) : (
                    <div className="px-5 py-4 space-y-3">
                      {/* Tone selector */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mr-1">Tone:</span>
                        {TONES.map(t => (
                          <button key={t} onClick={() => setReplyTone(t)} className={`rounded-lg px-2.5 py-1 text-xs font-bold transition border ${replyTone === t ? "bg-violet-600 border-violet-600 text-white" : "border-gray-200 text-gray-500 hover:border-violet-300"}`}>{t}</button>
                        ))}
                      </div>
                      {/* Generate button */}
                      {!replyDraft && (
                        <button
                          onClick={handleGenerateReply}
                          disabled={replyGenerating || !thread.length}
                          className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-bold text-white transition disabled:opacity-60"
                        >
                          {replyGenerating ? <><div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin"/>Generating…</> : <><SparkleIcon/>Generate Reply</>}
                        </button>
                      )}
                      {/* Edit area */}
                      {replyDraft && (
                        <>
                          <textarea
                            value={replyEditing}
                            onChange={e => setReplyEditing(e.target.value)}
                            rows={5}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSendReply}
                              disabled={replySending || !replyEditing.trim()}
                              className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 transition disabled:opacity-50"
                            >
                              <SendIcon/>{replySending ? "Sending…" : "Send"}
                            </button>
                            <button onClick={() => { setReplyDraft(""); setReplyEditing(""); }} className="text-xs text-gray-400 hover:text-gray-600 transition">Regenerate</button>
                            <button onClick={() => setReplyOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600 transition"><CloseIcon/></button>
                          </div>
                        </>
                      )}
                      {replyError && <p className="text-xs text-red-500">{replyError}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex flex-1 items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-4xl mb-3">{meta.icon}</p>
                <p className="text-sm font-semibold text-gray-400">{meta.label}</p>
                <p className="text-xs text-gray-300 mt-1">Select an email to read it</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
