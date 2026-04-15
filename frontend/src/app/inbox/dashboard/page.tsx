"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { setLastActivePlatform } from "@/lib/platformSession";
import { PlatformSwitcher } from "@/components/PlatformSwitcher";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type IntentLabel = "Lead" | "Support" | "Payment" | "Meeting" | "Spam" | "FYI";

interface EmailThread {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  summary: string;
  intent: IntentLabel;
  isUnread: boolean;
}

interface ThreadMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
}

const INTENT_STYLES: Record<IntentLabel, string> = {
  Lead: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  Support: "text-red-400 bg-red-400/10 border-red-400/25",
  Payment: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  Meeting: "text-sky-400 bg-sky-400/10 border-sky-400/25",
  Spam: "text-zinc-500 bg-zinc-500/10 border-zinc-500/25",
  FYI: "text-zinc-400 bg-zinc-400/10 border-zinc-400/25",
};

const TONES = ["Formal", "Casual", "Sales", "Empathetic", "Short"];

function SparkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export default function InboxDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [threadsError, setThreadsError] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [activeThread, setActiveThread] = useState<EmailThread | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);

  const [tone, setTone] = useState("Formal");
  const [instruction, setInstruction] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [editedReply, setEditedReply] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [replyError, setReplyError] = useState("");

  const [mobileView, setMobileView] = useState<"list" | "thread" | "ai">("list");
  const [filterIntent, setFilterIntent] = useState<IntentLabel | "All">("All");

  const tokenRef = useRef<string>("");

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

  const fetchToken = useCallback(async () => {
    if (!user) return "";
    const t = await user.getIdToken();
    tokenRef.current = t;
    return t;
  }, [user]);

  const loadThreads = useCallback(async (pageToken?: string) => {
    const token = await fetchToken();
    if (!token) return;
    if (pageToken) setLoadingMore(true);
    else setThreadsLoading(true);
    setThreadsError("");
    try {
      const url = `${API}/inbox/messages?maxResults=20${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 403 || res.status === 401) {
        router.replace("/inbox/connect");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load inbox");
      if (pageToken) {
        setThreads((prev) => [...prev, ...(data.messages ?? [])]);
      } else {
        setThreads(data.messages ?? []);
      }
      setNextPageToken(data.nextPageToken ?? null);
    } catch (e: any) {
      setThreadsError(e.message);
    } finally {
      setThreadsLoading(false);
      setLoadingMore(false);
    }
  }, [fetchToken, router]);

  useEffect(() => {
    if (user) loadThreads();
  }, [user, loadThreads]);

  async function openThread(t: EmailThread) {
    setActiveThread(t);
    setThreadMessages([]);
    setGeneratedReply("");
    setEditedReply("");
    setSendSuccess(false);
    setReplyError("");
    setMobileView("thread");
    setThreadLoading(true);
    const token = await fetchToken();
    try {
      const res = await fetch(`${API}/inbox/thread/${t.threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load thread");
      setThreadMessages(data.messages ?? []);
    } catch (e: any) {
      setThreadMessages([]);
    } finally {
      setThreadLoading(false);
    }
  }

  async function handleGenerate() {
    if (!activeThread) return;
    setGenerating(true);
    setGeneratedReply("");
    setEditedReply("");
    setReplyError("");
    setSendSuccess(false);
    const token = await fetchToken();
    const threadText = threadMessages.map((m) => `From: ${m.from}\n${m.body}`).join("\n\n---\n\n");
    try {
      const res = await fetch(`${API}/inbox/reply/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: activeThread.subject, thread: threadText, tone, instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setGeneratedReply(data.reply ?? "");
      setEditedReply(data.reply ?? "");
    } catch (e: any) {
      setReplyError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend() {
    if (!activeThread || !editedReply.trim()) return;
    setSending(true);
    setSendSuccess(false);
    setReplyError("");
    const token = await fetchToken();
    const lastMsg = threadMessages[threadMessages.length - 1];
    const toAddress = activeThread.from;
    try {
      const res = await fetch(`${API}/inbox/reply/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          to: toAddress,
          subject: activeThread.subject,
          body: editedReply,
          threadId: activeThread.threadId,
          inReplyTo: lastMsg?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSendSuccess(true);
      setEditedReply("");
      setGeneratedReply("");
    } catch (e: any) {
      setReplyError(e.message);
    } finally {
      setSending(false);
    }
  }

  const filteredThreads = filterIntent === "All"
    ? threads
    : threads.filter((t) => t.intent === filterIntent);

  function senderInitial(from: string) {
    const name = from.replace(/<.*?>/, "").trim();
    return name[0]?.toUpperCase() ?? "?";
  }

  function formatSender(from: string) {
    const match = from.match(/^(.*?)\s*<(.+?)>$/);
    return match ? match[1].trim() || match[2] : from;
  }

  function formatDate(dateStr: string) {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch { return dateStr; }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04030a]">
        <div className="h-8 w-8 rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#04030a] text-zinc-100 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-white/8 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/inbox" className="flex items-center gap-2 text-zinc-400 hover:text-white transition">
            <img src="/evara-logo.png" alt="Evara" className="h-6 w-6 object-contain opacity-70" />
            <span className="text-xs font-black uppercase tracking-[0.22em] hidden sm:block">Inbox AI</span>
          </Link>
          {user?.email && (
            <span className="hidden md:block text-[10px] text-zinc-600 border border-white/8 rounded-full px-2.5 py-1">
              {user.email}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadThreads()}
            disabled={threadsLoading}
            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/8 transition"
            title="Refresh"
          >
            <RefreshIcon spinning={threadsLoading} />
          </button>
          <Link
            href="/inbox/connect"
            className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition border border-white/8 rounded-full px-3 py-1.5"
          >
            Manage Gmail
          </Link>
          <PlatformSwitcher current="inbox" />
        </div>
      </header>

      {/* Mobile view tabs */}
      <div className="flex lg:hidden border-b border-white/8 shrink-0">
        {[
          { id: "list", label: "Inbox" },
          { id: "thread", label: "Email", disabled: !activeThread },
          { id: "ai", label: "AI Reply", disabled: !activeThread },
        ].map((tab) => (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => setMobileView(tab.id as any)}
            className={`flex-1 py-2.5 text-xs font-bold transition ${
              mobileView === tab.id
                ? "text-fuchsia-400 border-b-2 border-fuchsia-400"
                : "text-zinc-600 hover:text-zinc-300"
            } ${tab.disabled ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Thread list ───────────────────────────────────────────── */}
        <aside className={`${mobileView === "list" ? "flex" : "hidden"} lg:flex w-full lg:w-[300px] xl:w-[340px] shrink-0 flex-col border-r border-white/8 overflow-hidden`}>
          {/* Intent filter */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/8 overflow-x-auto scrollbar-hide">
            {(["All", "Lead", "Support", "Payment", "Meeting", "FYI", "Spam"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterIntent(f)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                  filterIntent === f
                    ? "bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-300"
                    : "border-white/8 text-zinc-600 hover:text-white hover:border-white/15"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {threadsLoading ? (
              <div className="flex flex-col gap-2 p-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-white/[0.03] p-3 animate-pulse">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-white/8" />
                      <div className="flex-1 h-3 rounded bg-white/8" />
                      <div className="w-8 h-2 rounded bg-white/5" />
                    </div>
                    <div className="h-2.5 rounded bg-white/5 mb-1.5" />
                    <div className="h-2 rounded bg-white/[0.03] w-3/4" />
                  </div>
                ))}
              </div>
            ) : threadsError ? (
              <div className="p-6 text-center">
                <p className="text-xs text-red-400 mb-3">{threadsError}</p>
                {threadsError.toLowerCase().includes("gmail") || threadsError.toLowerCase().includes("connection") ? (
                  <Link href="/inbox/connect" className="text-xs text-fuchsia-400 underline">Connect Gmail</Link>
                ) : (
                  <button onClick={() => loadThreads()} className="text-xs text-fuchsia-400 underline">Try again</button>
                )}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-zinc-600">No emails found</p>
              </div>
            ) : (
              <>
                {filteredThreads.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openThread(t)}
                    className={`w-full text-left px-3 py-3 border-b border-white/[0.04] transition hover:bg-white/[0.04] ${
                      activeThread?.id === t.id ? "bg-fuchsia-500/8 border-l-2 border-l-fuchsia-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-600 to-violet-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                        {senderInitial(t.from)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${t.isUnread ? "text-white" : "text-zinc-400"}`}>
                            {formatSender(t.from)}
                          </span>
                          <span className="text-[9px] text-zinc-600 shrink-0">{formatDate(t.date)}</span>
                        </div>
                      </div>
                    </div>
                    <p className={`text-[10px] truncate mb-1 ${t.isUnread ? "text-zinc-200" : "text-zinc-500"} pl-9`}>
                      {t.subject}
                    </p>
                    <div className="flex items-center gap-2 pl-9">
                      <p className="text-[9px] text-zinc-600 truncate flex-1">{t.summary || t.snippet}</p>
                      <span className={`shrink-0 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${INTENT_STYLES[t.intent]}`}>
                        {t.intent}
                      </span>
                    </div>
                    {t.isUnread && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                    )}
                  </button>
                ))}
                {nextPageToken && (
                  <div className="p-3">
                    <button
                      onClick={() => loadThreads(nextPageToken)}
                      disabled={loadingMore}
                      className="w-full py-2.5 rounded-xl border border-white/8 text-[10px] font-bold text-zinc-500 hover:text-white hover:border-white/20 transition"
                    >
                      {loadingMore ? "Loading..." : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        {/* ── Thread view ───────────────────────────────────────────── */}
        <main className={`${mobileView === "thread" ? "flex" : "hidden"} lg:flex flex-1 flex-col overflow-hidden border-r border-white/8`}>
          {!activeThread ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
                  <svg className="w-6 h-6 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <p className="text-xs text-zinc-600">Select an email to read it</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Thread header */}
              <div className="border-b border-white/8 px-5 py-4 shrink-0">
                <div className="flex items-start gap-3">
                  <button onClick={() => setMobileView("list")} className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-white/8 text-zinc-500 hover:text-white transition">
                    <BackIcon />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-black text-white leading-snug mb-1 truncate">{activeThread.subject}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-zinc-500">{formatSender(activeThread.from)}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${INTENT_STYLES[activeThread.intent]}`}>
                        {activeThread.intent}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileView("ai")}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/25 text-fuchsia-300 text-[10px] font-bold"
                  >
                    <SparkIcon className="w-3 h-3" /> AI Reply
                  </button>
                </div>
                {activeThread.summary && (
                  <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-fuchsia-400 mb-1">AI Summary</p>
                    <p className="text-[10px] text-zinc-300 leading-5">{activeThread.summary}</p>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {threadLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/8 p-4 animate-pulse">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-white/8" />
                          <div className="flex-1 h-3 bg-white/8 rounded" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2.5 bg-white/5 rounded w-full" />
                          <div className="h-2.5 bg-white/5 rounded w-4/5" />
                          <div className="h-2.5 bg-white/[0.03] rounded w-3/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : threadMessages.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-8">Could not load messages</p>
                ) : (
                  threadMessages.map((msg, i) => (
                    <div key={msg.id} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-600 to-violet-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                          {senderInitial(msg.from)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{formatSender(msg.from)}</p>
                          <p className="text-[9px] text-zinc-600">{formatDate(msg.date)}</p>
                        </div>
                        {i === threadMessages.length - 1 && (
                          <span className="text-[8px] font-bold text-zinc-700 bg-white/5 rounded-full px-2 py-0.5">latest</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 leading-6 whitespace-pre-wrap break-words">{msg.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        {/* ── AI Reply panel ────────────────────────────────────────── */}
        <aside className={`${mobileView === "ai" ? "flex" : "hidden"} lg:flex w-full lg:w-[300px] xl:w-[340px] shrink-0 flex-col overflow-hidden`}>
          {!activeThread ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <p className="text-xs text-zinc-600 text-center">Open an email to generate an AI reply</p>
            </div>
          ) : (
            <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto">
              {/* Mobile back */}
              <button onClick={() => setMobileView("thread")} className="lg:hidden flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition -mb-2">
                <BackIcon /> Back to email
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2.5">Reply Tone</p>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTone(t); setGeneratedReply(""); setEditedReply(""); }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                        tone === t
                          ? "bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-300"
                          : "border-white/8 text-zinc-500 hover:text-white hover:border-white/15"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Custom instruction (optional)</p>
                <input
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder='e.g. "mention our 20% discount offer"'
                  className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none focus:border-fuchsia-500/40"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || threadLoading || threadMessages.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-black transition disabled:opacity-50"
              >
                {generating ? (
                  <><div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><SparkIcon /> Generate Reply</>
                )}
              </button>

              {replyError && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-3 py-2.5 text-xs text-red-300">
                  {replyError}
                </div>
              )}

              {sendSuccess && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Reply sent successfully!
                </div>
              )}

              {(editedReply || generating) && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">AI Draft · {tone}</p>
                    <button
                      onClick={() => { setEditedReply(generatedReply); setSendSuccess(false); }}
                      className="text-[9px] text-zinc-600 hover:text-zinc-400 transition"
                    >
                      Reset
                    </button>
                  </div>
                  <textarea
                    value={editedReply}
                    onChange={(e) => setEditedReply(e.target.value)}
                    rows={10}
                    className="w-full flex-1 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/[0.04] px-3 py-3 text-xs text-zinc-200 leading-6 outline-none focus:border-fuchsia-500/40 resize-none"
                    placeholder="Your reply will appear here..."
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !editedReply.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black text-xs font-black transition hover:bg-zinc-200 disabled:opacity-50"
                  >
                    {sending ? (
                      <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />
                    ) : (
                      <><SendIcon /> Send Reply</>
                    )}
                  </button>
                </div>
              )}

              {!editedReply && !generating && (
                <div className="flex-1 rounded-xl border border-white/8 bg-white/[0.02] flex items-center justify-center p-6">
                  <p className="text-[10px] text-zinc-700 text-center leading-5">
                    Choose a tone and click<br />Generate to draft a reply
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
