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
  { id: "education",    label: "Education",    emoji: "🎓" },
  { id: "news",         label: "News",         emoji: "📰" },
  { id: "politics",     label: "Politics",     emoji: "🏛️" },
  { id: "culture",      label: "Culture",      emoji: "🎭" },
  { id: "student_help", label: "Student Help", emoji: "👨‍🎓" },
  { id: "jobs",         label: "Jobs",         emoji: "💼" },
  { id: "agriculture",  label: "Agriculture",  emoji: "🌾" },
];

const BIHAR_DISTRICTS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "all",          label: "All Bihar" },
  { value: "patna",        label: "Patna" },
  { value: "gaya",         label: "Gaya" },
  { value: "muzaffarpur",  label: "Muzaffarpur" },
  { value: "bhagalpur",    label: "Bhagalpur" },
  { value: "purnia",       label: "Purnia" },
  { value: "darbhanga",    label: "Darbhanga" },
  { value: "sitamarhi",    label: "Sitamarhi" },
  { value: "chapra",       label: "Chapra" },
  { value: "arrah",        label: "Arrah" },
  { value: "begusarai",    label: "Begusarai" },
  { value: "katihar",      label: "Katihar" },
  { value: "munger",       label: "Munger" },
  { value: "saharsa",      label: "Saharsa" },
  { value: "samastipur",   label: "Samastipur" },
  { value: "siwan",        label: "Siwan" },
  { value: "hajipur",      label: "Hajipur" },
  { value: "dehri",        label: "Dehri" },
  { value: "bettiah",      label: "Bettiah" },
  { value: "motihari",     label: "Motihari" },
  { value: "nawada",       label: "Nawada" },
  { value: "rohtas",       label: "Rohtas" },
  { value: "bhojpur",      label: "Bhojpur" },
  { value: "jamui",        label: "Jamui" },
  { value: "vaishali",     label: "Vaishali" },
  { value: "supaul",       label: "Supaul" },
  { value: "kishanganj",   label: "Kishanganj" },
  { value: "madhepura",    label: "Madhepura" },
  { value: "sheohar",      label: "Sheohar" },
  { value: "araria",       label: "Araria" },
  { value: "kaimur",       label: "Kaimur" },
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
      "Namaste — I'm **Bihar AI**, focused on Bihar. **Auto Mode** is on: I'll pick the category from each question (or tap a category to lock it). Turn on **Web** for live search — words like *latest*, *aaj*, *abhi* also turn it on for that message.",
  };
}

// ── SVG Icons ──────────────────────────────────────────────────────────────
function IconSend({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPlus({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
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
function IconX({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconLogout({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconGlobe({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IconCopy({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconCheck({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMic({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot inline-block h-2 w-2 rounded-full bg-amber-400/70"
          style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}

function BiharAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0d0d14] ring-1 ring-white/[0.08] overflow-hidden">
      <img
        src="/evara-logo.png"
        alt="Evara"
        className="h-full w-full object-contain p-0.5"
        draggable={false}
      />
    </div>
  );
}

export default function BiharAiPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [categoryAutoMode, setCategoryAutoMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BiharCategory>("education");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [webEnabled, setWebEnabled] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("default");
  const [lastResolvedCategory, setLastResolvedCategory] = useState<BiharCategory | null>(null);
  const [lastWebAutoBoost, setLastWebAutoBoost] = useState(false);
  const [lastServerWebEffective, setLastServerWebEffective] = useState<boolean | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([greetingMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [usage, setUsage] = useState<{ messagesLeft?: number; webSearchLeft?: number }>({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

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
        const data: { messages?: Array<{ id: string; role: Role; content: string }> } = await resp.json();
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages(data.messages.map((m) => ({ id: m.id || makeId(), role: m.role === "user" ? "user" : "ai", content: m.content })));
        } else {
          setMessages([greetingMessage()]);
        }
      } catch { /* keep local state */ } finally {
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

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const lockedCategoryLabel = useMemo(
    () => BIHAR_CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? "",
    [selectedCategory]
  );
  const lastResolvedLabel = useMemo(
    () => (lastResolvedCategory ? BIHAR_CATEGORIES.find((c) => c.id === lastResolvedCategory)?.label ?? "" : ""),
    [lastResolvedCategory]
  );
  const districtLabel = useMemo(
    () => BIHAR_DISTRICTS.find((d) => d.value === selectedDistrict)?.label ?? selectedDistrict,
    [selectedDistrict]
  );

  const contextChip = useMemo(() => {
    const catPart = categoryAutoMode ? `Auto → ${lastResolvedLabel || "…"}` : lockedCategoryLabel;
    const webStr = lastServerWebEffective === null ? (webEnabled ? "ON" : "OFF") : (lastServerWebEffective ? "ON" : "OFF");
    const webExtra = lastServerWebEffective === true && lastWebAutoBoost ? " (auto)" : "";
    return `${catPart} · ${districtLabel} · Web ${webStr}${webExtra}`;
  }, [categoryAutoMode, lastResolvedLabel, lockedCategoryLabel, districtLabel, webEnabled, lastWebAutoBoost, lastServerWebEffective]);

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
        recognition.lang = "hi-IN";
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
            setMicError("Speech-to-text unavailable in this environment. Click ✓ to finish.");
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || isTyping) return;
    const text = input.trim();
    if (!text) return;

    const activeId = currentChatId === "default" ? getBiharConversationId() : currentChatId;
    if (currentChatId === "default") setCurrentChatId(activeId);

    setInput("");
    setMessages((prev) => [...prev, { id: makeId(), role: "user", content: text }]);
    setIsTyping(true);
    setLastWebAutoBoost(false);
    setLastServerWebEffective(null);

    try {
      const token = await user.getIdToken();
      const resp = await fetch(`${API_BASE_URL}/v1/bihar-ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
        const backendMessage: string = err?.error ?? `Request failed (${resp.status})`;
        if (err?.usage) setUsage({ messagesLeft: err.usage.messagesLeft, webSearchLeft: err.usage.webSearchLeft });
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

      if (data.category && BIHAR_CATEGORIES.some((x) => x.id === data.category)) setLastResolvedCategory(data.category);
      if (typeof data.webAutoBoost === "boolean") setLastWebAutoBoost(data.webAutoBoost);
      if (typeof data.webSearchEffective === "boolean") setLastServerWebEffective(data.webSearchEffective);
      if (data.conversationId) { sessionStorage.setItem("bihar_ai_conversation_id", data.conversationId); setCurrentChatId(data.conversationId); }
      if (data.usage) setUsage({ messagesLeft: data.usage.messagesLeft, webSearchLeft: data.usage.webSearchLeft });

      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "ai", content: data.reply ?? "No response.", sources: data.sources ?? [] },
      ]);
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { id: makeId(), role: "ai", content: `**Error:** ${errorText}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <span className="text-sm font-bold text-zinc-900">B</span>
          </div>
          <p className="text-[13px] text-zinc-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <>
    <div className="flex h-screen overflow-hidden bg-[#111111] text-zinc-100">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════ */}
      <aside className={[
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.06] bg-[#0d0d0d] transition-transform duration-300",
        "lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] px-4 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-zinc-900 shadow-lg">
              B
            </div>
            <div>
              <p className="text-[14px] font-semibold text-amber-300 leading-tight">Bihar AI</p>
              <p className="text-[10px] text-zinc-600 leading-tight">Bihar-focused assistant</p>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-zinc-600 hover:text-zinc-300 lg:hidden">
            <IconX size={14} />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 py-3">
          <button
            type="button"
            onClick={startNewChat}
            disabled={isTyping}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] py-2.5 text-[13px] font-medium text-amber-300/90 transition hover:bg-amber-500/[0.12] disabled:opacity-50"
          >
            <IconPlus size={13} />
            New chat
          </button>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-3">
          <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Category</p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => { setCategoryAutoMode(true); setSidebarOpen(false); }}
              className={[
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition",
                categoryAutoMode
                  ? "bg-amber-500/[0.1] text-amber-300 ring-1 ring-inset ring-amber-500/20"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
              ].join(" ")}
            >
              <span className="text-[14px]">🤖</span>
              <span className="font-medium">Auto (AI decides)</span>
            </button>
            {BIHAR_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setCategoryAutoMode(false); setSelectedCategory(c.id); setSidebarOpen(false); }}
                className={[
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition",
                  !categoryAutoMode && selectedCategory === c.id
                    ? "bg-amber-500/[0.1] text-amber-300 ring-1 ring-inset ring-amber-500/20"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                ].join(" ")}
              >
                <span className="text-[14px]">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>

          {/* District */}
          <div className="mt-4 px-1">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">District</p>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-amber-400/40 focus:bg-white/[0.06]"
            >
              {BIHAR_DISTRICTS.map((d) => (
                <option key={d.value} value={d.value} className="bg-zinc-900">{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="border-t border-white/[0.05] px-3 py-3 space-y-1.5">
          <a
            href="/chat"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 text-[12px] text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            ← Evara AI
          </a>
          <button
            type="button"
            onClick={async () => { const auth = getFirebaseAuth(); await signOut(auth); router.replace("/login"); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[12px] text-zinc-600 hover:text-red-400 transition"
          >
            <IconLogout size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MAIN
      ══════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">

        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#111111]/95 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-1.5 text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-200 lg:hidden"
            >
              <IconMenu size={18} />
            </button>
            <div>
              <p className="text-[14px] font-semibold text-amber-300 leading-tight">Bihar AI</p>
              <p className="text-[11px] text-zinc-600 leading-tight">{contextChip}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Usage */}
            {(typeof usage.messagesLeft === "number" || typeof usage.webSearchLeft === "number") && (
              <span className="hidden text-[11px] text-zinc-600 sm:block">
                {typeof usage.messagesLeft === "number" ? `${usage.messagesLeft} msgs` : ""}
                {typeof usage.messagesLeft === "number" && typeof usage.webSearchLeft === "number" ? " · " : ""}
                {typeof usage.webSearchLeft === "number" ? `${usage.webSearchLeft} web` : ""} left
              </span>
            )}

            {/* Web toggle */}
            <button
              type="button"
              onClick={() => setWebEnabled((v) => !v)}
              className={[
                "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-medium transition",
                webEnabled
                  ? "border-amber-400/40 bg-amber-400/[0.08] text-amber-300"
                  : "border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:text-zinc-300",
              ].join(" ")}
              aria-pressed={webEnabled}
            >
              <IconGlobe size={13} />
              Web {webEnabled ? "ON" : "OFF"}
            </button>

            {/* Category badge */}
            <div className="hidden items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[12px] text-zinc-400 sm:flex">
              {categoryAutoMode
                ? <>🤖 Auto{lastResolvedLabel ? ` → ${lastResolvedLabel}` : ""}</>
                : <>{BIHAR_CATEGORIES.find((c) => c.id === selectedCategory)?.emoji} {lockedCategoryLabel}</>}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
            {historyLoading && (
              <p className="text-center text-[12px] text-zinc-600">Loading chat…</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={["msg-in", m.role === "user" ? "flex justify-end" : "flex items-start gap-3"].join(" ")}>
                {m.role === "ai" && <BiharAvatar />}
                <div className={[
                  "group relative",
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-br-sm bg-amber-500/[0.08] px-4 py-3 text-[14px] leading-relaxed text-zinc-100 ring-1 ring-inset ring-amber-500/15"
                    : "flex-1 min-w-0",
                ].join(" ")}>
                  {m.role === "ai" ? (
                    <div className="text-[14px] text-zinc-100">
                      <div className="chat-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[12px]">
                          <p className="font-medium text-zinc-400 mb-1">Sources</p>
                          {m.sources.map((s) => (
                            <a key={`${s.link}-${s.title}`} href={s.link} target="_blank" rel="noreferrer"
                              className="block truncate text-amber-400 underline decoration-amber-400/40 underline-offset-2 hover:text-amber-300">
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

            {isTyping && (
              <div className="msg-in flex items-start gap-3">
                <BiharAvatar />
                <div className="rounded-2xl border border-amber-500/[0.15] bg-amber-500/[0.04] px-4 py-3">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-white/[0.05] bg-[#111111] px-4 py-4">
          <div className="mx-auto max-w-3xl">
            {isListening ? (
              <VoiceRecordingBar
                analyserRef={analyserRef}
                isTranscribing={isTranscribing}
                onCancel={() => stopRecording(false)}
                onConfirm={() => stopRecording(true)}
                accent="amber"
              />
            ) : (
              <form
                onSubmit={handleSubmit}
                className="relative rounded-2xl border border-white/[0.09] bg-[#1c1c1c] p-3 shadow-xl ring-1 ring-inset ring-white/[0.04] transition-all focus-within:border-amber-400/30 focus-within:ring-amber-400/[0.07]"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className="w-full resize-none bg-transparent pr-16 text-[14px] leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600"
                  placeholder="Bihar ke baare mein kuch bhi pucho…"
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCategoryAutoMode(true)}
                      className={[
                        "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition",
                        categoryAutoMode
                          ? "bg-amber-500/[0.1] text-amber-300 ring-1 ring-amber-500/20"
                          : "text-zinc-600 hover:text-zinc-400",
                      ].join(" ")}
                    >
                      🤖 Auto
                    </button>
                    {BIHAR_CATEGORIES.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setCategoryAutoMode(false); setSelectedCategory(c.id); }}
                        className={[
                          "hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] transition sm:flex",
                          !categoryAutoMode && selectedCategory === c.id
                            ? "bg-amber-500/[0.1] text-amber-300 ring-1 ring-amber-500/20"
                            : "text-zinc-600 hover:text-zinc-400",
                        ].join(" ")}
                      >
                        {c.emoji}
                      </button>
                    ))}
                  </div>
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
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-zinc-900 shadow-lg transition hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
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
              Words like &quot;latest / aaj / abhi&quot; auto-enable web search.{" "}
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
    </div>

    <CookiePreferencesModal open={showCookieModal} onClose={() => setShowCookieModal(false)} />
    </>
  );
}
