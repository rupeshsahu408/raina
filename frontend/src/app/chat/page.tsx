"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { VoiceRecordingBar } from "@/components/VoiceRecordingBar";
import { CookiePreferencesModal } from "@/components/CookiePreferencesModal";

type Personality = "Simi" | "Loa";
type Mode = "personal" | "web" | "study" | "thinking" | "business";
type Role = "user" | "ai";
type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  sources?: Array<{ title: string; link: string }>;
};
type UsageInfo = {
  messagesLeft?: number;
  webSearchLeft?: number;
};
type ConversationItem = {
  conversationId: string;
  title: string;
  preview: string;
  pinned?: boolean;
  lastMessageAt: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

async function readFetchErrorDetail(resp: Response): Promise<string> {
  const code = `${resp.status} ${resp.statusText}`.trim();
  const raw = await resp.text().catch(() => "");
  const trimmed = raw.trim().slice(0, 2000);
  if (!trimmed) return code;
  try {
    const j = JSON.parse(trimmed) as { error?: string; detail?: string };
    const parts = [code];
    if (typeof j.error === "string") parts.push(j.error);
    if (typeof j.detail === "string") parts.push(j.detail);
    return parts.length > 1 ? parts.join(" — ") : `${code} — ${trimmed}`;
  } catch {
    return `${code} — ${trimmed}`;
  }
}

function isUnreachableApiError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message.toLowerCase();
  return (
    m.includes("failed to fetch") ||
    m.includes("networkerror") ||
    m.includes("network request failed") ||
    m.includes("load failed") ||
    m.includes("econnrefused") ||
    m.includes("connection refused")
  );
}

function formatUnreachableApiHelp(apiBase: string, technical: string, url?: string): string {
  const lines = [
    `Cannot reach the API at ${apiBase}`,
    "",
    `"Failed to fetch" means the browser never connected — this is not a database error yet.`,
    "",
    "Do this:",
    "1. Open a terminal in the evara/backend folder and run: npm run dev",
    "2. Wait for: [evara-backend] listening on http://localhost:8081",
    `3. In the browser, open: ${apiBase}/health  (should show {"ok":true,...})`,
    "4. If your API uses another port, set NEXT_PUBLIC_API_BASE_URL in frontend/.env.local and restart the Next.js dev server",
    "",
    technical,
  ];
  if (url) lines.push("", `Request URL: ${url}`);
  return lines.join("\n");
}

const DAILY_MESSAGE_LIMIT = Number(process.env.NEXT_PUBLIC_DAILY_MESSAGE_LIMIT ?? "120");
const DAILY_WEB_SEARCH_LIMIT = Number(process.env.NEXT_PUBLIC_DAILY_WEB_SEARCH_LIMIT ?? "25");
const CONVERSATION_ID_KEY = "evara_conversation_id";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredConversationId(): string | null {
  if (typeof window === "undefined") return null;
  const fromSession = sessionStorage.getItem(CONVERSATION_ID_KEY);
  if (fromSession?.trim()) return fromSession.trim();
  const fromLocal = localStorage.getItem(CONVERSATION_ID_KEY);
  if (fromLocal?.trim()) {
    sessionStorage.setItem(CONVERSATION_ID_KEY, fromLocal.trim());
    return fromLocal.trim();
  }
  return null;
}

function persistConversationId(id: string) {
  if (typeof window === "undefined" || !id.trim()) return;
  const v = id.trim();
  sessionStorage.setItem(CONVERSATION_ID_KEY, v);
  localStorage.setItem(CONVERSATION_ID_KEY, v);
}

const CONV_CACHE_KEY = "evara_conv_cache_v1";

function loadConvCache(uid: string): ConversationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${CONV_CACHE_KEY}_${uid}`);
    return raw ? (JSON.parse(raw) as ConversationItem[]) : [];
  } catch { return []; }
}

function saveConvCache(uid: string, list: ConversationItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${CONV_CACHE_KEY}_${uid}`, JSON.stringify(list.slice(0, 100)));
  } catch { /* quota */ }
}

function removeFromConvCache(uid: string, conversationId: string) {
  const list = loadConvCache(uid);
  saveConvCache(uid, list.filter((c) => c.conversationId !== conversationId));
}

function getConversationId() {
  const existing = readStoredConversationId();
  if (existing) return existing;
  const generated = `conv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  persistConversationId(generated);
  return generated;
}

function createConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function greetingMessage(): ChatMessage {
  return {
    id: "greeting",
    role: "ai",
    content: "Hi, I'm Evara. Tell me what you need right now—gently.",
  };
}

function upsertConversation(
  list: ConversationItem[],
  next: ConversationItem
): ConversationItem[] {
  const withoutCurrent = list.filter(
    (item) => item.conversationId !== next.conversationId
  );
  return [next, ...withoutCurrent].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

function titleFromPreview(preview: string) {
  const t = preview.trim();
  if (!t) return "New Chat";
  return t.length > 48 ? `${t.slice(0, 47)}…` : t;
}

// ── SVG Icons ──────────────────────────────────────────────────────────────
function IconPlus({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
function IconSend({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMic({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconSettings({ size = 15, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IconLogout({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconDots({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="8" cy="13" r="1.3" />
    </svg>
  );
}
function IconPin({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function IconSearch({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconCopy({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconCheck({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMenu({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconX({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconChevronDown({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconEdit({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconTrash({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Typing Indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot inline-block h-2 w-2 rounded-full bg-zinc-400"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

// ── AI Avatar ───────────────────────────────────────────────────────────────
function EvaraAvatar(_: { personality: Personality }) {
  return (
    <img
      src="/evara-logo.png"
      alt="Evara"
      className="h-8 w-8 shrink-0 object-contain"
      draggable={false}
    />
  );
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [personality, setPersonality] = useState<Personality>("Simi");
  const [mode, setMode] = useState<Mode>("personal");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [usage, setUsage] = useState<UsageInfo>({});
  const [messages, setMessages] = useState<ChatMessage[]>([greetingMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState("default");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetchError, setHistoryFetchError] = useState<string | null>(null);
  const [conversationsLoadError, setConversationsLoadError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuConversationId, setActiveMenuConversationId] = useState<string | null>(null);
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [incognitoActive, setIncognitoActive] = useState(false);
  const [showIncognitoToast, setShowIncognitoToast] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  const loadConversations = useCallback(async (authUser: User, query = "") => {
    const token = await authUser.getIdToken();
    const url = query.trim()
      ? `${API_BASE_URL}/v1/conversations?q=${encodeURIComponent(query.trim())}`
      : `${API_BASE_URL}/v1/conversations`;
    let resp: Response;
    try {
      resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const full = isUnreachableApiError(err)
        ? formatUnreachableApiHelp(API_BASE_URL, `Original error: ${msg}`, url)
        : `Network error loading conversations.\n${msg}\nAPI: ${API_BASE_URL}\n${url}`;
      setConversationsLoadError(full);
      console.error("[chat] loadConversations fetch failed:", { url, error: msg });
      const cached = loadConvCache(authUser.uid);
      if (cached.length) setConversations(cached);
      return cached;
    }
    if (!resp.ok) {
      if (resp.status === 401) router.replace("/login");
      const detail = await readFetchErrorDetail(resp);
      setConversationsLoadError(`Failed to load conversation list (${url}).\n${detail}`);
      console.error("[chat] loadConversations HTTP error:", detail);
      const cached = loadConvCache(authUser.uid);
      if (cached.length) setConversations(cached);
      return cached;
    }
    setConversationsLoadError(null);
    const data: { conversations?: ConversationItem[] } = await resp.json();
    const list = Array.isArray(data.conversations) ? data.conversations : [];
    if (!query.trim()) {
      const cached = loadConvCache(authUser.uid);
      const merged = list.length ? list : cached;
      setConversations(merged);
      saveConvCache(authUser.uid, merged);
      return merged;
    }
    setConversations(list);
    return list;
  }, [router]);

  const startNewChat = () => {
    const nextConversationId = createConversationId();
    persistConversationId(nextConversationId);
    setConversationId(nextConversationId);
    setMessages([greetingMessage()]);
    setInput("");
    setShowModeMenu(false);
    setSidebarOpen(false);
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        router.replace("/login");
      } else {
        const cached = loadConvCache(u.uid);
        if (cached.length) setConversations(cached);
      }
    });
    return () => unsub();
  }, [router]);

  const displayName = useMemo(() => {
    if (!user) return "User";
    return user.displayName || user.email?.split("@")[0] || "User";
  }, [user]);

  const avatarInitial = useMemo(() => {
    return displayName.charAt(0).toUpperCase();
  }, [displayName]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const conversationList = await loadConversations(user);
        let activeId = readStoredConversationId();
        if (conversationList.length > 0 && activeId) {
          const known = conversationList.some((c) => c.conversationId === activeId);
          if (!known) {
            activeId = conversationList[0].conversationId;
            persistConversationId(activeId);
          }
        }
        if (!activeId) {
          activeId =
            conversationList.length > 0
              ? conversationList[0].conversationId
              : createConversationId();
          persistConversationId(activeId);
        }
        setConversationId(activeId);

        const token = await user.getIdToken();
        const profileResp = await fetch(`${API_BASE_URL}/v1/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileResp.ok) {
          const profileData: { privacy?: { incognitoChatMode?: boolean } } = await profileResp.json();
          setIncognitoActive(Boolean(profileData.privacy?.incognitoChatMode));
        }
      } catch (err) {
        console.error("[chat] conversation bootstrap failed:", err);
      }
    })();
  }, [user, loadConversations]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        await fetch(`${API_BASE_URL}/v1/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ...(user.displayName?.trim() ? { name: user.displayName.trim() } : {}),
            selectedPersonality: personality,
          }),
        });
      } catch (err) {
        console.error("[chat] profile sync failed:", err);
      }
    })();
  }, [user, personality]);

  useEffect(() => {
    if (!user || !conversationId || conversationId === "default") return;
    (async () => {
      const url = `${API_BASE_URL}/v1/conversations/${encodeURIComponent(conversationId)}/messages`;
      try {
        setHistoryLoading(true);
        setHistoryFetchError(null);
        const token = await user.getIdToken();
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) {
          const detail = await readFetchErrorDetail(resp);
          const full = `GET ${url}\nConversation: ${conversationId}\n\n${detail}`;
          setHistoryFetchError(full);
          console.error("[chat] messages fetch failed:", full);
          return;
        }
        const data: { messages?: Array<{ id: string; role: Role; content: string }> } = await resp.json();
        setHistoryFetchError(null);
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages(data.messages.map((m) => ({ id: m.id || makeId(), role: m.role, content: m.content })));
        } else {
          setMessages([greetingMessage()]);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const full = isUnreachableApiError(err)
          ? formatUnreachableApiHelp(API_BASE_URL, `Original error: ${msg}`, url)
          : `Network error loading messages.\n${msg}\n\nURL: ${url}\nAPI base: ${API_BASE_URL}`;
        setHistoryFetchError(full);
        console.error("[chat] messages fetch threw:", full);
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, [user, conversationId]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      loadConversations(user, searchQuery).catch(() => {});
    }, 220);
    return () => window.clearTimeout(timer);
  }, [user, searchQuery, loadConversations]);

  useEffect(() => {
    const saved = sessionStorage.getItem("evara_mode");
    if (saved === "personal" || saved === "web" || saved === "study" || saved === "thinking" || saved === "business") {
      setMode(saved);
    }
  }, []);

  useEffect(() => { sessionStorage.setItem("evara_mode", mode); }, [mode]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!incognitoActive || typeof window === "undefined") return;
    const seenKey = "evara_incognito_toast_seen";
    if (sessionStorage.getItem(seenKey) === "1") return;
    sessionStorage.setItem(seenKey, "1");
    setShowIncognitoToast(true);
    const timer = window.setTimeout(() => setShowIncognitoToast(false), 3200);
    return () => window.clearTimeout(timer);
  }, [incognitoActive]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const modeConfig: Record<Mode, { label: string; icon: string; color: string }> = {
    personal:  { label: "Personal",   icon: "❤️",  color: "text-rose-400" },
    web:       { label: "Web Search", icon: "🌐",  color: "text-sky-400" },
    study:     { label: "Study",      icon: "🎓",  color: "text-emerald-400" },
    thinking:  { label: "Thinking",   icon: "🧠",  color: "text-violet-400" },
    business:  { label: "Business",   icon: "💼",  color: "text-amber-400" },
  };

  const messageLeft = usage.messagesLeft;
  const webLeft = usage.webSearchLeft;
  const messageUsed = typeof messageLeft === "number" ? DAILY_MESSAGE_LIMIT - messageLeft : 0;
  const webUsed = typeof webLeft === "number" ? DAILY_WEB_SEARCH_LIMIT - webLeft : 0;
  const messagePercent = Math.max(0, Math.min(100, (messageUsed / DAILY_MESSAGE_LIMIT) * 100));
  const webPercent = Math.max(0, Math.min(100, (webUsed / DAILY_WEB_SEARCH_LIMIT) * 100));
  const isLow = (val?: number) => typeof val === "number" && val <= 10;

  const copyMessage = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      window.setTimeout(() => setCopiedMessageId((prev) => (prev === id ? null : prev)), 1500);
    } catch { /* ignore */ }
  };

  const stopRecording = (submit: boolean) => {
    speechRef.current?.abort();
    speechRef.current = null;
    recorderRef.current?.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
    if (submit) {
      const t = transcriptRef.current.trim();
      if (t) setInput((prev) => (prev ? prev + " " + t : t));
      else setMicError("No speech detected — please try again.");
    }
    transcriptRef.current = "";
  };

  const startRecording = async () => {
    setMicError(null);
    transcriptRef.current = "";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      recorder.start();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.continuous = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let final = "";
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript;
          }
          if (final) transcriptRef.current = final;
        };
        recognition.onerror = (ev: { error: string }) => {
          if (ev.error === "network") {
            setMicError("Speech-to-text unavailable in this environment. Click ✓ anyway — we'll use what was captured.");
          }
        };
        recognition.start();
        speechRef.current = recognition;
      }

      setIsListening(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/denied|not.allowed|permission/i.test(msg)) {
        setMicError("Microphone access denied. Allow it in your browser settings.");
      } else {
        setMicError("Could not access microphone: " + msg);
      }
    }
  };

  const patchConversation = async (targetId: string, payload: { title?: string; pinned?: boolean }) => {
    if (!user) return false;
    const token = await user.getIdToken();
    const resp = await fetch(`${API_BASE_URL}/v1/conversations/${encodeURIComponent(targetId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return resp.ok;
  };

  const deleteConversation = async (targetId: string) => {
    if (!user) return false;
    const token = await user.getIdToken();
    const resp = await fetch(`${API_BASE_URL}/v1/conversations/${encodeURIComponent(targetId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return resp.ok;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || isTyping) return;
    const text = input.trim();
    if (!text) return;
    const activeConversationId = getConversationId();
    setConversationId((prev) => prev === activeConversationId ? prev : activeConversationId);
    setInput("");
    setMessages((prev) => [...prev, { id: makeId(), role: "user", content: text }]);
    setConversations((prev) => {
      const next = upsertConversation(prev, {
        conversationId: activeConversationId,
        title: titleFromPreview(text),
        preview: text,
        lastMessageAt: new Date().toISOString(),
      });
      if (user) saveConvCache(user.uid, next);
      return next;
    });
    setIsTyping(true);
    try {
      const token = await user.getIdToken();
      const resp = await fetch(`${API_BASE_URL}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, personality, mode, conversationId: activeConversationId }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        const backendMessage: string = err?.error ?? `Chat failed (${resp.status})`;
        if (err?.usage) setUsage({ messagesLeft: err.usage.messagesLeft, webSearchLeft: err.usage.webSearchLeft });
        const norm = backendMessage.toLowerCase();
        if (norm.includes("firebase admin missing") || norm.includes("auth not configured") ||
          norm.includes("mongodb not configured") || norm.includes("mongo") || norm.includes("database unavailable")) {
          const demoResp = await fetch(`${API_BASE_URL}/v1/demo-chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text, personality, mode }),
          });
          if (demoResp.ok) {
            const demoData: { reply?: string } = await demoResp.json();
            setMessages((prev) => [...prev, { id: makeId(), role: "ai", content: demoData.reply ?? "I'm here with you." }]);
            return;
          }
        }
        throw new Error(backendMessage);
      }
      const data: { reply?: string; sources?: Array<{ title: string; link: string }>; usage?: UsageInfo; conversationId?: string } = await resp.json();
      if (data.conversationId && data.conversationId !== conversationId) {
        persistConversationId(data.conversationId);
        setConversationId(data.conversationId);
      }
      if (data.usage) setUsage({ messagesLeft: data.usage.messagesLeft, webSearchLeft: data.usage.webSearchLeft });
      setMessages((prev) => [...prev, { id: makeId(), role: "ai", content: data.reply ?? "I'm here with you. Tell me more.", sources: data.sources ?? [] }]);
      setConversations((prev) => {
        const next = upsertConversation(prev, {
          conversationId: data.conversationId ?? activeConversationId,
          title: titleFromPreview(data.reply ?? text),
          preview: data.reply ?? text,
          lastMessageAt: new Date().toISOString(),
        });
        saveConvCache(user.uid, next);
        return next;
      });
      try { await loadConversations(user); } catch { /* keep local */ }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { id: makeId(), role: "ai", content: `I couldn't process that yet: ${errorText}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Conversation item ──────────────────────────────────────────────────
  function ConvItem({ c }: { c: ConversationItem }) {
    const isActive = c.conversationId === conversationId;
    const isMenuOpen = activeMenuConversationId === c.conversationId;
    const isDeleting = deletingConversationId === c.conversationId;
    const isRenaming = renamingConversationId === c.conversationId;

    const commitRename = async () => {
      const t = renameValue.trim();
      if (t && t !== c.title) await patchConversation(c.conversationId, { title: t });
      setRenamingConversationId(null);
      setActiveMenuConversationId(null);
      if (user) await loadConversations(user, searchQuery);
    };

    const confirmDelete = async () => {
      await deleteConversation(c.conversationId);
      if (user) removeFromConvCache(user.uid, c.conversationId);
      setConversations((prev) => prev.filter((x) => x.conversationId !== c.conversationId));
      if (c.conversationId === conversationId) startNewChat();
      setDeletingConversationId(null);
      setActiveMenuConversationId(null);
      if (user) await loadConversations(user, searchQuery);
    };

    return (
      <div className="group relative">
        {/* ── Inline delete confirmation ── */}
        {isDeleting ? (
          <div className="mx-1 mb-0.5 flex flex-col gap-2 rounded-xl bg-white/[0.05] px-3 py-2.5">
            <p className="text-[11.5px] text-zinc-300 leading-snug">Delete &ldquo;{c.title || "this chat"}&rdquo;?</p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-500/20 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/30 transition"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeletingConversationId(null)}
                className="flex-1 rounded-lg bg-white/[0.05] py-1.5 text-[11px] font-medium text-zinc-400 hover:bg-white/[0.08] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                if (isRenaming) return;
                persistConversationId(c.conversationId);
                setConversationId(c.conversationId);
                setSidebarOpen(false);
                setActiveMenuConversationId(null);
              }}
              className={[
                "w-full rounded-xl px-3 py-2 pr-8 text-left text-[13px] transition-colors",
                isActive
                  ? "bg-white/[0.08] text-zinc-100"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
              ].join(" ")}
            >
              {isRenaming ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") { setRenamingConversationId(null); setActiveMenuConversationId(null); }
                  }}
                  className="w-full bg-transparent text-[13px] text-zinc-100 outline-none border-b border-violet-500/50 pb-px"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="block truncate leading-snug">
                  {c.pinned && <span className="mr-1 text-[10px] text-amber-400">📌</span>}
                  {c.title || c.preview || "Untitled chat"}
                </span>
              )}
            </button>

            {/* Three-dot menu trigger */}
            <button
              type="button"
              className={[
                "absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-1 transition",
                "text-zinc-600 hover:bg-white/[0.07] hover:text-zinc-300",
                isActive || isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              ].join(" ")}
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuConversationId((prev) => prev === c.conversationId ? null : c.conversationId);
              }}
            >
              <IconDots size={13} />
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className="absolute right-1 top-9 z-30 w-38 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a1a] py-1 text-[12px] shadow-2xl shadow-black/60">
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-zinc-300 hover:bg-white/[0.06] transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingConversationId(c.conversationId);
                    setRenameValue(c.title || c.preview || "");
                    setActiveMenuConversationId(null);
                  }}
                >
                  <IconEdit size={12} className="text-zinc-500" />
                  Rename
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-zinc-300 hover:bg-white/[0.06] transition"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await patchConversation(c.conversationId, { pinned: !c.pinned });
                    setActiveMenuConversationId(null);
                    if (user) await loadConversations(user, searchQuery);
                  }}
                >
                  <IconPin size={12} className="text-zinc-500" />
                  {c.pinned ? "Unpin" : "Pin"}
                </button>
                <div className="my-1 mx-2 border-t border-white/[0.06]" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-red-400 hover:bg-white/[0.06] transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingConversationId(c.conversationId);
                    setActiveMenuConversationId(null);
                  }}
                >
                  <IconTrash size={12} />
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#111111] text-zinc-100">

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════ */}
      <aside className={[
        "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/[0.05] bg-[#0a0a0a] transition-transform duration-300",
        "lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-3 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <img src="/evara-logo.png" alt="Evara AI" className="h-10 w-10 shrink-0 object-contain" draggable={false} />
            <span className="text-[14px] font-semibold tracking-tight text-zinc-100">Evara AI</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-300 lg:hidden transition"
          >
            <IconX size={15} />
          </button>
        </div>

        {/* ── New chat ── */}
        <div className="px-3 pb-2 pt-1">
          <button
            type="button"
            onClick={startNewChat}
            disabled={loading || isTyping}
            className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] px-3.5 py-2.5 text-[13px] font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
          >
            <IconPlus size={15} className="shrink-0 text-zinc-400" />
            New chat
          </button>
        </div>

        {/* ── Personality toggle ── */}
        <div className="mx-3 mb-2 flex gap-1 rounded-xl bg-white/[0.04] p-1">
          {(["Simi", "Loa"] as Personality[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPersonality(p)}
              className={[
                "flex-1 rounded-lg py-1.5 text-[12px] font-medium transition",
                personality === p
                  ? "bg-violet-600 text-white shadow shadow-violet-900/40"
                  : "text-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2">
            <IconSearch size={13} className="shrink-0 text-zinc-600" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats…"
              className="flex-1 bg-transparent text-[12.5px] text-zinc-300 outline-none placeholder:text-zinc-600"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-zinc-600 hover:text-zinc-400 transition">
                <IconX size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── Bihar AI link ── */}
        <div className="px-3 pb-1">
          <a
            href="/bihar-ai"
            onClick={() => setSidebarOpen(false)}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-[13px] font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200"
          >
            <span className="shrink-0 text-[13px] leading-none">🟡</span>
            Bihar AI
          </a>
        </div>

        {/* ── Divider ── */}
        <div className="mx-3 mb-1 border-t border-white/[0.05]" />

        {/* ── Conversation list ── */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[12.5px] font-medium text-zinc-500">No conversations yet</p>
              <p className="text-[11.5px] text-zinc-700 leading-relaxed">Start a new chat to see your history here</p>
            </div>
          ) : (() => {
            const pinned = conversations.filter((c) => c.pinned);
            const unpinned = conversations.filter((c) => !c.pinned);

            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate() - 1);
            const startOf7Days = new Date(startOfToday); startOf7Days.setDate(startOf7Days.getDate() - 7);
            const startOf30Days = new Date(startOfToday); startOf30Days.setDate(startOf30Days.getDate() - 30);

            const dateGroup = (c: ConversationItem) => {
              const d = new Date(c.lastMessageAt);
              if (d >= startOfToday) return "Today";
              if (d >= startOfYesterday) return "Yesterday";
              if (d >= startOf7Days) return "Previous 7 days";
              if (d >= startOf30Days) return "Previous 30 days";
              return "Older";
            };

            const groups: { label: string; items: ConversationItem[] }[] = [
              { label: "Today", items: [] },
              { label: "Yesterday", items: [] },
              { label: "Previous 7 days", items: [] },
              { label: "Previous 30 days", items: [] },
              { label: "Older", items: [] },
            ];

            for (const c of unpinned) {
              const g = groups.find((g) => g.label === dateGroup(c));
              if (g) g.items.push(c);
            }

            return (
              <div className="space-y-0.5">
                {pinned.length > 0 && (
                  <div className="mb-1">
                    <p className="px-2 pt-1 pb-1 text-[10.5px] font-semibold uppercase tracking-widest text-zinc-600">Pinned</p>
                    {pinned.map((c) => <ConvItem key={c.conversationId} c={c} />)}
                  </div>
                )}
                {groups.filter((g) => g.items.length > 0).map((g) => (
                  <div key={g.label}>
                    <p className="px-2 pt-3 pb-1 text-[10.5px] font-semibold uppercase tracking-widest text-zinc-600 first:pt-1">{g.label}</p>
                    {g.items.map((c) => <ConvItem key={c.conversationId} c={c} />)}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── Bottom: usage + user ── */}
        <div className="shrink-0 border-t border-white/[0.05] px-2 py-2 space-y-0.5">
          {/* Usage (compact) */}
          {(typeof messageLeft === "number" || typeof webLeft === "number") && (
            <div className="rounded-xl bg-white/[0.03] px-3 py-2.5 text-[11px] space-y-2 mb-1">
              <p className="font-medium text-zinc-500">Today&apos;s usage</p>
              <div className="space-y-1.5">
                <div>
                  <div className="mb-1 flex justify-between text-zinc-600">
                    <span>Messages</span>
                    <span className={isLow(messageLeft) ? "text-amber-400 font-medium" : ""}>
                      {typeof messageLeft === "number" ? `${messageLeft} left` : "—"}
                    </span>
                  </div>
                  <div className="h-[2px] overflow-hidden rounded-full bg-zinc-800">
                    <div className={["h-full rounded-full transition-all", isLow(messageLeft) ? "bg-amber-400" : "bg-violet-500"].join(" ")}
                      style={{ width: `${messagePercent}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-zinc-600">
                    <span>Web searches</span>
                    <span className={isLow(webLeft) ? "text-amber-400 font-medium" : ""}>
                      {typeof webLeft === "number" ? `${webLeft} left` : "—"}
                    </span>
                  </div>
                  <div className="h-[2px] overflow-hidden rounded-full bg-zinc-800">
                    <div className={["h-full rounded-full transition-all", isLow(webLeft) ? "bg-amber-400" : "bg-sky-500"].join(" ")}
                      style={{ width: `${webPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            <IconSettings size={15} className="shrink-0" />
            Settings
          </button>

          {/* User row */}
          <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-white/[0.04] transition cursor-default group">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-[11px] font-bold text-white">
              {avatarInitial}
            </div>
            <span className="flex-1 truncate text-[13px] text-zinc-300">{displayName}</span>
            <button
              type="button"
              title="Sign out"
              onClick={async () => { const auth = getFirebaseAuth(); await signOut(auth); router.replace("/login"); }}
              className="rounded-lg p-1 text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
            >
              <IconLogout size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#111111]/95 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-1.5 text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-200 lg:hidden"
            >
              <IconMenu size={18} />
            </button>

            {/* Mode selector button */}
            <button
              type="button"
              onClick={() => setShowModeMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-zinc-100"
            >
              <span>{modeConfig[mode].icon}</span>
              <span>{modeConfig[mode].label}</span>
              <IconChevronDown size={11} />
            </button>

            {incognitoActive && (
              <span className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-2.5 py-1 text-[11px] text-amber-300">
                Incognito
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startNewChat}
              disabled={loading || isTyping}
              className="hidden items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[12px] text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-100 disabled:opacity-40 sm:flex"
            >
              <IconPlus size={12} />
              New chat
            </button>

            {/* Profile menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTopMenu((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 text-[12px] font-bold text-zinc-200 hover:ring-2 hover:ring-violet-500/40 transition"
              >
                {avatarInitial}
              </button>
              {showTopMenu && (
                <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900/95 py-1.5 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-white/[0.06] px-4 py-2.5">
                    <p className="text-[13px] font-medium text-zinc-200">{displayName}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user?.email ?? ""}</p>
                  </div>
                  {[
                    { label: "Profile", href: "/settings" },
                    { label: "Settings", href: "/settings" },
                    { label: "Personalization", href: "/settings#personalization" },
                    { label: "Upgrade Plan", href: "/settings#upgrade" },
                  ].map((item) => (
                    <a key={item.label} href={item.href}
                      className="block px-4 py-2 text-[13px] text-zinc-300 hover:bg-white/[0.05] hover:text-white">
                      {item.label}
                    </a>
                  ))}
                  <div className="border-t border-white/[0.06] mt-1 pt-1">
                    <button type="button"
                      onClick={async () => { const auth = getFirebaseAuth(); await signOut(auth); router.replace("/login"); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-[13px] text-red-400 hover:bg-white/[0.05]">
                      <IconLogout size={13} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Error banners ── */}
        {conversationsLoadError && (
          <div role="alert" className="shrink-0 border-b border-amber-600/30 bg-amber-950/80 px-4 py-2.5 text-[12px] text-amber-200">
            <div className="mx-auto flex max-w-3xl items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="font-semibold">Conversation list error — </span>
                Make sure the backend is running and MongoDB Atlas IP whitelist includes your IP (or 0.0.0.0/0).
              </div>
              <button type="button" onClick={() => setConversationsLoadError(null)} className="shrink-0 rounded-lg text-amber-400 hover:text-amber-200">
                <IconX size={14} />
              </button>
            </div>
          </div>
        )}
        {historyFetchError && (
          <div role="alert" className="shrink-0 border-b border-red-500/30 bg-red-950/80 px-4 py-2.5 text-[12px] text-red-200">
            <div className="mx-auto flex max-w-3xl items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="font-semibold">Could not load chat history — </span>
                Check that the backend is running and your MongoDB Atlas IP whitelist is open.
              </div>
              <button type="button" onClick={() => setHistoryFetchError(null)} className="shrink-0 text-red-400 hover:text-red-200">
                <IconX size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Messages area ── */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <img src="/evara-logo.png" alt="Evara AI" className="h-12 w-12 object-contain" draggable={false} />
              <p className="text-[13px] text-zinc-500">
                {historyLoading ? "Loading chat history…" : "Loading…"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
                {messages.map((m) => (
                  <div key={m.id} className={["msg-in", m.role === "user" ? "flex justify-end" : "flex items-start gap-3"].join(" ")}>
                    {m.role === "ai" && <EvaraAvatar personality={personality} />}
                    <div className={[
                      "group relative",
                      m.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-br-sm bg-white/[0.08] px-4 py-3 text-[14px] leading-relaxed text-zinc-100"
                        : "flex-1 min-w-0",
                    ].join(" ")}>
                      {m.role === "ai" ? (
                        <div className="text-[14px] text-zinc-100">
                          <div className="chat-markdown">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                          </div>
                          {m.sources && m.sources.length > 0 && (
                            <div className="mt-3 space-y-1 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[12px]">
                              <p className="font-medium text-zinc-400 mb-1">Sources</p>
                              {m.sources.map((s) => (
                                <a key={`${s.link}-${s.title}`} href={s.link} target="_blank" rel="noreferrer"
                                  className="block truncate text-sky-400 underline decoration-sky-400/40 underline-offset-2 hover:text-sky-300">
                                  {s.title}
                                </a>
                              ))}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => copyMessage(m.id, m.content)}
                            className="mt-1.5 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-zinc-600 opacity-0 transition hover:bg-white/[0.06] hover:text-zinc-300 group-hover:opacity-100"
                          >
                            {copiedMessageId === m.id ? <><IconCheck size={11} /><span className="text-emerald-400">Copied</span></> : <><IconCopy size={11} />Copy</>}
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="whitespace-pre-wrap">{m.content}</div>
                          <button
                            type="button"
                            onClick={() => copyMessage(m.id, m.content)}
                            className="mt-1.5 flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] text-zinc-600 opacity-0 transition hover:text-zinc-300 group-hover:opacity-100"
                          >
                            {copiedMessageId === m.id ? <><IconCheck size={11} /><span className="text-emerald-400">Copied</span></> : <><IconCopy size={11} />Copy</>}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="msg-in flex items-start gap-3">
                    <EvaraAvatar personality={personality} />
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            {/* ── Input area ── */}
            <div className="shrink-0 border-t border-white/[0.05] bg-[#111111] px-4 py-4">
              <div className="mx-auto max-w-3xl">
                {isListening ? (
                  <VoiceRecordingBar
                    analyserRef={analyserRef}
                    isTranscribing={isTranscribing}
                    onCancel={() => stopRecording(false)}
                    onConfirm={() => stopRecording(true)}
                    accent="violet"
                  />
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="relative rounded-2xl border border-white/[0.09] bg-[#1c1c1c] p-3 shadow-xl ring-1 ring-inset ring-white/[0.04] transition-all focus-within:border-violet-500/40 focus-within:ring-violet-500/10"
                  >
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      className="w-full resize-none bg-transparent pr-20 text-[14px] leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600"
                      placeholder="Ask anything…"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      disabled={isTyping}
                      style={{ maxHeight: 160 }}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowModeMenu(true)}
                        className={["flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium transition hover:border-white/10 hover:bg-white/[0.06]", modeConfig[mode].color].join(" ")}
                      >
                        {modeConfig[mode].icon} {modeConfig[mode].label}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={startRecording}
                          disabled={isTyping}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-zinc-500 transition hover:border-white/10 hover:text-zinc-300 disabled:opacity-40"
                          aria-label="Voice input"
                          title="Voice input"
                        >
                          <IconMic size={14} />
                        </button>
                        <button
                          type="submit"
                          disabled={isTyping || input.trim().length === 0}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg transition hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <IconSend size={14} />
                        </button>
                      </div>
                    </div>
                  </form>
                )}
                {micError && (
                  <p className="mt-1.5 text-center text-[11px] text-red-400">{micError}</p>
                )}
                <p className="mt-1 text-center text-[11px] text-zinc-700">
                  Evara can make mistakes. Verify important information.{" "}
                  <button
                    type="button"
                    onClick={() => setShowCookieModal(true)}
                    className="underline underline-offset-2 transition hover:text-zinc-500"
                  >
                    Cookie Preferences
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <CookiePreferencesModal open={showCookieModal} onClose={() => setShowCookieModal(false)} />

      {/* ══════════════════════════════════════════
          MODE SELECTOR MODAL
      ══════════════════════════════════════════ */}
      {showModeMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setShowModeMenu(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-[#161616] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="font-semibold text-zinc-100">Choose mode</p>
              <p className="mt-0.5 text-[12px] text-zinc-500">Switch behavior instantly without losing memory.</p>
            </div>
            <div className="p-3 space-y-1">
              {(Object.entries(modeConfig) as [Mode, typeof modeConfig[Mode]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setMode(key); setShowModeMenu(false); }}
                  className={[
                    "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[13px] transition",
                    mode === key
                      ? "bg-violet-600/20 text-violet-200 ring-1 ring-inset ring-violet-500/30"
                      : "text-zinc-300 hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-[16px]">{cfg.icon}</span>
                    <span className="font-medium">{cfg.label}</span>
                  </span>
                  {mode === key && (
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Incognito toast ── */}
      {showIncognitoToast && (
        <div className="fixed bottom-28 left-1/2 z-[70] -translate-x-1/2 rounded-2xl border border-amber-500/30 bg-amber-950/90 px-4 py-2.5 text-[13px] text-amber-200 shadow-xl backdrop-blur-md">
          Incognito is ON — this chat won&apos;t be saved.
        </div>
      )}
    </div>
  );
}
