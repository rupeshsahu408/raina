"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Personality = "Simi" | "Loa";
type ChatRole = "user" | "ai";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const MAX_DEMO_REPLIES = 4; // 3–5 responses per spec
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function detectTopic(text: string) {
  const t = text.toLowerCase();
  if (/(anxious|anxiety|worried|panic|nervous|scared)/.test(t)) return "anxiety";
  if (/(sad|down|cry|hurt|empty|hopeless)/.test(t)) return "sadness";
  if (/(angry|mad|furious|rage|irritated)/.test(t)) return "anger";
  if (/(lonely|alone|isolated)/.test(t)) return "loneliness";
  if (/(overwhelmed|stress|stressed|too much|burnt out|burnout)/.test(t))
    return "stress";
  return "general";
}

function buildReply(userText: string, personality: Personality) {
  const topic = detectTopic(userText);
  const safeFollowUp = (() => {
    switch (topic) {
      case "anxiety":
        return "What’s the main thing your mind keeps circling right now?";
      case "sadness":
        return "What happened today that led to this feeling?";
      case "anger":
        return "What (or who) set it off—was it something specific?";
      case "loneliness":
        return "When you feel this way, is it more about missing someone or feeling misunderstood?";
      case "stress":
        return "If we zoom in on one small part of this, what’s the first step you could take?";
      default:
        return "What would feel most helpful to talk about first?";
    }
  })();

  const intro = (() => {
    if (personality === "Loa") {
      switch (topic) {
        case "anxiety":
          return "Okay, breathe with me for a second—you're not in trouble.";
        case "sadness":
          return "Oof. That sounds heavy. I’m listening—really.";
        case "anger":
          return "I get it—anger usually shows up when something matters.";
        case "loneliness":
          return "That ache makes sense. You’re not being “dramatic.”";
        case "stress":
          return "Yeah… that sounds like a lot to carry at once.";
        default:
          return "Got you. Tell me more—slow and honest.";
      }
    }

    // Simi
    switch (topic) {
      case "anxiety":
        return "I hear you. Anxiety can feel so loud inside your body.";
      case "sadness":
        return "I’m really sorry you’re going through this. That hurts.";
      case "anger":
        return "It makes sense you feel angry. Emotions have reasons.";
      case "loneliness":
        return "I can see how lonely that feels. You deserve gentleness.";
      case "stress":
        return "That sounds overwhelming. Anyone would feel tense in that moment.";
      default:
        return "I’m here with you. Let’s take this gently.";
    }
  })();

  const boundary = (() => {
    // Avoid dependency language.
    if (topic === "anxiety" || topic === "stress") {
      return "Let’s focus on what you can do next—one small, doable thing.";
    }
    return "We can work with what you’re feeling, without pushing you to be “fine.”";
  })();

  if (topic === "anxiety") {
    return `${intro} ${boundary}\n\nFor grounding: try 4 slow breaths with me—inhale for 4, exhale for 6. Then answer: ${safeFollowUp}`;
  }

  return `${intro} ${boundary}\n\n${safeFollowUp}`;
}

export function DemoChatWidget() {
  const [personality, setPersonality] = useState<Personality>("Simi");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const demoRepliesUsed = useMemo(
    () => messages.filter((m) => m.role === "ai").length,
    [messages]
  );
  const remainingReplies = Math.max(0, MAX_DEMO_REPLIES - demoRepliesUsed);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const canSend = !isTyping && remainingReplies > 0 && input.trim().length > 0;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-sky-400" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Demo chat
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-200">
              {remainingReplies > 0
                ? `${remainingReplies} replies left`
                : "Limit reached"}
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-2xl border border-zinc-800 bg-black/10 p-0.5">
          {(["Simi", "Loa"] as Personality[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPersonality(p)}
              className={[
                "rounded-2xl px-2 py-1 text-[10px] transition-colors",
                personality === p
                  ? "bg-zinc-900 text-zinc-50"
                  : "text-zinc-400 hover:text-zinc-200",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 max-h-44 overflow-y-auto rounded-2xl bg-zinc-900/60 p-2">
        {messages.length === 0 ? (
          <div className="text-[11px] text-zinc-400">
            Send one thought—Evara will respond gently.
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : "flex"}
              >
                <div
                  className={[
                    "max-w-[84%] whitespace-pre-wrap rounded-2xl px-3 py-2 leading-relaxed",
                    m.role === "user"
                      ? "bg-zinc-100 text-black"
                      : "bg-zinc-800 text-zinc-100",
                  ].join(" ")}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping ? (
              <div className="flex">
                <div className="rounded-2xl bg-zinc-800 px-3 py-2 text-zinc-100">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-200" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-200 delay-100" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-200 delay-200" />
                  </span>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        className="mt-2 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSend) return;

          const text = input.trim();
          setInput("");
          setMessages((prev) => [
            ...prev,
            { id: makeId(), role: "user", content: text },
          ]);
          setIsTyping(true);

          (async () => {
            try {
              const resp = await fetch(`${API_BASE_URL}/v1/demo-chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, personality }),
              });

              if (!resp.ok) {
                const err = await resp.json().catch(() => null);
                if (resp.status === 429) {
                  const reply =
                    err?.error === "demo limit reached"
                      ? "Demo limit reached. Sign up to keep chatting."
                      : "Demo limit reached.";
                  setMessages((prev) => [
                    ...prev,
                    { id: makeId(), role: "ai", content: reply },
                  ]);
                  return;
                }
                throw new Error(err?.error ?? "Demo chat failed");
              }

              const data: { reply?: string } = await resp.json();
              const reply = data.reply || buildReply(text, personality);
              setMessages((prev) => [
                ...prev,
                { id: makeId(), role: "ai", content: reply },
              ]);
            } catch {
              const reply = buildReply(text, personality);
              setMessages((prev) => [
                ...prev,
                { id: makeId(), role: "ai", content: reply },
              ]);
            } finally {
              setIsTyping(false);
            }
          })();
        }}
      >
        <textarea
          rows={1}
          className="max-h-24 flex-1 resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-[12px] leading-relaxed text-zinc-100 outline-none ring-0 focus:border-zinc-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share what you’re feeling…"
          disabled={remainingReplies <= 0 || isTyping}
        />
        <button
          type="submit"
          disabled={!canSend}
          className={[
            "h-9 rounded-2xl px-3 text-[12px] font-medium transition-colors",
            canSend ? "bg-zinc-100 text-black" : "bg-zinc-800 text-zinc-500",
          ].join(" ")}
        >
          Send
        </button>
      </form>

      {remainingReplies <= 0 ? (
        <div className="mt-2 text-[11px] text-zinc-500">
          Demo limit reached. Sign up to keep chatting.
        </div>
      ) : null}
    </div>
  );
}

