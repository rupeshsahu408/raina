"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { ibaraUrl } from "@/lib/ibaraApi";

interface Message {
  role: "user" | "assistant";
  content: string;
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
  const [activeTab, setActiveTab] = useState<"chat" | "embed">("chat");
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const embedCode = siteId
    ? `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/ibara-widget.js" data-site-id="${siteId}"></script>`
    : "";

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
          const res = await fetch(ibaraUrl(`/sites/${siteId}/bot?userId=${u.uid}`));
          const data = await res.json();
          setBot(data.bot || null);
          if (data.bot) {
            setMessages([{
              role: "assistant",
              content: `Hi! I'm the AI assistant for ${data.bot.businessName || "this business"}. How can I help you today? 😊`,
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
  }, [messages, sending]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sending || !siteId) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setSending(true);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(ibaraUrl(`/sites/${siteId}/chat`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, message: userMsg, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .card-glass { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
        .msg-user { background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.15)); border: 1px solid rgba(124,58,237,0.25); border-bottom-right-radius: 4px; }
        .msg-ai { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); border-bottom-left-radius: 4px; }
        .input-field { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; }
        .input-field:focus { border-color: rgba(124,58,237,0.6); outline: none; background: rgba(124,58,237,0.05); }
        .send-btn { background: linear-gradient(135deg, #7c3aed, #06b6d4); transition: all 0.2s; }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .typing-dot { animation: typing 1.4s ease-in-out infinite; background: rgba(124,58,237,0.7); }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%,60%,100%{ transform:translateY(0);opacity:0.4 } 30%{ transform:translateY(-6px);opacity:1 } }
        @keyframes msg-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .msg-animate { animation: msg-in 0.2s ease; }
        .tab-active { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4); color: #a78bfa; }
        .tab-inactive { color: rgba(255,255,255,0.4); border-color: transparent; }
        .tab-inactive:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.04); }
        .code-block { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.08); font-family: 'Courier New', monospace; }
        .step-num { background: linear-gradient(135deg, #7c3aed, #06b6d4); }
        /* Floating widget demo */
        .widget-demo-btn {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(124,58,237,0.5);
          animation: float-btn 3s ease-in-out infinite;
        }
        @keyframes float-btn { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .badge-dot { width:12px;height:12px;background:#22c55e;border-radius:50%;border:2px solid #0B0B1E;animation:pulse-dot 2s ease-in-out infinite;position:absolute;top:2px;right:2px; }
        @keyframes pulse-dot{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
      `}</style>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black mb-1">Chat Preview</h1>
          <p className="text-white/30 text-sm">Test your AI chatbot and get your embed code</p>
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
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="font-bold text-lg mb-2">No AI configured yet</h3>
          <p className="text-white/30 text-sm mb-5 max-w-sm mx-auto">Set up your AI first to test it here.</p>
          <button onClick={() => router.push(`/ibara/dashboard/ai-setup?siteId=${siteId}`)}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
            Configure AI →
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Tabs */}
          <div className="flex gap-2 p-1 card-glass rounded-xl w-fit">
            {(["chat", "embed"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${activeTab === tab ? "tab-active" : "tab-inactive border-transparent"}`}>
                {tab === "chat" ? "💬 Test Chat" : "🔧 Get Embed Code"}
              </button>
            ))}
          </div>

          {/* Chat tab */}
          {activeTab === "chat" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Chat preview — simulates the floating widget */}
              <div className="lg:col-span-3 card-glass rounded-2xl overflow-hidden flex flex-col" style={{ height: "560px" }}>
                {/* Widget header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.1))" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>🤖</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{bot.businessName ? `${bot.businessName} AI` : "IBARA Assistant"}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[11px] text-white/35">Online · {bot.language} · {bot.tone}</span>
                    </div>
                  </div>
                  <button onClick={() => {
                    setMessages([{ role: "assistant", content: `Hi! I'm the AI assistant for ${bot.businessName || "this business"}. How can I help you today? 😊` }]);
                  }} className="text-[11px] text-white/25 hover:text-white/50 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-all">
                    Reset
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(124,58,237,0.3) transparent" }}>
                  {messages.map((msg, i) => (
                    <div key={i} className={`msg-animate flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-1"
                          style={{ background: "linear-gradient(135deg, #7c3aed80, #06b6d480)" }}>🤖</div>
                      )}
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "msg-user text-white" : "msg-ai text-white/80"}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs shrink-0 mt-1">
                          {user?.email?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-2 items-start">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                        style={{ background: "linear-gradient(135deg, #7c3aed80, #06b6d480)" }}>🤖</div>
                      <div className="msg-ai px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          {[0,1,2].map(i => <div key={i} className="typing-dot w-2 h-2 rounded-full" />)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-white/5" style={{ background: "rgba(0,0,0,0.15)" }}>
                  <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                      placeholder="Ask something your customers might ask..." rows={1}
                      className="input-field flex-1 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 resize-none leading-relaxed"
                      style={{ minHeight: "40px", maxHeight: "80px" }}
                      onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 80) + "px"; }} />
                    <button type="submit" disabled={sending || !input.trim()}
                      className="send-btn w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </form>
                  <p className="text-center text-[10px] text-white/15 mt-2">Enter to send · Shift+Enter for new line</p>
                </div>
              </div>

              {/* Right panel — widget preview */}
              <div className="lg:col-span-2 space-y-4">
                <div className="card-glass rounded-2xl p-5">
                  <h3 className="font-bold text-sm mb-3 text-white/80">Widget Preview</h3>
                  <p className="text-xs text-white/35 mb-5 leading-relaxed">
                    This is how your floating chatbot will appear on your website — fixed in the bottom-right corner.
                  </p>
                  <div className="rounded-xl bg-gradient-to-br from-violet-950/30 to-cyan-950/20 border border-white/5 p-6 flex items-end justify-end relative" style={{ minHeight: "200px" }}>
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 text-xs text-center px-6">
                      Your website content appears here
                    </div>
                    <div className="relative">
                      <div className="widget-demo-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                      </div>
                      <div className="badge-dot" />
                    </div>
                  </div>
                </div>

                <div className="card-glass rounded-2xl p-5">
                  <h3 className="font-bold text-sm mb-3 text-white/80">Widget Features</h3>
                  <ul className="space-y-2.5 text-xs text-white/45">
                    {[
                      "Fixed position — stays while scrolling",
                      "Expands on click into full chat window",
                      "Fully mobile responsive",
                      "Animated typing indicator",
                      "Conversation history maintained",
                      "No page reload or redirects",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="text-green-400 text-base">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Embed tab */}
          {activeTab === "embed" && (
            <div className="space-y-5 max-w-3xl">
              {/* How to install */}
              <div className="card-glass rounded-2xl p-6">
                <h2 className="font-bold text-base mb-5">How to add the widget to your website</h2>
                <div className="space-y-4">
                  {[
                    { num: "1", title: "Copy the embed code below", desc: "One line of HTML — no dependencies, no frameworks needed." },
                    { num: "2", title: "Paste before </body> on your website", desc: "Add it to your HTML file, CMS template, or website builder (Wix, Squarespace, WordPress, etc.)" },
                    { num: "3", title: "Save and publish", desc: "Your AI chatbot will automatically appear as a floating button in the bottom-right corner." },
                  ].map((s) => (
                    <div key={s.num} className="flex gap-4">
                      <div className="step-num w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">{s.num}</div>
                      <div>
                        <p className="text-sm font-semibold mb-0.5">{s.title}</p>
                        <p className="text-xs text-white/35">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Embed code */}
              <div className="card-glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-sm text-white/80">Your Embed Code</h2>
                  <button onClick={copyEmbed}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${copied ? "text-green-400 bg-green-400/10 border border-green-400/20" : "text-violet-300 bg-violet-600/15 border border-violet-500/25 hover:border-violet-500/50"}`}>
                    {copied ? "✓ Copied!" : "⎘ Copy Code"}
                  </button>
                </div>
                <div className="code-block rounded-xl p-4 text-xs overflow-x-auto">
                  <pre className="text-green-300 whitespace-pre-wrap break-all leading-relaxed">
                    {embedCode}
                  </pre>
                </div>
                <p className="mt-3 text-xs text-white/25">
                  This code is unique to your site. Keep your Site ID private.
                </p>
              </div>

              {/* Platform guides */}
              <div className="card-glass rounded-2xl p-6">
                <h2 className="font-bold text-sm text-white/80 mb-4">Platform-specific guides</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name: "WordPress", tip: "Add to theme's footer.php or use a Header & Footer plugin" },
                    { name: "Wix", tip: "Embed → Custom Code → Add to all pages → Body end" },
                    { name: "Shopify", tip: "Online Store → Themes → Edit code → theme.liquid before </body>" },
                    { name: "Squarespace", tip: "Settings → Advanced → Code Injection → Footer" },
                    { name: "Webflow", tip: "Project Settings → Custom Code → Footer Code" },
                    { name: "Plain HTML", tip: "Paste before the closing </body> tag in your HTML file" },
                  ].map((p) => (
                    <div key={p.name} className="rounded-xl p-3 bg-white/3 border border-white/6 hover:border-white/12 transition-all">
                      <p className="text-xs font-semibold text-white/70 mb-1">{p.name}</p>
                      <p className="text-[11px] text-white/30 leading-relaxed">{p.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Warning if inactive */}
          {!bot.isActive && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
              <span>⚠️</span>
              <p className="text-xs text-amber-300/70">
                Your AI is inactive. Activate it in{" "}
                <button onClick={() => router.push(`/ibara/dashboard/ai-setup?siteId=${siteId}`)}
                  className="text-amber-300 underline hover:text-amber-700">AI Setup</button>{" "}
                to start responding to visitors.
              </p>
            </div>
          )}
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
