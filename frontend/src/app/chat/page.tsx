"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getFirebaseAuth } from "@/lib/firebaseClient";

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

/** Readable server error for UI + console (never swallows status or body). */
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

/** Browser could not open a TCP connection to the API (backend down, wrong host/port, etc.). */
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

const DAILY_MESSAGE_LIMIT = Number(
  process.env.NEXT_PUBLIC_DAILY_MESSAGE_LIMIT ?? "120"
);
const DAILY_WEB_SEARCH_LIMIT = Number(
  process.env.NEXT_PUBLIC_DAILY_WEB_SEARCH_LIMIT ?? "25"
);

const CONVERSATION_ID_KEY = "evara_conversation_id";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Survives refresh; localStorage also survives new tabs (sessionStorage does not). */
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
    content: "Hi, I’m Evara. Tell me what you need right now—gently.",
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
  const [conversationsLoadError, setConversationsLoadError] = useState<string | null>(
    null
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuConversationId, setActiveMenuConversationId] = useState<string | null>(null);
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [incognitoActive, setIncognitoActive] = useState(false);
  const [showIncognitoToast, setShowIncognitoToast] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const loadConversations = useCallback(async (authUser: User, query = "") => {
    const token = await authUser.getIdToken();
    const url = query.trim()
      ? `${API_BASE_URL}/v1/conversations?q=${encodeURIComponent(query.trim())}`
      : `${API_BASE_URL}/v1/conversations`;
    let resp: Response;
    try {
      resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const full = isUnreachableApiError(err)
        ? formatUnreachableApiHelp(API_BASE_URL, `Original error: ${msg}`, url)
        : `Network error loading conversations.\n${msg}\nAPI: ${API_BASE_URL}\n${url}`;
      setConversationsLoadError(full);
      console.error("[chat] loadConversations fetch failed:", { url, error: msg });
      return [];
    }
    if (!resp.ok) {
      if (resp.status === 401) {
        router.replace("/login");
      }
      const detail = await readFetchErrorDetail(resp);
      setConversationsLoadError(
        `Failed to load conversation list (${url}).\n${detail}`
      );
      console.error("[chat] loadConversations HTTP error:", detail);
      return [];
    }
    setConversationsLoadError(null);
    const data: { conversations?: ConversationItem[] } = await resp.json();
    const list = Array.isArray(data.conversations) ? data.conversations : [];
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
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) router.replace("/login");
    });
    return () => unsub();
  }, [router]);

  const displayName = useMemo(() => {
    if (!user) return "Evara";
    return user.displayName || "Evara";
  }, [user]);

  // Once per login: restore active chat from server + durable storage (not on personality change).
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
          const profileData: { privacy?: { incognitoChatMode?: boolean } } =
            await profileResp.json();
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...(user.displayName?.trim()
              ? { name: user.displayName.trim() }
              : {}),
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
        const resp = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          const detail = await readFetchErrorDetail(resp);
          const full = `GET ${url}\nConversation: ${conversationId}\n\n${detail}`;
          setHistoryFetchError(full);
          console.error("[chat] messages fetch failed:", full);
          return;
        }
        const data: {
          messages?: Array<{ id: string; role: Role; content: string }>;
        } = await resp.json();
        setHistoryFetchError(null);
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages(
            data.messages.map((m) => ({
              id: m.id || makeId(),
              role: m.role,
              content: m.content,
            }))
          );
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
      loadConversations(user, searchQuery).catch(() => {
        // no-op: keep local list
      });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [user, searchQuery, loadConversations]);

  useEffect(() => {
    const saved = sessionStorage.getItem("evara_mode");
    if (
      saved === "personal" ||
      saved === "web" ||
      saved === "study" ||
      saved === "thinking" ||
      saved === "business"
    ) {
      setMode(saved);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("evara_mode", mode);
  }, [mode]);

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

  const modeLabel: Record<Mode, string> = {
    personal: "Personal",
    web: "Web Search",
    study: "Study",
    thinking: "Thinking",
    business: "Business",
  };
  const modeIcon: Record<Mode, string> = {
    personal: "❤️",
    web: "🌐",
    study: "🎓",
    thinking: "🧠",
    business: "💼",
  };

  const messageLeft = usage.messagesLeft;
  const webLeft = usage.webSearchLeft;
  const messageUsed =
    typeof messageLeft === "number" ? DAILY_MESSAGE_LIMIT - messageLeft : 0;
  const webUsed =
    typeof webLeft === "number" ? DAILY_WEB_SEARCH_LIMIT - webLeft : 0;
  const messagePercent = Math.max(
    0,
    Math.min(100, (messageUsed / DAILY_MESSAGE_LIMIT) * 100)
  );
  const webPercent = Math.max(
    0,
    Math.min(100, (webUsed / DAILY_WEB_SEARCH_LIMIT) * 100)
  );

  const isLow = (val?: number) => typeof val === "number" && val <= 10;
  const copyMessage = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      window.setTimeout(() => setCopiedMessageId((prev) => (prev === id ? null : prev)), 1200);
    } catch {
      // ignore clipboard failures
    }
  };
  const patchConversation = async (
    targetConversationId: string,
    payload: { title?: string; pinned?: boolean }
  ) => {
    if (!user) return false;
    const token = await user.getIdToken();
    const resp = await fetch(
      `${API_BASE_URL}/v1/conversations/${encodeURIComponent(targetConversationId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );
    return resp.ok;
  };

  const deleteConversation = async (targetConversationId: string) => {
    if (!user) return false;
    const token = await user.getIdToken();
    const resp = await fetch(
      `${API_BASE_URL}/v1/conversations/${encodeURIComponent(targetConversationId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return resp.ok;
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-zinc-100">
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-800 bg-zinc-950/95 p-4 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Evara AI
          </p>
          <button
            type="button"
            className="rounded-lg border border-zinc-800 px-2 py-1 text-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
          <p className="text-xs text-zinc-400">
            {loading ? "Signing you in…" : `Welcome, ${displayName}`}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {(["Simi", "Loa"] as Personality[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPersonality(p)}
                className={[
                  "rounded-full border px-3 py-1 text-xs transition",
                  personality === p
                    ? "border-purple-500 bg-purple-500/15"
                    : "border-zinc-800",
                ].join(" ")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <a
          href="/bihar-ai"
          onClick={() => setSidebarOpen(false)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/45 bg-amber-500/10 px-3 py-2.5 text-sm font-medium text-amber-200 transition hover:bg-amber-500/18"
        >
          <span aria-hidden>🟡</span>
          Bihar AI
        </a>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="mb-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs outline-none focus:border-zinc-600"
          />
          <div className="max-h-52 space-y-2 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="px-2 py-1 text-xs text-zinc-500">No chat history yet.</p>
            ) : (
              <>
                {conversations.some((c) => c.pinned) ? (
                  <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Pinned
                  </p>
                ) : null}
                {conversations
                  .filter((c) => c.pinned)
                  .map((c) => (
                    <div key={c.conversationId} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          persistConversationId(c.conversationId);
                          setConversationId(c.conversationId);
                          setSidebarOpen(false);
                        }}
                        className={[
                          "w-full rounded-lg px-2 py-2 pr-8 text-left text-xs transition",
                          c.conversationId === conversationId
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-zinc-300 hover:bg-zinc-800/60",
                        ].join(" ")}
                      >
                        {renamingConversationId === c.conversationId ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={async () => {
                              const nextTitle = renameValue.trim();
                              if (nextTitle) await patchConversation(c.conversationId, { title: nextTitle });
                              setRenamingConversationId(null);
                              setActiveMenuConversationId(null);
                              if (user) await loadConversations(user, searchQuery);
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                const nextTitle = renameValue.trim();
                                if (nextTitle) await patchConversation(c.conversationId, { title: nextTitle });
                                setRenamingConversationId(null);
                                setActiveMenuConversationId(null);
                                if (user) await loadConversations(user, searchQuery);
                              }
                            }}
                            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 outline-none"
                          />
                        ) : (
                          <div className="truncate">📌 {c.title || c.preview || "Untitled chat"}</div>
                        )}
                      </button>
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-md px-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        onClick={() =>
                          setActiveMenuConversationId((prev) =>
                            prev === c.conversationId ? null : c.conversationId
                          )
                        }
                      >
                        ⋮
                      </button>
                      {activeMenuConversationId === c.conversationId ? (
                        <div className="absolute right-1 top-7 z-20 w-28 rounded-lg border border-zinc-700 bg-zinc-900 p-1 text-xs shadow-xl">
                          <button
                            type="button"
                            className="block w-full rounded px-2 py-1 text-left hover:bg-zinc-800"
                            onClick={() => {
                              setRenamingConversationId(c.conversationId);
                              setRenameValue(c.title || c.preview || "");
                            }}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="block w-full rounded px-2 py-1 text-left hover:bg-zinc-800"
                            onClick={async () => {
                              await patchConversation(c.conversationId, { pinned: false });
                              setActiveMenuConversationId(null);
                              if (user) await loadConversations(user, searchQuery);
                            }}
                          >
                            Unpin
                          </button>
                          <button
                            type="button"
                            className="block w-full rounded px-2 py-1 text-left text-red-300 hover:bg-zinc-800"
                            onClick={async () => {
                              if (!window.confirm("Delete this chat?")) return;
                              await deleteConversation(c.conversationId);
                              if (c.conversationId === conversationId) startNewChat();
                              setActiveMenuConversationId(null);
                              if (user) await loadConversations(user, searchQuery);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}

                {conversations.some((c) => !c.pinned) ? (
                  <p className="px-2 pt-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Recent
                  </p>
                ) : null}
                {conversations
                  .filter((c) => !c.pinned)
                  .map((c) => (
                    <div key={c.conversationId} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          persistConversationId(c.conversationId);
                          setConversationId(c.conversationId);
                          setSidebarOpen(false);
                        }}
                        className={[
                          "w-full rounded-lg px-2 py-2 pr-8 text-left text-xs transition",
                          c.conversationId === conversationId
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-zinc-300 hover:bg-zinc-800/60",
                        ].join(" ")}
                      >
                        {renamingConversationId === c.conversationId ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={async () => {
                              const nextTitle = renameValue.trim();
                              if (nextTitle) await patchConversation(c.conversationId, { title: nextTitle });
                              setRenamingConversationId(null);
                              setActiveMenuConversationId(null);
                              if (user) await loadConversations(user, searchQuery);
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                const nextTitle = renameValue.trim();
                                if (nextTitle) await patchConversation(c.conversationId, { title: nextTitle });
                                setRenamingConversationId(null);
                                setActiveMenuConversationId(null);
                                if (user) await loadConversations(user, searchQuery);
                              }
                            }}
                            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 outline-none"
                          />
                        ) : (
                          <div className="truncate">{c.title || c.preview || "Untitled chat"}</div>
                        )}
                      </button>
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-md px-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        onClick={() =>
                          setActiveMenuConversationId((prev) =>
                            prev === c.conversationId ? null : c.conversationId
                          )
                        }
                      >
                        ⋮
                      </button>
                      {activeMenuConversationId === c.conversationId ? (
                        <div className="absolute right-1 top-7 z-20 w-28 rounded-lg border border-zinc-700 bg-zinc-900 p-1 text-xs shadow-xl">
                          <button
                            type="button"
                            className="block w-full rounded px-2 py-1 text-left hover:bg-zinc-800"
                            onClick={() => {
                              setRenamingConversationId(c.conversationId);
                              setRenameValue(c.title || c.preview || "");
                            }}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="block w-full rounded px-2 py-1 text-left hover:bg-zinc-800"
                            onClick={async () => {
                              await patchConversation(c.conversationId, { pinned: true });
                              setActiveMenuConversationId(null);
                              if (user) await loadConversations(user, searchQuery);
                            }}
                          >
                            Pin
                          </button>
                          <button
                            type="button"
                            className="block w-full rounded px-2 py-1 text-left text-red-300 hover:bg-zinc-800"
                            onClick={async () => {
                              if (!window.confirm("Delete this chat?")) return;
                              await deleteConversation(c.conversationId);
                              if (c.conversationId === conversationId) startNewChat();
                              setActiveMenuConversationId(null);
                              if (user) await loadConversations(user, searchQuery);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-3 text-xs text-zinc-300">
            <p className="font-medium text-zinc-200">Today usage</p>
            <div className="mt-2 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-zinc-400">Messages</span>
                  <span
                    className={isLow(messageLeft) ? "text-amber-300" : "text-zinc-300"}
                  >
                    {typeof messageLeft === "number" ? messageLeft : "—"} left
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={[
                      "h-full rounded-full transition-all",
                      isLow(messageLeft) ? "bg-amber-400" : "bg-sky-400",
                    ].join(" ")}
                    style={{ width: `${messagePercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-zinc-400">Web searches</span>
                  <span className={isLow(webLeft) ? "text-amber-300" : "text-zinc-300"}>
                    {typeof webLeft === "number" ? webLeft : "—"} left
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={[
                      "h-full rounded-full transition-all",
                      isLow(webLeft) ? "bg-amber-400" : "bg-purple-400",
                    ].join(" ")}
                    style={{ width: `${webPercent}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-zinc-500">
              Daily counters reset at midnight (UTC).
            </p>
          </div>
          <a
            href="/settings"
            className="block rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-600"
          >
            Settings
          </a>
          <button
            type="button"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-left text-sm text-zinc-200 hover:border-zinc-600"
            onClick={startNewChat}
            disabled={loading || isTyping}
          >
            New chat
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-left text-sm text-zinc-200 hover:border-zinc-600"
            onClick={async () => {
              const auth = getFirebaseAuth();
              await signOut(auth);
              router.replace("/login");
            }}
            disabled={loading}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-800 px-2 py-1 text-xs lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                Menu
              </button>
              <p className="text-sm font-semibold">Evara AI</p>
              <a
                href="/bihar-ai"
                className="inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200 hover:bg-amber-500/20"
              >
                Bihar AI
              </a>
              <div className="hidden items-center gap-1 md:flex">
                {(["Simi", "Loa"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPersonality(p)}
                    className={[
                      "rounded-full border px-2 py-0.5 text-[10px] transition",
                      personality === p
                        ? "border-purple-500 bg-purple-500/15 text-zinc-100"
                        : "border-zinc-700 text-zinc-300 hover:border-zinc-500",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={startNewChat}
                disabled={loading || isTyping}
                className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-[10px] text-zinc-200 hover:border-zinc-500 disabled:opacity-50"
              >
                New chat
              </button>
              {process.env.NODE_ENV !== "production" ? (
                <div className="rounded-full border border-emerald-800/70 bg-emerald-950/40 px-3 py-1 text-[10px] text-emerald-300">
                  chatId: {conversationId.slice(-8)}
                </div>
              ) : null}
              <div className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[10px] text-zinc-300">
                Mode: {modeIcon[mode]} {modeLabel[mode]}
              </div>
              {incognitoActive ? (
                <div className="rounded-full border border-amber-600/60 bg-amber-500/15 px-3 py-1 text-[10px] text-amber-300">
                  Incognito active
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setShowTopMenu((v) => !v)}
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-[10px] text-zinc-300 hover:border-zinc-600"
              >
                ⚙️ Profile
              </button>
              {showTopMenu ? (
                <div className="absolute right-0 top-8 z-40 w-44 rounded-xl border border-zinc-700 bg-zinc-900 p-1 text-xs shadow-2xl">
                  <a
                    href="/settings"
                    className="block rounded-lg px-3 py-2 text-zinc-200 hover:bg-zinc-800"
                  >
                    Profile
                  </a>
                  <a
                    href="/settings"
                    className="block rounded-lg px-3 py-2 text-zinc-200 hover:bg-zinc-800"
                  >
                    Settings
                  </a>
                  <a
                    href="/settings#personalization"
                    className="block rounded-lg px-3 py-2 text-zinc-200 hover:bg-zinc-800"
                  >
                    Personalization
                  </a>
                  <a
                    href="/settings#upgrade"
                    className="block rounded-lg px-3 py-2 text-zinc-200 hover:bg-zinc-800"
                  >
                    Upgrade Plan
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      const auth = getFirebaseAuth();
                      await signOut(auth);
                      router.replace("/login");
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {conversationsLoadError ? (
          <div
            role="alert"
            className="border-b border-amber-600/40 bg-amber-950/90 px-4 py-3 text-sm text-amber-100"
          >
            <div className="mx-auto flex w-full max-w-4xl items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-50">Conversation list error</p>
                <p className="mt-0.5 text-xs text-amber-200/85">
                  If you see &quot;Failed to fetch&quot; or &quot;Cannot reach the API&quot;, start the backend (
                  <code className="rounded bg-amber-900/60 px-1">cd backend; npm run dev</code>
                  ) and open{" "}
                  <code className="rounded bg-amber-900/60 px-1">{API_BASE_URL}/health</code>.
                </p>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-amber-200/95">
                  {conversationsLoadError}
                </pre>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-amber-600/50 px-2 py-1 text-xs text-amber-100 hover:bg-amber-900/60"
                onClick={() => setConversationsLoadError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {historyFetchError ? (
          <div
            role="alert"
            className="border-b border-red-500/50 bg-red-950/95 px-4 py-3 text-sm text-red-100"
          >
            <div className="mx-auto flex w-full max-w-4xl items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-red-50">Could not load chat history</p>
                <p className="mt-0.5 text-xs text-red-200/90">
                  <span className="block">
                    If the details say &quot;Failed to fetch&quot; or &quot;Cannot reach the API&quot;, the Node
                    backend is not running — run{" "}
                    <code className="rounded bg-red-900/80 px-1">npm run dev</code> in{" "}
                    <code className="rounded bg-red-900/80 px-1">evara/backend</code> and check{" "}
                    <code className="rounded bg-red-900/80 px-1">{API_BASE_URL}/health</code>.
                  </span>
                  <span className="mt-1 block">
                    If you see MongoDB / Atlas errors, fix IP whitelist and{" "}
                    <code className="rounded bg-red-900/80 px-1">MONGODB_URI</code> in backend{" "}
                    <code className="rounded bg-red-900/80 px-1">.env</code>.
                  </span>
                </p>
                <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-red-200/95">
                  {historyFetchError}
                </pre>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-red-500/50 px-2 py-1 text-xs text-red-100 hover:bg-red-900/60"
                onClick={() => setHistoryFetchError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-6 text-sm text-zinc-400">
            {historyLoading ? "Loading chat history…" : "Loading…"}
          </main>
        ) : (
          <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 pb-4 pt-4 sm:px-4">
            <div className="flex-1 space-y-4 overflow-y-auto pb-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    m.role === "user" ? "flex justify-end" : "flex",
                    "animate-[evaraMessageIn_220ms_ease-out]",
                  ].join(" ")}
                >
                  <div className={m.role === "ai" ? "flex max-w-[92%] gap-2 sm:max-w-[85%]" : "max-w-[92%] sm:max-w-[85%]"}>
                    {m.role === "ai" ? (
                      <div className="mt-1 h-7 w-7 shrink-0 rounded-full border border-purple-500/40 bg-purple-500/20 text-center text-xs leading-7 text-purple-200">
                        E
                      </div>
                    ) : null}
                    <div
                      className={[
                        "group rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        m.role === "user"
                          ? "bg-zinc-100 text-black shadow-sm"
                          : "border border-zinc-800 bg-gradient-to-b from-[#1b1b1b] to-[#171717] text-zinc-100",
                      ].join(" ")}
                    >
                      <div className="chat-markdown whitespace-pre-wrap">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                      {m.sources?.length ? (
                        <div className="mt-3 space-y-1 text-xs text-zinc-300">
                          <p className="text-zinc-400">Sources:</p>
                          {m.sources.map((s) => (
                            <a
                              key={`${s.link}-${s.title}`}
                              href={s.link}
                              target="_blank"
                              rel="noreferrer"
                              className="block truncate underline decoration-zinc-600 underline-offset-2 hover:text-zinc-100"
                            >
                              {s.title}
                            </a>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => copyMessage(m.id, m.content)}
                          className="rounded-md border border-zinc-700/60 px-2 py-0.5 text-[11px] text-zinc-300 opacity-0 transition hover:border-zinc-500 hover:text-zinc-100 group-hover:opacity-100"
                        >
                          {copiedMessageId === m.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping ? (
                <div className="flex">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100">
                    {mode === "thinking" ? "Thinking…" : "Evara is typing…"}
                  </div>
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            <form
              className="sticky bottom-0 mt-2 rounded-[22px] border border-zinc-700/70 bg-[#1a1a1a]/95 p-2 backdrop-blur-md"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user || isTyping) return;

                const text = input.trim();
                if (!text) return;
                const activeConversationId = getConversationId();
                setConversationId((prev) =>
                  prev === activeConversationId ? prev : activeConversationId
                );

                setInput("");
                setMessages((prev) => [
                  ...prev,
                  { id: makeId(), role: "user", content: text },
                ]);
                setConversations((prev) =>
                  upsertConversation(prev, {
                    conversationId: activeConversationId,
                    title: titleFromPreview(text),
                    preview: text,
                    lastMessageAt: new Date().toISOString(),
                  })
                );
                setIsTyping(true);

                try {
                  const token = await user.getIdToken();
                  const resp = await fetch(`${API_BASE_URL}/v1/chat`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      message: text,
                      personality,
                      mode,
                      conversationId: activeConversationId,
                    }),
                  });

                  if (!resp.ok) {
                    const err = await resp.json().catch(() => null);
                    const backendMessage: string =
                      err?.error ?? `Chat failed (${resp.status})`;
                    if (err?.usage) {
                      setUsage({
                        messagesLeft: err.usage.messagesLeft,
                        webSearchLeft: err.usage.webSearchLeft,
                      });
                    }

                    const normalizedBackendMessage = backendMessage.toLowerCase();
                    if (
                      normalizedBackendMessage.includes("firebase admin missing") ||
                      normalizedBackendMessage.includes("auth not configured") ||
                      normalizedBackendMessage.includes("mongodb not configured") ||
                      normalizedBackendMessage.includes("mongo") ||
                      normalizedBackendMessage.includes("database unavailable")
                    ) {
                      const demoResp = await fetch(`${API_BASE_URL}/v1/demo-chat`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: text, personality, mode }),
                      });
                      if (demoResp.ok) {
                        const demoData: { reply?: string } = await demoResp.json();
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: makeId(),
                            role: "ai",
                            content:
                              demoData.reply ??
                              "I’m here with you. Tell me more about what you’re feeling.",
                          },
                        ]);
                        return;
                      }
                    }
                    throw new Error(backendMessage);
                  }

                  const data: {
                    reply?: string;
                    sources?: Array<{ title: string; link: string }>;
                    usage?: UsageInfo;
                    conversationId?: string;
                  } = await resp.json();
                  if (data.conversationId && data.conversationId !== conversationId) {
                    persistConversationId(data.conversationId);
                    setConversationId(data.conversationId);
                  }
                  if (data.usage) {
                    setUsage({
                      messagesLeft: data.usage.messagesLeft,
                      webSearchLeft: data.usage.webSearchLeft,
                    });
                  }
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: makeId(),
                      role: "ai",
                      content: data.reply ?? "I’m here with you. Tell me more.",
                      sources: data.sources ?? [],
                    },
                  ]);
                  setConversations((prev) =>
                    upsertConversation(prev, {
                      conversationId: data.conversationId ?? activeConversationId,
                      title: titleFromPreview(data.reply ?? text),
                      preview: data.reply ?? text,
                      lastMessageAt: new Date().toISOString(),
                    })
                  );
                  try {
                    await loadConversations(user);
                  } catch {
                    // Keep optimistic local history if server refresh fails.
                  }
                } catch (err) {
                  const errorText =
                    err instanceof Error
                      ? err.message
                      : "Something went wrong. Please try again.";
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: makeId(),
                      role: "ai",
                      content: `I couldn't process that yet: ${errorText}`,
                    },
                  ]);
                } finally {
                  setIsTyping(false);
                }
              }}
            >
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModeMenu(true)}
                  className="h-11 w-11 rounded-full border border-zinc-700 bg-zinc-900/70 text-base transition hover:scale-105 hover:border-zinc-500"
                  aria-label="Open mode selector"
                >
                  +
                </button>
                <textarea
                  rows={1}
                  className="max-h-28 flex-1 resize-none rounded-full border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm outline-none focus:border-zinc-500"
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const form = e.currentTarget.form;
                      if (form) form.requestSubmit();
                    }
                  }}
                  disabled={isTyping}
                />
                <button
                  type="button"
                  className="h-11 w-11 rounded-full border border-zinc-700 bg-zinc-900/70 text-base text-zinc-300 transition hover:border-zinc-500"
                  aria-label="Voice input (coming soon)"
                  title="Voice input coming soon"
                >
                  🎤
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-full bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-60"
                  disabled={isTyping || input.trim().length === 0}
                >
                  ➤
                </button>
              </div>
            </form>
          </main>
        )}
      </div>

      {showModeMenu ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center"
          onClick={() => setShowModeMenu(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-zinc-100">Choose mode</p>
            <p className="mt-1 text-xs text-zinc-400">
              Switch behavior instantly without losing memory.
            </p>
            <div className="mt-3 space-y-2">
              {(
                [
                  ["personal", "❤️", "Personal"],
                  ["web", "🌐", "Web Search"],
                  ["study", "🎓", "Study"],
                  ["thinking", "🧠", "Thinking"],
                  ["business", "💼", "Business"],
                ] as const
              ).map(([key, icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setMode(key);
                    setShowModeMenu(false);
                  }}
                  className={[
                    "flex h-11 w-full items-center justify-between rounded-2xl border px-4 text-sm transition",
                    mode === key
                      ? "border-purple-500 bg-purple-500/15 text-zinc-50"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-zinc-600",
                  ].join(" ")}
                >
                  <span>
                    {icon} {label}
                  </span>
                  {mode === key ? <span className="text-xs">Active</span> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showIncognitoToast ? (
        <div className="fixed bottom-24 left-1/2 z-[70] w-[92%] max-w-md -translate-x-1/2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 shadow-xl backdrop-blur-sm">
          Incognito is ON - this chat won&apos;t be saved.
        </div>
      ) : null}
    </div>
  );
}

