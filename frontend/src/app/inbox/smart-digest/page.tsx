"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import ComposeModal from "@/components/ComposeModal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type DigestCategory = "promotions" | "social";
type PriorityCategory = "Urgent" | "High-Value Lead" | "Payment" | "Support Issue" | "Risk Detected" | "Needs Reply" | "Low Priority";

interface EmailItem {
  id: string; threadId: string; subject: string; from: string;
  date: string; snippet: string; summary: string; intent: string;
  priorityCategory: PriorityCategory; priorityScore: number;
  priorityReason: string; suggestedAction: string; riskLevel: "High" | "Medium" | "Low";
  bestTone: string; isUnread: boolean; isStarred: boolean;
  gmailCategory?: string; aiRescued?: boolean;
}
interface ThreadMessage {
  id: string; subject: string; from: string; to?: string;
  cc?: string; date: string; body: string; bodyText?: string; bodyHtml?: string;
}
interface ActionPlan {
  summary: string; intent: string; priority: string;
  recommendedAction: string; risk: string; bestTone: string; suggestedNextStep: string;
}

function senderName(from: string): string {
  const match = from.match(/^(.*?)\s*<(.+?)>$/);
  const name = (match ? match[1] : from).trim().replace(/^["']|["']$/g, "");
  if (name.includes("@") && !match) return name.split("@")[0] || name;
  return name || from;
}
function senderEmail(from: string): string {
  const m = from.match(/<(.+?)>/);
  return (m ? m[1] : from).trim();
}
function senderInitial(from: string) { return (senderName(from)[0] || "?").toUpperCase(); }
function avatarColor(s: string): string {
  const colors = ["#5c4ff6","#0b8a4d","#d44000","#1565c0","#6a1b9a","#00838f","#c62828","#2e7d32"];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return colors[h % colors.length];
}
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr); const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (days === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Yesterday";
    if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return dateStr; }
}
function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) + ", " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return dateStr; }
}

function priorityStyle(cat?: PriorityCategory) {
  const styles: Record<string, { badge: string; dot: string; panel: string; text: string }> = {
    "Urgent":         { badge: "bg-red-50 text-red-700 border-red-200",     dot: "bg-red-500",    panel: "bg-red-50 border-red-100",    text: "text-red-700" },
    "Risk Detected":  { badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", panel: "bg-orange-50 border-orange-100", text: "text-orange-700" },
    "High-Value Lead":{ badge: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500", panel: "bg-violet-50 border-violet-100", text: "text-violet-700" },
    "Payment":        { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", panel: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" },
    "Support Issue":  { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", panel: "bg-amber-50 border-amber-100", text: "text-amber-700" },
    "Needs Reply":    { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", panel: "bg-indigo-50 border-indigo-100", text: "text-indigo-700" },
    "Low Priority":   { badge: "bg-gray-50 text-gray-500 border-gray-200",   dot: "bg-gray-300",   panel: "bg-gray-50 border-gray-100",  text: "text-gray-500" },
  };
  return styles[cat ?? "Low Priority"] ?? styles["Low Priority"];
}

function intentBadge(intent: string) {
  const map: Record<string, string> = {
    Lead: "bg-violet-100 text-violet-700", Support: "bg-amber-100 text-amber-700",
    Payment: "bg-emerald-100 text-emerald-700", Meeting: "bg-blue-100 text-blue-700",
    Spam: "bg-red-100 text-red-700", FYI: "bg-gray-100 text-gray-500",
  };
  return map[intent] ?? map.FYI;
}

function emailFrameDoc(msg: ThreadMessage): string {
  const content = msg.bodyHtml?.trim() || `<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">${(msg.bodyText || msg.body || "").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`;
  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;background:#fff;color:#202124;font-family:Arial,sans-serif;font-size:14px;line-height:1.6}body{padding:2px 0 18px}img{max-width:100%!important;height:auto!important}a{color:#1a73e8}</style></head><body>${content}</body></html>`;
}

function normalizeEmail(item: any): EmailItem {
  return {
    id: item.id, threadId: item.threadId, subject: item.subject || "(no subject)",
    from: item.from || "", date: item.date || "", snippet: item.snippet || "",
    summary: item.summary ?? (item.snippet || "").slice(0, 120),
    intent: item.intent ?? "FYI", priorityCategory: item.priorityCategory ?? "Low Priority",
    priorityScore: item.priorityScore ?? 38, priorityReason: item.priorityReason ?? "",
    suggestedAction: item.suggestedAction ?? "", riskLevel: item.riskLevel ?? "Low",
    bestTone: item.bestTone ?? "Neutral", isUnread: item.isUnread ?? false,
    isStarred: item.isStarred ?? false, gmailCategory: item.gmailCategory, aiRescued: item.aiRescued ?? false,
  };
}

function parseSmartReplies(raw: string): string[] {
  return raw.split("|||").map(s => s.trim()).filter(s => s.length > 8).slice(0, 5);
}

const TONES = ["Formal","Friendly","Direct","Empathetic","Sales"];

function BackIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>; }
function RefreshIcon({ spinning }: { spinning?: boolean }) { return <svg className={`h-4 w-4 ${spinning?"animate-spin":""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>; }
function SparkleIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>; }
function ReplyIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>; }
function TrashIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function ArchiveIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="5" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>; }
function StarIcon({ filled }: { filled?: boolean }) { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill={filled?"#f4b400":"none"} stroke={filled?"#f4b400":"currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function ChevronDown() { return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>; }
function SendIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>; }
function ComposeIcon2() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }

export default function SmartDigestPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [category, setCategory] = useState<DigestCategory>("promotions");
  const [emails, setEmails] = useState<Record<DigestCategory, EmailItem[]>>({ promotions: [], social: [] });
  const [loading, setLoading] = useState<Record<DigestCategory, boolean>>({ promotions: false, social: false });
  const [nextPageToken, setNextPageToken] = useState<Record<DigestCategory, string | null>>({ promotions: null, social: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedCategories, setLoadedCategories] = useState<Set<DigestCategory>>(new Set());

  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);

  const [aiSummary, setAiSummary] = useState("");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [smartRepliesLoading, setSmartRepliesLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyTone, setReplyTone] = useState("Formal");
  const [customInstruction, setCustomInstruction] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [editedReply, setEditedReply] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [replyError, setReplyError] = useState("");

  const [composeOpen, setComposeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "email">("list");

  const tokenRef = useRef("");
  const requestIdRef = useRef(0);

  useEffect(() => {
    let auth: ReturnType<typeof getFirebaseAuth>;
    try { auth = getFirebaseAuth(); } catch { router.replace("/login"); return; }
    const unsub = onAuthStateChanged(auth, async u => {
      setAuthLoading(false);
      if (!u) { router.replace("/login"); return; }
      setUser(u);
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

  const fetchEmails = useCallback(async (cat: DigestCategory, pageToken?: string) => {
    const token = tokenRef.current || await getToken();
    if (!token) return;
    if (!pageToken) {
      setLoading(prev => ({ ...prev, [cat]: true }));
    } else {
      setLoadingMore(true);
    }
    try {
      const params = new URLSearchParams({ folder: cat, maxResults: "50" });
      if (pageToken) params.set("pageToken", pageToken);
      const res = await fetch(`${API}/inbox/messages?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load emails");
      const data = await res.json();
      const items: EmailItem[] = (data.messages ?? []).map(normalizeEmail);
      setEmails(prev => ({
        ...prev,
        [cat]: pageToken ? [...(prev[cat] ?? []), ...items] : items,
      }));
      setNextPageToken(prev => ({ ...prev, [cat]: data.nextPageToken ?? null }));
      setLoadedCategories(prev => new Set([...prev, cat]));
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(prev => ({ ...prev, [cat]: false }));
      setLoadingMore(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (user) fetchEmails("promotions");
  }, [user, fetchEmails]);

  useEffect(() => {
    if (user && category === "social" && !loadedCategories.has("social")) {
      fetchEmails("social");
    }
  }, [user, category, loadedCategories, fetchEmails]);

  async function openEmail(email: EmailItem) {
    const reqId = ++requestIdRef.current;
    setSelectedEmail(email);
    setThreadMessages([]);
    setAiSummary("");
    setSmartReplies([]);
    setActionPlan(null);
    setGeneratedReply(""); setEditedReply("");
    setSendSuccess(false); setReplyOpen(false);
    setMobileView("email");
    setThreadLoading(true);
    const token = await getToken();
    try {
      const res = await fetch(`${API}/inbox/thread/${email.threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && requestIdRef.current === reqId) {
        const data = await res.json();
        const msgs: ThreadMessage[] = data.messages ?? [];
        setThreadMessages(msgs);
        void loadActionPlan(email, msgs, token, reqId);
        void generateSmartReplies(email, msgs, token, reqId);
      }
    } catch {} finally {
      if (requestIdRef.current === reqId) setThreadLoading(false);
    }
  }

  async function loadActionPlan(email: EmailItem, messages: ThreadMessage[], token: string, reqId: number) {
    if (!messages.length) return;
    setActionPlanLoading(true);
    const threadText = messages.map(m => `From: ${m.from}\nDate: ${m.date}\n${m.bodyText || m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/action-plan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject, from: email.from, snippet: email.snippet, intent: email.intent, priorityCategory: email.priorityCategory, thread: threadText }),
      });
      const data = await res.json();
      if (res.ok && requestIdRef.current === reqId) setActionPlan(data.actionPlan ?? null);
    } catch {} finally {
      if (requestIdRef.current === reqId) setActionPlanLoading(false);
    }
  }

  async function generateSmartReplies(email: EmailItem, messages: ThreadMessage[], token: string, reqId: number) {
    if (!messages.length) return;
    setSmartRepliesLoading(true);
    const threadText = messages.map(m => `From: ${m.from}\n${m.bodyText || m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/reply/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject, thread: threadText, tone: "short", instruction: "Generate 5 distinct, ready-to-send reply suggestions. Each 1-3 sentences. Separate with |||. No numbering." }),
      });
      const data = await res.json();
      if (res.ok && requestIdRef.current === reqId) setSmartReplies(parseSmartReplies(data.reply ?? ""));
    } catch {} finally {
      if (requestIdRef.current === reqId) setSmartRepliesLoading(false);
    }
  }

  async function handleSummarize() {
    if (!selectedEmail || !threadMessages.length) return;
    setAiSummaryLoading(true); setAiSummary("");
    const token = await getToken();
    const threadText = threadMessages.map(m => `From: ${m.from}\n${m.bodyText || m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/reply/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: selectedEmail.subject, thread: threadText, tone: "analytical", instruction: "Summarize this email thread in 3-5 bullet points. Each bullet should be a key fact, decision, or action item. Start each bullet with '•'." }),
      });
      const data = await res.json();
      if (res.ok) setAiSummary(data.reply ?? "");
    } catch {} finally { setAiSummaryLoading(false); }
  }

  async function handleGenerateReply() {
    if (!selectedEmail) return;
    setGenerating(true); setGeneratedReply(""); setEditedReply(""); setReplyError("");
    const token = await getToken();
    const threadText = threadMessages.map(m => `From: ${m.from}\n${m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/reply/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: selectedEmail.subject, thread: threadText, tone: replyTone, instruction: customInstruction || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setGeneratedReply(data.reply ?? ""); setEditedReply(data.reply ?? "");
    } catch (e: any) { setReplyError(e.message); } finally { setGenerating(false); }
  }

  async function handleSend() {
    if (!selectedEmail || !editedReply.trim()) return;
    setSending(true); setSendSuccess(false);
    const token = await getToken();
    const lastMsg = threadMessages[threadMessages.length - 1];
    try {
      const fd = new FormData();
      fd.append("to", senderEmail(selectedEmail.from));
      fd.append("subject", selectedEmail.subject);
      fd.append("body", editedReply);
      fd.append("threadId", selectedEmail.threadId);
      if (lastMsg?.id) fd.append("inReplyTo", lastMsg.id);
      const res = await fetch(`${API}/inbox/reply/send`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed to send"); }
      setSendSuccess(true); setEditedReply(""); setGeneratedReply(""); setReplyOpen(false);
    } catch (e: any) { setReplyError(e.message); } finally { setSending(false); }
  }

  async function handleTrash(email: EmailItem, e?: React.MouseEvent) {
    e?.stopPropagation();
    const token = await getToken();
    setEmails(prev => ({ ...prev, [category]: prev[category].filter(em => em.id !== email.id) }));
    if (selectedEmail?.id === email.id) { setSelectedEmail(null); setMobileView("list"); }
    try { await fetch(`${API}/inbox/trash/${email.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch {}
  }

  async function handleArchive(email: EmailItem, e?: React.MouseEvent) {
    e?.stopPropagation();
    const token = await getToken();
    setEmails(prev => ({ ...prev, [category]: prev[category].filter(em => em.id !== email.id) }));
    if (selectedEmail?.id === email.id) { setSelectedEmail(null); setMobileView("list"); }
    try { await fetch(`${API}/inbox/archive/${email.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch {}
  }

  async function handleStar(email: EmailItem, e?: React.MouseEvent) {
    e?.stopPropagation();
    const token = await getToken();
    const newStarred = !email.isStarred;
    setEmails(prev => ({
      ...prev,
      [category]: prev[category].map(em => em.id === email.id ? { ...em, isStarred: newStarred } : em)
    }));
    if (selectedEmail?.id === email.id) setSelectedEmail(s => s ? { ...s, isStarred: newStarred } : s);
    try { await fetch(`${API}/inbox/star/${email.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ starred: newStarred }) }); } catch {}
  }

  const activeEmails = emails[category] ?? [];
  const filtered = search.trim() ? activeEmails.filter(e => e.subject.toLowerCase().includes(search.toLowerCase()) || senderName(e.from).toLowerCase().includes(search.toLowerCase()) || e.snippet.toLowerCase().includes(search.toLowerCase())) : activeEmails;
  const isLoading = loading[category];

  const catConfig = {
    promotions: { label: "Promotions", color: "text-amber-600", bg: "bg-amber-500", lightBg: "bg-amber-50", border: "border-amber-200", icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, desc: "Deals, newsletters, and marketing emails" },
    social: { label: "Social", color: "text-blue-600", bg: "bg-blue-500", lightBg: "bg-blue-50", border: "border-blue-200", icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, desc: "Notifications from social networks & communities" },
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" /></div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/inbox/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-all shrink-0">
            <BackIcon /> Back
          </Link>
          <div className="w-px h-5 bg-gray-200 shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg,#5c4ff6,#7c3aed)" }}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.74-9.7A2.5 2.5 0 0 1 7.76 6.7L9.5 6"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.74-9.7a2.5 2.5 0 0 0-1.96-2.86L14.5 6"/></svg>
            </div>
            <div>
              <span className="font-black text-gray-900 text-sm">Smart Digest</span>
              <span className="text-gray-400 text-xs ml-2 hidden sm:inline">{catConfig[category].desc}</span>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 ml-4 bg-gray-100 rounded-xl p-1 shrink-0">
            {(["promotions","social"] as DigestCategory[]).map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${category === cat ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <span className={category === cat ? catConfig[cat].color : "text-gray-400"}>{catConfig[cat].icon}</span>
                {catConfig[cat].label}
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${category === cat ? `${catConfig[cat].lightBg} ${catConfig[cat].color}` : "bg-gray-200 text-gray-500"}`}>
                  {(emails[cat] ?? []).length || "—"}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-violet-300 focus-within:bg-white transition-all">
              <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search digest..." className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 text-gray-800" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button onClick={() => fetchEmails(category)} disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50">
              <RefreshIcon spinning={isLoading} /> Refresh
            </button>
            <button onClick={() => setComposeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#5c4ff6,#7c3aed)" }}>
              <ComposeIcon2 /> Compose
            </button>
            {user?.email && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: avatarColor(user.email) }}>
                {user.email[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body (below top bar) ──────────────────────────────────────── */}
      <div className="flex flex-1 pt-14 overflow-hidden">

        {/* Email list */}
        <div className={`${selectedEmail && mobileView === "email" ? "hidden sm:flex" : "flex"} w-full sm:w-[340px] md:w-[380px] flex-col border-r border-gray-100 bg-white shrink-0 overflow-hidden`}>

          {/* Category summary header */}
          <div className={`px-4 py-3 border-b border-gray-50 ${catConfig[category].lightBg} shrink-0`}>
            <div className="flex items-center gap-2">
              <span className={catConfig[category].color}>{catConfig[category].icon}</span>
              <span className={`text-sm font-black ${catConfig[category].color}`}>{catConfig[category].label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${catConfig[category].lightBg} ${catConfig[category].color} border ${catConfig[category].border}`}>
                {filtered.length} emails
              </span>
              {filtered.some(e => e.aiRescued) && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-violet-100 text-violet-700 flex items-center gap-1">
                  <SparkleIcon /> {filtered.filter(e => e.aiRescued).length} AI rescued
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{catConfig[category].desc}</p>
          </div>

          {/* Email list scroll */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (emails[category] ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
                <p className="text-sm text-gray-400">Loading {catConfig[category].label}…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${catConfig[category].lightBg}`}>
                  <span className={catConfig[category].color}>{catConfig[category].icon}</span>
                </div>
                <p className="font-bold text-gray-700">No {catConfig[category].label.toLowerCase()} emails</p>
                <p className="text-xs text-gray-400">{search ? "No results match your search." : `Your ${catConfig[category].label.toLowerCase()} folder is empty.`}</p>
              </div>
            ) : (
              <>
                {filtered.map(email => {
                  const ps = priorityStyle(email.priorityCategory);
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <button
                      key={email.id}
                      onClick={() => openEmail(email)}
                      className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-all ${isSelected ? "bg-violet-50 border-l-2 border-l-violet-500" : "hover:bg-gray-50"}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 mt-0.5" style={{ background: avatarColor(email.from) }}>
                          {senderInitial(email.from)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-xs font-black truncate flex-1 ${email.isUnread ? "text-gray-900" : "text-gray-600"}`}>
                              {senderName(email.from)}
                            </span>
                            {email.isUnread && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
                            <span className="text-[10px] text-gray-400 shrink-0">{formatDate(email.date)}</span>
                          </div>
                          <p className={`text-xs truncate mb-1 ${email.isUnread ? "font-bold text-gray-800" : "font-medium text-gray-600"}`}>
                            {email.subject}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate leading-snug">{email.snippet}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${ps.badge}`}>
                              {email.priorityCategory}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${intentBadge(email.intent)}`}>
                              {email.intent}
                            </span>
                            {email.aiRescued && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600 flex items-center gap-0.5">
                                <SparkleIcon /> AI
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <button onClick={e => handleStar(email, e)} className="text-gray-300 hover:text-yellow-400 transition-colors">
                            <StarIcon filled={email.isStarred} />
                          </button>
                          <button onClick={e => handleTrash(email, e)} className="text-gray-200 hover:text-red-400 transition-colors">
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Load more */}
                {nextPageToken[category] && (
                  <div className="p-4 text-center">
                    <button onClick={() => fetchEmails(category, nextPageToken[category]!)} disabled={loadingMore}
                      className="text-xs font-bold text-violet-600 hover:text-violet-800 disabled:opacity-50 flex items-center gap-1.5 mx-auto">
                      {loadingMore ? <><RefreshIcon spinning /> Loading…</> : "Load more emails"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Email detail panel */}
        <div className={`${!selectedEmail || mobileView === "list" ? "hidden sm:flex" : "flex"} flex-1 flex-col overflow-hidden bg-white`}>
          {!selectedEmail ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(92,79,246,0.1),rgba(124,58,237,0.1))" }}>
                <svg className="h-7 w-7 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.74-9.7A2.5 2.5 0 0 1 7.76 6.7L9.5 6"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.74-9.7a2.5 2.5 0 0 0-1.96-2.86L14.5 6"/></svg>
              </div>
              <div>
                <p className="font-black text-gray-700 text-lg">Smart Digest</p>
                <p className="text-sm text-gray-400 mt-1">Select an email from the list to read it with full AI features</p>
              </div>
              <div className="flex gap-2 mt-2">
                {(["promotions","social"] as DigestCategory[]).map(cat => (
                  <div key={cat} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${catConfig[cat].lightBg} ${catConfig[cat].color} border ${catConfig[cat].border}`}>
                    {catConfig[cat].label}: {(emails[cat]??[]).length}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">

              {/* Email header */}
              <div className={`px-5 py-4 border-b border-gray-100 shrink-0 ${priorityStyle(selectedEmail.priorityCategory).panel} border-l-4 border-l-${selectedEmail.priorityCategory === "Urgent" || selectedEmail.priorityCategory === "Risk Detected" ? "red" : "violet"}-400`}
                style={{ borderLeftColor: selectedEmail.priorityCategory === "Urgent" ? "#ef4444" : selectedEmail.priorityCategory === "Risk Detected" ? "#f97316" : selectedEmail.priorityCategory === "High-Value Lead" ? "#8b5cf6" : "#6b7280" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-black text-gray-900 text-base leading-snug">{selectedEmail.subject}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-gray-600">{senderName(selectedEmail.from)}</span>
                      <span className="text-xs text-gray-400">&lt;{senderEmail(selectedEmail.from)}&gt;</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateLong(selectedEmail.date)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setMobileView("list")} className="sm:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-all">
                      <BackIcon />
                    </button>
                    <button onClick={e => handleStar(selectedEmail, e)} className={`p-2 rounded-xl transition-all ${selectedEmail.isStarred ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}>
                      <StarIcon filled={selectedEmail.isStarred} />
                    </button>
                    <button onClick={e => handleArchive(selectedEmail, e)} className="p-2 rounded-xl text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                      <ArchiveIcon />
                    </button>
                    <button onClick={e => handleTrash(selectedEmail, e)} className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${priorityStyle(selectedEmail.priorityCategory).badge}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${priorityStyle(selectedEmail.priorityCategory).dot}`} />
                    {selectedEmail.priorityCategory}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${intentBadge(selectedEmail.intent)}`}>{selectedEmail.intent}</span>
                  <span className="text-xs text-gray-400 font-medium">Score: {selectedEmail.priorityScore}/100</span>
                  {selectedEmail.aiRescued && <span className="text-xs font-bold px-2 py-1 rounded-lg bg-violet-50 text-violet-600 flex items-center gap-1"><SparkleIcon /> AI Rescued</span>}
                  <span className={`text-xs font-medium ml-auto ${catConfig[category].color}`}>{catConfig[category].label}</span>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">

                {/* Action plan */}
                {(actionPlanLoading || actionPlan) && (
                  <div className="mx-5 mt-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-lg bg-violet-500 flex items-center justify-center text-white"><SparkleIcon /></span>
                      <span className="text-xs font-black text-violet-700 uppercase tracking-wide">AI Action Plan</span>
                    </div>
                    {actionPlanLoading ? (
                      <div className="flex items-center gap-2 text-violet-400 text-sm"><div className="w-4 h-4 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" /> Analyzing…</div>
                    ) : actionPlan && (
                      <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                        {[
                          { label: "Summary", value: actionPlan.summary },
                          { label: "Recommended Action", value: actionPlan.recommendedAction },
                          { label: "Best Tone", value: actionPlan.bestTone },
                          { label: "Next Step", value: actionPlan.suggestedNextStep },
                        ].filter(f => f.value).map((f, i) => (
                          <div key={i} className="bg-white rounded-xl p-2.5 border border-violet-100">
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-wide mb-1">{f.label}</p>
                            <p className="text-gray-700 leading-relaxed">{f.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Smart reply suggestions */}
                {(smartRepliesLoading || smartReplies.length > 0) && (
                  <div className="mx-5 mt-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-2">Quick Replies</p>
                    {smartRepliesLoading ? (
                      <div className="flex items-center gap-2 text-gray-400 text-xs"><div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" /> Generating suggestions…</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {smartReplies.map((r, i) => (
                          <button key={i} onClick={() => { setEditedReply(r); setGeneratedReply(r); setReplyOpen(true); }}
                            className="text-xs px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all text-left max-w-xs">
                            {r.length > 80 ? r.slice(0, 80) + "…" : r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Summary */}
                <div className="mx-5 mt-3 flex items-center gap-2">
                  <button onClick={handleSummarize} disabled={aiSummaryLoading || !threadMessages.length}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-all disabled:opacity-50">
                    {aiSummaryLoading ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-violet-600 animate-spin" /> Summarizing…</> : <><SparkleIcon /> AI Summary</>}
                  </button>
                  <button onClick={() => setReplyOpen(r => !r)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-all">
                    <ReplyIcon /> {replyOpen ? "Hide Reply" : "Reply"}
                  </button>
                </div>

                {aiSummary && (
                  <div className="mx-5 mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wide mb-1.5">Summary</p>
                    <div className="text-xs text-gray-700 leading-relaxed space-y-1">
                      {aiSummary.split("\n").filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                  </div>
                )}

                {/* Reply composer */}
                {replyOpen && (
                  <div className="mx-5 mt-3 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                    <div className="px-4 py-3 bg-white border-b border-gray-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 font-medium">Tone:</span>
                        {TONES.map(t => (
                          <button key={t} onClick={() => setReplyTone(t)}
                            className={`text-xs px-2 py-1 rounded-lg font-medium transition-all ${replyTone === t ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                      <input
                        value={customInstruction}
                        onChange={e => setCustomInstruction(e.target.value)}
                        placeholder="Custom instruction (optional)…"
                        className="w-full mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-violet-300 text-gray-700 placeholder-gray-400"
                      />
                    </div>
                    <div className="p-4">
                      {generatedReply || editedReply ? (
                        <>
                          <textarea
                            value={editedReply}
                            onChange={e => setEditedReply(e.target.value)}
                            rows={6}
                            className="w-full text-sm border border-gray-200 rounded-xl p-3 outline-none focus:border-violet-300 resize-none text-gray-700 bg-white"
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={handleGenerateReply} disabled={generating}
                              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all">
                              <RefreshIcon spinning={generating} /> Regenerate
                            </button>
                            <button onClick={handleSend} disabled={sending || !editedReply.trim()}
                              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl text-white font-bold transition-all disabled:opacity-50 ml-auto"
                              style={{ background: "linear-gradient(135deg,#5c4ff6,#7c3aed)" }}>
                              {sending ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending…</> : <><SendIcon /> Send</>}
                            </button>
                          </div>
                        </>
                      ) : (
                        <button onClick={handleGenerateReply} disabled={generating}
                          className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl text-white transition-all disabled:opacity-70"
                          style={{ background: "linear-gradient(135deg,#5c4ff6,#7c3aed)" }}>
                          {generating ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Generating…</> : <><SparkleIcon /> Generate AI Reply</>}
                        </button>
                      )}
                      {sendSuccess && <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">✓ Reply sent successfully</p>}
                      {replyError && <p className="text-xs text-red-500 mt-2">{replyError}</p>}
                    </div>
                  </div>
                )}

                {/* Thread messages */}
                <div className="mx-5 mt-4 mb-6 space-y-3">
                  {threadLoading ? (
                    <div className="flex items-center gap-2 py-8 justify-center">
                      <div className="w-5 h-5 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
                      <span className="text-sm text-gray-400">Loading thread…</span>
                    </div>
                  ) : threadMessages.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">No messages loaded.</div>
                  ) : (
                    threadMessages.map((msg, i) => {
                      const isLast = i === threadMessages.length - 1;
                      return (
                        <div key={msg.id} className={`rounded-2xl border overflow-hidden ${isLast ? "border-gray-200 shadow-sm" : "border-gray-100"}`}>
                          <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ background: avatarColor(msg.from) }}>
                              {senderInitial(msg.from)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-gray-800">{senderName(msg.from)}</span>
                              {msg.to && <span className="text-[10px] text-gray-400 ml-1.5">→ {msg.to}</span>}
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">{formatDate(msg.date)}</span>
                          </div>
                          <div className="bg-white">
                            <iframe
                              srcDoc={emailFrameDoc(msg)}
                              className="w-full border-0"
                              style={{ minHeight: isLast ? 220 : 120 }}
                              onLoad={e => {
                                const iframe = e.target as HTMLIFrameElement;
                                try { iframe.style.height = (iframe.contentDocument?.body.scrollHeight ?? 220) + "px"; } catch {}
                              }}
                              sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {composeOpen && (
        <ComposeModal
          user={user}
          onClose={() => setComposeOpen(false)}
          onSent={() => setComposeOpen(false)}
          apiBase={API}
        />
      )}
    </div>
  );
}
