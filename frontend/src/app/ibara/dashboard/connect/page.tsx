"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { ibaraUrl } from "@/lib/ibaraApi";

interface ChatMsg { role: "user" | "assistant"; content: string; }

function renderMessage(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
      return (
        <div key={i} className="relative mt-2 mb-2">
          <pre className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-green-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">{lines}</pre>
          <button
            onClick={() => navigator.clipboard.writeText(lines)}
            className="absolute top-2 right-2 text-[10px] text-white/30 hover:text-white/70 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded transition-all"
          >copy</button>
        </div>
      );
    }
    return <span key={i} className="whitespace-pre-wrap leading-relaxed">{part}</span>;
  });
}

type Method = "wordpress" | "gtm" | "file" | "manual" | null;
type Platform = "wordpress" | "shopify" | "wix" | "squarespace" | "webflow" | "html" | "unknown";

interface DetectResult {
  platform: Platform;
  details: Record<string, string>;
  hasIbaraWidget: boolean;
  domain: string;
}

interface ConnectionState {
  connectionMethod: Method;
  connectionStatus: "not_connected" | "connected" | "pending";
  connectionVerifiedAt: string | null;
  detectedPlatform: string;
}

const BACKEND = "https://raina-1.onrender.com";
const WIDGET_CDN = "https://www.plyndrox.app/ibara-widget.js";
const API_BASE = "https://raina-1.onrender.com";

function ConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId") || "";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState<DetectResult | null>(null);
  const [connection, setConnection] = useState<ConnectionState | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<Method>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ isLive: boolean; message: string } | null>(null);

  const [wpUrl, setWpUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpAppPassword, setWpAppPassword] = useState("");
  const [wpConnecting, setWpConnecting] = useState(false);
  const [wpResult, setWpResult] = useState<{ success: boolean; message: string } | null>(null);

  const [gtmId, setGtmId] = useState("");
  const [gtmSaving, setGtmSaving] = useState(false);

  const [codeCopied, setCodeCopied] = useState(false);

  const [dnsOpen, setDnsOpen] = useState(false);
  const [dnsVerifying, setDnsVerifying] = useState(false);
  const [dnsResult, setDnsResult] = useState<{ verified: boolean; message: string } | null>(null);
  const [dnsToken, setDnsToken] = useState<string>("");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi! I'm your Setup Assistant 👋\n\nI can guide you step-by-step to connect your chatbot to your website, and generate the exact code you need.\n\nWhat platform is your website built on? (e.g. WordPress, Shopify, Wix, plain HTML, React...)" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteId) return;
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/ibara/auth");
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/ibara/auth"); return; }
      setUser(u);
      try {
        const [sitesRes, connRes] = await Promise.all([
          fetch(ibaraUrl(`/sites?userId=${u.uid}`)),
          fetch(ibaraUrl(`/sites/${siteId}/connection`)),
        ]);
        const sitesData = await sitesRes.json();
        const connData = await connRes.json();
        const found = sitesData.sites?.find((s: any) => s._id === siteId);
        if (found) {
          setDomain(found.domain);
          setWpUrl(`https://${found.domain}`);
          if (found.verificationToken) setDnsToken(found.verificationToken);
          if (connData.connectionMethod) {
            setSelectedMethod(connData.connectionMethod);
          }
          setConnection(connData);
          if (!connData.detectedPlatform || connData.detectedPlatform === "unknown" || connData.detectedPlatform === "") {
            detectPlatform(found.domain);
          } else {
            setDetected({ platform: connData.detectedPlatform as Platform, details: {}, hasIbaraWidget: connData.connectionStatus === "connected", domain: found.domain });
          }
        }
      } catch {}
      setLoading(false);
    });
    return () => unsub();
  }, [siteId, router]);

  const detectPlatform = async (d: string) => {
    setDetecting(true);
    try {
      const res = await fetch(ibaraUrl("/detect-platform"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: d }),
      });
      const data = await res.json();
      setDetected(data);
      if (data.platform && data.platform !== "unknown") {
        await fetch(ibaraUrl(`/sites/${siteId}/connection`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.uid, detectedPlatform: data.platform }),
        });
      }
    } catch {}
    setDetecting(false);
  };

  const saveConnectionMethod = async (method: Method, status: "not_connected" | "pending" | "connected" = "pending") => {
    if (!user) return;
    try {
      await fetch(ibaraUrl(`/sites/${siteId}/connection`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, connectionMethod: method, connectionStatus: status }),
      });
      setConnection((prev) => prev ? { ...prev, connectionMethod: method, connectionStatus: status } : null);
    } catch {}
  };

  const handleWordPressConnect = async () => {
    if (!user || !wpUsername || !wpAppPassword) return;
    setWpConnecting(true);
    setWpResult(null);
    try {
      const res = await fetch(ibaraUrl(`/sites/${siteId}/wordpress-connect`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, wpUrl, wpUsername, wpAppPassword }),
      });
      const data = await res.json();
      setWpResult(data);
      if (data.success) {
        setConnection((prev) => prev ? { ...prev, connectionMethod: "wordpress", connectionStatus: "pending" } : null);
      }
    } catch {
      setWpResult({ success: false, message: "Connection failed. Please try again." });
    }
    setWpConnecting(false);
  };

  const handleDownloadPlugin = () => {
    window.open(`${BACKEND}/api/ibara/sites/${siteId}/generate-plugin`, "_blank");
    saveConnectionMethod("wordpress", "pending");
  };

  const handleDownloadInstaller = () => {
    window.open(`${BACKEND}/api/ibara/sites/${siteId}/generate-installer`, "_blank");
    saveConnectionMethod("file", "pending");
  };

  const handleGtmSave = async () => {
    if (!gtmId.trim()) return;
    setGtmSaving(true);
    await saveConnectionMethod("gtm", "pending");
    setGtmSaving(false);
  };

  const handleManualSelect = async () => {
    await saveConnectionMethod("manual", "pending");
  };

  const handleVerifyConnection = async () => {
    if (!user) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(ibaraUrl(`/sites/${siteId}/verify-connection`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (data.isLive) {
        setVerifyResult({ isLive: true, message: "Your chatbot is live on the website!" });
        setConnection((prev) => prev ? { ...prev, connectionStatus: "connected" } : null);
      } else {
        setVerifyResult({ isLive: false, message: "Chatbot not detected yet. Please complete the installation steps and try again." });
      }
    } catch {
      setVerifyResult({ isLive: false, message: "Verification failed. Please try again." });
    }
    setVerifying(false);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, chatOpen]);

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    const newMsgs: ChatMsg[] = [...chatMsgs, { role: "user", content: msg }];
    setChatMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const history = newMsgs.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(ibaraUrl(`/sites/${siteId}/setup-chat`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      setChatMsgs((prev) => [...prev, { role: "assistant", content: data.reply || "Sorry, something went wrong. Please try again." }]);
    } catch {
      setChatMsgs((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setChatLoading(false);
  };

  const embedCode = `<script src="${WIDGET_CDN}" data-site-id="${siteId}" data-api-base="${API_BASE}" async defer></script>`;
  const gtmScript = `<script>
window.dataLayer = window.dataLayer || [];
(function(){
  var s = document.createElement('script');
  s.src = '${WIDGET_CDN}';
  s.setAttribute('data-site-id', '${siteId}');
  s.setAttribute('data-api-base', '${API_BASE}');
  s.async = true;
  document.body.appendChild(s);
})();
</script>`;

  const platformLabel: Record<string, string> = {
    wordpress: "WordPress",
    shopify: "Shopify",
    wix: "Wix",
    squarespace: "Squarespace",
    webflow: "Webflow",
    html: "HTML/Custom Site",
    unknown: "Custom Website",
  };

  const platformIcon: Record<string, string> = {
    wordpress: "🔷",
    shopify: "🟩",
    wix: "⬜",
    squarespace: "◼",
    webflow: "🔵",
    html: "📄",
    unknown: "🌐",
  };

  const isConnected = connection?.connectionStatus === "connected";

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
        .method-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); transition: all 0.2s; cursor: pointer; }
        .method-card:hover { border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.05); }
        .method-card.selected { border-color: rgba(124,58,237,0.6); background: rgba(124,58,237,0.08); }
        .method-card.recommended { border-color: rgba(6,182,212,0.3); }
        .input-field { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; }
        .input-field:focus { border-color: rgba(124,58,237,0.6); outline: none; background: rgba(124,58,237,0.05); }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #06b6d4); transition: all 0.3s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(124,58,237,0.35); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .code-block { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; }
        .step-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.4); color: #a78bfa; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black mb-1">Connect Your Website</h1>
          <p className="text-white/30 text-sm">Choose how to add the chatbot to <span className="text-white/60 font-medium">{domain}</span></p>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border text-green-400 bg-green-400/10 border-green-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Chatbot Live
          </div>
        )}
      </div>

      {isConnected && (
        <div className="card-glass rounded-2xl p-6 mb-6 border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-2xl">✅</div>
            <div>
              <h2 className="font-bold text-green-300 mb-0.5">Your chatbot is connected and live!</h2>
              <p className="text-sm text-green-300/50">The Ibara AI chatbot is running on <strong>{domain}</strong></p>
            </div>
            <button
              onClick={() => window.open(`https://${domain}`, "_blank")}
              className="ml-auto px-4 py-2 rounded-xl border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/10 transition-all"
            >
              Visit Site →
            </button>
          </div>
        </div>
      )}

      {detecting && (
        <div className="card-glass rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-sm text-white/50">Detecting your website platform...</span>
        </div>
      )}

      {detected && !detecting && (
        <div className="card-glass rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">{platformIcon[detected.platform] || "🌐"}</span>
          <div>
            <p className="text-sm font-semibold text-white/80">
              Detected: <span className="gradient-text">{platformLabel[detected.platform] || "Custom Website"}</span>
              {detected.platform === "wordpress" && detected.details.siteName && (
                <span className="text-white/30 font-normal"> — {detected.details.siteName}</span>
              )}
            </p>
            {detected.hasIbaraWidget
              ? <p className="text-xs text-green-400">Ibara AI widget already detected on your site!</p>
              : <p className="text-xs text-white/30">We'll recommend the best connection method for your platform.</p>
            }
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-bold text-sm text-white/50 uppercase tracking-wider mb-4">Choose Connection Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div
            onClick={() => setSelectedMethod("wordpress")}
            className={`method-card rounded-2xl p-5 ${selectedMethod === "wordpress" ? "selected" : ""} ${detected?.platform === "wordpress" ? "recommended" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔷</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">WordPress</p>
                  {detected?.platform === "wordpress" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Recommended</span>
                  )}
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Upload our plugin or auto-connect using your WP admin credentials. Zero code.</p>
              </div>
              {selectedMethod === "wordpress" && <span className="text-violet-400 text-lg mt-0.5">✓</span>}
            </div>
          </div>

          <div
            onClick={() => setSelectedMethod("gtm")}
            className={`method-card rounded-2xl p-5 ${selectedMethod === "gtm" ? "selected" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏷️</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">Google Tag Manager</p>
                  {(detected?.platform === "shopify" || detected?.platform === "webflow") && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Recommended</span>
                  )}
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Works on any site with GTM. Add a custom HTML tag — no code needed.</p>
              </div>
              {selectedMethod === "gtm" && <span className="text-violet-400 text-lg mt-0.5">✓</span>}
            </div>
          </div>

          <div
            onClick={() => setSelectedMethod("file")}
            className={`method-card rounded-2xl p-5 ${selectedMethod === "file" ? "selected" : ""} ${detected?.platform === "html" ? "recommended" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">📁</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">File Upload (cPanel)</p>
                  {detected?.platform === "html" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Recommended</span>
                  )}
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Download a one-time PHP installer, upload to your site, and it connects automatically.</p>
              </div>
              {selectedMethod === "file" && <span className="text-violet-400 text-lg mt-0.5">✓</span>}
            </div>
          </div>

          <div
            onClick={() => setSelectedMethod("manual")}
            className={`method-card rounded-2xl p-5 ${selectedMethod === "manual" ? "selected" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Manual / Embed Code</p>
                <p className="text-xs text-white/40 leading-relaxed">Copy one script tag and paste it into your site. Works everywhere.</p>
              </div>
              {selectedMethod === "manual" && <span className="text-violet-400 text-lg mt-0.5">✓</span>}
            </div>
          </div>
        </div>
      </div>

      {selectedMethod === "wordpress" && (
        <div className="card-glass rounded-2xl p-6 mb-6 space-y-6">
          <h2 className="font-bold flex items-center gap-2">
            <span className="text-xl">🔷</span> WordPress Connection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
              <p className="font-bold text-sm text-violet-300 mb-3">Option A — Download Plugin (Easiest)</p>
              <div className="space-y-3 mb-4">
                {["Download the Ibara AI plugin file (.php)", "Go to WordPress Admin → Plugins → Add New → Upload Plugin", "Upload the downloaded file and click Install Now", "Click Activate Plugin — done!"].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="step-num mt-0.5">{i + 1}</span>
                    <p className="text-xs text-white/60 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleDownloadPlugin}
                className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
              >
                ⬇ Download WordPress Plugin
              </button>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <p className="font-bold text-sm text-cyan-300 mb-3">Option B — Auto-Connect (Advanced)</p>
              <p className="text-xs text-white/40 mb-3 leading-relaxed">
                Use your WordPress Application Password to let us install automatically. Go to{" "}
                <span className="text-cyan-400">WP Admin → Users → Your Profile → Application Passwords</span> to create one.
              </p>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">WordPress URL</label>
                  <input
                    type="text"
                    value={wpUrl}
                    onChange={(e) => setWpUrl(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="input-field w-full h-10 rounded-xl px-3 text-sm text-white placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Username</label>
                  <input
                    type="text"
                    value={wpUsername}
                    onChange={(e) => setWpUsername(e.target.value)}
                    placeholder="admin"
                    className="input-field w-full h-10 rounded-xl px-3 text-sm text-white placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Application Password</label>
                  <input
                    type="password"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                    className="input-field w-full h-10 rounded-xl px-3 text-sm text-white placeholder:text-white/20"
                  />
                </div>
              </div>
              {wpResult && (
                <div className={`mb-3 rounded-xl px-3 py-2.5 text-xs ${wpResult.success ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>
                  {wpResult.message}
                </div>
              )}
              <button
                onClick={handleWordPressConnect}
                disabled={wpConnecting || !wpUsername || !wpAppPassword}
                className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
              >
                {wpConnecting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : "Auto-Connect WordPress"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMethod === "gtm" && (
        <div className="card-glass rounded-2xl p-6 mb-6">
          <h2 className="font-bold flex items-center gap-2 mb-5">
            <span className="text-xl">🏷️</span> Google Tag Manager Setup
          </h2>
          <div className="space-y-4 mb-6">
            {[
              { step: 1, text: "Open Google Tag Manager (tagmanager.google.com) and go to your container" },
              { step: 2, text: "Click Tags → New → Tag Configuration → Custom HTML" },
              { step: 3, text: "Paste the script below into the HTML field" },
              { step: 4, text: "Set Trigger to: All Pages" },
              { step: 5, text: "Save and click Submit → Publish" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="step-num mt-0.5">{step}</span>
                <p className="text-sm text-white/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Script to paste in GTM</p>
              <button
                onClick={() => copyCode(gtmScript)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {codeCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="code-block rounded-xl p-4 text-white/70 whitespace-pre-wrap break-all">
              {gtmScript}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-white/40 block mb-1.5">Your GTM Container ID (optional, for our records)</label>
            <input
              type="text"
              value={gtmId}
              onChange={(e) => setGtmId(e.target.value)}
              placeholder="GTM-XXXXXXX"
              className="input-field w-full h-11 rounded-xl px-3.5 text-sm text-white placeholder:text-white/20"
            />
          </div>
          <button
            onClick={handleGtmSave}
            disabled={gtmSaving}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
          >
            {gtmSaving ? "Saving..." : "I've Published in GTM →"}
          </button>
        </div>
      )}

      {selectedMethod === "file" && (
        <div className="card-glass rounded-2xl p-6 mb-6">
          <h2 className="font-bold flex items-center gap-2 mb-5">
            <span className="text-xl">📁</span> One-Time File Upload
          </h2>
          <div className="space-y-4 mb-6">
            {[
              { step: 1, text: "Click 'Download Installer File' below to get your ibara-connect.php file" },
              { step: 2, text: "Log into your hosting control panel (cPanel, Plesk, etc.)" },
              { step: 3, text: "Open File Manager and navigate to your website's root folder (public_html)" },
              { step: 4, text: "Upload the ibara-connect.php file to that folder" },
              { step: 5, text: `Visit: https://${domain}/ibara-connect.php and click "Install Chatbot Now"` },
              { step: 6, text: "The chatbot installs automatically. You can delete the file afterwards." },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="step-num mt-0.5">{step}</span>
                <p className="text-sm text-white/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4">
            <p className="text-xs text-amber-300/80">
              <strong>No FTP needed.</strong> Use your hosting's built-in File Manager — available in cPanel, Plesk, and most control panels.
            </p>
          </div>
          <button
            onClick={handleDownloadInstaller}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
          >
            ⬇ Download Installer File
          </button>
        </div>
      )}

      {selectedMethod === "manual" && (
        <div className="card-glass rounded-2xl p-6 mb-6">
          <h2 className="font-bold flex items-center gap-2 mb-5">
            <span className="text-xl">📋</span> Manual Embed
          </h2>
          <p className="text-sm text-white/50 mb-4 leading-relaxed">
            Copy the script below and paste it just before the <code className="text-violet-300">&lt;/body&gt;</code> tag on every page of your website.
          </p>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Your unique embed script</p>
              <button
                onClick={() => copyCode(embedCode)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {codeCopied ? "✓ Copied!" : "Copy Code"}
              </button>
            </div>
            <div className="code-block rounded-xl p-4 text-white/70 break-all">
              {embedCode}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              { platform: "WordPress", instruction: "Appearance → Theme Editor → Add before </body> in footer.php" },
              { platform: "Shopify", instruction: "Online Store → Themes → Edit Code → theme.liquid before </body>" },
              { platform: "Wix", instruction: "Settings → Custom Code → Add to Body (End)" },
              { platform: "Squarespace", instruction: "Settings → Advanced → Code Injection → Footer" },
            ].map(({ platform, instruction }) => (
              <div key={platform} className="rounded-xl bg-white/3 border border-white/6 p-3">
                <p className="text-xs font-semibold text-white/70 mb-1">{platform}</p>
                <p className="text-[11px] text-white/35 leading-relaxed">{instruction}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleManualSelect}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
          >
            I've Added the Script →
          </button>
        </div>
      )}

      <div className="card-glass rounded-2xl overflow-hidden">
        <button
          onClick={() => setDnsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <p className="text-sm font-semibold text-white/70">Domain Ownership Verification</p>
              <p className="text-xs text-white/30">Optional — add a DNS TXT record to prove you own this domain</p>
            </div>
          </div>
          <span className={`text-white/30 text-sm transition-transform ${dnsOpen ? "rotate-180" : ""}`}>▾</span>
        </button>

        {dnsOpen && (
          <div className="px-6 pb-6 border-t border-white/5 pt-5">
            <p className="text-xs text-white/40 leading-relaxed mb-4">
              Add the following DNS TXT record to <strong className="text-white/60">{domain}</strong> through your domain registrar (e.g. GoDaddy, Namecheap, Cloudflare). This confirms you own the domain and is entirely optional.
            </p>
            {dnsToken && (
              <div className="code-block rounded-xl p-4 mb-4">
                <div className="grid grid-cols-3 gap-2 text-xs mb-3 text-white/30 uppercase tracking-wider">
                  <span>Type</span><span>Name</span><span>Value</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-white/80">
                  <span className="text-cyan-400">TXT</span>
                  <span>@</span>
                  <span className="break-all text-violet-300">ibara-verify={dnsToken}</span>
                </div>
              </div>
            )}
            {dnsResult && (
              <div className={`mb-4 rounded-xl px-4 py-3 text-xs ${dnsResult.verified ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-amber-500/10 border border-amber-500/30 text-amber-300"}`}>
                {dnsResult.verified ? "✅ Domain verified successfully!" : `⚠️ ${dnsResult.message}`}
              </div>
            )}
            <button
              disabled={dnsVerifying || dnsResult?.verified}
              onClick={async () => {
                if (!user) return;
                setDnsVerifying(true);
                setDnsResult(null);
                try {
                  const res = await fetch(ibaraUrl(`/sites/${siteId}/verify`), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.uid }),
                  });
                  const data = await res.json();
                  setDnsResult({ verified: data.verified, message: data.message || "DNS record not found yet. Please check your settings and try again in a few minutes." });
                } catch {
                  setDnsResult({ verified: false, message: "Verification failed. Please try again." });
                }
                setDnsVerifying(false);
              }}
              className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            >
              {dnsVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking DNS...
                </span>
              ) : dnsResult?.verified ? "✓ Verified" : "Check DNS Record"}
            </button>
          </div>
        )}
      </div>

      {selectedMethod && isConnected && (
        <div className="card-glass rounded-2xl p-5 border-green-500/20 bg-green-500/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl shrink-0">✅</div>
          <div className="flex-1">
            <p className="font-bold text-green-300 text-sm">Chatbot is live on your website!</p>
            <p className="text-xs text-green-300/50 mt-0.5">Your visitors can now chat with the AI assistant</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.open(`https://${domain}`, "_blank")} className="px-3 py-2 rounded-xl border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/10 transition-all">Visit Site</button>
            <button onClick={() => router.push(`/ibara/dashboard/overview?siteId=${siteId}`)} className="btn-primary px-3 py-2 rounded-xl text-xs font-bold text-white">Dashboard →</button>
          </div>
        </div>
      )}

      {/* Floating Setup Assistant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="w-[370px] h-[520px] rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/60"
            style={{ background: "rgba(8,8,20,0.97)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))" }}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-sm shrink-0">🤖</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Setup Assistant</p>
                <p className="text-[10px] text-white/40">AI-powered connection guide</p>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/30 hover:text-white/70 text-lg transition-colors leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {chatMsgs.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/50 to-cyan-500/50 flex items-center justify-center text-sm shrink-0 mt-0.5">🤖</div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user"
                    ? "bg-violet-600/30 border border-violet-500/30 text-white rounded-tr-sm"
                    : "bg-white/5 border border-white/8 text-white/85 rounded-tl-sm"
                  }`}>
                    {renderMessage(m.content)}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/50 to-cyan-500/50 flex items-center justify-center text-sm shrink-0">🤖</div>
                  <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  placeholder="Ask me anything about setup..."
                  className="flex-1 h-10 rounded-xl px-3 text-sm text-white placeholder:text-white/25"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 flex gap-1.5 flex-wrap">
                {["WordPress", "Shopify", "Wix", "Plain HTML"].map((q) => (
                  <button key={q} onClick={() => { setChatInput(`I'm using ${q}`); }}
                    className="text-[10px] px-2 py-1 rounded-lg border border-white/8 text-white/30 hover:text-white/60 hover:border-white/15 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setChatOpen((o) => !o)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-all hover:scale-105 active:scale-95"
          style={{ background: chatOpen ? "rgba(124,58,237,0.6)" : "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
        >
          {chatOpen ? (
            <span className="text-lg leading-none">×</span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
          {chatOpen ? "Close" : "Need help connecting?"}
        </button>
      </div>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <ConnectContent />
    </Suspense>
  );
}
