"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface Bot {
  businessName: string;
  tone: string;
  language: string;
  isActive: boolean;
}

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId") || "";

  const [user, setUser] = useState<User | null>(null);
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/ibara/auth");
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/ibara/auth"); return; }
      setUser(u);
      if (siteId) {
        try {
          const res = await fetch(`/api/ibara/sites/${siteId}/bot?userId=${u.uid}`);
          const data = await res.json();
          setBot(data.bot || null);
          if (data.bot) {
            setMessages([{
              role: "assistant",
              content: `Hi! I'm the AI assistant for ${data.bot.businessName || "this business"}. How can I help you today?`,
              ts: Date.now(),
            }]);
          }
        } catch {}
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router, siteId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sending || !siteId) return;

    const userMsg: Message = { role: "user", content: input.trim(), ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(`/api/ibara/sites/${siteId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          message: userMsg.content,
          history,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, ts: Date.now() }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        ts: Date.now(),
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages(bot ? [{
      role: "assistant",
      content: `Hi! I'm the AI assistant for ${bot.businessName || "this business"}. How can I help you today?`,
      ts: Date.now(),
    }] : []);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-3xl">
      <style>{`
        .card-glass { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
        .msg-user { background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.15)); border: 1px solid rgba(124,58,237,0.25); }
        .msg-ai { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); }
        .input-field {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s;
        }
        .input-field:focus { border-color: rgba(124,58,237,0.6); outline: none; background: rgba(124,58,237,0.05); }
        .send-btn { background: linear-gradient(135deg, #7c3aed, #06b6d4); transition: all 0.2s; }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .typing-dot { animation: typing 1.4s ease-in-out infinite; background: rgba(124,58,237,0.7); }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }
      `}</style>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black mb-1">Chat Preview</h1>
          <p className="text-white/30 text-sm">Test your AI chatbot before it goes live</p>
        </div>
        {bot && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${bot.isActive ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-amber-400 bg-amber-400/10 border-amber-400/20"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${bot.isActive ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
            {bot.isActive ? "AI is Active" : "AI is Inactive"}
          </div>
        )}
      </div>

      {!bot ? (
        <div className="card-glass rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
            🤖
          </div>
          <h3 className="font-bold text-lg mb-2">No AI configured yet</h3>
          <p className="text-white/30 text-sm mb-5 max-w-sm mx-auto">
            You need to set up your AI first. Add your business information in the AI Setup page.
          </p>
          <button
            onClick={() => router.push(`/ibara/dashboard/ai-setup?siteId=${siteId}`)}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
          >
            Configure AI →
          </button>
        </div>
      ) : (
        <div className="card-glass rounded-2xl flex flex-col overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div>
              <p className="text-sm font-semibold">{bot.businessName || "Your AI"}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] text-white/30">Online · {bot.language} · {bot.tone}</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-xs text-white/25 hover:text-white/60 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-700 to-cyan-600 flex items-center justify-center text-xs shrink-0 mr-2 mt-1">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" ? "msg-user text-white rounded-br-sm" : "msg-ai text-white/80 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs shrink-0 ml-2 mt-1">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-700 to-cyan-600 flex items-center justify-center text-xs shrink-0">
                  🤖
                </div>
                <div className="msg-ai px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1">
                    {[0,1,2].map(i => <div key={i} className="typing-dot w-2 h-2 rounded-full" />)}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center text-xs text-red-400/70 py-2">{error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t border-white/5">
            <form onSubmit={handleSend} className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask something your customers might ask..."
                rows={1}
                className="input-field flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none leading-relaxed"
                style={{ minHeight: "44px", maxHeight: "120px" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="send-btn w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-white/15">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}

      {!bot?.isActive && bot && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
          <span>⚠️</span>
          <p className="text-xs text-amber-300/70">
            Your AI is currently inactive. Activate it in{" "}
            <button
              onClick={() => router.push(`/ibara/dashboard/ai-setup?siteId=${siteId}`)}
              className="text-amber-300 underline hover:text-amber-200 transition-colors"
            >
              AI Setup
            </button>{" "}
            to make it live for visitors.
          </p>
        </div>
      )}
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>}>
      <PreviewContent />
    </Suspense>
  );
}
