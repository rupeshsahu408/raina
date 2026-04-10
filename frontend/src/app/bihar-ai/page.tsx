"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getFirebaseAuth } from "@/lib/firebaseClient";

export type BiharCategory =
  | "education"
  | "news"
  | "politics"
  | "culture"
  | "student_help"
  | "jobs"
  | "agriculture";

type Role = "user" | "ai";
type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  sources?: Array<{ title: string; link: string }>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

const BIHAR_CATEGORIES: ReadonlyArray<{
  id: BiharCategory;
  label: string;
  emoji: string;
}> = [
  { id: "education", label: "Education", emoji: "🎓" },
  { id: "news", label: "News", emoji: "📰" },
  { id: "politics", label: "Politics", emoji: "🏛️" },
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "student_help", label: "Student Help", emoji: "👨‍🎓" },
  { id: "jobs", label: "Jobs", emoji: "💼" },
  { id: "agriculture", label: "Agriculture", emoji: "🌾" },
];

const BIHAR_DISTRICTS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "all", label: "All Bihar" },
  { value: "patna", label: "Patna" },
  { value: "gaya", label: "Gaya" },
  { value: "muzaffarpur", label: "Muzaffarpur" },
  { value: "bhagalpur", label: "Bhagalpur" },
  { value: "purnia", label: "Purnia" },
  { value: "darbhanga", label: "Darbhanga" },
  { value: "sitamarhi", label: "Sitamarhi" },
  { value: "chapra", label: "Chapra" },
  { value: "arrah", label: "Arrah" },
  { value: "begusarai", label: "Begusarai" },
  { value: "katihar", label: "Katihar" },
  { value: "munger", label: "Munger" },
  { value: "saharsa", label: "Saharsa" },
  { value: "samastipur", label: "Samastipur" },
  { value: "siwan", label: "Siwan" },
  { value: "hajipur", label: "Hajipur" },
  { value: "dehri", label: "Dehri" },
  { value: "bettiah", label: "Bettiah" },
  { value: "motihari", label: "Motihari" },
  { value: "nawada", label: "Nawada" },
  { value: "rohtas", label: "Rohtas" },
  { value: "bhojpur", label: "Bhojpur" },
  { value: "jamui", label: "Jamui" },
  { value: "vaishali", label: "Vaishali" },
  { value: "supaul", label: "Supaul" },
  { value: "kishanganj", label: "Kishanganj" },
  { value: "madhepura", label: "Madhepura" },
  { value: "sheohar", label: "Sheohar" },
  { value: "araria", label: "Araria" },
  { value: "kaimur", label: "Kaimur" },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getBiharConversationId() {
  const existing = sessionStorage.getItem("bihar_ai_conversation_id");
  if (existing) return existing;
  const generated = `bihar_conv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  sessionStorage.setItem("bihar_ai_conversation_id", generated);
  return generated;
}

function createBiharConversationId() {
  const id = `bihar_conv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  sessionStorage.setItem("bihar_ai_conversation_id", id);
  return id;
}

function greetingMessage(): ChatMessage {
  return {
    id: "greeting",
    role: "ai",
    content:
      "Namaste — I’m **Bihar AI**, focused on Bihar. **Auto Mode** is on: I’ll pick the category from each question (or tap a category to lock it). Turn on **Web** for live search — words like *latest*, *aaj*, *abhi* also turn it on for that message.",
  };
}

export default function BiharAiPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /** When true, category is detected server-side each message; sidebar categories lock this off. */
  const [categoryAutoMode, setCategoryAutoMode] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<BiharCategory>("education");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [webEnabled, setWebEnabled] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("default");
  const [lastResolvedCategory, setLastResolvedCategory] =
    useState<BiharCategory | null>(null);
  const [lastWebAutoBoost, setLastWebAutoBoost] = useState(false);
  /** After last reply: whether server used web search (includes keyword auto). Null = no reply yet this session. */
  const [lastServerWebEffective, setLastServerWebEffective] = useState<
    boolean | null
  >(null);

  const [messages, setMessages] = useState<ChatMessage[]>([greetingMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [usage, setUsage] = useState<{
    messagesLeft?: number;
    webSearchLeft?: number;
  }>({});

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) router.replace("/login");
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!user || !currentChatId || currentChatId === "default") return;
    (async () => {
      try {
        setHistoryLoading(true);
        const token = await user.getIdToken();
        const resp = await fetch(
          `${API_BASE_URL}/v1/conversations/${encodeURIComponent(currentChatId)}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!resp.ok) return;
        const data: {
          messages?: Array<{ id: string; role: Role; content: string }>;
        } = await resp.json();
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages(
            data.messages.map((m) => ({
              id: m.id || makeId(),
              role: m.role === "user" ? "user" : "ai",
              content: m.content,
            }))
          );
        } else {
          setMessages([greetingMessage()]);
        }
      } catch {
        // keep local state
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, [user, currentChatId]);

  const initConversation = useCallback(() => {
    const id = getBiharConversationId();
    setCurrentChatId(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    initConversation();
  }, [user, initConversation]);

  const lockedCategoryLabel = useMemo(() => {
    return BIHAR_CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? "";
  }, [selectedCategory]);

  const lastResolvedLabel = useMemo(() => {
    if (!lastResolvedCategory) return "";
    return (
      BIHAR_CATEGORIES.find((c) => c.id === lastResolvedCategory)?.label ?? ""
    );
  }, [lastResolvedCategory]);

  const districtLabel = useMemo(() => {
    return (
      BIHAR_DISTRICTS.find((d) => d.value === selectedDistrict)?.label ??
      selectedDistrict
    );
  }, [selectedDistrict]);

  const contextChip = useMemo(() => {
    const catPart = categoryAutoMode
      ? `Auto 🤖 → ${lastResolvedLabel || "…"}`
      : lockedCategoryLabel;
    const webStr =
      lastServerWebEffective === null
        ? webEnabled
          ? "ON"
          : "OFF"
        : lastServerWebEffective
          ? "ON"
          : "OFF";
    const webExtra =
      lastServerWebEffective === true && lastWebAutoBoost ? " (auto)" : "";
    return `${catPart} | ${districtLabel} | Web ${webStr}${webExtra}`;
  }, [
    categoryAutoMode,
    lastResolvedLabel,
    lockedCategoryLabel,
    districtLabel,
    webEnabled,
    lastWebAutoBoost,
    lastServerWebEffective,
  ]);

  const startNewChat = () => {
    const nextId = createBiharConversationId();
    setCurrentChatId(nextId);
    setMessages([greetingMessage()]);
    setInput("");
    setLastResolvedCategory(null);
    setLastWebAutoBoost(false);
    setLastServerWebEffective(null);
    setSidebarOpen(false);
  };

  const accentBorder = "border-amber-400/50";
  const accentBg = "bg-amber-400/10";
  const accentText = "text-amber-300";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-4 py-4">
        <p className={`text-sm font-semibold ${accentText}`}>⭐ Bihar AI</p>
        <p className="mt-1 text-[11px] text-zinc-500">
          Bihar-focused assistant — separate from Evara chat.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Categories
        </p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setCategoryAutoMode(true);
              setSidebarOpen(false);
            }}
            className={[
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
              categoryAutoMode
                ? `${accentBorder} ${accentBg} ${accentText}`
                : "border border-transparent text-zinc-300 hover:bg-zinc-800/80",
            ].join(" ")}
          >
            <span aria-hidden>🤖</span>
            Auto (AI decides)
          </button>
          {BIHAR_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategoryAutoMode(false);
                setSelectedCategory(c.id);
                setSidebarOpen(false);
              }}
              className={[
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                !categoryAutoMode && selectedCategory === c.id
                  ? `${accentBorder} ${accentBg} ${accentText}`
                  : "border border-transparent text-zinc-300 hover:bg-zinc-800/80",
              ].join(" ")}
            >
              <span aria-hidden>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-6 px-1">
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className={`mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400/60`}
          >
            {BIHAR_DISTRICTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={startNewChat}
          disabled={isTyping}
          className={`w-full rounded-xl border ${accentBorder} ${accentBg} px-3 py-2 text-sm font-medium ${accentText} transition hover:bg-amber-400/15 disabled:opacity-50`}
        >
          ➕ New chat
        </button>
        <a
          href="/chat"
          className="mt-2 block rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-center text-sm text-zinc-300 hover:border-zinc-600"
        >
          ← Evara AI
        </a>
        <button
          type="button"
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-left text-sm text-zinc-200 hover:border-zinc-600"
          onClick={async () => {
            const auth = getFirebaseAuth();
            await signOut(auth);
            router.replace("/login");
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-zinc-800 bg-[#0c0c0c] lg:flex">
        {sidebarInner}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(100%,320px)] flex-col border-r border-zinc-800 bg-[#0c0c0c] shadow-2xl">
            {sidebarInner}
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 px-3 py-3 backdrop-blur-md sm:px-4">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-zinc-800 px-2 py-1 text-xs lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  ☰
                </button>
                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${accentText}`}>
                    🟡 Bihar AI
                  </p>
                  {categoryAutoMode ? (
                    <p className="truncate text-[10px] text-zinc-500">
                      Auto Mode ON 🤖 — AI khud samajh raha hai
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWebEnabled((v) => !v)}
                  className={[
                    "rounded-full border px-3 py-1 text-[11px] font-medium transition",
                    webEnabled
                      ? `${accentBorder} ${accentBg} ${accentText}`
                      : "border-zinc-700 bg-zinc-900/70 text-zinc-400",
                  ].join(" ")}
                  aria-pressed={webEnabled}
                >
                  🌐 {webEnabled ? "ON" : "OFF"}
                </button>
              </div>
            </div>
            <div className="lg:hidden">
              <p className="text-[11px] text-zinc-500">
                Category:{" "}
                <span className="text-zinc-200">
                  {categoryAutoMode ? (
                    <>
                      🤖 Auto
                      {lastResolvedLabel ? ` → ${lastResolvedLabel}` : null}
                    </>
                  ) : (
                    <>
                      {BIHAR_CATEGORIES.find((c) => c.id === selectedCategory)
                        ?.emoji}{" "}
                      {lockedCategoryLabel}
                    </>
                  )}
                </span>
              </p>
            </div>
            <div
              className={`rounded-full border px-3 py-1 text-[11px] text-zinc-400 ${accentBorder} bg-zinc-900/40`}
            >
              {contextChip}
            </div>
            {(typeof usage.messagesLeft === "number" ||
              typeof usage.webSearchLeft === "number") && (
              <p className="text-[10px] text-zinc-500">
                Today:{" "}
                {typeof usage.messagesLeft === "number"
                  ? `${usage.messagesLeft} msgs left`
                  : null}
                {typeof usage.messagesLeft === "number" &&
                typeof usage.webSearchLeft === "number"
                  ? " · "
                  : null}
                {typeof usage.webSearchLeft === "number"
                  ? `${usage.webSearchLeft} web left`
                  : null}
              </p>
            )}
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 pb-28 pt-3 sm:px-4">
          {historyLoading ? (
            <p className="text-center text-xs text-zinc-500">Loading chat…</p>
          ) : null}
          <div className="flex-1 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={[
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                ].join(" ")}
              >
                <div
                  className={[
                    "max-w-[92%] rounded-2xl border px-3 py-2 text-sm",
                    m.role === "user"
                      ? "border-amber-500/30 bg-amber-500/10 text-zinc-50"
                      : "border-zinc-800 bg-zinc-900/80 text-zinc-100",
                  ].join(" ")}
                >
                  <div className="chat-markdown whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                  {m.sources?.length ? (
                    <div className="mt-2 space-y-1 border-t border-zinc-800 pt-2 text-xs text-zinc-400">
                      <p className="text-zinc-500">Sources</p>
                      {m.sources.map((s) => (
                        <a
                          key={`${s.link}-${s.title}`}
                          href={s.link}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate underline decoration-zinc-600"
                        >
                          {s.title}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {isTyping ? (
              <div className="flex">
                <div
                  className={`rounded-2xl border ${accentBorder} ${accentBg} px-3 py-2 text-xs ${accentText}`}
                >
                  Bihar AI is typing…
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
        </main>

        <form
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-800 bg-zinc-950/95 p-3 backdrop-blur-md lg:left-[280px]"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!user || isTyping) return;
            const text = input.trim();
            if (!text) return;

            const activeId =
              currentChatId === "default" ? getBiharConversationId() : currentChatId;
            if (currentChatId === "default") {
              setCurrentChatId(activeId);
            }

            setInput("");
            setMessages((prev) => [
              ...prev,
              { id: makeId(), role: "user", content: text },
            ]);
            setIsTyping(true);
            setLastWebAutoBoost(false);
            setLastServerWebEffective(null);

            try {
              const token = await user.getIdToken();
              const resp = await fetch(`${API_BASE_URL}/v1/bihar-ai/chat`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  message: text,
                  categoryAuto: categoryAutoMode,
                  category: categoryAutoMode ? "auto" : selectedCategory,
                  district: selectedDistrict,
                  webSearch: webEnabled,
                  conversationId: activeId,
                }),
              });

              if (!resp.ok) {
                const err = await resp.json().catch(() => null);
                const backendMessage: string =
                  err?.error ?? `Request failed (${resp.status})`;
                if (err?.usage) {
                  setUsage({
                    messagesLeft: err.usage.messagesLeft,
                    webSearchLeft: err.usage.webSearchLeft,
                  });
                }
                throw new Error(backendMessage);
              }

              const data: {
                reply?: string;
                conversationId?: string;
                category?: BiharCategory;
                webAutoBoost?: boolean;
                webSearchEffective?: boolean;
                sources?: Array<{ title: string; link: string }>;
                usage?: { messagesLeft?: number; webSearchLeft?: number };
              } = await resp.json();

              if (data.category && BIHAR_CATEGORIES.some((x) => x.id === data.category)) {
                setLastResolvedCategory(data.category);
              }
              if (typeof data.webAutoBoost === "boolean") {
                setLastWebAutoBoost(data.webAutoBoost);
              }
              if (typeof data.webSearchEffective === "boolean") {
                setLastServerWebEffective(data.webSearchEffective);
              }

              if (data.conversationId) {
                sessionStorage.setItem(
                  "bihar_ai_conversation_id",
                  data.conversationId
                );
                setCurrentChatId(data.conversationId);
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
                  content: data.reply ?? "No response.",
                  sources: data.sources ?? [],
                },
              ]);
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
                  content: `**Error:** ${errorText}`,
                },
              ]);
            } finally {
              setIsTyping(false);
            }
          }}
        >
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <textarea
              rows={1}
              className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
              placeholder="Ask about Bihar…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              disabled={isTyping}
              className={`h-11 shrink-0 rounded-2xl border px-4 text-sm font-medium transition disabled:opacity-50 ${accentBorder} ${accentBg} ${accentText} hover:bg-amber-400/20`}
            >
              Send
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-zinc-600">
            Web {webEnabled ? "ON" : "OFF"} — toggle or use words like *latest / aaj / abhi* to
            auto-enable search for that message.
          </p>
        </form>
      </div>
    </div>
  );
}
