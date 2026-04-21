"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LANGUAGES, type Language } from "./languages";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

type Turn = {
  id: string;
  inputText: string;
  targetLanguage: Language;
  translation: string | null;
  explanation: string | null;
  status: "loading" | "done" | "error";
  errorMsg?: string;
  showSimplify: boolean;
  simplifying: boolean;
};

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function TranslatePage() {
  const [target, setTarget] = useState<Language>(LANGUAGES[0]);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Aggressively ensure no chat history persists — wipe any stale storage on mount and unmount
  useEffect(() => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("plyndrox_translate_"))
        .forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("plyndrox_translate_"))
        .forEach((k) => sessionStorage.removeItem(k));
    } catch {}
    return () => {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("plyndrox_translate_"))
          .forEach((k) => localStorage.removeItem(k));
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns.length, turns[turns.length - 1]?.translation, turns[turns.length - 1]?.explanation]);

  const filteredLanguages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [search]);

  function newChat() {
    setTurns([]);
    setInput("");
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const turn: Turn = {
      id: genId(),
      inputText: text,
      targetLanguage: target,
      translation: null,
      explanation: null,
      status: "loading",
      showSimplify: false,
      simplifying: false,
    };
    setTurns((prev) => [...prev, turn]);
    setInput("");

    try {
      const res = await fetch(`${API_BASE_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text,
          targetLanguage: `${target.name} (${target.native})`,
          mode: "translate",
        }),
      });
      const data = await res.json();
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turn.id
            ? {
                ...t,
                translation: data.translation || null,
                status: data.translation ? "done" : "error",
                errorMsg: data.translation ? undefined : data.error || "Translation failed",
                showSimplify: !!data.translation,
              }
            : t
        )
      );
    } catch (err) {
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turn.id
            ? { ...t, status: "error", errorMsg: "Network error. Please try again." }
            : t
        )
      );
    }
  }

  async function handleSimplify(turnId: string) {
    const turn = turns.find((t) => t.id === turnId);
    if (!turn) return;
    setTurns((prev) =>
      prev.map((t) => (t.id === turnId ? { ...t, simplifying: true } : t))
    );

    try {
      const res = await fetch(`${API_BASE_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text: turn.inputText,
          targetLanguage: `${turn.targetLanguage.name} (${turn.targetLanguage.native})`,
          mode: "simplify",
        }),
      });
      const data = await res.json();
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? {
                ...t,
                explanation: data.explanation || null,
                simplifying: false,
                showSimplify: false,
              }
            : t
        )
      );
    } catch {
      setTurns((prev) =>
        prev.map((t) => (t.id === turnId ? { ...t, simplifying: false } : t))
      );
    }
  }

  function copyText(text: string) {
    try {
      navigator.clipboard.writeText(text);
    } catch {}
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 text-zinc-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
              </svg>
            </span>
            <span>Translate</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="border-b border-zinc-200 px-4 py-3">
          <button
            onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 5v14"/><path d="M5 12h14"/>
            </svg>
            New Chat
          </button>
          <p className="mt-2 text-[11px] leading-snug text-zinc-500">
            Chats are never saved. Starting a new chat erases everything.
          </p>
        </div>

        <div className="border-b border-zinc-200 px-4 py-3">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {filteredLanguages.length} languages
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {filteredLanguages.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-zinc-500">No languages found</p>
          ) : (
            filteredLanguages.map((lang) => {
              const active = lang.code === target.code && lang.name === target.name;
              return (
                <button
                  key={`${lang.code}-${lang.name}`}
                  onClick={() => {
                    setTarget(lang);
                    setSidebarOpen(false);
                  }}
                  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                    active
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                      : "text-zinc-800 hover:bg-zinc-100"
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{lang.flag}</span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm font-semibold truncate ${active ? "text-white" : "text-zinc-900"}`}>
                      {lang.name}
                    </span>
                    <span className={`block text-xs truncate ${active ? "text-indigo-100" : "text-zinc-500"}`}>
                      {lang.native}
                    </span>
                  </span>
                  {active && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Translating to</p>
              <p className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <span className="text-lg">{target.flag}</span>
                {target.name}
                <span className="font-normal text-zinc-500">·</span>
                <span className="font-normal text-zinc-600">{target.native}</span>
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="hidden rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 sm:inline-block"
          >
            ← Back to Plyndrox
          </Link>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {turns.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                  <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
                </svg>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Plyndrox Translate</h1>
              <p className="mt-3 max-w-md text-zinc-600">
                Type anything in any language and translate it naturally into{" "}
                <span className="font-bold text-zinc-900">{target.name}</span>. Typos are fixed automatically — just type freely.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "Hello, how are you today?",
                  "kya hal hain bhai",
                  "I want to learn AI",
                  "मुझे आपकी मदद चाहिए",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-8 text-[11px] text-zinc-400">
                🔒 Privacy-first · No chat history is ever saved
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {turns.map((turn) => (
                <div key={turn.id} className="space-y-3">
                  {/* User input bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-sm">
                      {turn.inputText}
                    </div>
                  </div>

                  {/* Translation bubble */}
                  <div className="flex justify-start">
                    <div className="flex max-w-[90%] gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-zinc-500">
                          <span>{turn.targetLanguage.flag}</span>
                          <span>{turn.targetLanguage.name}</span>
                        </div>
                        <div className="rounded-2xl rounded-tl-sm border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                          {turn.status === "loading" && (
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                            </div>
                          )}
                          {turn.status === "error" && (
                            <p className="text-sm text-rose-700">⚠ {turn.errorMsg || "Something went wrong"}</p>
                          )}
                          {turn.status === "done" && turn.translation && (
                            <>
                              <p className="text-base leading-relaxed text-zinc-900 whitespace-pre-wrap">{turn.translation}</p>
                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  onClick={() => copyText(turn.translation!)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                    <rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                  </svg>
                                  Copy
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Simplify suggestion */}
                        {turn.status === "done" && turn.showSimplify && !turn.explanation && (
                          <button
                            onClick={() => handleSimplify(turn.id)}
                            disabled={turn.simplifying}
                            className="mt-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                              <path d="M12 3v18"/><path d="M5 8h14"/><path d="M5 16h14"/>
                            </svg>
                            {turn.simplifying ? "Explaining…" : "Do you want me to explain this in the simplest possible way?"}
                          </button>
                        )}

                        {/* Explanation result */}
                        {turn.explanation && (
                          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.8.7 1 1.5 1 2.3v1h6v-1c0-.8.2-1.6 1-2.3A7 7 0 0 0 12 2z"/>
                              </svg>
                              Simple explanation
                            </div>
                            <p className="text-sm leading-relaxed text-amber-950 whitespace-pre-wrap">{turn.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-zinc-200 bg-white px-4 py-3 sm:px-8"
        >
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={`Type anything — typos are auto-corrected. Translating to ${target.name}…`}
              rows={1}
              className="max-h-40 flex-1 resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none leading-relaxed py-1.5"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition ${
                input.trim()
                  ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              }`}
              aria-label="Translate"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m5 12 14 0"/><path d="m13 5 7 7-7 7"/>
              </svg>
            </button>
          </div>
          <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-zinc-400">
            Press Enter to translate · Shift+Enter for new line · No chat history is saved
          </p>
        </form>
      </main>
    </div>
  );
}
